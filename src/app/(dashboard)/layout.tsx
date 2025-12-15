import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <Header />
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-16 lg:pb-6">
        {children}
      </main>
      <BottomNav />
    </ProtectedRoute>
  );
}
