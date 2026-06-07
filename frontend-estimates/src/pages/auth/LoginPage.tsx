import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/api/auth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const MySwal = withReactContent(Swal);

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const swalConfig = {
    confirmButtonText: "ตกลง",
    confirmButtonColor: "#7c3aed",
    customClass: {
      popup: "rounded-xl",
      title: "text-gray-800",
      confirmButton: "rounded-md px-6",
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      await MySwal.fire({
        icon: "error",
        title: "ข้อมูลไม่ถูกต้อง",
        text: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน",
        ...swalConfig,
      });

      return;
    }

    try {
      setIsLoading(true);

      await login(email, password);

      await MySwal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
        text: "ยินดีต้อนรับ",
        ...swalConfig,
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login Error:", error);

      await MySwal.fire({
        icon: "error",
        title: "ข้อมูลไม่ถูกต้อง",
        text: "กรุณาลองใหม่อีกครั้ง",
        ...swalConfig,
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
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              เข้าสู่ระบบ
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-5 outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="อีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-5 outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-gray-400 transition-colors hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-medium py-3 rounded-lg transition-colors duration-200 mt-6 flex justify-center items-center ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-900 hover:bg-gray-800"
              }`}
            >
              {isLoading ? <span>กำลังเข้าสู่ระบบ...</span> : <span>เข้าสู่ระบบ</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;