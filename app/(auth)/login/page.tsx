"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useAuth from "@/lib/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { EyeIcon, EyeOffIcon, ArrowLeft, Mail, Lock, CircleAlert } from "lucide-react";
import { AxiosError } from "axios";

// Form validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Define a type for the API error response
interface ApiErrorResponse {
  msg: string;
  [key: string]: unknown;
}

export default function LoginPage() {
  const { login, isSubmitting, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null); // Reset API error
    try {
      await login(data);
      // The redirect is handled in the useAuth hook
    } catch (error: unknown) {
      console.error("Login failed:", error);
      // Extract error message from response if available
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        setApiError(errorData.msg || "Login failed. Please try again.");
      } else {
        setApiError(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
        );
      }
    }
  };

  // Display either the auth store error or our local API error
  const errorMessage = authError || apiError;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-gray-200 hover:text-primary-600">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-200">Sign In</h1>
            <p className="mt-2 text-gray-400">
              Enter your email and password to sign in to your account
            </p>
          </div>

          <div className="space-y-6">
            {/* Social Sign In - Only Google */}
            <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-50">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
                <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
              </svg>
              <span className="text-gray-900">Continue with Google</span>
            </button>

            <div className="flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-4 text-sm text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Display error messages */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {errorMessage}
                </div>
              )}

              <div className="relative">
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  fullWidth
                  error={errors.email?.message}
                  {...register("email")}
                  disabled={isSubmitting}
                  leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                />
              </div>

              <div className="relative">
                <Input
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  fullWidth
                  error={errors.password?.message}
                  leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-5 h-5 text-gray-500" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  }
                  {...register("password")}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-indigo-500 border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-300"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-brand hover:text-indigo-700"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div className="w-full">
                <Button
                  type="submit"
                  variant="default"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full bg-brand hover:bg-indigo-700"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-brand hover:text-primary-500"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-indigo-900">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-10 bg-indigo-900 bg-opacity-90">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-6">
              <CircleAlert className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome to Time Tracker</h2>
            <p className="text-gray-200 mb-8">Track your time, manage your projects, and boost your productivity with our intuitive time tracking solution.</p>
            </div>
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: 0.2
            }}
          />
        </div>
      </div>
    </div>
  );
}
