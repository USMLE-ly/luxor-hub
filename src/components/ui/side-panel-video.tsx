import React, { ReactNode, forwardRef } from "react"
import { AnimatePresence, MotionConfig, motion, type Transition } from "framer-motion"
import useMeasure from "react-use-measure"
import { cn } from "@/lib/utils"

const panelTransition: Transition = { type: "tween", ease: "easeInOut", duration: 0.4 }

const ResizablePanelInternal = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }, ref) => (
    <MotionConfig transition={panelTransition}>
      <div className="flex w-full flex-col items-start">
        <div className="mx-auto w-full">
          <div
            ref={ref}
            className={cn(
              children ? "rounded-r-none" : "rounded-sm",
              "relative overflow-hidden"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </MotionConfig>
  )
)
ResizablePanelInternal.displayName = "ResizablePanelInternal"

type NativeVideoProps = {
  videoOpen: boolean
  src: string
}

export const NativeVideo = forwardRef<HTMLDivElement, NativeVideoProps>(
  ({ videoOpen, src }, ref) => (
    <AnimatePresence>
      {videoOpen && (
        <motion.div
          ref={ref}
          className="md:flex md:justify-center py-1 px-1 md:py-8 md:px-8 w-full h-[300px] md:h-[800px] md:aspect-video rounded-2xl bg-background"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] as const, delay: 0.3 }}
        >
          <video
            className="w-full h-full rounded-xl object-cover"
            src={src}
            autoPlay
            loop
            muted
            playsInline
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
)
NativeVideo.displayName = "NativeVideo"

type ComponentProps = {
  panelOpen: boolean
  handlePanelOpen: () => void
  className?: string
  renderButton?: (handleToggle: () => void) => ReactNode
  children: ReactNode
}

const sectionVariants = {
  open: {
    width: "97%",
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const,
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
  closed: {
    transition: { duration: 0.2, ease: "easeInOut" as const },
  },
}

const sharedTransition: Transition = { duration: 0.6, ease: "easeInOut" as const }

export const SidePanelVideo = forwardRef<HTMLDivElement, ComponentProps>(
  ({ panelOpen, handlePanelOpen, className, renderButton, children }, ref) => {
    const [measureRef, bounds] = useMeasure()

    return (
      <ResizablePanelInternal>
        <motion.div
          ref={ref}
          className={cn(
            "bg-muted/40 rounded-r-[44px] w-[160px] md:w-[260px]",
            className
          )}
          animate={panelOpen ? "open" : "closed"}
          variants={sectionVariants}
        >
          <motion.div
            animate={{ height: bounds.height > 0 ? bounds.height : undefined }}
            className="h-auto"
            transition={{ type: "spring", bounce: 0.02, duration: 0.65 }}
          >
            <div ref={measureRef}>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={String(panelOpen)}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={cn(
                      "flex items-center w-full justify-start pl-4 md:pl-4 py-1 md:py-3",
                      panelOpen ? "pr-3" : ""
                    )}
                  >
                    {renderButton && renderButton(handlePanelOpen)}
                  </div>

                  {panelOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={sharedTransition}
                    >
                      {children}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </ResizablePanelInternal>
    )
  }
)
SidePanelVideo.displayName = "SidePanelVideo"
