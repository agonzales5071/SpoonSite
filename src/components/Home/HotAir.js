import React, { useEffect, useRef, useCallback} from 'react';
import { Link } from 'react-router-dom';

let balloonWidth = 114;
let balloonHeight = 135;
let isMobile = false;
if (document.documentElement.clientWidth < 768) {
  balloonWidth = 57;
  balloonHeight = 67;
  isMobile = true;
}

const HotAir = ({ id, totalComponents, componentData }) => {
  const balloonRef = useRef(null);

  const screenHeight = window.innerHeight;
  const screenWidth = window.innerWidth;
  const vertMargin = screenHeight / 10;
  const horizMargin = screenWidth / 10;

  const sliceWidth = (screenWidth - horizMargin * 2) / totalComponents;

  const getInitialPositionX = useCallback(
    (index) => `${horizMargin + index * sliceWidth + sliceWidth / 2 - balloonWidth / 2}px`,
    [horizMargin, sliceWidth]
  );

  const getRandomDuration = () => Math.random() * 6 + 10;

  const getRandomVerticalPosition = useCallback(() => {
    const verticalRange = screenHeight - vertMargin * 2 - balloonHeight * (isMobile ? 2 : 1);
    return `${Math.random() * verticalRange + vertMargin}px`;
  }, [screenHeight, vertMargin]);
  
  const getRandomHorizontalPosition = useCallback((index) => {
    return `${index * sliceWidth + Math.random() * sliceWidth}px`;
  }, [sliceWidth]);

  //this required soooo many reworks 

  useEffect(() => {
    const el = balloonRef.current;
    if (!el) return;

    // Set initial position (no animation)
    el.style.position = 'absolute';
    el.style.top = '60vh';
    el.style.left = getInitialPositionX(id);
    el.style.transition = 'none';

    // Force browser to apply initial styles before animating
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const firstTop = '40vh';
        const firstLeft = getInitialPositionX(id);
        const firstDuration = getRandomDuration();

        el.style.transition = `top ${firstDuration}s ease, left ${firstDuration}s ease`;
        el.style.top = firstTop;
        el.style.left = firstLeft;

        // Start the continuous animation loop
        const animate = () => {
          const newTop = getRandomVerticalPosition();
          const newLeft = getRandomHorizontalPosition(id);
          const duration = getRandomDuration();

          el.style.transition = `top ${duration}s ease, left ${duration}s ease`;
          el.style.top = newTop;
          el.style.left = newLeft;

          setTimeout(animate, duration * 1000);
        };

        setTimeout(animate, firstDuration * 1000);
      });
    });

  }, [id, getInitialPositionX, sliceWidth, screenHeight, vertMargin, 
    getRandomVerticalPosition, getRandomHorizontalPosition]);

  return (
    <div ref={balloonRef} style={{ backgroundColor: componentData.color, fontSize: componentData.size }}>
      <Link to={componentData.link}>
        <button className="balloonbutt">
          <img className="balloonimg" src={componentData.img} alt="" />
          <div className="balloontext" id={componentData.textid}>
            {componentData.text}
          </div>
        </button>
      </Link>
    </div>
  );
};

export default HotAir;