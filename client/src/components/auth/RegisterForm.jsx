/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/utils/api";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  AtSign,
  Lock,
  ArrowRight,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name cannot exceed 50 characters")
    .regex(/^[A-Za-z\s]+$/, "Full name can only contain letters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});
const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputStates, setInputStates] = useState({
    name: { value: "", isFocused: false, hasContent: false },
    username: { value: "", isFocused: false, hasContent: false },
    email: { value: "", isFocused: false, hasContent: false },
    password: { value: "", isFocused: false, hasContent: false },
  });
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post("/auth/register", data);
      toast.success("Registration successful! Please log in.", {
        style: {
          background: "#0F2C2C",
          color: "#E0F2F1",
          border: "1px solid #1D4E4E",
        },
        iconTheme: {
          primary: "#4CAF50",
          secondary: "#E0F2F1",
        },
        duration: 5000,
      });
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed", {
        style: {
          background: "#0F2C2C",
          color: "#E0F2F1",
          border: "1px solid #1D4E4E",
        },
        iconTheme: {
          primary: "#FF5252",
          secondary: "#E0F2F1",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setInputStates((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        hasContent: value.length > 0,
      },
    }));
  };

  const handleInputFocus = (name, isFocused) => {
    setInputStates((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        isFocused,
      },
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name Input */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={`text-[#B0BEC5] transition-all duration-300 
                      ${inputStates.name.isFocused ? "text-[#4CAF50]" : ""}`}
                  htmlFor="name"
                >
                  Full Name
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <User
                      className={`absolute left-3 top-1/2 -translate-y-1/2 
                          transition-all duration-300 
                          ${
                            inputStates.name.isFocused
                              ? "text-[#4CAF50] scale-110"
                              : "text-[#607D8B]"
                          }`}
                      size={20}
                    />
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter your full name"
                      disabled={isLoading}
                      onFocus={() => handleInputFocus("name", true)}
                      onBlur={() => handleInputFocus("name", false)}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange("name", e.target.value);
                      }}
                      autoComplete="name"
                      className={`pl-10 pr-3 
                          bg-[#1D4E4E]/30 
                          border-[#2E7D32]/30
                          text-[#E0F2F1] 
                          placeholder-[#607D8B]
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                          focus:outline-none
                          focus-visible:ring-0
                          ${
                            inputStates.name.isFocused
                              ? "ring-2 ring-[#4CAF50]/50 border-[#4CAF50]/70"
                              : "hover:border-[#2E7D32]"
                          }
                          ${
                            inputStates.name.hasContent
                              ? "border-[#66BB6A]"
                              : ""
                          }`}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[#FF5252] text-sm" />
              </FormItem>
            )}
          />

          {/* Username Input */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={`text-[#B0BEC5] transition-all duration-300 
                      ${
                        inputStates.username.isFocused ? "text-[#4CAF50]" : ""
                      }`}
                  htmlFor="username"
                >
                  Username
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <AtSign
                      className={`absolute left-3 top-1/2 -translate-y-1/2 
                          transition-all duration-300 
                          ${
                            inputStates.username.isFocused
                              ? "text-[#4CAF50] scale-110"
                              : "text-[#607D8B]"
                          }`}
                      size={20}
                    />
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter your username"
                      disabled={isLoading}
                      onFocus={() => handleInputFocus("username", true)}
                      onBlur={() => handleInputFocus("username", false)}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange("username", e.target.value);
                      }}
                      autoComplete="username"
                      className={`pl-10 pr-3 
                          bg-[#1D4E4E]/30 
                          border-[#2E7D32]/30
                          text-[#E0F2F1] 
                          placeholder-[#607D8B]
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                          focus:outline-none
                          focus-visible:ring-0
                          ${
                            inputStates.username.isFocused
                              ? "ring-2 ring-[#4CAF50]/50 border-[#4CAF50]/70"
                              : "hover:border-[#2E7D32]"
                          }
                          ${
                            inputStates.username.hasContent
                              ? "border-[#66BB6A]"
                              : ""
                          }`}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[#FF5252] text-sm" />
              </FormItem>
            )}
          />

          {/* Email Input */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={`text-[#B0BEC5] transition-all duration-300 
                      ${inputStates.email.isFocused ? "text-[#4CAF50]" : ""}`}
                  htmlFor="email"
                >
                  Email Address
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Mail
                      className={`absolute left-3 top-1/2 -translate-y-1/2 
                          transition-all duration-300 
                          ${
                            inputStates.email.isFocused
                              ? "text-[#4CAF50] scale-110"
                              : "text-[#607D8B]"
                          }`}
                      size={20}
                    />
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      disabled={isLoading}
                      onFocus={() => handleInputFocus("email", true)}
                      onBlur={() => handleInputFocus("email", false)}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange("email", e.target.value);
                      }}
                      autoComplete="email"
                      className={`pl-10 pr-3 
                          bg-[#1D4E4E]/30 
                          border-[#2E7D32]/30
                          text-[#E0F2F1] 
                          placeholder-[#607D8B]
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                          focus:outline-none
                          focus-visible:ring-0
                          ${
                            inputStates.email.isFocused
                              ? "ring-2 ring-[#4CAF50]/50 border-[#4CAF50]/70"
                              : "hover:border-[#2E7D32]"
                          }
                          ${
                            inputStates.email.hasContent
                              ? "border-[#66BB6A]"
                              : ""
                          }`}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[#FF5252] text-sm" />
              </FormItem>
            )}
          />

          {/* Password Input */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={`text-[#B0BEC5] transition-all duration-300 
                      ${
                        inputStates.password.isFocused ? "text-[#4CAF50]" : ""
                      }`}
                  htmlFor="password"
                >
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Lock
                      className={`absolute left-3 top-1/2 -translate-y-1/2 
                          transition-all duration-300 
                          ${
                            inputStates.password.isFocused
                              ? "text-[#4CAF50] scale-110"
                              : "text-[#607D8B]"
                          }`}
                      size={20}
                    />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      onFocus={() => handleInputFocus("password", true)}
                      onBlur={() => handleInputFocus("password", false)}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange("password", e.target.value);
                      }}
                      autoComplete="new-password"
                      className={`pl-10 pr-10 
                          bg-[#1D4E4E]/30 
                          border-[#2E7D32]/30
                          text-[#E0F2F1] 
                          placeholder-[#607D8B]
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                          focus:outline-none
                          focus-visible:ring-0
                          ${
                            inputStates.password.isFocused
                              ? "ring-2 ring-[#4CAF50]/50 border-[#4CAF50]/70"
                              : "hover:border-[#2E7D32]"
                          }
                          ${
                            inputStates.password.hasContent
                              ? "border-[#66BB6A]"
                              : ""
                          }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isLoading}
                      onClick={togglePasswordVisibility}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-[#607D8B] hover:bg-[#1D4E4E] hover:text-[#4CAF50] disabled:opacity-50"
                    >
                      {showPassword ? (
                        <EyeOffIcon size={20} />
                      ) : (
                        <EyeIcon size={20} />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage className="text-[#FF5252] text-sm" />
                <p className="text-xs text-[#81C784] mt-1">
                  Password must contain at least 6 characters, including uppercase, lowercase, 
                  number and special character
                </p>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-[#4CAF50] hover:bg-[#388E3C] 
                text-[#E0F2F1] font-semibold tracking-wide
                transition-all duration-300 group
                flex items-center justify-center gap-2
                shadow-md hover:shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !form.formState.isValid}
          >
            {isLoading ? (
              <>
                <span className="animate-pulse">Registering...</span>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </>
            ) : (
              <>
                Register
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[#B0BEC5]">
          Already have an account?{" "}
          <Button
            variant="link"
            disabled={isLoading}
            className="text-[#4CAF50] hover:text-[#388E3C] disabled:opacity-50"
            onClick={() => navigate("/login")}
          >
            Login Here
          </Button>
        </p>
      </div>
    </>
  );
};

export default RegisterForm;
