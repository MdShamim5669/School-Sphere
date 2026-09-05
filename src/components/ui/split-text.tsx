"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

export type SplitTextAnimation = "slide-up" | "fade" | "blur" | "spring-up";
export type SplitType = "chars" | "words";

interface SplitTextProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  type?: SplitType;
  animation?: SplitTextAnimation;
  delay?: number;
  duration?: number;
  stagger?: number;
  once?: boolean;
}

const getVariants = (animation: SplitTextAnimation, duration: number): { container: Variants; item: Variants } => {
  switch (animation) {
    case "slide-up":
      return {
        container: {
          hidden: {},
          visible: (stagger: number = 0.02) => ({
            transition: {
              staggerChildren: stagger,
            },
          }),
        },
        item: {
          hidden: { y: "115%", opacity: 0 },
          visible: {
            y: "0%",
            opacity: 1,
            transition: {
              duration,
              ease: [0.2, 0.65, 0.3, 0.9],
            },
          },
        },
      };

    case "spring-up":
      return {
        container: {
          hidden: {},
          visible: (stagger: number = 0.02) => ({
            transition: {
              staggerChildren: stagger,
            },
          }),
        },
        item: {
          hidden: { y: 35, opacity: 0, scale: 0.95 },
          visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
              type: "spring",
              damping: 15,
              stiffness: 120,
            },
          },
        },
      };

    case "blur":
      return {
        container: {
          hidden: {},
          visible: (stagger: number = 0.02) => ({
            transition: {
              staggerChildren: stagger,
            },
          }),
        },
        item: {
          hidden: { y: 20, opacity: 0, filter: "blur(6px)" },
          visible: {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: {
              duration,
              ease: [0.2, 0.65, 0.3, 0.9],
            },
          },
        },
      };

    case "fade":
    default:
      return {
        container: {
          hidden: {},
          visible: (stagger: number = 0.02) => ({
            transition: {
              staggerChildren: stagger,
            },
          }),
        },
        item: {
          hidden: { opacity: 0, y: 15 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration,
              ease: "easeOut",
            },
          },
        },
      };
  }
};

const MotionComponentMap = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  p: motion.p,
  span: motion.span,
  div: motion.div,
} as const;

export default function SplitText({
  children,
  className = "",
  as = "div",
  type = "words",
  animation = "slide-up",
  delay = 0.1,
  duration = 0.5,
  stagger = 0.028,
  once = true,
}: SplitTextProps) {
  const text = typeof children === "string" ? children : String(children ?? "");
  const words = text.split(" ");
  const { container, item } = getVariants(animation, duration);

  const Component = MotionComponentMap[as] || motion.div;

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-40px" }}
      custom={stagger}
      variants={{
        ...container,
        visible: {
          ...container.visible,
          transition: {
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      }}
      aria-label={text}
    >
      {words.map((word, wordIndex) => {
        if (type === "chars") {
          const chars = word.split("");
          return (
            <span
              key={`word-${wordIndex}`}
              className="inline-block whitespace-nowrap overflow-hidden"
              aria-hidden="true"
            >
              {chars.map((char, charIndex) => (
                <motion.span
                  key={`char-${wordIndex}-${charIndex}`}
                  className="inline-block"
                  variants={item}
                >
                  {char}
                </motion.span>
              ))}
              {wordIndex < words.length - 1 && (
                <span className="inline-block">&nbsp;</span>
              )}
            </span>
          );
        }

        return (
          <span
            key={`word-${wordIndex}`}
            className="inline-block whitespace-nowrap overflow-hidden"
            aria-hidden="true"
          >
            <motion.span className="inline-block" variants={item}>
              {word}
            </motion.span>
            {wordIndex < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        );
      })}
    </Component>
  );
}
