import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

function LayoutSkeleton() {
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar skeleton — desktop only */}
      <div className="hidden md:flex w-56 flex-col border-r border-border p-4 gap-4">
        <Skeleton className="h-8 w-28" />
        <div className="space-y-2 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b border-border flex items-center px-4">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LayoutSkeleton />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;


  return <Outlet />;
}
