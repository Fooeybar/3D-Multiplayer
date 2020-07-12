import {iomsg,socketmsg} from './msg.js';
import { ImprovedNoise } from './three.js-master/examples/jsm/math/ImprovedNoise.js'
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
            let spheres=new Spheres(Three);
            player.name=arr[i];
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
        let bottommat=new Three.MeshLambertMaterial(_mat);
        this.waterBottom=new Three.Mesh(watergeo,bottommat);
        this.waterBottom.position.y=_water.y-200;
        this.waterBottom.rotation.x=_water.rotation;
        this.scene.add(this.waterBottom);
    });
    //---ground-------------------------------------------
    this.ground;
    this.terrain;
    _socket.on(iomsg.ground,(_ground)=>{
        if(this.ground!==undefined){this.scene.remove(this.ground);this.ground===undefined;}
        let groundGeo=new Three.PlaneGeometry(_ground.length*0.25,_ground.width*0.25);
        let groundMat=new Three.MeshPhongMaterial({color:_ground.color,side:Three.DoubleSide,flatShading:true});
        this.ground=new Three.Mesh(groundGeo,groundMat);
        this.ground.position.set(_ground.x,575,_ground.z);
        this.ground.rotation.x=_ground.rotation;
        this.scene.add(this.ground);
        

    //clean up, move relevant stuff to server side
        if(this.terrain!==undefined)return;
        let worldWidth=1256,worldDepth=1256;
        let data=generateHeight(worldWidth,worldDepth);
        let geometry=new Three.PlaneBufferGeometry(78192,78192,worldWidth-1,worldDepth-1);
        geometry.rotateX(-Math.PI*0.5);
        let vertices=geometry.attributes.position.array;
        for(let i=0,j=0,l=vertices.length;i<l;i++,j+=3)vertices[j+1]=data[i]*5;
        new Three.TextureLoader().load('./models/images/sand1.jpg',(t1)=>{
            t1.minFilter=Three.LinearFilter;
            this.terrain=new Three.Mesh(geometry,new Three.MeshBasicMaterial({map:t1,side:Three.DoubleSide,fog:false}));
            this.terrain.position.y=-355;
            this.scene.add(this.terrain);
        });
    });
    function generateHeight(width,height){
        let size=width*height,data=new Uint8Array(size),
            perlin=new ImprovedNoise(),quality=1,z=Math.random()*17900;
        for(let j=0;j<4;j++){
            for(let i=0;i<size;i++){
                let x=i%width,y=~~(i/width);
                data[i]+=Math.abs(perlin.noise(x/quality,y/quality,z)*quality*3);
            }
            quality*=5;
        }
    return data;}




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
