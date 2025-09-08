import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { WalletAuth } from "./WalletAuth";
import { ProfileAvatar } from "./ProfileAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { disconnect } = useWallet();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Track", href: "/track" },
    { name: "Rewards", href: "/rewards" },
    { name: "Contact", href: "/contact" }
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "/#how-it-works") {
      e.preventDefault();
      if (location.pathname === "/") {
        // Already on home page, just scroll
        const element = document.getElementById("how-it-works");
        element?.scrollIntoView({ behavior: "smooth" });
      } else {
        // Navigate to home page first, then scroll after navigation
        navigate('/', { replace: true });
        setTimeout(() => {
          const element = document.getElementById("how-it-works");
          element?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  };

  const isActive = (href: string) => location.pathname === href;

  const handleDisconnect = async () => {
    try {
      await signOut();
      if (disconnect) {
        await disconnect();
      }
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(`Failed to sign out: ${error.message}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--pure-black))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Logo */}
          <div className="flex justify-start">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="https://paugtcnvqdbjcrrmjxma.supabase.co/storage/v1/object/public/website/VapeFi_Trans.png" 
                alt="VapeFi Logo" 
                className="h-8 w-auto" 
              />
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center space-x-4">
            {navLinks.map(link => (
              link.href === "/#how-it-works" ? (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-white hover:text-white/70 transition-colors whitespace-nowrap"
                >
                  {link.name}
                </a>
              ) : (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className={`text-white hover:text-white/70 transition-colors whitespace-nowrap ${
                    isActive(link.href) ? "font-semibold" : ""
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* User Actions - Right aligned */}
          <div className="hidden md:flex items-center justify-end space-x-4">
            {!user ? (
              <WalletAuth />
            ) : (
              <>
                <Link to="/track">
                  <Button variant="hero-primary" className="px-4 py-2 text-sm font-semibold">
                    Track Now
                  </Button>
                </Link>
                <ProfileAvatar />
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex justify-end">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-[hsl(var(--pure-black))] border-background/20">
                <div className="flex flex-col space-y-6 mt-8">
                  {navLinks.map(link => (
                    link.href === "/#how-it-works" ? (
                      <a 
                        key={link.name} 
                        href={link.href} 
                        onClick={(e) => {
                          handleSmoothScroll(e, link.href);
                          setIsOpen(false);
                        }}
                        className="text-white hover:text-white/70 transition-colors text-lg"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link 
                        key={link.name} 
                        to={link.href} 
                        onClick={() => setIsOpen(false)} 
                        className={`text-white hover:text-white/70 transition-colors text-lg ${
                          isActive(link.href) ? "font-semibold" : ""
                        }`}
                      >
                        {link.name}
                      </Link>
                    )
                  ))}
                  <div className="pt-4">
                    {!user ? (
                      <WalletAuth />
                    ) : (
                      <div className="space-y-4">
                        <Link to="/track" onClick={() => setIsOpen(false)}>
                          <Button variant="hero-primary" className="w-full px-4 py-2 text-sm font-semibold">
                            Track Now
                          </Button>
                        </Link>
                        <Link to="/profile" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full flex items-center gap-2">
                            Profile
                          </Button>
                        </Link>
                        <Button 
                          onClick={() => {
                            handleDisconnect();
                            setIsOpen(false);
                          }}
                          variant="outline" 
                          className="w-full flex items-center gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          Disconnect
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;