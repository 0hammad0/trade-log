import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Decorative background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 -left-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar className="fixed inset-y-0 left-0 z-50" />
      </div>

      {/* Main content */}
      <div className="relative flex flex-1 flex-col lg:pl-64">
        <Header />
        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
