import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { AppBottomNav } from '@/components/AppBottomNav';
import { PresentationBar } from '@/components/investment-consulting/PresentationBar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 pb-20 lg:pb-0">
          {children}
        </SidebarInset>
      </div>
      <AppBottomNav />
      <PresentationBar />
    </SidebarProvider>
  );
}
