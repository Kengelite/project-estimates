import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/api/auth";
import Swal from "sweetalert2"; // 1. Import SweetAlert2 เข้ามา
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal); // ใช้ตัวนี้เพื่อให้รองรับ React Component ใน Alert (ถ้าต้องการ)

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      MySwal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all fields",
        confirmButtonColor: "#111827", // สีเทาเข้มแบบปุ่มของคุณ
      });
      return;
    }

    try {
      setIsLoading(true);
      
      await login(email, password); 
      
      await MySwal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/dashboard");

    } catch (error: any) {
      console.error("Login Error:", error);
      const backendError = error.response?.data?.error || "Login failed. Please try again.";

      // ❌ แสดง Error Alert เมื่อ Login พลาด
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: backendError,
        confirmButtonColor: "#ef4444", // สีแดง
      });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {/* Icon */}
          <div className="flex justify-center mb-2">
               <img src="CPFF.png" alt="Logo" width={160} height={160} />
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign in</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-5 outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-5 outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-medium py-3 rounded-lg transition-colors duration-200 mt-6 flex justify-center items-center ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800"
              }`}
            >
              {isLoading ? <span>Signing in...</span> : <span>Sign in</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;