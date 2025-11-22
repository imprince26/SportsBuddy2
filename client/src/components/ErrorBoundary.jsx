import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug, 
  Mail, 
  ArrowLeft,
  Shield,
  Zap,
  HelpCircle,
  ExternalLink,
  Terminal,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      isRetrying: false,
      retryCount: 0,
      showDetails: false,
      copied: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to your error reporting service
    this.setState({
      error,
      errorInfo
    });

    // Log to console for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // You can also log the error to an error reporting service here
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In a real app, you would send this to your error reporting service
    // like Sentry, LogRocket, or Bugsnag
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      userId: this.getUserId(), // Get user ID if available
      buildVersion: process.env.REACT_APP_VERSION || 'development'
    };

    // Example: Send to your logging service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData)
    // });

    console.log('Error logged:', errorData);
  };

  getUserId = () => {
    // Try to get user ID from your auth context or localStorage
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  };

  handleRetry = async () => {
    this.setState({ isRetrying: true });
    
    // Wait a moment before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
      retryCount: prevState.retryCount + 1,
      showDetails: false
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const subject = encodeURIComponent(`Bug Report - Error ID: ${this.state.errorId}`);
    const body = encodeURIComponent(`
Error Details:
- Error ID: ${this.state.errorId}
- Message: ${this.state.error?.message || 'Unknown error'}
- URL: ${window.location.href}
- Time: ${new Date().toISOString()}
- User Agent: ${navigator.userAgent}

Please describe what you were doing when this error occurred:
[Your description here]
    `);
    
    window.open(`mailto:support@sportsbuddy.com?subject=${subject}&body=${body}`);
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  copyErrorDetails = () => {
    const errorDetails = `
Error ID: ${this.state.errorId}
Message: ${this.state.error?.message}
URL: ${window.location.href}
Time: ${new Date().toISOString()}
    `;
    navigator.clipboard.writeText(errorDetails);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  getErrorCategory = () => {
    const message = this.state.error?.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch')) {
      return { type: 'Network Error', color: 'bg-blue-500', icon: Zap };
    }
    if (message.includes('chunk') || message.includes('loading')) {
      return { type: 'Loading Error', color: 'bg-purple-500', icon: RefreshCw };
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return { type: 'Permission Error', color: 'bg-yellow-500', icon: Shield };
    }
    
    return { type: 'Application Error', color: 'bg-red-500', icon: Bug };
  };

  render() {
    if (this.state.hasError) {
      const errorCategory = this.getErrorCategory();
      const ErrorIcon = errorCategory.icon;

      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Large Gradient Orbs */}
            <motion.div 
              className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div 
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-destructive/20 to-destructive/5 rounded-full blur-3xl"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            
            {/* Floating Particles */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 rounded-full ${i % 3 === 0 ? 'bg-primary/40' : i % 3 === 1 ? 'bg-destructive/40' : 'bg-muted-foreground/30'}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 4 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut"
                }}
              />
            ))}

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--foreground-rgb),0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--foreground-rgb),0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
          </div>

          {/* Main Content */}
          <div className="container mx-auto max-w-4xl px-4 py-8 md:py-16 relative z-10 min-h-screen flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full"
            >
              {/* Glassmorphic Error Card */}
              <Card className="border-border/40 bg-card/60 backdrop-blur-2xl shadow-2xl shadow-black/10 dark:shadow-black/50 overflow-hidden relative">
                {/* Top Accent Bar */}
                <div className={`h-1.5 w-full ${errorCategory.color}`} />
                
                <CardHeader className="text-center space-y-8 pb-8 pt-12">
                  {/* 3D Error Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.2 
                    }}
                    className="flex justify-center"
                  >
                    <div className="relative">
                      {/* Main Icon Container */}
                      <motion.div
                        animate={{ 
                          rotateY: [0, 10, -10, 0],
                          rotateX: [0, -5, 5, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className={`relative w-28 h-28 rounded-3xl ${errorCategory.color} flex items-center justify-center shadow-2xl`}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <ErrorIcon className="w-14 h-14 text-white relative z-10" strokeWidth={2} />
                        
                        {/* Inner glow */}
                        <div className="absolute inset-2 bg-white/20 rounded-2xl blur-md" />
                      </motion.div>
                      
                      {/* Pulsing Ring */}
                      <motion.div
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.4, 0.8, 0.4]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className={`absolute inset-0 ${errorCategory.color} rounded-3xl blur-2xl opacity-50`}
                      />
                      
                      {/* Rotating Ring */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-4"
                      >
                        <div className={`w-full h-full rounded-full border-2 border-dashed ${errorCategory.color.replace('bg-', 'border-')} opacity-30`} />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Error Type Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Badge className={`${errorCategory.color} text-white border-0 px-5 py-2 text-sm font-semibold shadow-lg`}>
                      {errorCategory.type}
                    </Badge>
                  </motion.div>

                  {/* Title and Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4"
                  >
                    <CardTitle className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                      Oops! Something Went Wrong
                    </CardTitle>
                    <CardDescription className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                      We encountered an unexpected error. Our team has been automatically notified and we're working on a fix. 
                      Your experience matters to us!
                    </CardDescription>
                  </motion.div>
                </CardHeader>

                <CardContent className="space-y-8 pb-10">
                  {/* Error Info Grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    {[
                      { label: 'Error ID', value: this.state.errorId, mono: true },
                      { label: 'Retry Attempts', value: this.state.retryCount, mono: false },
                      { label: 'Timestamp', value: new Date().toLocaleTimeString(), mono: false }
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 backdrop-blur-sm"
                      >
                        <div className="text-sm font-medium text-muted-foreground mb-2">{item.label}</div>
                        <div className={`font-bold ${item.mono ? 'font-mono text-xs' : 'text-lg'} truncate`}>
                          {item.value}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Technical Details Accordion */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="border-t border-border/50 pt-6"
                  >
                    <Button
                      variant="ghost"
                      onClick={this.toggleDetails}
                      className="w-full justify-between hover:bg-muted/70 group py-6"
                    >
                      <span className="flex items-center gap-3 text-base font-semibold">
                        <Terminal className="w-5 h-5 group-hover:text-primary transition-colors" />
                        Technical Details
                      </span>
                      <motion.div
                        animate={{ rotate: this.state.showDetails ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </motion.div>
                    </Button>

                    <AnimatePresence>
                      {this.state.showDetails && this.state.error && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-4">
                            {/* Error Message */}
                            <div className="p-5 rounded-xl bg-gradient-to-br from-destructive/15 to-destructive/5 border-2 border-destructive/30">
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-bold text-destructive flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" />
                                  Error Message
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={this.copyErrorDetails}
                                  className="h-8 px-3 hover:bg-destructive/20"
                                >
                                  {this.state.copied ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-green-600" />
                                      <span className="text-green-600 font-medium">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                                      <span className="font-medium">Copy</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                              <div className="font-mono text-sm break-words text-destructive/90 bg-destructive/5 p-3 rounded-lg">
                                {this.state.error.message}
                              </div>
                            </div>

                            {/* Stack Trace */}
                            {this.state.error.stack && (
                              <details className="group cursor-pointer">
                                <summary className="p-4 rounded-xl bg-muted/60 hover:bg-muted border border-border/50 text-sm font-semibold flex items-center gap-2 transition-all">
                                  <Bug className="w-4 h-4 group-open:text-primary transition-colors" />
                                  Stack Trace
                                  <ChevronDown className="w-4 h-4 ml-auto group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="mt-3 p-5 rounded-xl bg-muted/30 border-2 border-border/50 overflow-x-auto max-h-80">
                                  <pre className="text-xs font-mono whitespace-pre-wrap break-words leading-relaxed">
                                    {this.state.error.stack}
                                  </pre>
                                </div>
                              </details>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <Separator className="my-6" />

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-wrap justify-center gap-3"
                  >
                    {[
                      { 
                        onClick: this.handleRetry, 
                        disabled: this.state.isRetrying,
                        variant: 'default',
                        icon: RefreshCw,
                        label: this.state.isRetrying ? 'Retrying...' : 'Try Again',
                        spinning: this.state.isRetrying
                      },
                      { onClick: this.handleReload, variant: 'outline', icon: RefreshCw, label: 'Reload Page' },
                      { onClick: this.handleGoHome, variant: 'outline', icon: Home, label: 'Go Home' },
                      { onClick: this.handleReportBug, variant: 'outline', icon: Mail, label: 'Report Bug' }
                    ].map((btn, idx) => {
                      const Icon = btn.icon;
                      return (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={btn.onClick}
                            disabled={btn.disabled}
                            variant={btn.variant}
                            size="lg"
                            className={`shadow-lg ${btn.variant === 'default' ? 'bg-primary hover:bg-primary/90 text-white' : ''}`}
                          >
                            <Icon className={`w-5 h-5 mr-2 ${btn.spinning ? 'animate-spin' : ''}`} />
                            {btn.label}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </motion.div>

                  {/* Help Section */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${errorCategory.color} flex-shrink-0`}>
                        <HelpCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="space-y-3 flex-1">
                        <div className="font-bold text-lg">Need Assistance?</div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Try refreshing the page or clearing your browser cache
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Ensure you have a stable internet connection
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Contact support with Error ID: <span className="font-mono font-bold text-foreground">{this.state.errorId}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 text-center space-y-2"
              >
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>SportsBuddy Error Tracking • Your data is secure</span>
                </div>
                <div className="text-xs text-muted-foreground/70">
                  Error logged and reported automatically
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;