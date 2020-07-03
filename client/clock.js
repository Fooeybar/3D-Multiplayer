function Clock(){
	let begin=Date.now();
    let hold=begin,now,diff;
	this.delta=()=>{
		now=Date.now();
        diff=(now-hold)*0.001;
        hold=now;
	return diff;};
};

export default Clock;
