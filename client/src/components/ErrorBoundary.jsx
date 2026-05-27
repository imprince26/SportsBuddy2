import React from 'react';
import { AlertTriangle, Bug, Home, RefreshCw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
      errorId: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    this.logErrorSafely(error, errorInfo);
  }

  logErrorSafely = (error, errorInfo) => {
    try {
      const errorData = {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId,
        buildVersion: import.meta.env.VITE_APP_VERSION || import.meta.env.MODE || 'development',
      };

      console.error('ErrorBoundary caught an error:', errorData);
    } catch (loggingError) {
      console.error('ErrorBoundary logging failed:', loggingError);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.assign('/');
  };

  copyErrorDetails = async () => {
    if (!navigator.clipboard) return;

    await navigator.clipboard.writeText([
      `Error ID: ${this.state.errorId}`,
      `Message: ${this.state.error?.message || 'Unknown error'}`,
      `URL: ${window.location.href}`,
      `Time: ${new Date().toISOString()}`,
    ].join('\n'));
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="relative min-h-screen overflow-hidden bg-background px-4 py-10 text-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center justify-center">
          <Card className="w-full overflow-hidden border-border/80 bg-card shadow-lg dark:border-white/10 dark:bg-slate-950">
            <CardHeader className="border-b border-border/70 bg-muted/20 px-6 py-6 dark:border-white/10 dark:bg-slate-900/60">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 dark:bg-blue-500/10 dark:text-blue-300">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="min-w-0 space-y-1 text-left">
                  <CardTitle className="text-xl font-semibold sm:text-2xl">
                    Something went wrong
                  </CardTitle>
                  <p className="text-sm leading-6 text-muted-foreground">
                    We could not load this part of the app. Try again, reload the page, or return home.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-xl border border-border bg-background/70 p-4 text-sm dark:border-white/10 dark:bg-slate-900/60">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-medium text-muted-foreground">Error ID</span>
                  <code className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-foreground dark:border-white/10 dark:bg-white/[0.04]">
                    {this.state.errorId}
                  </code>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleReload} className="w-full border-border dark:border-white/10">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="w-full border-border dark:border-white/10">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {this.state.error && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => this.setState((state) => ({ showDetails: !state.showDetails }))}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Bug className="h-4 w-4" />
                    {this.state.showDetails ? 'Hide technical details' : 'Show technical details'}
                  </button>

                  {this.state.showDetails && (
                    <div className="space-y-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 dark:bg-destructive/10">
                      <div className="break-words font-mono text-xs text-destructive">
                        {this.state.error.message}
                      </div>
                      {this.state.errorInfo?.componentStack && (
                        <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-background p-3 text-xs text-muted-foreground dark:bg-slate-900">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                      <Button variant="ghost" size="sm" onClick={this.copyErrorDetails}>
                        Copy error details
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground">
                Your session is safe. If this keeps happening, share the Error ID with support.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
