import { useState } from "react"
import { Link } from "react-router-dom"
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

  if (success) {
    return (
      <div className="min-h-screen bg-card/20 relative overflow-hidden flex items-center justify-center p-4">
        <HeroBg />

        <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          <Card className="border-slate-200 dark:border-slate-800 bg-card/20 shadow-xl rounded-2xl overflow-hidden">
            {/* Success Header */}
            <CardHeader className="text-center pb-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Animated Icon Container */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-2xl animate-pulse" />
                  <div className="absolute inset-1 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
                  </div>
                </div>

                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                  Check Your Email
                </CardTitle>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  We've sent a 6-digit reset code to your email address
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              {/* Info Box */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
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

              {/* Email Display */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">Email Sent</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Reset code has been sent to {form.getValues("email") || "your email address"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                <Link to="/reset-password" className="block w-full">
                  <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                    <div className="flex items-center justify-center space-x-2">
                      <KeyRound className="w-4 h-4" />
                      <span>Enter Reset Code</span>
                    </div>
                  </Button>
                </Link>
              </div>

              {/* Secondary Actions */}
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium hover:underline transition-colors flex items-center space-x-1"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Resend Code</span>
                  </button>

                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-700" />

                  <Link
                    to="/login"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium hover:underline transition-colors flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Login</span>
                  </Link>
                </div>
              </div>

              {/* Help Text */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">What's Next?</span>
                  </div>
                  <ul className="text-xs text-slate-500 dark:text-slate-500 mt-2 space-y-1">
                    <li>• Check your email inbox for the reset code</li>
                    <li>• Enter the 6-digit code on the next page</li>
                    <li>• Create a new secure password</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SportsBuddy Branding */}
          <div
            className="text-center mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-lg text-slate-900 dark:text-slate-50">SportsBuddy</span>
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Email sent successfully to your inbox
            </p>
          </div>
        </div>
      </div>
    )
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
                  <KeyRound className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                Forgot Password?
              </CardTitle>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Enter your email address and we'll send you a reset code
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {error && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <Alert className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">
                    Error
                  </AlertTitle>
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                  <FormField
                    control={form.control}
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
                            error={form.formState.errors.email?.message}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Security Notice</span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      For your security, reset codes expire in 10 minutes and are limited to 5 attempts.
                    </p>
                  </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
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
                </div>

                <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                  <Link
                    to="/login"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium hover:underline transition-colors flex items-center justify-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Login</span>
                  </Link>

                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Remember your password?{" "}
                      <Link
                        to="/login"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </Form>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">What happens next?</span>
                </div>
                <ul className="text-xs text-slate-500 dark:text-slate-500 mt-2 space-y-1">
                  <li>• Check your email inbox for the reset code</li>
                  <li>• Enter the 6-digit code on the next page</li>
                  <li>• Create a new secure password</li>
                </ul>
              </div>
            </div>
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
            Secure password recovery for your sports community
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
