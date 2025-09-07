import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { WalletContextProvider } from "@/components/WalletProvider";
import { AuthProvider } from "@/hooks/useAuth";
import ProfileGate from "@/components/ProfileGate";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load all pages to prevent startup crashes from heavy dependencies
const Index = React.lazy(() => import("./pages/Index"));
const Rewards = React.lazy(() => import("./pages/Rewards"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Track = React.lazy(() => import("./pages/Track"));
const Profile = React.lazy(() => import("./pages/Profile"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const Terms = React.lazy(() => import("./pages/Terms"));
const FAQ = React.lazy(() => import("./pages/FAQ"));
const Cookies = React.lazy(() => import("./pages/Cookies"));
// NFTMint is especially important to lazy load due to heavy Umi dependencies
const NFTMint = React.lazy(() => import("./pages/NFTMint"));

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WalletContextProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
              <Navbar />
              <ProfileGate />
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/rewards" element={<Rewards />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/track" element={<Track />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/cookies" element={<Cookies />} />
                  <Route path="/mint" element={<NFTMint />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </WalletContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
