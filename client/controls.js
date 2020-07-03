let Controls=function(Three,camera){
	let keys={
			clear:()=>{for(let i in keys)if(keys[i].hasOwnProperty('value'))keys[i].value=false;}
			,w:{toggle:false,value:false,id:87}
			,s:{toggle:false,value:false,id:83}
			,a:{toggle:false,value:false,id:65}
			,d:{toggle:false,value:false,id:68}
			,shift:{toggle:false,value:false,id:16}
			,space:{toggle:false,value:false,id:32}
			,caps:{toggle:true,value:false,id:20}
	};
	let PI_2=Math.PI*0.5;
	let enabled=false;
	let spheresyupper=new Three.Object3D();
	let spheresylower=new Three.Object3D();
	let spheresz=new Three.Object3D();
	let pitchObject=new Three.Object3D();
	pitchObject.add(camera);
	this.yawObject=new Three.Object3D();
	this.yawObject.position.y=10;
	this.yawObject.add(pitchObject);
	this.yawObject.set=(name)=>{
		let bumper=[];
		for(let i=0;i<10;i++){bumper.push(new Three.Object3D());bumper[i].name=name+'.b'+i;}
		bumper[0].position.set(0,-7.5,-20);
		bumper[1].position.set(0,-7.5,20);
		bumper[2].position.set(-20,-7.5,0);
		bumper[3].position.set(20,-7.5,0);
		bumper[4].position.set(0,7.5,-20);
		bumper[5].position.set(0,7.5,20);
		bumper[6].position.set(-20,7.5,0);
		bumper[7].position.set(20,7.5,0);
		bumper[8].position.set(0,20,0);
		bumper[9].position.set(0,-20,0);
		bumper.forEach((i)=>{this.yawObject.add(i);});
	}

	document.onclick=function(){if(!enabled)container.requestPointerLock();}
	document.addEventListener('pointerlockchange',()=>{
		if(document.pointerLockElement===container){enabled=true;document.getElementById('escape').style.display='none';}
		else{enabled=false;document.getElementById('escape').style.display='inline-block';keys.clear();}
	},false);
	document.addEventListener('mousemove',(event)=>{
		if(!enabled)return;
		let movementX=event.movementX||event.mozMovementX||event.webkitMovementX||0;
		let movementY=event.movementY||event.mozMovementY||event.webkitMovementY||0;
		this.yawObject.rotation.y-=movementX*0.002;
		pitchObject.rotation.x-=movementY*0.002;
		pitchObject.rotation.x=Math.max(-PI_2,Math.min(PI_2,pitchObject.rotation.x));
		//maybe emit bumpers here, so potential move is already pre-approved
		//server would have to handle a lot of incoming however
		//or could setinterval
	},false);
	document.addEventListener('keydown',(event)=>{
		if(!enabled)return;
		if(event.keyCode===16)if(keys.shift.toggle&&keys.shift.value)keys.shift.value=false;else keys.shift.value=true;
		if(event.keyCode===20)if(keys.caps.toggle&&keys.caps.value)keys.caps.value=false;else keys.caps.value=true;
		if(event.keyCode===32)if(keys.space.toggle&&keys.space.value)keys.space.value=false;else keys.space.value=true;
		if(event.keyCode===65)if(keys.a.toggle&&keys.a.value)keys.a.value=false;else keys.a.value=true;
		if(event.keyCode===68)if(keys.d.toggle&&keys.d.value)keys.d.value=false;else keys.d.value=true;
		if(event.keyCode===83)if(keys.s.toggle&&keys.s.value)keys.s.value=false;else keys.s.value=true;
		if(event.keyCode===87)if(keys.w.toggle&&keys.w.value)keys.w.value=false;else keys.w.value=true;
	},false);
	document.addEventListener('keyup',(event)=>{
		if(!enabled)return;
		if(event.keyCode===16)if(!keys.shift.toggle)keys.shift.value=false;
		if(event.keyCode===20)if(!keys.caps.toggle)keys.caps.value=false;
		if(event.keyCode===32)if(!keys.space.toggle)keys.space.value=false;
		if(event.keyCode===65)if(!keys.a.toggle)keys.a.value=false;
		if(event.keyCode===68)if(!keys.d.toggle)keys.d.value=false;
		if(event.keyCode===83)if(!keys.s.toggle)keys.s.value=false;
		if(event.keyCode===87)if(!keys.w.toggle)keys.w.value=false;
	},false);

	//{xp:bool,xn:bool,yp:bool,yn:bool,zp:bool,zn:bool,rotation}
	let clock=new Three.Clock();
	let _delta;
	let facing={x:0,y:0,z:0};
	this.move=()=>{
		_delta=clock.getDelta();	
		facing.x-=facing.x*5.0*_delta;
		facing.y-=facing.y*5.0*_delta;
		facing.z-=facing.z*5.0*_delta;
		let speed=3000.0*_delta;
		if(keys.caps.value)_delta*=2.5;
		if(keys.space.value)facing.y+=speed;
		if(keys.shift.value)facing.y-=speed;
		if(keys.w.value)facing.z-=speed;
		if(keys.s.value)facing.z+=speed;
		if(keys.a.value)facing.x-=speed;
		if(keys.d.value)facing.x+=speed;

		this.yawObject.translateX(facing.x*_delta);
		this.yawObject.translateY(facing.y*_delta);
		this.yawObject.translateZ(facing.z*_delta);
	};

};

export default Controls;