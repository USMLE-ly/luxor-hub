import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerTextScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleDimensions = () => (isMobile ? [0.92, 1] : [0.95, 1]);

  const rotate = useTransform(scrollYProgress, [0, 1], [-8, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translateY = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const titleTranslateY = useTransform(scrollYProgress, [0, 1], [30, 0]);
  const titleScale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  return (
    <div
      ref={containerRef}
      className="h-[44rem] md:h-[56rem] flex items-center justify-center relative p-2 md:p-20"
    >
      <motion.div
        style={{ translateY }}
        className="relative w-full max-w-5xl flex flex-col items-center justify-center"
      >
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </motion.div>
    </div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="relative h-[30rem] md:h-[40rem] w-full border-4 border-border bg-card rounded-[30px] shadow-2xl overflow-hidden"
    >
      <div className="h-full w-full rounded-2xl bg-muted">
        {children}
      </div>
    </motion.div>
  );
};
