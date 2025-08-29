import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navLinks = [{
    name: "Home",
    href: "/"
  }, {
    name: "How It Works",
    href: "/how-it-works"
  }, {
    name: "Rewards",
    href: "/rewards"
  }, {
    name: "Contact",
    href: "/contact"
  }];
  const isActive = (href: string) => location.pathname === href;
  return <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--pure-black))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="https://paugtcnvqdbjcrrmjxma.supabase.co/storage/v1/object/public/website/VapeFi_Trans.png" alt="VapeFi Logo" className="h-8 w-auto" />
            
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => <Link key={link.name} to={link.href} className={`text-background hover:text-background/70 transition-colors ${isActive(link.href) ? "font-semibold" : ""}`}>
                {link.name}
              </Link>)}
            <Link to="/track">
              <Button variant="hero-primary" className="ml-4 px-4 py-2 text-sm font-semibold">
                Start Earning
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-background">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-[hsl(var(--pure-black))] border-background/20">
                <div className="flex flex-col space-y-6 mt-8">
                  {navLinks.map(link => <Link key={link.name} to={link.href} onClick={() => setIsOpen(false)} className={`text-background hover:text-background/70 transition-colors text-lg ${isActive(link.href) ? "font-semibold" : ""}`}>
                      {link.name}
                    </Link>)}
                  <Link to="/track" onClick={() => setIsOpen(false)}>
                    <Button variant="hero-primary" className="w-full mt-6 px-4 py-2 text-sm font-semibold">
                      Start Earning
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>;
};
export default Navbar;