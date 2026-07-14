import { useCallback } from "react";
import { toast } from "sonner";

/**
 * Shared hook for consistent error handling across the app.
 * Replaces the 175+ scattered toast.error / console.error patterns.
 * 
 * Usage:
 *   const { handleAsync, handleError } = useErrorHandler();
 *   await handleAsync(() => fetchStuff(), "Failed to load data");
 */
export function useErrorHandler() {
  const handleError = useCallback((error: unknown, fallbackMessage?: string) => {
    const message = error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : fallbackMessage || "Something went wrong";
    
    toast.error(message);
    
    if (import.meta.env.DEV) {
      console.error("[Error]", message, error);
    }
  }, []);

  const handleAsync = useCallback(async <T>(
    fn: () => Promise<T>,
    fallbackMessage?: string
  ): Promise<T | null> => {
    try {
      return await fn();
    } catch (error) {
      handleError(error, fallbackMessage);
      return null;
    }
  }, [handleError]);

  return { handleError, handleAsync };
}
