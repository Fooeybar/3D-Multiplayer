let Players=(()=>{
    const defaultNames=require('fs').readFileSync('./client/first_names.txt','utf8').split(',')
         ,iomsg=require('./msg').iomsg
         ,socketmsg=require('./msg').socketmsg;
    let players={};
    const init=(io,world)=>{io.on(iomsg.connection,socket=>{
            //---newplayer----------------------------------------
            socket.on(socketmsg.newPlayer,()=>{
                players[socket.id]={
                        id:socket.id
                        ,name:defaultNames[Math.floor(Math.random()*(defaultNames.length-1))]
                        ,x:0,y:0,z:0
                        ,dx:0,dy:0,dz:0
                        ,rotation:0};
                world.SendMap(socket);       
                socket.emit(socketmsg.newPlayerRet,players[socket.id]);
                io.sockets.emit(iomsg.newPlayer,players[socket.id].name);
                console.log(players[socket.id].name+' has joined!');
            });
            //----------------------------------------------------
            //socket.on(move)
            //---dcplayer-----------------------------------------
            //needs afk timeout since closing browser will not sent dc msg
            socket.on(socketmsg.dc,()=>{
                if(players[socket.id]===undefined)return;
                io.sockets.emit(iomsg.dcPlayer,players[socket.id].name);
                console.log(players[socket.id].name+' has left!');
                delete players[socket.id];
                if(io.sockets.connected[socket.id]!==undefined)io.sockets.connected[socket.id].disconnect(1);
            });
            //----------------------------------------------------
    });};
return{init};})();
module.exports=Players;





















// const Clock=require('./imports').Clock;
// const clock=new Clock();
// let dx,dy,dz,tempx,tempy,tempz,delta;
// socket.on(socketmsg.move,(move)=>{//{xp:bool,xn:bool,yp:bool,yn:bool,zp:bool,zn:bool,rotation}//--------=========---------=====------===-----
//     players[socket.id].rotation=move.rotation;
//     dx=move.xp&&move.xn?0:move.xp?5:move.xn?-5:0;
//     dy=move.yp&&move.yn?0:move.yp?5:move.yn?-5:0;
//     dz=move.zp&&move.zn?0:move.zp?5:move.zn?-5:0;
//     if(dx===0&&dy===0&&dz===0)return;
//     tempx=player[socket.id].x+dx;
//     tempy=player[socket.id].y+dy;
//     tempz=player[socket.id].z+dz;
//     //world-edge collisions, need object collisions maybe
//     if(tempx>dimensions.xneg&&tempx<dimensions.xpos)player[socket.id].dx=dx;
//     if(tempy>dimensions.yneg&&tempy<dimensions.ypos)player[socket.id].dy=dy;
//     if(tempz>dimensions.zneg&&tempz<dimensions.zpos)player[socket.id].dz=dz;
// });
