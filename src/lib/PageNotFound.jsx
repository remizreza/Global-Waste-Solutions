import { Link, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  const error = useRouteError();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel max-w-xl p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">404</p>
        <h1 className="mt-3 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-sm text-slate-500">{error?.message ?? "The page you requested does not exist."}</p>
        <Button asChild className="mt-6">
          <Link to="/">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
