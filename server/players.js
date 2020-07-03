let Players=(()=>{
    const defaultNames=require('fs').readFileSync('./client/first_names.txt','utf8').split(',');
    const iomsg=require('./msg').iomsg;
    const socketmsg=require('./msg').socketmsg;
    const Clock=require('./clock');
    const clock=new Clock();
    let delta;
    let players={};
    let newPlayers='',leftPlayers='';
    let dimensions;
    const init=(_io,_interval=50/3,_dimensions)=>{
        players={};
        dimensions=_dimensions;
        _io.on(iomsg.connection,socket=>{
            socket.on(socketmsg.newPlayer,(_name)=>{
                players[socket.id]={
                        id:socket.id
                        ,name:_name!==undefined?_name:defaultNames[Math.floor(Math.random()*(defaultNames.length-1))]
                        ,colour:'#'+Math.random().toString(16).substr(-6)
                        ,x:0,y:0,z:0
                        ,dx:0,dy:0,dz:0
                        ,rotation:0
                    };
                socket.emit(socketmsg.newPlayerRet,players[socket.id]);
                if(newPlayers==='')newPlayers=players[socket.id].name;
                else newPlayers+=', '+players[socket.id].name;
                console.log(players[socket.id].name+' has joined!');
            });
            
            let dx,dy,dz,tempx,tempy,tempz;
            socket.on(socketmsg.move,(move)=>{//{xp:bool,xn:bool,yp:bool,yn:bool,zp:bool,zn:bool,rotation}//--------=========---------=====------===-----
                players[socket.id].rotation=move.rotation;
                dx=move.xp&&move.xn?0:move.xp?5:move.xn?-5:0;
                dy=move.yp&&move.yn?0:move.yp?5:move.yn?-5:0;
                dz=move.zp&&move.zn?0:move.zp?5:move.zn?-5:0;
                if(dx===0&&dy===0&&dz===0)return;
                tempx=player[socket.id].x+dx;
                tempy=player[socket.id].y+dy;
                tempz=player[socket.id].z+dz;
                //world-edge collisions, need object collisions maybe
                if(tempx>dimensions.xneg&&tempx<dimensions.xpos)player[socket.id].dx=dx;
                if(tempy>dimensions.yneg&&tempy<dimensions.ypos)player[socket.id].dy=dy;
                if(tempz>dimensions.zneg&&tempz<dimensions.zpos)player[socket.id].dz=dz;
            });

            socket.on(socketmsg.dc,()=>{
                if(players[socket.id]===undefined)return;
                if(leftPlayers==='')leftPlayers=players[socket.id].name;
                else leftPlayers+=', '+players[socket.id].name;
                console.log(players[socket.id].name+' has left!');
                delete players[socket.id];
                _io.sockets.connected[socket.id].disconnect(1);
            });
        });
        
        timer(_io,_interval);

    return players;};

    const timer=(_io,_interval=50/3)=>{
        setInterval(()=>{
            if(newPlayers!==''){_io.sockets.emit(iomsg.newPlayer,newPlayers);newPlayers='';}
            if(leftPlayers!==''){_io.sockets.emit(iomsg.dcPlayer,leftPlayers);leftPlayers='';}
            delta=clock.delta();
            for(let i in players){
                players[i].x+=players[i].dx;
                players[i].y+=players[i].dy;
                players[i].z+=players[i].dz;
                players[i].dx-=players[i].dx*5.0*delta;
                players[i].dy-=players[i].dy*5.0*delta;
                players[i].dz-=players[i].dz*5.0*delta;
            }
            
            _io.sockets.emit(iomsg.players,players);
            
        }
    ,_interval);};
    
return{init,timer};})();

module.exports=Players;



