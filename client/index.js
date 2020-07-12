import * as THREE from './three.js-master/build/three.module.js';
import Render from './renderer.js';
import Controls from './controls.js';
import Scene from './scene.js';
//-----------------------------------------------------------------------------------------------------------------------------------
let socket=io();
let camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,1,100000);
let controls=new Controls(THREE,camera);
let scene=new Scene(socket,THREE,controls.yawObject);
let renderer=new Render(THREE,scene,camera,controls);
//-----------------------------------------------------------------------------------------------------------------------------------
requestAnimationFrame(renderer.run);