let World=(()=>{
    const iomsg=require('./msg').iomsg
         ,dimensions={
            width:78192
            ,halfmap:78192*0.5
            ,xmax:78192*0.5
            ,xmin:-78192*0.5
            ,ymax:17900
            ,ymin:1
            ,zmax:78192*0.5
            ,zmin:-78192*0.5}
         ,Dimensions=()=>dimensions
         ,groundData=(function(){
            const PNoise=require('./imports').ImprovedNoise;
            let size=1256*1256,perlin=PNoise(),quality=1,z=Math.random()*dimensions.ymax,data=new Uint8Array(size);
            for(let j=0;j<4;j++,quality*=5)
                for(let i=0;i<size;i++){
                    let x=i%1256,y=~~(i/1256);
                    data[i]+=Math.abs(perlin.noise(x/quality,y/quality,z)*quality*3);}
            return data;})();
    //-----------------------------------------------------
    const SendMap=(socket)=>{
        //---fog----------------------------------------------
        socket.emit(iomsg.fog,{color:0x868293,density:0.0005});
        //---lights-------------------------------------------
        socket.emit(iomsg.lights,[{color:0xe8bdb0,intensity:1.5,x:2950,y:2625,z:-160}
                                 ,{color:0xc3eaff,intensity:0.75,x:-1,y:-0.5,z:-1}]);
        //---sky----------------------------------------------
        socket.emit(iomsg.sky,{name:'sky1.jpg'
            ,geo:{radius:dimensions.width
                 ,widthSegments:16
                 ,heightSegments:16}
            ,y:20000});
        //---water--------------------------------------------
        socket.emit(iomsg.water,{geo:{width:dimensions.width
                    ,height:dimensions.width
                    ,widthSegments:16
                    ,heightSegments:16}
                ,mat:{color:0x006ba0
                    ,transparent:true
                    ,opacity:0.6}
                ,y:-99
                ,rotation:-0.5*Math.PI
                ,depth:200});
        //---ground-------------------------------------------
        socket.emit(iomsg.ground,{data:groundData
                ,width:dimensions.width
                ,rotation:-Math.PI*0.5
                ,y:-355
                ,basetexture:'sand1.jpg'});
        //-----------------------------------------------------
    };
return{SendMap,Dimensions};})();
module.exports=World;
//---cubes--------------------------------------------
// ,cubes:()=>{
//     let objects=[],totalCubesWide=dimensions.mapsize/(dimensions.unitwidth*2);
//     for(let i=0;i<totalCubesWide;i++)
//         for(let j=0;j<totalCubesWide;j++){
//             if(Math.random()<0.8)continue;
//             objects.push({
//                 width:dimensions.unitwidth
//                 ,height:dimensions.unitwidth
//                 ,length:dimensions.unitwidth
//                 ,color:'#'+Math.random().toString(16).substr(-6)
//                 ,x:(dimensions.mapsize*Math.random())-(dimensions.mapsize*0.5)
//                 ,y:(dimensions.unitheight*0.5)+(Math.random()*100)
//                 ,z:(dimensions.mapsize*Math.random())-(dimensions.mapsize*0.5)
//                 ,rotation:degreesToRadians((Math.random()*360)*Math.PI/180)
//             });}
//     return objects;}