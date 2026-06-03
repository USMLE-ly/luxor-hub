import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Bug } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.warn("[LUXOR] ErrorBoundary caught:", error.message, info);
    // Also try to report to any global handler
    if (typeof window !== "undefined" && (window as any).__luxorErrors) {
      (window as any).__luxorErrors.push({
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        time: new Date().toISOString(),
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleClearAndRetry = () => {
    // Clear sessionStorage that might be causing issues
    sessionStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      const isBlankError = !error?.message || error.message === "";

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
          {/* LUXOR® Logo — matching landing page style */}
          <h1
            className="font-display text-4xl font-bold tracking-wider mb-6"
            style={{
              background: 'linear-gradient(135deg, #C8A951 0%, #DAA520 50%, #B8860B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            LUXOR®
          </h1>
          
          <AlertTriangle className="w-12 h-12 text-[#DAA520] mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mb-2 max-w-md">
            {this.props.fallbackMessage || "An unexpected error occurred. Please try again."}
          </p>
          
          {/* Show error details for debugging */}
          {error?.message && (
            <details className="mb-6 max-w-md w-full">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1 justify-center">
                <Bug className="w-3 h-3" /> Error Details
              </summary>
              <div className="mt-2 p-3 bg-destructive/10 rounded-lg text-left">
                <p className="text-xs font-mono text-destructive break-words">
                  {error.message}
                </p>
                {error.stack && (
                  <pre className="mt-2 text-[10px] font-mono text-muted-foreground overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}

          {isBlankError && (
            <div className="mb-6 p-3 bg-amber-500/10 rounded-lg max-w-md">
              <p className="text-xs text-amber-400">
                The error has no message. This can happen if a resource failed to load or 
                a script was blocked by content security policy. Try reloading the app.
              </p>
            </div>
          )}

          <div className="flex gap-3 flex-wrap justify-center">
            <Button
              variant="outline"
              onClick={this.handleRetry}
              className="gap-2 border-[#C8A951] text-[#C8A951] hover:bg-[#C8A951]/10"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
            <Button
              variant="outline"
              onClick={this.handleReload}
              className="gap-2"
            >
              Reload App
            </Button>
            <Button
              variant="ghost"
              onClick={this.handleClearAndRetry}
              className="gap-2 text-destructive hover:text-destructive"
            >
              Clear & Reload
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
