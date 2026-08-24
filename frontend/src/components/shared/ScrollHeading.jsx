import React, { useMemo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const extractText = (children) => {
  if (children == null || typeof children === 'boolean') return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractText).join(' ');
  if (React.isValidElement(children)) return extractText(children.props.children);
  return '';
};

const hasElementChildren = (children) =>
  React.Children.toArray(children).some((child) => React.isValidElement(child));

const lerp = (a, b, t) => a + (b - a) * Math.min(Math.max(t, 0), 1);

const wordProgress = (p, index, count) => {
  const t = count <= 1 ? 0 : index / (count - 1);
  const inStart = t * 0.22;
  const inEnd = inStart + 0.14;
  const outStart = 0.7 + t * 0.12;
  const outEnd = Math.min(outStart + 0.14, 1);
  const v = Math.min(Math.max(p, 0), 1);

  if (v <= inStart) return 0;
  if (v < inEnd) return (v - inStart) / (inEnd - inStart);
  if (v < outStart) return 1;
  if (v < outEnd) return 1 - (v - outStart) / (outEnd - outStart);
  return 0;
};

const ScrollWord = ({ word, index, count, scrollYProgress }) => {
  const opacity = useTransform(scrollYProgress, (p) => lerp(0.18, 1, wordProgress(p, index, count)));
  const y = useTransform(scrollYProgress, (p) => lerp(10, 0, wordProgress(p, index, count)));

  return (
    <motion.span
      style={{ opacity, y }}
      className="inline-block will-change-transform"
    >
      {word}
      {index < count - 1 ? '\u00A0' : ''}
    </motion.span>
  );
};

/**
 * Scroll-linked heading fill, adapted from Talwart-style word reveals.
 * Words brighten as the heading enters, then fade as it leaves.
 */
const ScrollHeading = ({
  children,
  className = '',
  as = 'h2',
  style = {},
  variant,
  ...props
}) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.9', 'end 0.12']
  });

  const text = useMemo(
    () => extractText(children).replace(/\s+/g, ' ').trim(),
    [children]
  );
  const words = useMemo(() => (text ? text.split(' ') : []), [text]);
  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const useWords = !reduceMotion
    && variant !== 'block'
    && words.length > 0
    && !hasElementChildren(children);

  const blockOpacity = useTransform(scrollYProgress, [0, 0.22, 0.78, 1], [0.18, 1, 1, 0.18]);
  const blockY = useTransform(scrollYProgress, [0, 0.22, 0.78, 1], [14, 0, 0, -10]);

  const Tag = motion[as] || motion.h2;

  if (useWords) {
    return (
      <Tag
        ref={containerRef}
        className={className}
        style={style}
        aria-label={text}
        {...props}
      >
        {words.map((word, i) => (
          <ScrollWord
            key={`${word}-${i}`}
            word={word}
            index={i}
            count={words.length}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </Tag>
    );
  }

  return (
    <Tag
      ref={containerRef}
      style={{ opacity: blockOpacity, y: blockY, ...style }}
      className={className}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default ScrollHeading;
