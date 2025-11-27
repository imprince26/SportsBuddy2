import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  KeyRound,
  Lock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Mail,
  Shield,
  Clock,
  Trophy,
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

  return (
    <div className="min-h-screen bg-card relative overflow-hidden flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <Card className="border-border bg-card shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <CardHeader className="text-center pb-6 bg-card/20 border-b border-slate-100 dark:border-slate-800">
            <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Animated Icon Container */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                <div className="absolute inset-1 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                  {step === 1 ? (
                    <KeyRound className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              </div>

              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                {step === 1 ? "Verify Reset Code" : "Set New Password"}
              </CardTitle>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {step === 1
                  ? "Enter the 6-digit code sent to your email"
                  : "Choose a strong password for your account"
                }
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center space-x-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors duration-300 ${step === 1
                    ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white'
                    : 'bg-green-600 text-white'
                  }`}>
                  {step === 1 ? '1' : <CheckCircle className="w-4 h-4" />}
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Verify Code</span>
              </div>
              <div className={`h-0.5 w-8 transition-colors duration-300 ${step === 2 ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors duration-300 ${step === 2
                    ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                  2
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">New Password</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {error && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <Alert className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">
                    Error
                  </AlertTitle>
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 1: Verify Code Form */}
            {step === 1 && (
              <Form {...step1Form}>
                <form onSubmit={step1Form.handleSubmit(onVerifyCode)} className="space-y-6">
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                    <FormField
                      control={step1Form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ModernInput
                              icon={Mail}
                              type="email"
                              placeholder="Email Address"
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
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                    <FormField
                      control={step1Form.control}
                      name="resetCode"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                            6-Digit Reset Code
                          </Label>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="text"
                                placeholder="000000"
                                maxLength={6}
                                {...field}
                                className="h-10 text-center text-2xl font-mono tracking-[0.5em] border-2 border-border focus:border-blue-600 dark:focus:border-blue-500 rounded-xl bg-slate-50 dark:bg-slate-800/50 transition-all duration-300"
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
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Time Sensitive</span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Code expires in 10 minutes. Check spam if not received.
                      </p>
                    </div>
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                    <Button
                      type="submit"
                      disabled={verifying}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
                    >
                      <div className="flex items-center justify-center">
                        {verifying ? (
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
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
                  </div>

                  <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium hover:underline transition-colors inline-flex items-center space-x-1"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Didn't receive the code? Send again</span>
                    </Link>

                    <div className="flex items-center justify-center">
                      <Link
                        to="/login"
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium hover:underline transition-colors flex items-center space-x-1"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Login</span>
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 2: New Password Form */}
            {step === 2 && (
              <Form {...step2Form}>
                <form onSubmit={step2Form.handleSubmit(onResetPassword)} className="space-y-6">
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                    <FormField
                      control={step2Form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ModernInput
                              icon={Lock}
                              type="password"
                              placeholder="New Password"
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
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                    <FormField
                      control={step2Form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ModernInput
                              icon={Lock}
                              type="password"
                              placeholder="Confirm Password"
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
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                        <Shield className="w-4 h-4" />
                        <span className="font-medium">Password Requirements</span>
                      </div>
                      <ul className="text-xs text-slate-500 dark:text-slate-500 mt-2 space-y-1">
                        <li>• At least 6 characters long</li>
                        <li>• Include letters and numbers</li>
                        <li>• Use a unique password</li>
                      </ul>
                    </div>
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
                    >
                      <div className="flex items-center justify-center">
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
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
                  </div>

                  <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                    <div className="flex items-center justify-center space-x-4">
                      <Link
                        to="/login"
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium hover:underline transition-colors flex items-center space-x-1"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Login</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium hover:underline transition-colors flex items-center space-x-1"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Change Code</span>
                      </button>
                    </div>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* SportsBuddy Branding */}
        <div
          className="text-center mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-lg text-slate-900 dark:text-slate-50">SportsBuddy</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Secure password reset for your sports community
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
