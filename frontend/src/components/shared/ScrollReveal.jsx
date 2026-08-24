import React from 'react';
import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

export const revealItem = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease }
  }
};

export const revealContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 }
  }
};

const ScrollReveal = ({
  children,
  className = '',
  delay = 0,
  y = 28,
  once = true,
  amount = 0.18,
  as = 'div'
}) => {
  const Tag = motion[as] || motion.div;
  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </Tag>
  );
};

export default ScrollReveal;
