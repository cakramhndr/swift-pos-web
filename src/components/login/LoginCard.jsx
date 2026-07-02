import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginCard() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Mohon isi semua field");
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Login berhasil");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Email atau password salah.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-10 py-12 bg-white">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#6D5DF6] to-[#5B46F5] flex items-center justify-center shadow-lg">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <span className="text-xl font-bold text-[#6D5DF6]">SwiftPOS</span>
      </div>

      {/* Form */}
      <div className="relative z-10 w-full max-w-md mx-auto animate-fade-up">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Masuk ke SwiftPOS
          </h2>
          <p className="mt-1.5 text-sm text-gray-500">
            Kelola bisnis Anda dengan lebih cerdas
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@perusahaan.com"
              className="h-[52px] w-full px-4 rounded-xl border border-[#c8c4d7] bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#6D5DF6] focus:ring-2 focus:ring-[#6D5DF6]/15 outline-none transition-all duration-200 text-sm"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-[52px] w-full px-4 pr-11 rounded-xl border border-[#c8c4d7] bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#6D5DF6] focus:ring-2 focus:ring-[#6D5DF6]/15 outline-none transition-all duration-200 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#6D5DF6] focus:ring-[#6D5DF6]/30 cursor-pointer"
            />
            <label
              htmlFor="remember"
              className="text-sm text-gray-500 cursor-pointer"
            >
              Ingat saya
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full h-[52px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DF6] to-[#5B46F5] text-sm font-semibold text-white shadow-lg shadow-[#6D5DF6]/25 hover:shadow-xl hover:shadow-[#6D5DF6]/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        {/* Inline footer */}
        <p className="mt-6 text-center text-[11px] text-gray-400">
          Powered by{" "}
          <span className="font-semibold text-[#6D5DF6]">SwiftPOS</span>
          <span className="ml-1.5 text-gray-300">v1.0.0</span>
        </p>
      </div>
    </div>
  );
}
