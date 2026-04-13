import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RouteGuard } from "@/components/RouteGuard";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import AdminNotifications from "./pages/AdminNotifications";
import AdminPortalSettings from "./pages/AdminPortalSettings";
import Onboarding from "./pages/Onboarding";
import AppDashboard from "./pages/AppDashboard";
import UserManagement from "./pages/UserManagement";
import UserActivityDetail from "./pages/UserActivityDetail";
import Profile from "./pages/Profile";
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
import AdminChat from "./pages/AdminChat";
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
import ClientPortalToolDetail from "./pages/client-portal/ClientPortalToolDetail";
import ClientPortalCourses from "./pages/client-portal/ClientPortalCourses";
import ClientPortalCourseModule from "./pages/client-portal/ClientPortalCourseModule";
import ClientPortalCoach from "./pages/client-portal/ClientPortalCoach";
import ClientPortalCoachModule from "./pages/client-portal/ClientPortalCoachModule";
import AdminCourses from "./pages/AdminCourses";
import ClientPortalPremium from "./pages/client-portal/ClientPortalPremium";
import ClientPortalMemories from "./pages/client-portal/ClientPortalMemories";
import ClientPortalProfileData from "./pages/client-portal/ClientPortalProfileData";

// Insurance Consulting Pages
import InsuranceConsultingStart from "./pages/insurance-consulting/InsuranceConsultingStart";
import InsuranceConsultingTopics from "./pages/insurance-consulting/InsuranceConsultingTopics";
import InsuranceConsultingIntroduction from "./pages/insurance-consulting/InsuranceConsultingIntroduction";
import InsuranceConsultingCompany from "./pages/insurance-consulting/InsuranceConsultingCompany";
import InsuranceConsultingAdvisorInfo from "./pages/insurance-consulting/InsuranceConsultingAdvisorInfo";
import InsuranceConsultingCustomerInfo from "./pages/insurance-consulting/InsuranceConsultingCustomerInfo";
import InsuranceConsultingConsultation from "./pages/insurance-consulting/InsuranceConsultingConsultation";
import InsuranceConsultingSummary from "./pages/insurance-consulting/InsuranceConsultingSummary";
import { ConsultationProvider } from "./hooks/useConsultationState";

// Investment Consulting Pages
import InvestmentConsultingStart from "./pages/investment-consulting/InvestmentConsultingStart";
import InvestmentConsultingFocus from "./pages/investment-consulting/InvestmentConsultingFocus";
import InvestmentConsultingIntroduction from "./pages/investment-consulting/InvestmentConsultingIntroduction";
import InvestmentConsultingCompany from "./pages/investment-consulting/InvestmentConsultingCompany";
import InvestmentConsultingAdvisorInfo from "./pages/investment-consulting/InvestmentConsultingAdvisorInfo";
import InvestmentConsultingCustomerInfo from "./pages/investment-consulting/InvestmentConsultingCustomerInfo";
import InvestmentConsultingConsultation from "./pages/investment-consulting/InvestmentConsultingConsultation";
import InvestmentConsultingNeeds from "./pages/investment-consulting/InvestmentConsultingNeeds";
import InvestmentConsultingAnswers from "./pages/investment-consulting/InvestmentConsultingAnswers";
import InvestmentConsultingSummary from "./pages/investment-consulting/InvestmentConsultingSummary";
import InvestmentConsultingOffer from "./pages/investment-consulting/InvestmentConsultingOffer";
import InvestmentConsultingPresentation from "./pages/investment-consulting/InvestmentConsultingPresentation";
import { InvestmentConsultationProvider } from "./hooks/useInvestmentConsultationState";
import ConsultationPresentationPage from "./pages/presentation/ConsultationPresentationPage";
import { ViewModeProvider } from "./hooks/useViewMode";
import { PageViewTracker } from "./components/PageViewTracker";
import AdminAutomations from "./pages/AdminAutomations";
import AdminAnalyticsDashboard from "./pages/AdminAnalyticsDashboard";
import AdminCtaManagement from "./pages/AdminCtaManagement";

