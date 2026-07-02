import LoginHero from "@/components/login/LoginHero";
import LoginCard from "@/components/login/LoginCard";

export default function Login() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#fcf8ff] via-[#f0ecf9] to-[#e9e4f5] p-6">
      {/* Main card */}
      <div className="w-full max-w-5xl flex rounded-3xl shadow-2xl shadow-purple-900/10 overflow-hidden">
        <LoginHero />
        <LoginCard />
      </div>

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
