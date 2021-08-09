//this should ask the browser for location permissions and set a text
var i = 0;

const text = document.getElementById("locationtext");

 function getlocation(){
 	if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      text.innerHTML = "Geolocation is not supported by this browser.";
    }
  }

function showPosition(position) {
  if(i==0){
  	text.innerHTML = "Tbh idk what to do with your location like I did not think I would get this far... Here they are I guess?"
    +"<br>Latitude: " + position.coords.latitude +
    "<br>Longitude: " + position.coords.longitude;
  }
  else if(i==1){
    text.innerHTML = "well don\'t press it again! let me think of something- hold on";
  }
  else if(i==2){
  	text.innerHTML = "umm...";
  }
  else if((i>=3 && i<=6) || i>8){
    text.innerHTML = "...";
  }  	
  else if(i==7){
  	text.innerHTML = "I got nothing okay? Now leave me alone.";
  }
  else if(i==8){
  	text.innerHTML = "for realsies";
  }
  i++;
 }


