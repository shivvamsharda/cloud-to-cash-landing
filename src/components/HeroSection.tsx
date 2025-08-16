import { Button } from "@/components/ui/button";
import vapeFiLogo from "@/assets/vapefi-logo-transparent.png";
const HeroSection = () => {
  return <section className="h-[70vh] bg-hero-bg flex flex-col items-center justify-center px-6 py-8">
      <div className="text-center max-w-4xl flex flex-col items-center">
        {/* Logo */}
        <img src={vapeFiLogo} alt="VapeFi Logo - Turn Clouds Into Coins" className="block mx-auto w-[480px] md:w-[640px] h-auto object-contain -mb-24 md:-mb-28 lg:-mb-32" />
        
        {/* Brand Name - positioned immediately below image */}
        <h1 className="text-6xl md:text-8xl font-bold text-hero-text tracking-tight leading-none mt-0 mb-2.5">
          VapeFi
        </h1>
        
        {/* Tagline */}
        <p className="text-xl font-semibold text-hero-text tracking-wide mb-8 md:text-xl">
          TURN CLOUDS INTO COINS
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button variant="hero-primary" size="lg" className="px-8 py-3 text-lg font-semibold min-w-[180px]">
            Start Earning
          </Button>
          <Button variant="hero-outline" size="lg" className="px-8 py-3 text-lg font-semibold min-w-[180px]">
            Learn More
          </Button>
        </div>
      </div>
    </section>;
};
export default HeroSection;