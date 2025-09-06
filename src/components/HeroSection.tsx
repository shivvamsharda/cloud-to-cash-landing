const HeroSection = () => {
  return (
    <section 
      className="min-h-[calc(100vh-4rem)] mt-16 relative overflow-hidden bg-[hsl(var(--pure-black))]"
    >
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
    </section>
  );
};
export default HeroSection;