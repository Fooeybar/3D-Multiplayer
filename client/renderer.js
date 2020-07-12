function Render(Three,_scene,_camera,_controls){
    this.renderer=new Three.WebGLRenderer();
    //this.renderer.setClearColor(0xffffff);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(this.renderer.domElement);
    this.run=()=>{
        _controls.move();
        this.renderer.render(_scene,_camera);
        requestAnimationFrame(this.run);
    }
    window.addEventListener('resize',()=>{
        _camera.aspect=window.innerWidth/window.innerHeight;
        _camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth,window.innerHeight);
    },false);
}

export default Render;