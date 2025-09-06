import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { WalletConnectButton } from "@/components/auth/WalletConnectButton";

const CTASection = () => {
  return (
    <section className="bg-black relative overflow-hidden min-h-[900px] px-6 flex items-end">
      {/* Mobile background image */}
      <div 
        className="absolute inset-0 bg-contain bg-center bg-no-repeat z-10 block md:hidden"
        style={{
          backgroundImage: "url('https://paugtcnvqdbjcrrmjxma.supabase.co/storage/v1/object/public/website/Mobile_Footer2.png')"
        }}
      />
      {/* Desktop background image */}
      <div 
        className="absolute inset-0 bg-contain bg-center bg-no-repeat z-10 hidden md:block"
        style={{
          backgroundImage: "url('https://paugtcnvqdbjcrrmjxma.supabase.co/storage/v1/object/public/website/Footer.png')"
        }}
      />
      <div className="max-w-4xl mx-auto relative z-20 w-full pb-24 sm:pb-28 lg:pb-32">
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <WalletConnectButton variant="hero-primary" className="px-8 py-3 text-lg font-semibold min-w-[180px]">
            Start Earning Now
          </WalletConnectButton>
          <Link to="/rewards">
            <Button variant="hero-outline" size="lg" className="px-8 py-3 text-lg font-semibold min-w-[180px] border-[hsl(var(--button-green))] text-[hsl(var(--button-green))] bg-transparent hover:bg-[hsl(var(--button-green))]/10 hover:shadow-[0_0_30px_hsl(var(--button-green)/0.4)] transition-all duration-300">
              View Rewards
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;