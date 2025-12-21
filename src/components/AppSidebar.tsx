import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ClipboardList,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Network,
  Trash2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AppSidebar() {
  const { t } = useTranslation();
  const { role, signOut } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const mainNavItems = [
    { title: t('dashboard.title'), url: '/app', icon: LayoutDashboard },
    { title: t('client.list'), url: '/app/clients', icon: Users },
    { title: t('case.list'), url: '/app/cases', icon: Briefcase },
    { title: t('task.list'), url: '/app/tasks', icon: ClipboardList },
  ];

  const adminNavItems = [
    { title: t('userManagement.title'), url: '/app/users', icon: Settings },
    { title: t('systemMap.title'), url: '/app/system-map', icon: Network },
    { title: t('trash.title'), url: '/app/trash', icon: Trash2 },
    { title: t('clientPortal.preview'), url: '/app/client-portal', icon: Eye },
  ];

  const roleLabel = role === 'admin' ? t('roles.admin') : t('roles.staff');
  const roleVariant = role === 'admin' ? 'default' : 'secondary';

  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <span className="font-semibold text-lg text-sidebar-foreground">{t('app.title')}</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          {!isCollapsed && (
            <Badge variant={roleVariant} className="text-xs w-fit">{roleLabel}</Badge>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted-foreground">{!isCollapsed && t('nav.main')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/app'}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-primary text-primary-foreground font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted-foreground">{!isCollapsed && t('nav.admin')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent"
                        activeClassName="bg-primary text-primary-foreground font-medium"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          size={isCollapsed ? 'icon' : 'default'}
          onClick={signOut}
          className={isCollapsed ? 'w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent' : 'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent'}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>{t('auth.logout')}</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
