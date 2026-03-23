import React, { ReactNode, forwardRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
// @ts-ignore
import ReactPlayer from "react-player";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

const ResizablePanelInternal = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }, ref) => (
    <div className="flex w-full flex-col items-start">
      <div className="mx-auto w-full">
        <div ref={ref} className={cn(children ? "rounded-r-none" : "rounded-sm", "relative overflow-hidden")}>
          {children}
        </div>
      </div>
    </div>
  )
);
ResizablePanelInternal.displayName = "ResizablePanelInternal";

type VideoPlayerProps = { videoOpen: boolean; url: string };

export const VideoPlayer = forwardRef<HTMLDivElement, VideoPlayerProps>(
  ({ videoOpen, url }, ref) => (
    <AnimatePresence>
      {videoOpen && (
        <motion.div
          ref={ref}
          className="md:flex md:justify-center py-1 px-1 md:py-8 md:px-8 w-full h-[300px] md:h-[800px] md:aspect-video rounded-2xl bg-background"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {/* @ts-ignore */}
          <ReactPlayer width="100%" height="100%" controls={false} playing={videoOpen} loop muted url={url} />
        </motion.div>
      )}
    </AnimatePresence>
  )
);
VideoPlayer.displayName = "VideoPlayer";

type SidePanelVideoProps = {
  panelOpen: boolean;
  handlePanelOpen: () => void;
  className?: string;
  renderButton?: (handleToggle: () => void) => ReactNode;
  children: ReactNode;
};

export const SidePanelVideo = forwardRef<HTMLDivElement, SidePanelVideoProps>(
  ({ panelOpen, handlePanelOpen, className, renderButton, children }, ref) => {
    const [measureRef, bounds] = useMeasure();

    return (
      <ResizablePanelInternal>
        <motion.div
          ref={ref}
          className={cn("bg-muted/30 rounded-r-[44px] w-[160px] md:w-[260px]", className)}
          animate={panelOpen ? { width: "97%" } : {}}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ height: bounds.height > 0 ? bounds.height : undefined }}
            className="h-auto"
            transition={{ type: "spring", bounce: 0.02, duration: 0.65 }}
          >
            <div ref={measureRef}>
              <AnimatePresence mode="popLayout">
                <motion.div key={String(panelOpen)} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <div className={cn("flex items-center w-full justify-start pl-4 md:pl-4 py-1 md:py-3", panelOpen ? "pr-3" : "")}>
                    {renderButton && renderButton(handlePanelOpen)}
                  </div>
                  {panelOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                      {children}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </ResizablePanelInternal>
    );
  }
);
SidePanelVideo.displayName = "SidePanelVideo";
