import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { WalletConnectButton } from "@/components/auth/WalletConnectButton";
import { WalletStatus } from "@/components/auth/WalletStatus";
import { ProfileAvatar } from "@/components/auth/ProfileAvatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, profileComplete } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  // Base navigation links for all users
  const baseNavLinks = [{
    name: "Home",
    href: "/"
  }, {
    name: "How It Works",
    href: "/#how-it-works"
  }, {
    name: "Rewards",
    href: "/rewards"
  }, {
    name: "Contact",
    href: "/contact"
  }];

  // Add Track link for authenticated users with complete profiles
  const navLinks = isAuthenticated 
    ? [
        ...baseNavLinks.slice(0, 2), // Home and How It Works
        { name: "Track", href: "/track" },
        ...baseNavLinks.slice(2) // Rewards and Contact
      ]
    : baseNavLinks;

  // Fetch user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && user && profileComplete) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('name, username, avatar_url')
          .eq('id', user.id)
          .single();
        setUserProfile(data);
      };
      fetchProfile();
    } else {
      setUserProfile(null);
    }
  }, [isAuthenticated, user, profileComplete]);

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
  return <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--pure-black))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Logo */}
          <div className="flex justify-start">
            <Link to="/" className="flex items-center space-x-2">
              <img src="https://paugtcnvqdbjcrrmjxma.supabase.co/storage/v1/object/public/website/VapeFi_Trans.png" alt="VapeFi Logo" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center space-x-8">
            {navLinks.map(link => (
              link.href === "/#how-it-works" ? (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-background hover:text-background/70 transition-colors"
                >
                  {link.name}
                </a>
              ) : (
                <Link key={link.name} to={link.href} className={`text-background hover:text-background/70 transition-colors ${isActive(link.href) ? "font-semibold" : ""}`}>
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* User Actions - Right aligned */}
          <div className="hidden md:flex items-center justify-end space-x-4">
            {isAuthenticated && profileComplete ? (
              <>
                <ProfileAvatar profile={userProfile} />
                <WalletStatus />
              </>
            ) : (
              <WalletConnectButton variant="hero-primary" className="px-4 py-2 text-sm font-semibold">
                Start Earning
              </WalletConnectButton>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex justify-end">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-background">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-[hsl(var(--pure-black))] border-background/20">
                <div className="flex flex-col space-y-6 mt-8">
                  {isAuthenticated && profileComplete && userProfile && (
                    <div className="pb-4 border-b border-background/20">
                      <div className="flex items-center space-x-3">
                        <ProfileAvatar profile={userProfile} />
                        <div>
                          <p className="text-background text-sm font-medium">{userProfile.name}</p>
                          <p className="text-background/60 text-xs">@{userProfile.username}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {navLinks.map(link => (
                    link.href === "/#how-it-works" ? (
                      <a 
                        key={link.name} 
                        href={link.href} 
                        onClick={(e) => {
                          handleSmoothScroll(e, link.href);
                          setIsOpen(false);
                        }}
                        className="text-background hover:text-background/70 transition-colors text-lg"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link key={link.name} to={link.href} onClick={() => setIsOpen(false)} className={`text-background hover:text-background/70 transition-colors text-lg ${isActive(link.href) ? "font-semibold" : ""}`}>
                        {link.name}
                      </Link>
                    )
                  ))}
                  {!(isAuthenticated && profileComplete) && (
                    <WalletConnectButton variant="hero-primary" className="w-full mt-6 px-4 py-2 text-sm font-semibold">
                      Start Earning
                    </WalletConnectButton>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>;
};
export default Navbar;