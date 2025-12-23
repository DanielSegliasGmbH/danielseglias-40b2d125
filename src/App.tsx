import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RouteGuard } from "@/components/RouteGuard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AppDashboard from "./pages/AppDashboard";
import UserManagement from "./pages/UserManagement";
import CustomersList from "./pages/CustomersList";
import CustomerDetail from "./pages/CustomerDetail";

// Helper component to redirect /app/clients/:id to /app/customers/:id
function ClientToCustomerRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/app/customers/${id || ''}`} replace />;
}

import CaseList from "./pages/CaseList";
import CaseDetail from "./pages/CaseDetail";
import TaskList from "./pages/TaskList";
import SystemMap from "./pages/SystemMap";
import Trash from "./pages/Trash";
import AdminTools from "./pages/AdminTools";
import AdminToolDetail from "./pages/AdminToolDetail";
import AdminLeads from "./pages/AdminLeads";
import AdminPublicPages from "./pages/AdminPublicPages";
import NotFound from "./pages/NotFound";
import PublicBlogDetail from "./pages/public/PublicBlogDetail";
import PublicToolDetail from "./pages/public/PublicToolDetail";

// Client Portal Pages
import ClientPortalHome from "./pages/client-portal/ClientPortalHome";
import ClientPortalInsurances from "./pages/client-portal/ClientPortalInsurances";
import ClientPortalGoals from "./pages/client-portal/ClientPortalGoals";
import ClientPortalTasks from "./pages/client-portal/ClientPortalTasks";
import ClientPortalStrategies from "./pages/client-portal/ClientPortalStrategies";
import ClientPortalLibrary from "./pages/client-portal/ClientPortalLibrary";
import ClientPortalTools from "./pages/client-portal/ClientPortalTools";

// Public Pages (no auth required)
import PublicLanding from "./pages/public/PublicLanding";
import PublicContact from "./pages/public/PublicContact";
import PublicBlog from "./pages/public/PublicBlog";
import PublicTools from "./pages/public/PublicTools";

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
              {/* Public routes (no auth) */}
              <Route path="/" element={<PublicLanding />} />
              <Route path="/contact" element={<PublicContact />} />
              <Route path="/blog" element={<PublicBlog />} />
              <Route path="/blog/:slug" element={<PublicBlogDetail />} />
              <Route path="/tools" element={<PublicTools />} />
              <Route path="/tools/:slug" element={<PublicToolDetail />} />
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

              {/* Protected: Admin only - Tools */}
              <Route
                path="/app/tools"
                element={
                  <RouteGuard allowedRoles={['admin']}>
                    <AdminTools />
                  </RouteGuard>
                }
              />
              <Route
                path="/app/tools/:slug"
                element={
                  <RouteGuard allowedRoles={['admin']}>
                    <AdminToolDetail />
                  </RouteGuard>
                }
              />

              {/* Protected: Admin only - Leads */}
              <Route
                path="/app/leads"
                element={
                  <RouteGuard allowedRoles={['admin']}>
                    <AdminLeads />
                  </RouteGuard>
                }
              />

              {/* Protected: Admin only - Public Pages */}
              <Route
                path="/app/public-pages"
                element={
                  <RouteGuard allowedRoles={['admin']}>
                    <AdminPublicPages />
                  </RouteGuard>
                }
              />

              {/* Legacy: Redirect old client routes to customers - preserve ID */}
              <Route
                path="/app/clients"
                element={<Navigate to="/app/customers" replace />}
              />
              <Route
                path="/app/clients/:id"
                element={<ClientToCustomerRedirect />}
              />

              {/* Protected: Customers List (new structure) */}
              <Route
                path="/app/customers"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <CustomersList />
                  </RouteGuard>
                }
              />


              {/* Protected: Customer Detail (new structure) */}
              <Route
                path="/app/customers/:id"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <CustomerDetail />
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
              
              {/* Removed duplicate "/" route - Landing is at line 62 */}
              
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