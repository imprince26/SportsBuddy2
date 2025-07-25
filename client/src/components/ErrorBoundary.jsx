import React from 'react';
import { motion } from 'framer-motion';
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
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      showDetails: false
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 overflow-hidden relative">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-blue-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-blue-950/20" />

            {/* Animated Particles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-red-400/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              />
            ))}

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '60px 60px',
                }}
              />
            </div>
          </div>

          <div className="container mx-auto max-w-4xl px-4 py-8 relative z-10 min-h-screen flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center w-full"
            >
              {/* Error Icon and Title */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative mb-8"
              >
                <div className="relative mx-auto w-32 h-32 mb-6">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute inset-0 ${errorCategory.color} rounded-full flex items-center justify-center shadow-2xl`}
                  >
                    <ErrorIcon className="w-16 h-16 text-white" />
                  </motion.div>
                  
                  {/* Pulsing effect */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute inset-0 ${errorCategory.color} rounded-full opacity-20 blur-xl`}
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-4"
                >
                  <Badge className={`${errorCategory.color} text-white border-0 mb-4 px-4 py-2`}>
                    {errorCategory.type}
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                    Oops! Something went wrong
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    We encountered an unexpected error while processing your request. 
                    Don't worry, our team has been notified and we're working on a fix.
                  </p>
                </motion.div>
              </motion.div>

              {/* Error Details Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-8"
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Error Information
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={this.toggleDetails}
                        className="text-gray-600 dark:text-gray-400"
                      >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        {this.state.showDetails ? 'Hide Details' : 'Show Details'}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Error ID</div>
                        <div className="text-gray-900 dark:text-white font-mono text-sm">
                          {this.state.errorId}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Retry Attempts</div>
                        <div className="text-gray-900 dark:text-white">
                          {this.state.retryCount}
                        </div>
                      </div>
                    </div>

                    {this.state.showDetails && this.state.error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                            Error Message
                          </div>
                          <div className="text-red-900 dark:text-red-100 font-mono text-sm break-all">
                            {this.state.error.message}
                          </div>
                        </div>

                        {this.state.error.stack && (
                          <details className="group">
                            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                              Stack Trace
                            </summary>
                            <div className="mt-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-x-auto">
                              <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                {this.state.error.stack}
                              </pre>
                            </div>
                          </details>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap justify-center gap-4 mb-8"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={this.handleRetry}
                    disabled={this.state.isRetrying}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                  >
                    {this.state.isRetrying ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Try Again
                      </>
                    )}
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={this.handleReload}
                    variant="outline"
                    size="lg"
                    className="border-gray-300 dark:border-gray-600"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Reload Page
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    size="lg"
                    className="border-gray-300 dark:border-gray-600"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Go Home
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={this.handleReportBug}
                    variant="outline"
                    size="lg"
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Report Bug
                  </Button>
                </motion.div>
              </motion.div>

              {/* Help Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center"
              >
                <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/30 dark:border-gray-700/30 max-w-lg mx-auto">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Need Help?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      If this error persists, please contact our support team with the error ID above.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open('/help', '_blank')}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Help Center
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open('/contact', '_blank')}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-8 text-center"
              >
                <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span>Your data is safe • Error reported automatically • Response time &lt; 24h</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Decorative Elements */}
          <motion.div
            className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <motion.div
            className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;