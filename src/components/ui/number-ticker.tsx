import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

interface NumberTickerProps {
  value: number;
  format?: (n: number) => string;
  suffix?: string;
  className?: string;
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const SingleDigit = ({ digit, delay }: { digit: string; delay: number }) => {
  const [show, setShow] = useState(false);
  const numericDigit = parseInt(digit);
  const isNum = !isNaN(numericDigit);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!isNum) {
    return <span className="inline-block">{digit}</span>;
  }

  return (
    <span className="inline-block h-[1em] overflow-hidden relative" style={{ width: "0.65em" }}>
      <span
        className="inline-flex flex-col transition-transform duration-700 ease-out"
        style={{
          transform: show ? `translateY(-${numericDigit * 10}%)` : "translateY(0%)",
          transitionDelay: `${delay}ms`,
        }}
      >
        {DIGITS.map((d) => (
          <span key={d} className="h-[1em] flex items-center justify-center">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
};

const NumberTicker = ({ value, format, suffix = "", className = "" }: NumberTickerProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (isInView) setStarted(true);
  }, [isInView]);

  const formatted = format ? format(value) : value.toString();
  const displayStr = formatted + suffix;
  const chars = displayStr.split("");

  return (
    <span ref={ref} className={`inline-flex items-baseline ${className}`}>
      {started
        ? chars.map((char, i) => (
            <SingleDigit key={`${i}-${char}`} digit={char} delay={i * 80} />
          ))
        : chars.map((char, i) => (
            <span key={i} className="inline-block opacity-0" style={{ width: !isNaN(parseInt(char)) ? "0.65em" : undefined }}>
              {char}
            </span>
          ))}
    </span>
  );
};

export default NumberTicker;
