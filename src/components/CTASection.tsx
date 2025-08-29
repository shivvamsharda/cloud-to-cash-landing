import { Button } from "@/components/ui/button";
import SolanaWalletAuth from "@/components/SolanaWalletAuth";

const CTASection = () => {
  return (
    <section 
      className="bg-black py-20 px-6 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('https://paugtcnvqdbjcrrmjxma.supabase.co/storage/v1/object/public/website/Footer.png')"
      }}
    >
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <SolanaWalletAuth className="px-8 py-3 text-lg font-semibold min-w-[180px] bg-white text-brand-purple border-white hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]">
            Start Earning Now
          </SolanaWalletAuth>
          <Button variant="hero-outline" size="lg" className="px-8 py-3 text-lg font-semibold min-w-[180px] border-[hsl(var(--button-green))] text-[hsl(var(--button-green))] bg-transparent hover:bg-[hsl(var(--button-green))]/10 hover:shadow-[0_0_30px_hsl(var(--button-green)/0.4)] transition-all duration-300">
            View Rewards
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;