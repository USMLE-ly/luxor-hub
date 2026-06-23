import React, { lazy, Suspense, Component } from "react";
import { BrowserRouter } from "react-router-dom";

const AppContent = lazy(() => import("./AppContent"));

const Loading = () => <div className="flex items-center justify-center min-h-screen bg-background"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

class AppErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground max-w-md">Please refresh the page to try again.</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg">Refresh</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => (
  <AppErrorBoundary>
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <AppContent />
      </Suspense>
    </BrowserRouter>
  </AppErrorBoundary>
);

export default App;
