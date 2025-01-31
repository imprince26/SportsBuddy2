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
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
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
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/register", data);
      toast.success("Registration Successful!", {
        style: {
          background: "#0F2C2C",
          color: "#E0F2F1",
          border: "1px solid #1D4E4E",
        },
        iconTheme: {
          primary: "#2E7D32",
          secondary: "#E0F2F1",
        },
      });

      navigate("/");
    } catch (error) {
      const errorMessage = error.response.data;
      toast.error(errorMessage.message, {
        style: {
          background: "#2C3E50",
          color: "#ECF0F1",
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
                      onFocus={() => handleInputFocus("name", true)}
                      onBlur={() => handleInputFocus("name", false)}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange("name", e.target.value);
                      }}
                      className={`pl-10 pr-3 
                          bg-[#1D4E4E]/30 
                          border-[#2E7D32]/30
                          text-[#E0F2F1] 
                          placeholder-[#607D8B]
                          transition-all duration-300 ease-in-out
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
                      onFocus={() => handleInputFocus("username", true)}
                      onBlur={() => handleInputFocus("username", false)}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange("username", e.target.value);
                      }}
                      className={`pl-10 pr-3 
                          bg-[#1D4E4E]/30 
                          border-[#2E7D32]/30
                          text-[#E0F2F1] 
                          placeholder-[#607D8B]
                          transition-all duration-300 ease-in-out
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
                      onFocus={() => handleInputFocus("email", true)}
                      onBlur={() => handleInputFocus("email", false)}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange("email", e.target.value);
                      }}
                      className={`pl-10 pr-3 
                          bg-[#1D4E4E]/30 
                          border-[#2E7D32]/30
                          text-[#E0F2F1] 
                          placeholder-[#607D8B]
                          transition-all duration-300 ease-in-out
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
                      onFocus={() => handleInputFocus("password", true)}
                      onBlur={() => handleInputFocus("password", false)}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange("password", e.target.value);
                      }}
                      className={`pl-10 pr-10 
                          bg-[#1D4E4E]/30 
                          border-[#2E7D32]/30
                          text-[#E0F2F1] 
                          placeholder-[#607D8B]
                          transition-all duration-300 ease-in-out
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
                      onClick={togglePasswordVisibility}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-[#607D8B] hover:bg-[#1D4E4E] hover:text-[#4CAF50]"
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
              </FormItem>
            )}
          />

          {/* Register Button */}
          <Button
            type="submit"
            className="w-full bg-[#4CAF50] hover:bg-[#388E3C] 
                text-[#E0F2F1] font-semibold tracking-wide
                transition-all duration-300 group
                flex items-center justify-center gap-2
                shadow-md hover:shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
            <ArrowRight
              className="ml-2 group-hover:translate-x-1 transition-transform"
              size={20}
            />
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[#B0BEC5]">
          Already have an account?{" "}
          <Button
            variant="link"
            className="text-[#4CAF50] hover:text-[#388E3C]"
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
