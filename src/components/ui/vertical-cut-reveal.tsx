import { type AnimationOptions, motion } from "framer-motion";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

// Intl.Segmenter non è ancora nei tipi di lib con target ES2020 (evita
// grapheme-splitting scorretto su emoji/accenti multi-codepoint); fallback
// a un'interfaccia minima invece di `any`.
interface SegmenterLike {
  segment(text: string): Iterable<{ segment: string }>;
}
interface IntlWithSegmenter {
  Segmenter?: new (locale: string, options: { granularity: string }) => SegmenterLike;
}

function splitIntoChars(text: string): string[] {
  const SegmenterCtor = (Intl as IntlWithSegmenter).Segmenter;
  if (SegmenterCtor) {
    const segmenter = new SegmenterCtor("it", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }
  return Array.from(text);
}

interface WordObject {
  characters: string[];
  needsSpace: boolean;
}

interface VerticalCutRevealRef {
  startAnimation: () => void;
  reset: () => void;
}

type VerticalCutRevealProps = {
  children: string;
  reverse?: boolean;
  transition?: AnimationOptions;
  splitBy?: "words" | "characters" | "lines" | string;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  containerClassName?: string;
  wordLevelClassName?: string;
  elementLevelClassName?: string;
  onStart?: () => void;
  onComplete?: () => void;
  autoStart?: boolean;
};

// Adattato dal componente "Vertical Cut Reveal" di 21st.dev (cnippet.dev):
// niente "use client", "motion/react" -> "framer-motion" (già in uso nel
// progetto). Ogni carattere è una molla framer-motion indipendente — stesso
// tipo di animazione leggera già usata altrove nel sito (niente scroll-jack,
// niente librerie 3D), solo applicata al testo invece che a un layout.
export const VerticalCutReveal = forwardRef<VerticalCutRevealRef, VerticalCutRevealProps>(
  (
    {
      children,
      reverse = false,
      transition = { damping: 22, stiffness: 190, type: "spring" },
      splitBy = "words",
      staggerDuration = 0.2,
      staggerFrom = "first",
      containerClassName,
      wordLevelClassName,
      elementLevelClassName,
      onStart,
      onComplete,
      autoStart = true,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const text = children;
    const [isAnimating, setIsAnimating] = useState(false);

    const elements = useMemo(() => {
      const words = text.split(" ");
      if (splitBy === "characters") {
        return words.map((word, i) => ({
          characters: splitIntoChars(word),
          needsSpace: i !== words.length - 1,
        }));
      }
      return splitBy === "words"
        ? text.split(" ")
        : splitBy === "lines"
          ? text.split("\n")
          : text.split(splitBy);
    }, [text, splitBy]);

    const getStaggerDelay = useCallback(
      (index: number) => {
        const total =
          splitBy === "characters"
            ? (elements as WordObject[]).reduce(
                (acc, word) => acc + word.characters.length + (word.needsSpace ? 1 : 0),
                0
              )
            : elements.length;
        if (staggerFrom === "first") return index * staggerDuration;
        if (staggerFrom === "last") return (total - 1 - index) * staggerDuration;
        if (staggerFrom === "center")
          return Math.abs(Math.floor(total / 2) - index) * staggerDuration;
        if (staggerFrom === "random")
          return Math.abs(Math.floor(Math.random() * total) - index) * staggerDuration;
        return Math.abs(staggerFrom - index) * staggerDuration;
      },
      [elements, staggerFrom, staggerDuration, splitBy]
    );

    const startAnimation = useCallback(() => {
      setIsAnimating(true);
      onStart?.();
    }, [onStart]);

    useImperativeHandle(ref, () => ({
      reset: () => setIsAnimating(false),
      startAnimation,
    }));

    useEffect(() => {
      if (autoStart) startAnimation();
    }, [autoStart, startAnimation]);

    const variants = useMemo(
      () => ({
        hidden: { y: reverse ? "-100%" : "100%" },
        visible: (i: number) => ({
          transition: {
            ...transition,
            delay: ((transition?.delay as number) || 0) + getStaggerDelay(i),
          },
          y: 0,
        }),
      }),
      [reverse, transition, getStaggerDelay]
    );

    const wordList =
      splitBy === "characters"
        ? (elements as WordObject[])
        : (elements as string[]).map((el, i) => ({
            characters: [el],
            needsSpace: i !== elements.length - 1,
          }));

    return (
      <span
        className={cn(containerClassName, "flex flex-wrap whitespace-pre-wrap", splitBy === "lines" && "flex-col")}
        ref={containerRef}
      >
        <span className="sr-only">{text}</span>
        {wordList.map((wordObj, wordIndex, array) => {
          const prevCount = array.slice(0, wordIndex).reduce((sum, w) => sum + w.characters.length, 0);
          return (
            <span
              aria-hidden="true"
              className={cn("inline-flex overflow-hidden", wordLevelClassName)}
              key={wordIndex}
            >
              {wordObj.characters.map((char, charIndex) => (
                <span className={cn(elementLevelClassName, "relative whitespace-pre-wrap")} key={charIndex}>
                  <motion.span
                    animate={isAnimating ? "visible" : "hidden"}
                    className="inline-block"
                    custom={prevCount + charIndex}
                    initial="hidden"
                    onAnimationComplete={
                      wordIndex === elements.length - 1 && charIndex === wordObj.characters.length - 1
                        ? onComplete
                        : undefined
                    }
                    variants={variants}
                  >
                    {char}
                  </motion.span>
                </span>
              ))}
              {wordObj.needsSpace && <span> </span>}
            </span>
          );
        })}
      </span>
    );
  }
);

VerticalCutReveal.displayName = "VerticalCutReveal";