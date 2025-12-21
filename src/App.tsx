import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RouteGuard } from "@/components/RouteGuard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AppDashboard from "./pages/AppDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected: Internal area (admin + staff) */}
            <Route
              path="/app"
              element={
                <RouteGuard allowedRoles={['admin', 'staff']}>
                  <AppDashboard />
                </RouteGuard>
              }
            />

            {/* Protected: Admin only - User Management */}
            <Route
              path="/app/users"
              element={
                <RouteGuard allowedRoles={['admin']}>
                  <UserManagement />
                </RouteGuard>
              }
            />
            
            {/* Protected: Client area */}
            <Route
              path="/client"
              element={
                <RouteGuard allowedRoles={['client']}>
                  <ClientDashboard />
                </RouteGuard>
              }
            />
            
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
