import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ActivityIcon } from "lucide-react";
import RegisterForm from "@/components/auth/RegisterForm";

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1A1A] via-[#0F2C2C] to-[#0A1A1A] p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] 
        from-[#0F2C2C]/30 via-transparent to-[#0A1A1A]/50 opacity-75"
      ></div>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2E7D32]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#4CAF50]/10 rounded-full blur-3xl"></div>
      </div>

      <Card
        className="w-full max-w-md relative z-10 border-none shadow-2xl backdrop-blur-lg 
        bg-[#0F2C2C]/70 rounded-2xl overflow-hidden transform transition-all duration-300 
        hover:scale-[1.02] hover:shadow-4xl"
      >
        <div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r 
          from-[#2E7D32] via-[#4CAF50] to-[#2E7D32] animate-gradient-x"
        ></div>

        <CardHeader className="text-center space-y-4 pb-0 pt-6">
          <div className="flex justify-center">
            <ActivityIcon
              className="h-16 w-16 text-[#4CAF50] animate-pulse"
              strokeWidth={1.5}
            />
          </div>
          <CardTitle className="text-4xl font-bold text-[#E0F2F1] tracking-tight">
            Create Account
          </CardTitle>
          <CardDescription className="text-[#81C784] text-lg">
            Join the Sports Network Community
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
