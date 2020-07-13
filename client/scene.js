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
    });
    //---players-------------------------------------------
    let players=[];
    _socket.on(iomsg.players,(_players)=>{//place players on scene ================------------------------================--------------=====-------===---------
        for(let i=0;i<_players.length;i++){
            let player=this.scene.getObjectByName(_players[i].name);
            if(player===undefined){
                player=new Three.Object3D();
                player.name=_players[i].name;
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
            player.name=arr[i];
            this.scene.add(player);
            players.push(player);
        }
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
    //---fog----------------------------------------------
    this.fog;
    _socket.once(iomsg.fog,(_fog)=>{
        this.fog=new Three.FogExp2(_fog.color,_fog.density);
        this.scene.fog=this.fog;
    });
    //---lights-------------------------------------------
    this.lights=[];
    _socket.once(iomsg.lights,(_lights)=>{
        for(let i=0;i<_lights.length;i++){
            let temp=new Three.DirectionalLight(_lights[i].color,_lights[i].intensity);
            temp.position.set(_lights[i].x,_lights[i].y,_lights[i].z);
            this.lights.push(temp);
            this.scene.add(temp);
        }
    });
    //---sky----------------------------------------------
    this.sky;
    _socket.once(iomsg.sky,(_sky)=>{
        new Three.TextureLoader().load('./models/images/'+_sky.name,(t1)=>{
            t1.minFilter=Three.LinearFilter;
            this.sky=new Three.Mesh(
                new Three.SphereGeometry(_sky.geo.radius,_sky.geo.widthSegments,_sky.geo.heightSegments)
                ,new Three.MeshBasicMaterial({map:t1,side:Three.BackSide,fog:false})
               );
            this.sky.position.y=_sky.y;
            this.sky.rotation.z=Math.PI*0.35;
            this.scene.add(this.sky);
        });
    });
    //---water--------------------------------------------
    this.water;
    this.waterBottom;
    _socket.once(iomsg.water,(_water)=>{
        let watergeo=new Three.PlaneBufferGeometry(_water.geo.width,_water.geo.height,_water.geo.widthSegments,_water.geo.heightSegments);
        let _mat=_water.mat;
        _mat.side=Three.DoubleSide;
        let watermat=new Three.MeshLambertMaterial(_mat);
        this.water=new Three.Mesh(watergeo,watermat);
        this.water.position.y=_water.y;
        this.water.rotation.x=_water.rotation;
        this.scene.add(this.water);
        _mat.transparent=false;
        _mat.fog=true;
        let bottommat=new Three.MeshLambertMaterial(_mat);
        this.waterBottom=new Three.Mesh(watergeo,bottommat);
        this.waterBottom.position.y=_water.y-_water.depth;
        this.waterBottom.rotation.x=_water.rotation;
        this.scene.add(this.waterBottom);
    });
    //---ground-------------------------------------------
    this.terrain;
    _socket.once(iomsg.ground,(_ground)=>{
        let worldWidth=1256,worldDepth=1256;
        let geometry=new Three.PlaneBufferGeometry(_ground.width,_ground.width,worldWidth-1,worldDepth-1);
        geometry.rotateX(_ground.rotation);
        for(let i=0,j=0,vertices=geometry.attributes.position.array;i<vertices.length;i++,j+=3)vertices[j+1]=_ground.data[i]*5;
        new Three.TextureLoader().load('./models/images/'+_ground.basetexture,(t1)=>{
            t1.minFilter=Three.LinearFilter;
            this.terrain=new Three.Mesh(geometry,new Three.MeshBasicMaterial({map:t1,side:Three.DoubleSide,fog:false}));
            this.terrain.position.y=_ground.y;
            this.scene.add(this.terrain);
        });
    });
    //---objects-------------------------------------------
    // this.objects=[];
    // let deg90=45*Math.PI/180;
    // _socket.on('iomsg.objects',(_objects)=>{
    //     if(this.objects.length>0){for(let i=0;i<this.objects.length;i++)this.scene.remove(this.objects[i]);this.objects=[];}
    //     for(let i=0;i<_objects.length;i++){
    //         let cube=new Three.Mesh(
    //             new Three.BoxGeometry(_objects[i].width,_objects[i].height,_objects[i].length)
    //             ,new Three.MeshPhongMaterial({color:_objects[i].color,side:Three.DoubleSide}));
    //         cube.position.set(_objects[i].x,_objects[i].y,_objects[i].z);
    //         cube.rotation.x=deg90;
    //         //cube.rotation.y=deg90;
    //         cube.rotation.z=deg90;
    //         this.objects.push(cube);
    //         this.scene.add(cube);
    //     }
    // });
    //---models-------------------------------------------
    // this.models;
    // _socket.on('iomsg.models',(_models)=>{});
    //----------------------------------------------------
return this.scene;}
export default Scene;
//----------------------------------------------------//----------------------------------------------------//----------------------------------------------------
