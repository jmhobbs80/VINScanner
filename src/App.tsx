
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import AuthLoading from "./pages/AuthLoading";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import ScanVIN from "./pages/ScanVIN";
import HistoryList from "./pages/HistoryList";
import HistoryDetail from "./pages/HistoryDetail";
import OrgSettings from "./pages/OrgSettings";
import NotFound from "./pages/NotFound";
import BottomNavigation from "./components/BottomNavigation";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<AuthLoading />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/home" element={
              <>
                <Home />
                <BottomNavigation />
              </>
            } />
            <Route path="/scan" element={
              <>
                <ScanVIN />
                <BottomNavigation />
              </>
            } />
            <Route path="/history" element={
              <>
                <HistoryList />
                <BottomNavigation />
              </>
            } />
            <Route path="/history/:scanId" element={
              <>
                <HistoryDetail />
                <BottomNavigation />
              </>
            } />
            <Route path="/settings" element={
              <>
                <OrgSettings />
                <BottomNavigation />
              </>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
