import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const scrollToLeaderboard = () => {
    const leaderboardSection = document.getElementById('leaderboard');
    if (leaderboardSection) {
      leaderboardSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="min-h-[calc(100vh-4rem)] mt-16 relative overflow-hidden bg-[hsl(var(--pure-black))]"
    >
      {/* Grid Background */}
      <div 
        className="absolute inset-0 z-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Desktop Hero Image */}
      <img
        src="/images/hero-desktop.png"
        alt="VapeFi Hero"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="hidden md:block absolute inset-0 w-full h-full object-cover z-10"
      />
      
      {/* Mobile Hero Image */}
      <img
        src="/images/hero-mobile.png"
        alt="VapeFi Hero Mobile"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="block md:hidden absolute inset-0 w-full h-full object-cover z-10"
      />
      
      {/* Content Overlay */}
      <div className="absolute left-1/2 top-[62%] z-20 -translate-x-1/2 -translate-y-1/2 px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/track">
              <Button variant="hero-primary" className="px-8 py-3 text-lg font-semibold min-w-[180px]">
                Start Earning Now
              </Button>
            </Link>
            <Button 
              variant="hero-outline" 
              onClick={scrollToLeaderboard}
              className="px-8 py-3 text-lg font-semibold min-w-[180px] border-2 border-white text-white bg-transparent hover:bg-white hover:text-[hsl(var(--pure-black))] rounded-full transition-all duration-300"
            >
              View Leaderboard
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;