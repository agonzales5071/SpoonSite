//this should toggle the video in the player when pressed
// eslint-disable-next-line no-unused-vars
var vids1 = ['d9mLhZtSwSs'];
var vids2 = ['t4l5JIRyx6Q', 'HZCxGwv6jIw', 'PD-g54MVZlc'];
function togglevid(){
	if(vids2.length > 0){
		let move = vids2.shift;
		vids1.push(move);
	}
	else{
		vids2 = vids1;
		vids1 = [];
	}
		var vidId = vids2[0];
		var url = "https://www.youtube.com/embed/" + vidId;
		document.getElementById('videoplayer').src = url;
}
export default togglevid;