let Server=(()=>{
    const Express=require('express')
         ,Path=require('path')
         ,App=Express()
         ,Server=require('http').createServer(App)
         ,Socket=require('socket.io')
         ,Port=8080
         ,IO=Socket(Server,{'pingInterval':2000,'pingTimeout':5000})
         ,World=require('./world')
         ,Players=require('./players');

    App.use(Express.static('./client'));
    App.get('/',(req,res)=>{res.sendFile(Path.join(__dirname,'./client/index.html'));});
    Server.listen(Port,()=>{
        console.log('Starting server on port('+Port+')...');
        Players.init(IO,World);
    });
})();
module.exports=Server;

 

