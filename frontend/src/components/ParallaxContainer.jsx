import React, { useEffect, useState } from 'react';
import './Parallax.css';

const ParallaxContainer = ({ children }) => {
  const [offsetY, setOffsetY] = useState(0);

  const handleScroll = () => {
    setOffsetY(window.pageYOffset);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="parallax-container">
      {React.Children.map(children, (child, index) => {
        const speed = child.props.speed || 0;
        return React.cloneElement(child, {
            style: { 
                ...child.props.style,
                transform: `translateY(${offsetY * speed}px)` 
            }
        });
      })}
    </div>
  );
};

export default ParallaxContainer;
