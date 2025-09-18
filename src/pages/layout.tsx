import { Navigate, Outlet } from 'react-router';
import { Header } from '../components/layout/header';
import {
  Sidebar,
  SidebarInset,
  SidebarPin,
  SidebarProvider,
} from '../components/layout/sidebar';
import { Menu } from '@/components/layout/menu';
import { LOCAL_STORAGE } from '../constant/local-storage';

export default function DefaultLayout() {
  const accessToken = localStorage.getItem(LOCAL_STORAGE.ACCESS_TOKEN);

  if (!accessToken) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Header />
      <SidebarProvider defaultWidth={232}>
        <Sidebar>
          <Menu  />
          <SidebarPin />
        </Sidebar>
        <SidebarInset>
          <Outlet context={{ accessToken }} />
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}