import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Rewards from "./pages/Rewards";
import Contact from "./pages/Contact";
import Track from "./pages/Track";
import NotFound from "./pages/NotFound";
import { SolanaWalletContext } from "@/contexts/SolanaWalletContext";
import { AuthProvider } from "@/contexts/WalletContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SolanaWalletContext>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/track" element={<Track />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </SolanaWalletContext>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
