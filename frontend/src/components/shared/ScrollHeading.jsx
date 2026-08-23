import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * ScrollHeading Component
 * Implements smooth scroll-linked fade-in & fade-out / word reveal effect
 * inspired by award-winning sites like talwart.com.
 * When scrolling into view, opacity transitions from 0.15/0.2 -> 1 -> 0.15/0.2.
 */
const ScrollHeading = ({
  children,
  className = '',
  as = 'h2',
  style = {},
  variant = 'fade', // 'fade' | 'words'
  ...props
}) => {
  const containerRef = useRef(null);

  // Track the scroll progress of this specific heading container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Smooth scroll progression curves
  // 0: below viewport (0.2 opacity, slight blur or offset)
  // 0.25 - 0.75: in active viewing zone (1 opacity, 0 translateY)
  // 1: scrolled past top (fading out smoothly back to 0.2)
  const opacity = useTransform(scrollYProgress, [0, 0.28, 0.72, 1], [0.15, 1, 1, 0.15]);
  const y = useTransform(scrollYProgress, [0, 0.28, 0.72, 1], [18, 0, 0, -18]);
  const scale = useTransform(scrollYProgress, [0, 0.28, 0.72, 1], [0.97, 1, 1, 0.97]);

  const Component = motion[as] || motion.h2;

  // If text is simple string and words reveal is desired
  if (variant === 'words' && typeof children === 'string') {
    const words = children.split(' ');
    return (
      <span ref={containerRef} className={`inline-block ${className}`} style={style} {...props}>
        {words.map((word, i) => {
          const start = 0.1 + (i / words.length) * 0.25;
          const end = start + 0.15;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const wordOpacity = useTransform(scrollYProgress, [0, start, end, 0.75, 1], [0.18, 0.18, 1, 1, 0.18]);
          return (
            <motion.span
              key={i}
              style={{ opacity: wordOpacity }}
              className="inline-block mr-[0.25em] transition-colors"
            >
              {word}
            </motion.span>
          );
        })}
      </span>
    );
  }

  return (
    <Component
      ref={containerRef}
      style={{
        opacity,
        y,
        scale,
        ...style
      }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
};

export default ScrollHeading;
