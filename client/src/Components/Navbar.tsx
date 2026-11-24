import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/format";
import ThemeToggle from "./ThemeToggle";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
    isActive ? "bg-surface-2 text-primary" : "text-muted hover:text-fg"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // close avatar dropdown on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  const links = [
    { to: "/", label: "Home", end: true, show: true },
    { to: "/courses", label: "Courses", end: false, show: true },
    { to: "/my-courses", label: "My Courses", end: false, show: !!user },
    { to: "/admin", label: "Admin", end: false, show: user?.role === "admin" },
  ].filter((l) => l.show);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-white">
            <GraduationCap size={18} aria-hidden="true" />
          </span>
          <div>
            Course<span className="text-primary">Hub</span>
          </div>
        </Link>

        {/* desktop links */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="grid h-9 w-9 place-items-center rounded-md bg-primary text-sm font-semibold text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label="Account menu"
              >
                {initials(user.name)}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-lg border border-line bg-surface p-2">
                  <div className="border-b border-line px-3 pb-2 pt-1">
                    <p className="truncate font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                    <span className="mt-1.5 inline-block text-xs text-primary capitalize">
                      {user.role}
                    </span>
                  </div>
                  <Link
                    to="/my-courses"
                    onClick={() => setMenuOpen(false)}
                    className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <BookOpen size={16} /> My Courses
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* mobile panel */}
      {mobileOpen && (
        <div className="border-t border-line bg-page px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setMobileOpen(false)}
                className={linkClass}
              >
                {l.label}
              </NavLink>
            ))}
            {!user && (
              <div className="mt-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg border border-line py-2 text-center text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg bg-primary py-2 text-center text-sm font-medium text-white"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
