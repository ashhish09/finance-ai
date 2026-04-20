import SignUpForm from "./_component/signup-form";
import Logo from "@/components/logo/logo";

const SignUp = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-[#0a0a0a]">
      {/* Left Column - Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10 md:pt-6 bg-[#0a0a0a]">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo url="/" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignUpForm />
          </div>
        </div>
      </div>

      {/* Right Column - Creative UI */}
      <div className="relative hidden lg:block overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#0f1a15] to-[#0a0a0a]">
        {/* Animated gradient orbs with green theme */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-full filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

        {/* Floating transaction cards with rupee symbols */}
        <div className="absolute top-32 left-24 p-4 bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-xl animate-float shadow-lg shadow-emerald-500/5">
          <div className="text-lg font-bold text-emerald-400">+₹450</div>
          <div className="text-xs text-gray-400 mt-1">Income</div>
        </div>
        <div className="absolute top-48 right-32 p-4 bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-xl animate-float-delayed shadow-lg shadow-emerald-500/5">
          <div className="text-lg font-bold text-emerald-400">₹1,234</div>
          <div className="text-xs text-gray-400 mt-1">Savings</div>
        </div>
        <div className="absolute bottom-64 left-48 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl animate-float shadow-lg shadow-red-500/5" style={{ animationDelay: '1s' }}>
          <div className="text-lg font-bold text-red-400">-₹89</div>
          <div className="text-xs text-gray-400 mt-1">Expense</div>
        </div>
        <div className="absolute top-64 right-48 p-4 bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-xl animate-float-delayed shadow-lg shadow-emerald-500/5" style={{ animationDelay: '0.5s' }}>
          <div className="text-lg font-bold text-emerald-400">+₹2.5K</div>
          <div className="text-xs text-gray-400 mt-1">Bonus</div>
        </div>
        <div className="absolute bottom-48 right-24 p-4 bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-xl animate-float shadow-lg shadow-emerald-500/5" style={{ animationDelay: '1.5s' }}>
          <div className="text-lg font-bold text-emerald-400">₹567</div>
          <div className="text-xs text-gray-400 mt-1">Wallet</div>
        </div>

        {/* Animated rupee symbols floating */}
        <div className="absolute top-1/4 left-1/3 text-6xl text-emerald-500/10 animate-pulse">₹</div>
        <div className="absolute bottom-1/3 right-1/4 text-8xl text-emerald-500/5 animate-pulse" style={{ animationDelay: '1s' }}>₹</div>
        <div className="absolute top-1/2 right-1/3 text-5xl text-emerald-500/10 animate-pulse" style={{ animationDelay: '2s' }}>₹</div>

        {/* Content Section */}
        <div className="absolute inset-0 flex flex-col items-end justify-end p-8">
          <div className="w-full max-w-3xl backdrop-blur-sm bg-[#0a0a0a]/60 p-8 rounded-tl-3xl border border-emerald-500/20">
            <h1 className="text-3xl font-bold text-white">
              Start Your Savings Journey!
            </h1>
            <p className="mt-4 text-gray-400">
              Join thousands who are managing their money smarter. Every rupee counts!
            </p>

            {/* Stats Grid with Rupee theme */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
                <div className="text-2xl font-bold text-emerald-400">₹0</div>
                <div className="text-xs text-gray-400 mt-1">Setup Fee</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
                <div className="text-2xl font-bold text-emerald-400">FREE</div>
                <div className="text-xs text-gray-400 mt-1">Forever</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
                <div className="text-2xl font-bold text-emerald-400">10K+</div>
                <div className="text-xs text-gray-400 mt-1">Happy Users</div>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 animate-pulse">
                ✓ Zero Cost
              </div>
              <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 animate-pulse" style={{ animationDelay: '0.5s' }}>
                ✓ Easy Setup
              </div>
              <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 animate-pulse" style={{ animationDelay: '1s' }}>
                ✓ Start Saving Now
              </div>
            </div>
          </div>
        </div>

        {/* Custom Animations */}
        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -50px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(50px, 50px) scale(1.05); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes float-delayed {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-30px); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-float-delayed {
            animation: float-delayed 8s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default SignUp;