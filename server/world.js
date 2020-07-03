let World=(()=>{
    let iomsg=require('./msg').iomsg;
    let dimensions={
        mapsize:0
        ,halfmap:0
        ,wallheight:0
        ,unitwidth:0
        ,unitheight:0
        ,xpos:0
        ,xneg:0
        ,ypos:0
        ,yneg:0
        ,zpos:0
        ,zneg:0
    };
    const init=(_io,_interval=50/3,_mapSize=2400,_wallHeight=90,_unitWidth=90,_unitHeight=30)=>{
        dimensions.mapsize=_mapSize;
        dimensions.wallheight=_wallHeight;
        dimensions.unitwidth=_unitWidth;
        dimensions.unitheight=_unitHeight;
        dimensions.halfmap=_mapSize*0.5;
        dimensions.xpos=dimensions.halfmap;
        dimensions.xneg=-dimensions.halfmap;
        dimensions.ypos=500;
        dimensions.yneg=2.5;
        dimensions.zpos=dimensions.halfmap;
        dimensions.zneg=-dimensions.halfmap;
        timer(_io,_interval);
    };
    const fog=(_io)=>{_io.sockets.emit(iomsg.fog,{
            color:'#'+Math.random().toString(16).substr(-6)
            ,density:0.001*Math.random()
    });};
    const lights=(_io)=>{_io.sockets.emit(iomsg.lights,[
        {color:0xffffff,intensity:(Math.random()*0.3)+0.7,x:1,y:1,z:1}
        ,{color:0xffffff,intensity:(Math.random()*0.3)+0.7,x:1,y:-1,z:-1}
        ,{color:0xffffff,intensity:(Math.random()*0.3)+0.7,x:-1,y:1,z:1}
        ,{color:0xffffff,intensity:(Math.random()*0.3)+0.7,x:-1,y:-1,z:-1}
    ]);};
    const ground=(_io)=>{_io.sockets.emit(iomsg.ground,{
            length:dimensions.mapsize
            ,width:dimensions.mapsize
            ,rotation:degreesToRadians(90)
            ,x:0,y:0,z:0
            ,color:'#'+Math.random().toString(16).substr(-6)
    });};
    const walls=(_io)=>{_io.sockets.emit(iomsg.walls,{
        wall:{length:dimensions.mapsize,width:dimensions.wallheight,color:'#'+Math.random().toString(16).substr(-6)}
        ,north:{x:0,y:dimensions.unitheight*1.5,z:-dimensions.halfmap,rotation:0}
        ,south:{x:0,y:dimensions.unitheight*1.5,z:dimensions.halfmap,rotation:0}
        ,east:{x:dimensions.halfmap,y:dimensions.unitheight*1.5,z:0,rotation:degreesToRadians(90)}
        ,west:{x:-dimensions.halfmap,y:dimensions.unitheight*1.5,z:0,rotation:degreesToRadians(90)}
    });};
    const cubes=(_io)=>{
        let objects=[],totalCubesWide=dimensions.mapsize/(dimensions.unitwidth*2);
        for(let i=0;i<totalCubesWide;i++){
            for(let j=0;j<totalCubesWide;j++){
                if(Math.random()<0.8)continue;
                objects.push({
                    width:dimensions.unitwidth
                    ,height:dimensions.unitwidth
                    ,length:dimensions.unitwidth
                    ,color:'#'+Math.random().toString(16).substr(-6)
                    ,x:(dimensions.mapsize*Math.random())-(dimensions.mapsize*0.5)
                    ,y:(dimensions.unitheight*0.5)+(Math.random()*100)
                    ,z:(dimensions.mapsize*Math.random())-(dimensions.mapsize*0.5)
                    ,rotation:degreesToRadians(Math.random()*360)
                });
        }}_io.sockets.emit(iomsg.objects,objects);
    };
    const getDimensions=()=>dimensions;
    const degreesToRadians=(_degrees)=>_degrees*Math.PI/180;
    const timer=(_io,_interval=50/3)=>{
            setInterval(()=>{
                fog(_io);
                lights(_io);
                walls(_io);
                ground(_io);
                cubes(_io);
            },_interval);
    };    
return{init,timer,getDimensions};})();

module.exports=World;