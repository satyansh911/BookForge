import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Reveal Component
 * Wraps content and animates it as it enters the viewport.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {number} [props.delay=0] - Delay before animation starts (seconds)
 * @param {number} [props.duration=1] - Animation duration (seconds)
 * @param {string} [props.direction='up'] - Animation direction ('up', 'down', 'left', 'right', 'none')
 * @param {number} [props.distance=50] - Animation distance (pixels)
 * @param {string} [props.className=''] - Additional class names for the wrapper
 * @param {boolean} [props.stagger=false] - Whether to stagger children
 */
const Reveal = ({ 
  children, 
  delay = 0, 
  duration = 1.2, 
  direction = "up", 
  distance = 60, 
  className = "",
  stagger = false
}) => {
  const containerRef = useRef(null);

  useGSAP(() => {
    const element = containerRef.current;
    if (!element) return;

    const vars = {
      opacity: 0,
      duration,
      delay,
      ease: "expo.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        toggleActions: "play none none none",
      }
    };

    // Set initial position based on direction
    if (direction === "up") vars.y = distance;
    else if (direction === "down") vars.y = -distance;
    else if (direction === "left") vars.x = distance;
    else if (direction === "right") vars.x = -distance;

    if (stagger) {
      gsap.from(element.children, {
        ...vars,
        stagger: 0.1,
      });
    } else {
      gsap.from(element, vars);
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={`${className} will-change-transform`}>
      {children}
    </div>
  );
};

export default Reveal;
