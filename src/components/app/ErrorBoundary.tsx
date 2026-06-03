import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

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
    console.warn("[LEXOR] ErrorBoundary caught:", error.message, info);
  }

  render() {
    if (this.state.hasError) {
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
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            {this.props.fallbackMessage || "An unexpected error occurred. Please try again."}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="gap-2 border-[#C8A951] text-[#C8A951] hover:bg-[#C8A951]/10"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              Reload App
            </Button>
          </div>
          <p className="mt-8 text-xs text-muted-foreground/50">
            LEXOR® v2.1.5 — If this persists, contact support
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
