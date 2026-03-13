import { Navigate, Outlet } from 'react-router';
import { Header } from '../components/layout/header';
import { Sidebar, SidebarInset, SidebarPin, SidebarProvider } from '../components/layout/sidebar';
import { Menu } from '@/components/layout/menu';
import { useAuth } from '@/hooks/useAuth';

export default function DefaultLayout() {
  const { isAuthenticated, accessToken } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Header />
      <SidebarProvider defaultWidth={232}>
        <Sidebar>
          <Menu />
          <SidebarPin />
        </Sidebar>
        <SidebarInset>
          <Outlet context={{ accessToken }} />
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
