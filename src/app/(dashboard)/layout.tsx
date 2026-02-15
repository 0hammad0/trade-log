import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar className="fixed inset-y-0 left-0 z-50" />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <Header />
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
