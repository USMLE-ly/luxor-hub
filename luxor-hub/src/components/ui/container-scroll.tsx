import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [15, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <div
      className="h-[40rem] md:h-[50rem] flex items-center justify-center relative p-2 md:p-12"
      ref={containerRef}
      style={{ contain: "layout" }}
    >
      <div
        className="py-10 md:py-20 w-full relative"
        style={{ perspective: "1000px" }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

const Header = ({ translate, titleComponent }: { translate: MotionValue<number>; titleComponent: React.ReactNode }) => {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
        willChange: "transform",
      }}
      className="max-w-5xl -mt-8 mx-auto h-[20rem] md:h-[30rem] w-full border border-border/30 p-2 md:p-4 bg-card rounded-2xl"
    >
      <div className="h-full w-full overflow-hidden rounded-xl bg-muted">
        {children}
      </div>
    </motion.div>
  );
};
