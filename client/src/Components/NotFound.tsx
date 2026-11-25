import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-[8rem] font-extrabold leading-none text-primary sm:text-[10rem]">
        404
      </h1>
      <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Page not found</h2>
      <p className="mt-3 max-w-md text-muted">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary-hover"
      >
        <Home size={18} /> Back to home
      </Link>
    </section>
  );
}