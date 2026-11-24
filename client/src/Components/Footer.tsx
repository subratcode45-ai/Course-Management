import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_0.5fr_0.5fr]">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-white">
              <GraduationCap size={18} aria-hidden="true" />
            </span>
            <div>
              Course<span className="text-primary">Hub</span>
            </div>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Straightforward courses for learning and practicing development.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/courses"
                className="text-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                All courses
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  to="/my-courses"
                  className="text-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  My courses
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Account</h4>
          <ul className="space-y-2 text-sm">
            {user ? (
              <li>
                <Link
                  to="/my-courses"
                  className="text-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Dashboard
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="text-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} CourseHub. All rights reserved.
      </div>
    </footer>
  );
}
