import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
var moveCounter = 0;
var durCounter = 0;
let balloonWidth = 114;
let balloonHeight = 135;
let isMobile = false;
if (document.documentElement.clientWidth < 768){
  balloonWidth = 57;
  balloonHeight = 67;
  isMobile = true;
}

const HotAir = ({ id, totalComponents, componentData }) => {
  
  
  const screenHeight = window.innerHeight;
  const screenWidth = window.innerWidth;
  const vertMargin = screenHeight/10; // 10vh margin for top/bottom, left/right
  const horizMargin = screenWidth/10;
  
  // Calculate the width of each slice for horizontal positioning (evenly spread out)
  const sliceWidth = (screenWidth - horizMargin * 2) / totalComponents; // Adjusting for left margin
  
  // Initially set the position to 60vh height and spread them evenly horizontally within their slice
  const getInitialPosition = (index) => {
    const top = '60vh'; // Always start at 60vh height
    const left = getInitialPositionX(index);
    return { top, left };
  };
  const getInitialPositionX = (index) => {
    const left = `${horizMargin + index * sliceWidth + sliceWidth/2 - balloonWidth/2}px`; // Spread out horizontally but within the slice
    return left;
  };

    // Function to generate random duration between 15s and 25s
    const minDur = 10;
  const getRandomDuration = () => {
    let dur = 1;
    if(durCounter < totalComponents){
      durCounter++;
    }
    else{
      dur = Math.random() * (6) + minDur;
    }
    console.log("dur = " + dur);
    return dur;
    
  };
  // State for position and animation duration
  const [position, setPosition] = useState(getInitialPosition(id)); // Set initial position
  const [duration, setDuration] = useState(getRandomDuration()); // Set initial duration for animation
  
  
  // Update position and duration at random intervals
  useEffect(() => {
  
    // Function to generate a random vertical position within the screen, keeping within the margins
    const getRandomVerticalPosition = () => {
      let top = null;
      if(moveCounter < totalComponents*2){//first move goes straight up
        top = '40vh';
        moveCounter++;
      }
      else{
        top = `${Math.random() * (screenHeight - vertMargin*2 - balloonHeight) + vertMargin}px`; // Random vertical position, within screen height minus margins
        if(isMobile){
          top = `${Math.random() * (screenHeight - vertMargin*2 - balloonHeight*2) + vertMargin}px`;
        }
      }
      return top;
    };
  
    // Randomly generate left position within the slice for the horizontal position
    const getRandomHorizontalPosition = (index) => {
      let left = null;
      if(moveCounter < totalComponents*2){
        left = getInitialPositionX(index);
        moveCounter++;
      }
      else{
        left = `${index * sliceWidth + Math.random() * sliceWidth}px`; // Keep it within its slice
      }
        return left;
    };
  
      const interval = setInterval(() => {
        setPosition((prevPosition) => ({
          top: getRandomVerticalPosition(), // Random vertical movement
          left: getRandomHorizontalPosition(id), // Keep horizontal within slice
        }));
        setDuration(getRandomDuration()); // Randomize the animation duration
      }, duration * 1000); // Update every random duration interval
  
      return () => clearInterval(interval); // Cleanup on unmount
    }, [id, duration]);
  
    const floatingStyle = {
      position: 'absolute',
      top: position.top,
      left: position.left,
      transition: `top ${duration}s ease, left ${duration}s ease`,
      backgroundColor: componentData.color, // Use the color from the object
      fontSize: componentData.size, // Use the size from the object
    };
  
    return (
      <div style={floatingStyle}>
        <Link to={componentData.link}><button className="balloonbutt">
          <img className="balloonimg" src={componentData.img} alt=""></img>
          <div className="balloontext" id={componentData.textid} >{componentData.text}</div></button>
        </Link>
      </div>
    );
  };
export default HotAir;