// Public Pages (no auth required)
import MinimalLanding from "./pages/public/MinimalLanding";
import PublicLanding from "./pages/public/PublicLanding";
import PublicContact from "./pages/public/PublicContact";
import PublicBlog from "./pages/public/PublicBlog";
import PublicTools from "./pages/public/PublicTools";
import PublicCaseStudies from "./pages/public/PublicCaseStudies";
import PublicCaseStudyDetail from "./pages/public/PublicCaseStudyDetail";
import { CaseStudyProvider } from "./hooks/useCaseStudies";

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
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OfflineBanner />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CaseStudyProvider>
          <AuthProvider>
            <PageViewTracker />
            <Routes>
              {/* Public routes (no auth) */}
              <Route path="/" element={<MinimalLanding />} />
              <Route path="/hauptseite" element={<PublicLanding />} />
              <Route path="/contact" element={<PublicContact />} />
              <Route path="/blog" element={<PublicBlog />} />
              <Route path="/blog/:slug" element={<PublicBlogDetail />} />
              <Route path="/tools" element={<PublicTools />} />
              <Route path="/case-studies" element={<PublicCaseStudies />} />
              <Route path="/case-studies/:slug" element={<PublicCaseStudyDetail />} />
              <Route path="/tools/:slug" element={<PublicToolDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Navigate to="/login" replace />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={<Onboarding />} />
              
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

              {/* Protected: Profile (all authenticated) */}
              <Route
                path="/app/profile"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff', 'client']}>
                    <Profile />
                  </RouteGuard>
                }
              />

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

              {/* Protected: Admin only - Chat */}
              <Route
                path="/app/chat"
                element={
                  <RouteGuard allowedRoles={['admin']}>
                    <AdminChat />
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
              <Route
                path="/app/users/:userId"
                element={
                  <RouteGuard allowedRoles={['admin']}>
                    <UserActivityDetail />
                  </RouteGuard>
                }
                />
              <Route
                path="/app/automations"
                element={
                  <RouteGuard allowedRoles={['admin']}>
                    <AdminAutomations />
                  </RouteGuard>
                }
              />
              <Route
                path="/app/analytics"
                element={
                  <RouteGuard allowedRoles={['admin']}>
                    <AdminAnalyticsDashboard />
                  </RouteGuard>
                }
              />
              <Route
                path="/app/cta"
                element={
                  <RouteGuard allowedRoles={['admin']}>
                    <AdminCtaManagement />
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
              <Route
                path="/app/client-portal/tools/:slug"
                element={
                  <RouteGuard allowedRoles={['client', 'admin']}>
                    <ClientPortalToolDetail />
                  </RouteGuard>
                }
              />
              <Route
                path="/app/client-portal/courses"
                element={
                  <RouteGuard allowedRoles={['client', 'admin']}>
                    <ClientPortalCourses />
                  </RouteGuard>
                }
              />
              <Route
                path="/app/client-portal/courses/:moduleId"
                element={
                  <RouteGuard allowedRoles={['client', 'admin']}>
                    <ClientPortalCourseModule />
                  </RouteGuard>
                }
              />
              <Route
                path="/app/client-portal/coach"
                element={
                  <RouteGuard allowedRoles={['client', 'admin']}>
                    <ClientPortalCoach />
                  </RouteGuard>
                }
              />
              <Route
                path="/app/client-portal/coach/:moduleKey"
                element={
                  <RouteGuard allowedRoles={['client', 'admin']}>
                    <ClientPortalCoachModule />
                  </RouteGuard>
                }
              />
              <Route
                path="/app/client-portal/premium"
                element={
                  <RouteGuard allowedRoles={['client', 'admin']}>
                    <ClientPortalPremium />
                  </RouteGuard>
                }
              />
              <Route
                path="/app/client-portal/memories"
                element={
                  <RouteGuard allowedRoles={['client', 'admin']}>
                    <ClientPortalMemories />
                  </RouteGuard>
                }
              />
              <Route
                path="/app/client-portal/profile-data"
                element={
                  <RouteGuard allowedRoles={['client', 'admin']}>
                    <ClientPortalProfileData />
                  </RouteGuard>
                }
              />
              {/* Protected: Admin only - Courses */}
              <Route
                path="/app/courses"
                element={
                  <RouteGuard allowedRoles={['admin']}>
                    <AdminCourses />
                  </RouteGuard>
                }
              />

              {/* Protected: Admin only - Notifications */}
              <Route
                path="/app/notifications"
                element={
                  <RouteGuard allowedRoles={['admin']}>
                    <AdminNotifications />
                  </RouteGuard>
                }
              />

              {/* Protected: Admin only - Portal Settings */}
              <Route
                path="/app/portal-settings"
                element={
                  <RouteGuard allowedRoles={['admin']}>
                    <AdminPortalSettings />
                  </RouteGuard>
                }
              />

              {/* Insurance Consulting Routes - wrapped in ConsultationProvider */}
              <Route
                path="/app/insurance-consulting"
                element={<Navigate to="/app/insurance-consulting/start" replace />}
              />
              <Route
                path="/app/insurance-consulting/start"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <ConsultationProvider>
                      <InsuranceConsultingStart />
                    </ConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/insurance-consulting/topics"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <ConsultationProvider>
                      <InsuranceConsultingTopics />
                    </ConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/insurance-consulting/focus"
                element={<Navigate to="/app/insurance-consulting/topics" replace />}
              />
              <Route
                path="/app/insurance-consulting/introduction"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <ConsultationProvider>
                      <InsuranceConsultingIntroduction />
                    </ConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/insurance-consulting/company"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <ConsultationProvider>
                      <InsuranceConsultingCompany />
                    </ConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/insurance-consulting/advisor-info"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <ConsultationProvider>
                      <InsuranceConsultingAdvisorInfo />
                    </ConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/insurance-consulting/customer-info"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <ConsultationProvider>
                      <InsuranceConsultingCustomerInfo />
                    </ConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/insurance-consulting/consultation"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <ConsultationProvider>
                      <InsuranceConsultingConsultation />
                    </ConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/insurance-consulting/summary"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <ConsultationProvider>
                      <InsuranceConsultingSummary />
                    </ConsultationProvider>
                  </RouteGuard>
                }
              />
              
              {/* Investment Consulting Routes - wrapped in InvestmentConsultationProvider */}
              <Route
                path="/app/investment-consulting"
                element={<Navigate to="/app/investment-consulting/start" replace />}
              />
              <Route
                path="/app/investment-consulting/start"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <InvestmentConsultationProvider>
                      <InvestmentConsultingStart />
                    </InvestmentConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/investment-consulting/focus"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <InvestmentConsultationProvider>
                      <InvestmentConsultingFocus />
                    </InvestmentConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/investment-consulting/topics"
                element={<Navigate to="/app/investment-consulting/focus" replace />}
              />
              <Route
                path="/app/investment-consulting/introduction"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <InvestmentConsultationProvider>
                      <InvestmentConsultingIntroduction />
                    </InvestmentConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/investment-consulting/company"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <InvestmentConsultationProvider>
                      <InvestmentConsultingCompany />
                    </InvestmentConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/investment-consulting/advisor-info"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <InvestmentConsultationProvider>
                      <InvestmentConsultingAdvisorInfo />
                    </InvestmentConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/investment-consulting/customer-info"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <InvestmentConsultationProvider>
                      <InvestmentConsultingCustomerInfo />
                    </InvestmentConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/investment-consulting/consultation"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <InvestmentConsultationProvider>
                      <InvestmentConsultingConsultation />
                    </InvestmentConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/investment-consulting/needs"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <InvestmentConsultationProvider>
                      <InvestmentConsultingNeeds />
                    </InvestmentConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/investment-consulting/answers"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <InvestmentConsultationProvider>
                      <InvestmentConsultingAnswers />
                    </InvestmentConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/investment-consulting/summary"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <InvestmentConsultationProvider>
                      <InvestmentConsultingSummary />
                    </InvestmentConsultationProvider>
                  </RouteGuard>
                }
              />
              <Route
                path="/app/investment-consulting/offer"
                element={
                  <RouteGuard allowedRoles={['admin', 'staff']}>
                    <InvestmentConsultationProvider>
                      <InvestmentConsultingOffer />
                    </InvestmentConsultationProvider>
                  </RouteGuard>
                }
              />

              {/* Presentation mode – public route (no auth, synced via BroadcastChannel) */}
              <Route
                path="/presentation/investment"
                element={<InvestmentConsultingPresentation />}
              />

              {/* Unified presentation mode – loads consultation by ID */}
              <Route
                path="/presentation/:type/:id"
                element={<ConsultationPresentationPage />}
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
          </CaseStudyProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;