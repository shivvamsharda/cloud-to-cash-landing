import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[hsl(var(--pure-black))] flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(var(--button-green))] rounded-full mix-blend-screen filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[hsl(var(--effect-purple))] rounded-full mix-blend-screen filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-[hsl(var(--button-green))] to-[hsl(var(--effect-purple))] bg-clip-text mb-4">
            404
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[hsl(var(--button-green))] to-[hsl(var(--effect-purple))] mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-white/70 text-lg">
            Looks like this page got lost in the vapor. The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/" 
            className="bg-[hsl(var(--button-green))] text-black px-8 py-3 rounded-xl font-semibold hover:bg-[hsl(var(--button-green))]/90 transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return Home
          </a>
          <button 
            onClick={() => window.history.back()}
            className="border border-[hsl(var(--button-green))] text-[hsl(var(--button-green))] px-8 py-3 rounded-xl font-semibold hover:bg-[hsl(var(--button-green))]/10 transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Route Info for Debugging */}
        <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
          <p className="text-white/50 text-sm">
            Attempted route: <span className="text-[hsl(var(--button-green))] font-mono">{location.pathname}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
