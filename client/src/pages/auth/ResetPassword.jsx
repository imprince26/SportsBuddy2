import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  KeyRound,
  Lock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Shield,
  Clock,
  Zap,
  Trophy,
  Users,
  Target
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ModernInput from "@/components/ModernInput"
import api from "@/utils/api"
import { toast } from "react-hot-toast"

// Conditional schema based on step
const step1Schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  resetCode: z.string().min(6, "Reset code must be 6 digits").max(6, "Reset code must be 6 digits"),
})

const step2Schema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const ResetPassword = () => {
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [step, setStep] = useState(1) // 1: verify code, 2: set new password
  const [resetToken, setResetToken] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  // Step 1 form (email + reset code)
  const step1Form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      email: "",
      resetCode: "",
    },
  })

  // Step 2 form (new password)
  const step2Form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onVerifyCode = async (data) => {
    console.log('Verifying code with data:', data)
    setVerifying(true)
    setError("")

    try {
      const response = await api.post("/auth/verify-reset-code", {
        email: data.email,
        resetCode: data.resetCode,
      })

      if (response.data.success) {
        setResetToken(response.data.data.resetToken)
        setStep(2)
        toast.success("Code verified! Now set your new password.")
      }
    } catch (err) {
      console.error('Verify code error:', err)
      const message = err.response?.data?.message || "Invalid reset code"
      setError(message)
      toast.error(message)
    } finally {
      setVerifying(false)
    }
  }

  const onResetPassword = async (data) => {
    console.log('Resetting password with data:', data)
    setLoading(true)
    setError("")

    try {
      const response = await api.post("/auth/reset-password", {
        resetToken,
        newPassword: data.newPassword,
      })

      if (response.data.success) {
        toast.success("Password reset successfully!")
        navigate("/login", { 
          state: { 
            message: "Password reset successfully. Please login with your new password.",
            type: "success"
          } 
        })
      }
    } catch (err) {
      console.error('Reset password error:', err)
      const message = err.response?.data?.message || "Failed to reset password"
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
        {[Trophy, Zap, Users, Target, KeyRound, Shield].map((Icon, i) => (
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
                    {step === 1 ? (
                      <KeyRound className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Lock className="w-10 h-10 text-green-600 dark:text-green-400" />
                    )}
                  </motion.div>
                </div>

                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {step === 1 ? "Verify Reset Code" : "Set New Password"}
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {step === 1 
                    ? "Enter the 6-digit code sent to your email"
                    : "Choose a strong password for your account"
                  }
                </p>
              </motion.div>

              {/* Step Indicator */}
              <motion.div 
                variants={itemVariants}
                className="flex items-center justify-center space-x-4 mt-6"
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    step === 1 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-green-600 text-white'
                  }`}>
                    {step === 1 ? '1' : <CheckCircle className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Verify Code</span>
                </div>
                <div className={`h-0.5 w-8 ${step === 2 ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    step === 2 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                  }`}>
                    2
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">New Password</span>
                </div>
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

              {/* Step 1: Verify Code Form */}
              {step === 1 && (
                <Form {...step1Form}>
                  <form onSubmit={step1Form.handleSubmit(onVerifyCode)} className="space-y-6">
                    <motion.div variants={itemVariants}>
                      <FormField
                        control={step1Form.control}
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
                                error={step1Form.formState.errors.email?.message}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FormField
                        control={step1Form.control}
                        name="resetCode"
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                              6-Digit Reset Code
                            </Label>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="text"
                                  placeholder="000000"
                                  maxLength={6}
                                  {...field}
                                  className="h-14 text-center text-2xl font-mono tracking-[0.5em] border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl bg-gray-50 dark:bg-gray-800/50 transition-all duration-300"
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                                    field.onChange(value)
                                  }}
                                />
                              </div>
                            </FormControl>
                            {step1Form.formState.errors.resetCode && (
                              <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                                <AlertCircle className="w-4 h-4" />
                                <span>{step1Form.formState.errors.resetCode.message}</span>
                              </p>
                            )}
                          </FormItem>
                        )}
                      />
                    </motion.div>

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

                    <motion.div variants={itemVariants}>
                      <Button
                        type="submit"
                        disabled={verifying}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <div className="relative z-10 flex items-center justify-center">
                          {verifying ? (
                            <div className="flex items-center space-x-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                              />
                              <span>Verifying Code...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <KeyRound className="w-4 h-4" />
                              <span>Verify Code</span>
                            </div>
                          )}
                        </div>
                      </Button>
                    </motion.div>

                    <motion.div variants={itemVariants} className="text-center space-y-3">
                      <Link
                        to="/forgot-password"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors inline-flex items-center space-x-1"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Didn't receive the code? Send again</span>
                      </Link>
                      
                      <div className="flex items-center justify-center">
                        <Link
                          to="/login"
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium hover:underline transition-colors flex items-center space-x-1"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back to Login</span>
                        </Link>
                      </div>
                    </motion.div>
                  </form>
                </Form>
              )}

              {/* Step 2: New Password Form */}
              {step === 2 && (
                <Form {...step2Form}>
                  <form onSubmit={step2Form.handleSubmit(onResetPassword)} className="space-y-6">
                    <motion.div variants={itemVariants}>
                      <FormField
                        control={step2Form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <ModernInput
                                icon={Lock}
                                type="password"
                                placeholder="Enter new password"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                error={step2Form.formState.errors.newPassword?.message}
                                showPassword={showPassword}
                                onTogglePassword={() => setShowPassword(!showPassword)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FormField
                        control={step2Form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <ModernInput
                                icon={Lock}
                                type="password"
                                placeholder="Confirm new password"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                error={step2Form.formState.errors.confirmPassword?.message}
                                showPassword={showConfirmPassword}
                                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700/50">
                        <div className="flex items-center space-x-2 text-sm text-green-800 dark:text-green-200">
                          <Shield className="w-4 h-4" />
                          <span className="font-medium">Password Requirements</span>
                        </div>
                        <ul className="text-xs text-green-700 dark:text-green-300 mt-2 space-y-1">
                          <li>• At least 6 characters long</li>
                          <li>• Include letters and numbers</li>
                          <li>• Use a unique password</li>
                        </ul>
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
                              <span>Resetting Password...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Lock className="w-4 h-4" />
                              <span>Reset Password</span>
                            </div>
                          )}
                        </div>
                      </Button>
                    </motion.div>

                    <motion.div variants={itemVariants} className="text-center space-y-3">
                      <div className="flex items-center justify-center space-x-4">
                        <Link
                          to="/login"
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium hover:underline transition-colors flex items-center space-x-1"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back to Login</span>
                        </Link>
                        
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium hover:underline transition-colors flex items-center space-x-1"
                        >
                          <KeyRound className="w-4 h-4" />
                          <span>Change Code</span>
                        </button>
                      </div>
                    </motion.div>
                  </form>
                </Form>
              )}
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
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Secure password reset for your sports community
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default ResetPassword