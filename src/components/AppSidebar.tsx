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
  ];

  const roleLabel = role === 'admin' ? t('roles.admin') : t('roles.staff');
  const roleVariant = role === 'admin' ? 'default' : 'secondary';

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <span className="font-bold text-lg">{t('app.title')}</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
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
          <SidebarGroupLabel>{!isCollapsed && t('nav.main')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/app'}
                      className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-muted"
                      activeClassName="bg-primary/10 text-primary font-medium"
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
            <SidebarGroupLabel>{!isCollapsed && t('nav.admin')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-muted"
                        activeClassName="bg-primary/10 text-primary font-medium"
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

      <SidebarFooter className="border-t p-4">
        <Button
          variant="ghost"
          size={isCollapsed ? 'icon' : 'default'}
          onClick={signOut}
          className={isCollapsed ? 'w-full justify-center' : 'w-full justify-start gap-3'}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>{t('auth.logout')}</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
