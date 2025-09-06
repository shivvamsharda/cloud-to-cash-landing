const HeroSection = () => {
  return (
    <section 
      className="min-h-[calc(100vh-4rem)] mt-16 relative overflow-hidden bg-[hsl(var(--pure-black))]"
    >
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      {/* Desktop Hero Image */}
      <div 
        className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat z-10"
        style={{
          backgroundImage: 'url(https://paugtcnvqdbjcrrmjxma.supabase.co/storage/v1/object/public/website/VapeFi_Hero_Trans.png)'
        }}
      />
      {/* Mobile Hero Image */}
      <div 
        className="block md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat z-10"
        style={{
          backgroundImage: 'url(https://paugtcnvqdbjcrrmjxma.supabase.co/storage/v1/object/public/website/Hero_Mobile2.png)'
        }}
      />
    </section>
  );
};
export default HeroSection;