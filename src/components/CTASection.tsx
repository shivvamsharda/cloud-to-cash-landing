import { Button } from "@/components/ui/button";
import SolanaWalletAuth from "@/components/SolanaWalletAuth";

const CTASection = () => {
  return (
    <section className="bg-black relative overflow-hidden min-h-[600px] sm:min-h-[900px] px-4 sm:px-6 flex items-end">
      <div 
        className="absolute inset-0 bg-contain bg-center bg-no-repeat z-10"
        style={{
          backgroundImage: "url('https://paugtcnvqdbjcrrmjxma.supabase.co/storage/v1/object/public/website/Footer.png')",
          backgroundSize: 'cover'
        }}
      />
      <div className="max-w-4xl mx-auto relative z-20 w-full pb-12 sm:pb-24 lg:pb-32">
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <SolanaWalletAuth className="px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold min-w-[160px] sm:min-w-[180px] bg-white text-brand-purple border-white hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] w-full sm:w-auto">
            Start Earning Now
          </SolanaWalletAuth>
          <Button variant="hero-outline" size="lg" className="px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold min-w-[160px] sm:min-w-[180px] border-[hsl(var(--button-green))] text-[hsl(var(--button-green))] bg-transparent hover:bg-[hsl(var(--button-green))]/10 hover:shadow-[0_0_30px_hsl(var(--button-green)/0.4)] transition-all duration-300 w-full sm:w-auto">
            View Rewards
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;