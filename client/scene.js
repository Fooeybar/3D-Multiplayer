import {iomsg,socketmsg} from './msg.js';
function Scene(_socket,Three,_controls){
    this.scene=new Three.Scene();
    this.scene.add(_controls);
    //---close-connection---------------------------------
    let exit=true;
    let closeConn=()=>{
        if(!exit)return;
        _socket.emit(socketmsg.dc);
        _socket.close();
        exit=false;
    }
    let msg=true;
    window.addEventListener('pagehide',()=>{closeConn();if(msg){console.log('You\'ve left the game!');msg=false;}});
    window.onunload=()=>{closeConn();if(msg){console.log('You\'ve left the game!');msg=false;}};
    window.onbeforeunload=()=>{closeConn();};
    window.unload=()=>{closeConn();};
    //---me------------------------------------------------
    let me={};
    _socket.emit(socketmsg.newPlayer);
    _socket.once(socketmsg.newPlayerRet,(player)=>{
        me=player;
        console.log('My name is '+me.name+'!');
        _controls.set(me.name);
        //add spheres to me
    });
    //---players-------------------------------------------
    let players=[];
    _socket.on(iomsg.players,(_players)=>{//place players on scene ================------------------------================--------------=====-------===---------
        for(let i=0;i<_players.length;i++){
            let player=this.scene.getObjectByName(_players[i].name);
            if(player===undefined){
                player=new Three.Object3D();
                let spheres=new Spheres(Three);
                player.name=_players[i].name;
                player.add(spheres);
                this.scene.add(player);
                players.push(player);
                console.log(player);
            }
            player.position.set(_players[i].x,_players[i].y,_players[i].z);
            player.rotation.y=_players[i].rotation;
        }
    });
    _socket.on(iomsg.newPlayer,(list)=>{
        if(list===me.name)return;
        if(list.includes(me.name))list=list.replace(' '+me.name+',','');
        console.log(list+' joined the game!');
        list.replace(' ');
        let arr=list.split(',');
        for(let i=0;i<arr.length;i++){
            let player=new Three.Object3D();
            let spheres=new Spheres(Three);
            player.name=arr[i];
            player.add(spheres);
            this.scene.add(player);
            players.push(player);
        }
        console.log(players);
    });
    _socket.on(iomsg.dcPlayer,(list)=>{
        console.log(list+' left the game!');
        list.replace(' ');
        let arr=list.split(',');
        for(let i=0;i<arr.length;i++){
            let obj=this.scene.getObjectByName(arr[i]);
            this.scene.remove(obj);
        }
    });
    this.scene.spheresAnimate=function(){
        for(let i=0;i<players.length;i++){
            players[i].rotateSpheres();
        }
    };
    //---fog----------------------------------------------
    this.fog;
    _socket.on(iomsg.fog,(_fog)=>{
        if(this.fog!==undefined){this.scene.remove(this.fog);this.fog=undefined;}
        this.fog=new Three.FogExp2(_fog.color,_fog.density);
        this.scene.fog=this.fog;
    });
    //---lights-------------------------------------------
    this.lights=[];
    _socket.once(iomsg.lights,(_lights)=>{
        for(let i=0;i<_lights.length;i++){
            let temp=new Three.DirectionalLight(0xffffff,_lights[i].intensity);
            temp.position.set(_lights[i].x,_lights[i].y,_lights[i].z);
            this.lights.push(temp);
            this.scene.add(temp);
        }
    });
    //---ground-------------------------------------------
    this.ground;
    _socket.on('iomsg.ground',(_ground)=>{
        if(this.ground!==undefined){this.scene.remove(this.ground);this.ground===undefined;}
        let groundGeo=new Three.PlaneGeometry(_ground.length,_ground.width);
        let groundMat=new Three.MeshPhongMaterial({color:_ground.color,side:Three.DoubleSide,flatShading:true});
        this.ground=new Three.Mesh(groundGeo,groundMat);
        this.ground.position.set(_ground.x,_ground.y,_ground.z);
        this.ground.rotation.x=_ground.rotation;
        this.scene.add(this.ground);
    });
    //---walls-------------------------------------------
    this.walls={};
    _socket.on(iomsg.walls,(_walls)=>{
        if(this.walls!==undefined){for(let i in this.walls)this.scene.remove(this.walls[i]);this.walls={};}
        let wallGeo=new Three.PlaneGeometry(_walls.wall.length,_walls.wall.width);
        let wallMat=()=>new Three.MeshPhongMaterial({color:_walls.wall.color,side:Three.DoubleSide});
        //---north
        this.walls.north=new Three.Mesh(wallGeo,wallMat());
        this.walls.north.position.set(_walls.north.x,_walls.north.y,_walls.north.z);
        this.walls.north.rotation.y=_walls.north.rotation;
        this.scene.add(this.walls.north);
        //---south
        this.walls.south=new Three.Mesh(wallGeo,wallMat());
        this.walls.south.position.set(_walls.south.x,_walls.south.y,_walls.south.z);
        this.walls.south.rotation.y=_walls.south.rotation;
        this.scene.add(this.walls.south);
        //---east
        this.walls.east=new Three.Mesh(wallGeo,wallMat());
        this.walls.east.position.set(_walls.east.x,_walls.east.y,_walls.east.z);
        this.walls.east.rotation.y=_walls.east.rotation;
        this.scene.add(this.walls.east);
        //---west
        this.walls.west=new Three.Mesh(wallGeo,wallMat());
        this.walls.west.position.set(_walls.west.x,_walls.west.y,_walls.west.z);
        this.walls.west.rotation.y=_walls.west.rotation;
        this.scene.add(this.walls.west);
    });
    //---objects-------------------------------------------
    this.objects=[];
    let deg90=45*Math.PI/180;
    _socket.on('iomsg.objects',(_objects)=>{
        if(this.objects.length>0){for(let i=0;i<this.objects.length;i++)this.scene.remove(this.objects[i]);this.objects=[];}
        for(let i=0;i<_objects.length;i++){
            let cube=new Three.Mesh(
                new Three.BoxGeometry(_objects[i].width,_objects[i].height,_objects[i].length)
                ,new Three.MeshPhongMaterial({color:_objects[i].color,side:Three.DoubleSide}));
            cube.position.set(_objects[i].x,_objects[i].y,_objects[i].z);
            cube.rotation.x=deg90;
            //cube.rotation.y=deg90;
            cube.rotation.z=deg90;
            this.objects.push(cube);
            this.scene.add(cube);
        }
    });
    //---models-------------------------------------------
    this.models;
    _socket.on(iomsg.models,(_models)=>{});
    //----------------------------------------------------
return this.scene;}
export default Scene;
//----------------------------------------------------//----------------------------------------------------//----------------------------------------------------
function Spheres(Three){
    let ret=new Three.Object3D();
    ret.name='sphere_main';
    let a=new Three.Object3D();
    let b=new Three.Object3D();
    a.name='a';
    b.name='b';
    let sphere=[];
    for(let i=0;i<12;i++){
        sphere.push(new Three.Mesh(new Three.SphereGeometry(3,50,50,0,Math.PI*2,0,Math.PI*2),new Three.MeshBasicMaterial()));
        sphere[i].name=name+'.s'+i;
    }
    for(let i=2;i<5;i+=2)sphere[i].position.set(-20,0,0);
    for(let i=3;i<6;i+=2)sphere[i].position.set(20,0,0);
    sphere[0].position.set(0,0,-20);
    sphere[1].position.set(0,0,20);
    for(let i=0;i<4;i++)a.add(sphere[i]);
    ret.add(a);
    sphere[6].position.set(0,20,0);
    sphere[7].position.set(0,-20,0);
    for(let i=4;i<8;i++)b.add(sphere[i]);
    ret.add(b);

    ret.rotateSpheres=function(){
        a.rotateY(-0.05);
		b.rotateZ(0.005);
    };
    return ret;
};