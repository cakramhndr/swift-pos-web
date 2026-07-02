export default function LoginFeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default">
      <div className="w-10 h-10 rounded-xl bg-[#6D5DF6]/10 text-[#6D5DF6] flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#6D5DF6]">{title}</p>
        <p className="text-xs text-[#6D5DF6]/60 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
