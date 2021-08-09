//this should toggle the video in the player when pressed
var vidnum = 0;

function togglevid(){
 const vids = ['d9mLhZtSwSs', 't4l5JIRyx6Q', 'HZCxGwv6jIw', 'PD-g54MVZlc']
  if(vidnum == 3){
		  vidnum = 0;
	    }
	    else{
	      vidnum++;
	    }
	    var vidId = vids[vidnum];
	    var url = "https://www.youtube.com/embed/" + vidId;
        document.getElementById('videoplayer').src = url;
      }