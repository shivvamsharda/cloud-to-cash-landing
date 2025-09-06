import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const HeroSection = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const preloadImages = () => {
      const desktopImg = new Image();
      const mobileImg = new Image();
      let loadedCount = 0;

      const handleLoad = () => {
        loadedCount++;
        if (loadedCount === 2) {
          setImagesLoaded(true);
        }
      };

      desktopImg.onload = handleLoad;
      mobileImg.onload = handleLoad;
      
      desktopImg.src = '/images/hero-desktop.png';
      mobileImg.src = '/images/hero-mobile.png';
    };

    preloadImages();
  }, []);

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
      
      {/* Loading skeleton */}
      {!imagesLoaded && (
        <Skeleton className="absolute inset-0 z-5 bg-[hsl(var(--muted))] animate-pulse" />
      )}
      
      {/* Desktop Hero Image */}
      <div 
        className={`hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat z-10 transition-opacity duration-500 ${
          imagesLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: 'url(/images/hero-desktop.png)'
        }}
      />
      
      {/* Mobile Hero Image */}
      <div 
        className={`block md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat z-10 transition-opacity duration-500 ${
          imagesLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: 'url(/images/hero-mobile.png)'
        }}
      />
    </section>
  );
};
export default HeroSection;