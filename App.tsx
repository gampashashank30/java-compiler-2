import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import AIAsk from "./pages/AIAsk";
import Settings from "./pages/Settings";
import LandingPage from "./pages/LandingPage";
import TutorPage from "./pages/TutorPage";

const queryClient = new QueryClient();

import { ThemeProvider } from "./components/ThemeContext";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<Index />} />
            <Route path="/aiask" element={<AIAsk />} />
            <Route path="/tutor" element={<TutorPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider >
);

export default App;
