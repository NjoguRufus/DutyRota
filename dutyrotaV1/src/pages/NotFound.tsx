import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted px-4 py-8">
      <div className="max-w-md text-center">
        <h1 className="mb-3 text-5xl font-bold tracking-tight sm:text-6xl">404</h1>
        <p className="mb-4 text-lg text-muted-foreground sm:text-xl">Oops! Page not found</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
