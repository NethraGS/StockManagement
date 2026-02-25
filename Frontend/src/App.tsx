import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Indices from "./pages/Indices";
import FAndO from "./pages/FAndO";
import Crypto from "./pages/Crypto";
import MutualFunds from "./pages/MutualFunds";
import Commodities from "./pages/Commodities";
import Education from "./pages/Education";
import Calculators from "./pages/Calculators";
import News from "./pages/News";
import PredictNow from "./pages/PredictNow";
import Portfolio from "./pages/Portfolio";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Learning from "./pages/Learning";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/indices" element={<Indices />} />
          <Route path="/fno" element={<FAndO />} />
          <Route path="/crypto" element={<Crypto />} />
          <Route path="/mutual-funds" element={<MutualFunds />} />
          <Route path="/commodities" element={<Commodities />} />
          <Route path="/education" element={<Education />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/news" element={<News />} />
          <Route path="/predict" element={<PredictNow />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
