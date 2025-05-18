import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
let total = 3;
let validSpace = 80;
let balloonWidth = 114;
if (document.documentElement.clientWidth < 768){
    balloonWidth = 57;
}

const HotAir = ({ id, totalComponents, componentData }) => {
    const margin = 10; // 10vh margin for top/bottom, left/right
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
  
    // Calculate the width of each slice for horizontal positioning (evenly spread out)
    const sliceWidth = (screenWidth - margin * 2) / totalComponents; // Adjusting for left margin
  
    // Initially set the position to 60vh height and spread them evenly horizontally within their slice
    const getInitialPosition = (index) => {
      const top = '60vh'; // Always start at 60vh height
      const left = `${margin + index * sliceWidth + Math.random() * sliceWidth}px`; // Spread out horizontally but within the slice
  
      return { top, left };
    };
  
    // Function to generate random duration between 15s and 25s
    const getRandomDuration = () => {
      return Math.random() * (25 - 15) + 15;
    };
  
    // Function to generate a random vertical position within the screen, keeping within the margins
    const getRandomVerticalPosition = () => {
      const top = `${Math.random() * (screenHeight - margin * 2)}vh`; // Random vertical position, within screen height minus margins
      return top;
    };
  
    // Randomly generate left position within the slice for the horizontal position
    const getRandomHorizontalPosition = (index) => {
      const left = `${margin + index * sliceWidth + Math.random() * sliceWidth}px`; // Keep it within its slice
      return left;
    };
  
    // State for position and animation duration
    const [position, setPosition] = useState(getInitialPosition(id)); // Set initial position
    const [duration, setDuration] = useState(getRandomDuration()); // Set initial duration for animation
  
    // Update position and duration at random intervals
    useEffect(() => {
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