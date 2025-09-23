import MainLayout from '@/components/Layout/MainLayout';
import { AuthProvider } from '@/components/Authentication/AuthGuard';

export default function Home() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
