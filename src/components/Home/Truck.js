import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {Link} from 'react-router-dom';

// Keyframes for the animation
const driveLeft = keyframes`
  0% {
    transform: translateX(100vw); /* Start from the right */
  }
  100% {
    transform: translateX(-100vw); /* Move off-screen to the left */
  }
`;

const driveRight = keyframes`
  0% {
    transform: translateX(-100vw); /* Start from the left */
  }
  100% {
    transform: translateX(100vw); /* Move off-screen to the right */
  }
`;

// Styled component for the black rectangle background
const Road = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 100vw; /* Width slightly larger than the image */
  height: 15px; /* Height slightly larger than the image */
  background-image: url("images/road.png");
  transform: translateX(-50%); /* Center the rectangle horizontally */
  z-index: -1; /* Place it behind the image */
  display: flex;
  align-items: center; /* Vertically center the content */
  justify-content: center; /* Horizontally center the content */
  overflow: hidden;
`;

// Styled component for the image
const TruckImage = styled.div`
  width: 200px;
  height: 96px;
  position: fixed;
  bottom: 0%; /* Position at the bottom of the screen */
  left: 50%; /* Center the image horizontally */
  transform: translateX(-50%) translateY(0); /* Center the image horizontally */
  animation: ${({ direction }) => (direction === 'right' ? driveRight : driveLeft)} 20s linear infinite;
  overflow: hidden;
  /* Media query for smaller screens */
  @media (max-width: 768px) {
    width: 100px;  /* Smaller width for screens <= 768px */
    height: 48px;  /* Smaller height for screens <= 768px */
  }
    max-width: 100%;
`;

// Styled component for the text on the moving image
const TruckText = styled.span`
  font-family: "VT323";
	font-size: 22px;
  position: fixed;
	color:#000000;
  overflow: hidden;
    /* Media query for smaller screens */
  @media (max-width: 768px) {
  font-size: 12px;
  } 
  &:hover{
    color: whitesmoke;
  }
    top: 32%; /* Vertically center the text */
  transform: translateY(-50%); /* Adjust for perfect vertical centering */

  /* Conditionally position text depending on the movement direction */
  ${({ direction }) => direction === 'left' ? `
    right: 13%; /* Place text to the right of the image when moving left */
  ` : `
    left: 13%; /* Place text to the left of the image when moving right */
  `}
`;

const Truck = () => {
  const [direction, setDirection] = useState('');
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    const randomDirection = Math.random() > 0.5 ? 'right' : 'left';
    setDirection(randomDirection);
    setFlip(randomDirection === 'right'); // Set flip state based on direction
    
    const intervalId = setInterval(() => {
      const newDirection = Math.random() > 0.5 ? 'right' : 'left';
      setDirection(newDirection);
      setFlip(newDirection === 'right');
    }, 20000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ position: 'flex', width: '100vw', height: '100vh', marginBottom: '25vh', display: 'inline', overflow: 'hidden', maxWidth: '100%'}}>
        {/* Background Rectangle */}
      <Road />
      <Link to="/latest-mic">
            {/* Moving Image of truck with Text */}
          <TruckImage direction={direction}>
            {/* Image */}
          <img
            src={flip ? "images/truckRight.png" : "images/truckLeft.png"}  // Flip image if moving right
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover',  overflow: 'hidden'}}
          />
          {/* Text on the Moving Object */}
          <TruckText direction={direction}>Latest Mic</TruckText>
        </TruckImage>
      </Link>
    </div>
  );
};

export default Truck;
