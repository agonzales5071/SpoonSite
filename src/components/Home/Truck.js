import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {Link} from 'react-router-dom';

// Keyframes for the animation
const moveLeft = keyframes`
  0% {
    transform: translateX(100vw); /* Start from the right */
  }
  100% {
    transform: translateX(-100vw); /* Move off-screen to the left */
  }
`;

const moveRight = keyframes`
  0% {
    transform: translateX(-100vw); /* Start from the left */
  }
  100% {
    transform: translateX(100vw); /* Move off-screen to the right */
  }
`;

// Styled component for the black rectangle background
const BackgroundRectangle = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 100vw; /* Width slightly larger than the image */
  height: 10px; /* Height slightly larger than the image */
  background-color: black;
  transform: translateX(-50%); /* Center the rectangle horizontally */
  z-index: -1; /* Place it behind the image */
  display: flex;
  align-items: center; /* Vertically center the content */
  justify-content: center; /* Horizontally center the content */
  
  /* Create a dotted yellow line bisecting the rectangle */
  &::before {
    content: '';
    width: 100%;
    border-top: 2px dotted yellow; /* Dotted yellow line */
  }
`;

// Styled component for the image
const MovingImage = styled.div`
  width: 150px;
  height: 72px;
  position: absolute;
  bottom: 0%; /* Position at the bottom of the screen */
  left: 50%; /* Center the image horizontally */
  transform: translateX(-50%) translateY(0); /* Center the image horizontally */
  animation: ${({ direction }) => (direction === 'right' ? moveRight : moveLeft)} 20s linear infinite;

  /* Media query for smaller screens */
  @media (max-width: 768px) {
    width: 80px;  /* Smaller width for screens <= 768px */
    height: 80px;  /* Smaller height for screens <= 768px */
  }

  @media (max-width: 480px) {
    width: 60px;  /* Even smaller width for screens <= 480px */
    height: 60px;  /* Even smaller height for screens <= 480px */
  }
`;

// Styled component for the text on the moving image
const MovingText = styled.span`
  	font-family: "VT323";
	font-size: 17px;
  position: absolute;
	color:#000000;

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

const MovingBox = () => {
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
    <div style={{ position: 'flex', width: '100vw', height: '100vh', marginBottom: '25vh', display: 'inline' }}>
        {/* Background Rectangle */}
      <BackgroundRectangle />
      <Link to="/portfolio">
            {/* Moving Image with Text */}
            <MovingImage direction={direction}>
        {/* Image */}
        <img
          src={flip ? "images/truckRight2.png" : "images/truckLeft2.png"}  // Flip image if moving right
          alt="Moving Component"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        {/* Text on the Moving Object */}
        <MovingText direction={direction}>Latest Mic</MovingText>
      </MovingImage>
    
      </Link>
    </div>
  );
};

export default MovingBox;
