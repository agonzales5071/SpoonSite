var wid = window.innerWidth * -1 * 0.5;
var hei = window.innerHeight * -1 * 0.5;
document.addEventListener("mousemove", parallax)
function parallax(e){
  document.querySelectorAll(".object").forEach(function(move){

    var movingValue = move.getAttribute("data-value");
    var x = (e.clientX + wid) * (0.02 * movingValue);
    var y = (e.clientY + hei) * (0.01 * movingValue);

    move.style.transform = "translateX(" + x + "px) translateY(" + y + "px)";
  });
}