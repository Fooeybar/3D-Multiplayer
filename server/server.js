let PlayerServer=(()=>{
    const Express=require('express');
    const Path=require('path');
    const App=Express();
    const Server=require('http').createServer(App);
    const Socket=require('socket.io');
    const Players=require('./players');
    const Port=8080;
    const Timer=50/3;
    const IO=Socket(Server,{'pingInterval':2000,'pingTimeout':5000});

    App.use(Express.static('./client'));
    App.get('/',(req,res)=>{res.sendFile(Path.join(__dirname,'./client/index.html'));});
    Server.listen(Port,()=>{
        console.log('Starting server on port:'+Port);
        let World=require('./world');
        let Players=require('./players');
        World.init(IO,3000);
        Players.init(IO,Timer,World.getDimensions());

    });
})();

module.exports=PlayerServer;

 

