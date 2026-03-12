import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PortfolioProvider } from "./context/PortfolioContext";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Indices from "./pages/Indices";
import IndexDetail from "./pages/IndexDetail";
import FAndO from "./pages/FAndO";
import Crypto from "./pages/Crypto";
import MutualFunds from "./pages/MutualFunds";
import Commodities from "./pages/Commodities";
import Education from "./pages/Education";
import Calculators from "./pages/Calculators";
import News from "./pages/News";
import PredictNow from "./pages/PredictNow";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PortfolioProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <AuthModal />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/indices" element={<Indices />} />
              <Route path="/indices/:indexName" element={<IndexDetail />} />
              <Route path="/fno" element={<FAndO />} />
              <Route path="/crypto" element={<Crypto />} />
              <Route path="/mutual-funds" element={<MutualFunds />} />
              <Route path="/commodities" element={<Commodities />} />
              <Route path="/education" element={<Education />} />
              <Route path="/calculators" element={<Calculators />} />
              <Route path="/news" element={<News />} />
              <Route path="/predict" element={<PredictNow />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
                      <Footer />
          </BrowserRouter>

        </TooltipProvider>
      </PortfolioProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
