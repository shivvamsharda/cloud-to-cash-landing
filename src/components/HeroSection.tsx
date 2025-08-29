import { Button } from "@/components/ui/button";
import SolanaWalletAuth from "@/components/SolanaWalletAuth";

const HeroSection = () => {
  return (
    <section 
      className="min-h-screen sm:min-h-[calc(100vh-4rem)] mt-0 sm:mt-16 relative overflow-hidden bg-[hsl(var(--pure-black))] w-full flex items-center justify-center"
    >
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10 sm:opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px sm:50px sm:50px'
        }}
      />
      
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 z-10 bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://paugtcnvqdbjcrrmjxma.supabase.co/storage/v1/object/public/website/VapeFi_Hero_Trans.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center center'
        }}
      />
      
      {/* Hero Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 text-center py-8 sm:py-16">
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 text-white leading-tight">
          Turn Your Vape Into
          <span className="block text-[hsl(var(--button-green))] mt-2">Real Rewards</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
          Track your vaping sessions with AI-powered detection and earn cryptocurrency rewards for your engagement.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <SolanaWalletAuth className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold min-w-[180px] sm:min-w-[200px] bg-white text-brand-purple border-white hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] w-full sm:w-auto">
            Start Earning Now
          </SolanaWalletAuth>
          <Button variant="hero-outline" size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold min-w-[180px] sm:min-w-[200px] border-[hsl(var(--button-green))] text-[hsl(var(--button-green))] bg-transparent hover:bg-[hsl(var(--button-green))]/10 hover:shadow-[0_0_30px_hsl(var(--button-green)/0.4)] transition-all duration-300 w-full sm:w-auto">
            Learn How It Works
          </Button>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;