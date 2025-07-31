import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  KeyRound,
  Shield,
  Clock,
  Trophy,
  Zap,
  Users,
  Target,
  Heart,
  Star,
  Activity,
  Send
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import ModernInput from "@/components/ModernInput"
import api from "@/utils/api"
import { toast } from "react-hot-toast"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setError("")

    try {
      const response = await api.post("/auth/forgot-password", {
        email: data.email,
      })

      if (response.data.success) {
        setSuccess(true)
        toast.success("Reset code sent to your email!")
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to send reset code"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-20 blur-3xl"
              style={{
                background: i % 2 === 0
                  ? "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                  : "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                width: `${200 + i * 100}px`,
                height: `${200 + i * 100}px`,
                left: `${-10 + (i * 25) % 110}%`,
                top: `${-10 + (i * 20) % 110}%`,
              }}
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Floating Success Icons */}
          {[CheckCircle, Trophy, Star, Heart, Mail, Shield].map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute text-green-200/15 dark:text-green-400/20"
              style={{
                left: `${15 + (i * 15) % 70}%`,
                top: `${20 + (i * 20) % 60}%`,
              }}
              animate={{
                y: [0, -12, 0],
                rotate: [0, 8, -8, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4 + i * 0.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Icon size={25 + (i % 3) * 8} />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            <Card className="border-0 shadow-2xl bg-white/85 dark:bg-gray-800/85 backdrop-blur-xl rounded-2xl overflow-hidden">
              {/* Success Header */}
              <CardHeader className="text-center pb-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-800 dark:to-emerald-700 border-b border-green-100 dark:border-green-700">
                <motion.div
                  variants={itemVariants}
                  className="relative"
                >
                  {/* Animated Icon Container */}
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl"
                      animate={{
                        rotate: [0, 180, 360],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    <motion.div
                      className="absolute inset-1 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </motion.div>
                  </div>

                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Check Your Email
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    We've sent a 6-digit reset code to your email address
                  </p>
                </motion.div>
              </CardHeader>

              <CardContent className="p-8 space-y-6">
                {/* Info Box */}
                <motion.div variants={itemVariants}>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700/50">
                    <div className="flex items-center space-x-2 text-sm text-blue-800 dark:text-blue-200">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Time Sensitive</span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Code expires in 10 minutes. Check spam if not received.
                    </p>
                  </div>
                </motion.div>

                {/* Email Display */}
                <motion.div variants={itemVariants}>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700/50">
                    <div className="flex items-center space-x-2 text-sm text-green-800 dark:text-green-200">
                      <Mail className="w-4 h-4" />
                      <span className="font-medium">Email Sent</span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Reset code has been sent to {form.getValues("email") || "your email address"}
                    </p>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div variants={itemVariants}>
                  <Link to="/reset-password" className="block w-full">
                    <Button className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <div className="relative z-10 flex items-center justify-center space-x-2">
                        <KeyRound className="w-4 h-4" />
                        <span>Enter Reset Code</span>
                      </div>
                    </Button>
                  </Link>
                </motion.div>

                {/* Secondary Actions */}
                <motion.div variants={itemVariants} className="space-y-3">
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => setSuccess(false)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors flex items-center space-x-1"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Resend Code</span>
                    </button>

                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />

                    <Link
                      to="/login"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium hover:underline transition-colors flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Login</span>
                    </Link>
                  </div>
                </motion.div>

                {/* Help Text */}
                <motion.div variants={itemVariants}>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">What's Next?</span>
                    </div>
                    <ul className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                      <li>• Check your email inbox for the reset code</li>
                      <li>• Enter the 6-digit code on the next page</li>
                      <li>• Create a new secure password</li>
                    </ul>
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            {/* SportsBuddy Branding */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-6"
            >
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-bold text-lg text-gray-900 dark:text-white">SportsBuddy</span>
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Email sent successfully to your inbox
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20 blur-3xl"
            style={{
              background: i % 2 === 0
                ? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
                : "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              left: `${-10 + (i * 25) % 110}%`,
              top: `${-10 + (i * 20) % 110}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Floating Sports Icons */}
        {[Mail, Shield, KeyRound, Users, Trophy, Activity].map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute text-blue-200/15 dark:text-blue-400/20"
            style={{
              left: `${15 + (i * 15) % 70}%`,
              top: `${20 + (i * 20) % 60}%`,
            }}
            animate={{
              y: [0, -12, 0],
              rotate: [0, 8, -8, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + i * 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Icon size={25 + (i % 3) * 8} />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl bg-white/85 dark:bg-gray-800/85 backdrop-blur-xl rounded-2xl overflow-hidden">
            {/* Header */}
            <CardHeader className="text-center pb-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-100 dark:border-gray-700">
              <motion.div
                variants={itemVariants}
                className="relative"
              >
                {/* Animated Icon Container */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl"
                    animate={{
                      rotate: [0, 180, 360],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <motion.div
                    className="absolute inset-1 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <KeyRound className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                </div>

                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Forgot Password?
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Enter your email address and we'll send you a reset code
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  variants={itemVariants}
                >
                  <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">
                      Error
                    </AlertTitle>
                    <AlertDescription className="text-red-700 dark:text-red-300">
                      {error}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ModernInput
                              icon={Mail}
                              type="email"
                              placeholder="Enter your email address"
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              error={form.formState.errors.email?.message}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700/50">
                      <div className="flex items-center space-x-2 text-sm text-blue-800 dark:text-blue-200">
                        <Shield className="w-4 h-4" />
                        <span className="font-medium">Security Notice</span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        For your security, reset codes expire in 10 minutes and are limited to 5 attempts.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <div className="relative z-10 flex items-center justify-center">
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            <span>Sending Reset Code...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Send className="w-4 h-4" />
                            <span>Send Reset Code</span>
                          </div>
                        )}
                      </div>
                    </Button>
                  </motion.div>

                  <motion.div variants={itemVariants} className="text-center space-y-3">
                    <Link
                      to="/login"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium hover:underline transition-colors flex items-center justify-center space-x-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Login</span>
                    </Link>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Remember your password?{" "}
                        <Link
                          to="/login"
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          Sign in here
                        </Link>
                      </p>
                    </div>
                  </motion.div>
                </form>
              </Form>

              <motion.div variants={itemVariants}>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">What happens next?</span>
                  </div>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                    <li>• Check your email inbox for the reset code</li>
                    <li>• Enter the 6-digit code on the next page</li>
                    <li>• Create a new secure password</li>
                  </ul>
                </div>
              </motion.div>
            </CardContent>
          </Card>

          {/* SportsBuddy Branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-lg text-gray-900 dark:text-white">SportsBuddy</span>
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Secure password recovery for your sports community
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default ForgotPassword
