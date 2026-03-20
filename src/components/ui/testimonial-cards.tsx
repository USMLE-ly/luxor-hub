"use client";

import * as React from 'react';
import { motion } from 'framer-motion';

interface TestimonialCardProps {
  handleShuffle: () => void;
  testimonial: string;
  position: string;
  id: number;
  author: string;
  image?: string;
}

export function TestimonialCard({ handleShuffle, testimonial, position, id, author, image }: TestimonialCardProps) {
  const dragRef = React.useRef(0);
  const isFront = position === "front";

  return (
    <motion.div
      style={{
        zIndex: position === "front" ? "2" : position === "middle" ? "1" : "0"
      }}
      animate={{
        rotate: position === "front" ? "-6deg" : position === "middle" ? "0deg" : "6deg",
        x: position === "front" ? "0%" : position === "middle" ? "33%" : "66%"
      }}
      drag={true}
      dragElastic={0.35}
      dragListener={isFront}
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onDragStart={(e: any) => {
        dragRef.current = e.clientX;
      }}
      onDragEnd={(e: any) => {
        if (dragRef.current - e.clientX > 150) {
          handleShuffle();
        }
        dragRef.current = 0;
      }}
      transition={{ duration: 0.35 }}
      className={`absolute left-0 top-0 grid h-[520px] w-[350px] select-none grid-rows-[1fr_auto] rounded-2xl border-2 border-border/40 bg-card/20 shadow-xl backdrop-blur-md overflow-hidden ${
        isFront ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      {image ? (
        <img
          src={image}
          alt={`Revenue proof from ${author}`}
          className="pointer-events-none w-full h-full object-cover object-top"
        />
      ) : (
        <div className="flex items-center justify-center">
          <img
            src={`https://i.pravatar.cc/128?img=${id}`}
            alt={`Avatar of ${author}`}
            className="pointer-events-none h-32 w-32 rounded-full border-2 border-border/40 bg-muted object-cover"
          />
        </div>
      )}
      <div className="p-5 space-y-2">
        <span className="block text-sm leading-relaxed text-muted-foreground">"{testimonial}"</span>
        <span className="block text-sm font-semibold text-primary">{author}</span>
      </div>
    </motion.div>
  );
}
