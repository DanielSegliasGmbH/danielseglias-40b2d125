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
import ClientList from "./pages/ClientList";
import ClientDetail from "./pages/ClientDetail";
import CaseList from "./pages/CaseList";
import CaseDetail from "./pages/CaseDetail";
import TaskList from "./pages/TaskList";
import SystemMap from "./pages/SystemMap";
import Trash from "./pages/Trash";
import NotFound from "./pages/NotFound";

// Client Portal Pages
import ClientPortalHome from "./pages/client-portal/ClientPortalHome";
import ClientPortalInsurances from "./pages/client-portal/ClientPortalInsurances";
import ClientPortalGoals from "./pages/client-portal/ClientPortalGoals";
import ClientPortalTasks from "./pages/client-portal/ClientPortalTasks";
import ClientPortalStrategies from "./pages/client-portal/ClientPortalStrategies";
import ClientPortalLibrary from "./pages/client-portal/ClientPortalLibrary";
import ClientPortalTools from "./pages/client-portal/ClientPortalTools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
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

              {/* Protected: Admin only - System Map */}
              <Route
                path="/app/system-map"
                element={
                  <RouteGuard allowedRoles={['admin']}>
                    <SystemMap />
                  </RouteGuard>
                }
              />

              {/* Protected: Admin only - Trash */}
              <Route
                path="/app/trash"
                element={
                  <RouteGuard allowedRoles={['admin']}>
                    <Trash />
                  </RouteGuard>
                }
              />

              {/* Protected: Client List */}
              <Route
                path="/app/clients"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <ClientList />
                  </RouteGuard>
                }
              />

              {/* Protected: Client Detail */}
              <Route
                path="/app/clients/:id"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <ClientDetail />
                  </RouteGuard>
                }
              />

              {/* Protected: Case List */}
              <Route
                path="/app/cases"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <CaseList />
                  </RouteGuard>
                }
              />

              {/* Protected: Case Detail */}
              <Route
                path="/app/cases/:id"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <CaseDetail />
                  </RouteGuard>
                }
              />

              {/* Protected: Task List */}
              <Route
                path="/app/tasks"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <TaskList />
                  </RouteGuard>
                }
              />

              {/* Client Portal Routes (client + admin) */}
              <Route
                path="/app/client-portal"
                element={
                  <RouteGuard allowedRoles={['client', 'admin']}>
                    <ClientPortalHome />
                  </RouteGuard>
                }
              />
              <Route
                path="/app/client-portal/insurances"
                element={
                  <RouteGuard allowedRoles={['client', 'admin']}>
                    <ClientPortalInsurances />
                  </RouteGuard>
                }
              />
              <Route
                path="/app/client-portal/goals"
                element={
                  <RouteGuard allowedRoles={['client', 'admin']}>
                    <ClientPortalGoals />
                  </RouteGuard>
                }
              />
              <Route
                path="/app/client-portal/tasks"
                element={
                  <RouteGuard allowedRoles={['client', 'admin']}>
                    <ClientPortalTasks />
                  </RouteGuard>
                }
              />
              <Route
                path="/app/client-portal/strategies"
                element={
                  <RouteGuard allowedRoles={['client', 'admin']}>
                    <ClientPortalStrategies />
                  </RouteGuard>
                }
              />
              <Route
                path="/app/client-portal/library"
                element={
                  <RouteGuard allowedRoles={['client', 'admin']}>
                    <ClientPortalLibrary />
                  </RouteGuard>
                }
              />
              <Route
                path="/app/client-portal/tools"
                element={
                  <RouteGuard allowedRoles={['client', 'admin']}>
                    <ClientPortalTools />
                  </RouteGuard>
                }
              />
              
              {/* Old client route - redirect to new portal */}
              <Route
                path="/client"
                element={<Navigate to="/app/client-portal" replace />}
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
}

export default App;