import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  Check,
  Gift,
  IndianRupee,
  PackageOpen,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import api from "../../api/axios";
import type { Course } from "../../types";
import { formatPrice } from "../../utils/format";

interface Toast {
  type: "success" | "error";
  text: string;
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-line bg-surface p-5">
      <span className="grid h-12 w-12 place-items-center rounded-md border border-line text-primary">
        {icon}
      </span>
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <tr className="border-t border-line">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="skeleton h-12 w-20 shrink-0" />
          <div className="skeleton h-4 w-40" />
        </div>
      </td>
      <td className="p-4">
        <div className="skeleton h-4 w-24" />
      </td>
      <td className="p-4">
        <div className="skeleton h-4 w-16" />
      </td>
      <td className="p-4">
        <div className="skeleton h-5 w-20 rounded-full!" />
      </td>
      <td className="p-4">
        <div className="skeleton h-5 w-16 rounded-full!" />
      </td>
      <td className="p-4">
        <div className="skeleton ml-auto h-8 w-20" />
      </td>
    </tr>
  );
}

const levelStyle: Record<string, string> = {
  Beginner: "text-primary",
  Intermediate: "text-accent",
  Advanced: "text-red-600",
};

export default function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);

  const [target, setTarget] = useState<Course | null>(null); // course pending deletion
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get<Course[]>("/courses")
      .then((res) => setCourses(res.data))
      .catch(() => setError("Could not load courses. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load, [load]);

  // auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // close modal with Escape
  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) setTarget(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, deleting]);

  const confirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await api.delete(`/courses/${target._id}`);
      setCourses((prev) => prev.filter((c) => c._id !== target._id));
      setToast({ type: "success", text: `"${target.title}" deleted` });
      setTarget(null);
    } catch {
      setToast({ type: "error", text: "Failed to delete course" });
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) =>
      [c.title, c.instructor, c.level, c.mode].some((f) =>
        f?.toLowerCase().includes(q),
      ),
    );
  }, [courses, search]);

  const freeCount = courses.filter((c) => c.price === 0).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin dashboard</h1>
          <p className="mt-1 text-muted">Create, update and remove courses.</p>
        </div>
        <Link
          to="/admin/courses/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-medium text-white transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Plus size={18} /> Add Course
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<BookOpen size={22} />}
          label="Total courses"
          value={loading ? "–" : courses.length}
        />
        <StatCard
          icon={<Gift size={22} />}
          label="Free courses"
          value={loading ? "–" : freeCount}
        />
        <StatCard
          icon={<IndianRupee size={22} />}
          label="Paid courses"
          value={loading ? "–" : courses.length - freeCount}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-center gap-3 text-red-500">
            <AlertTriangle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10"
          >
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Table card */}
      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, instructor, level..."
              className="w-full rounded-md border border-line bg-page py-2.5 pl-10 pr-9 text-sm outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <p className="text-sm text-muted">
            {loading
              ? "Loading..."
              : `${filtered.length} of ${courses.length} courses`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left text-sm">
            <thead className="bg-surface-2 text-sm text-muted">
              <tr>
                <th className="p-4 font-medium">Course</th>
                <th className="p-4 font-medium">Instructor</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Level</th>
                <th className="p-4 font-medium">Mode</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))}

              {!loading &&
                filtered.map((c) => (
                  <tr
                    key={c._id}
                    className="border-t border-line transition hover:bg-surface-2/60"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.thumbnail}
                          alt=""
                          className="h-12 w-20 shrink-0 rounded-md bg-surface-2 object-cover"
                        />
                        <span className="line-clamp-2 max-w-65 font-semibold">
                          {c.title}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-muted">{c.instructor}</td>
                    <td className="p-4 font-semibold">
                      {c.price === 0 ? (
                        <span className="text-xs font-semibold text-accent">
                          Free
                        </span>
                      ) : (
                        formatPrice(c.price)
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-md border border-line px-2.5 py-1 text-xs font-medium ${levelStyle[c.level] ?? "bg-surface-2"}`}
                      >
                        {c.level}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="rounded-md border border-line px-2.5 py-1 text-xs font-medium">
                        {c.mode}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/courses/${c._id}/edit`}
                          aria-label={`Edit ${c.title}`}
                          title="Edit"
                          className="grid h-9 w-9 place-items-center rounded-md border border-line text-muted transition-colors duration-150 hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => setTarget(c)}
                          aria-label={`Delete ${c.title}`}
                          title="Delete"
                          className="grid h-9 w-9 place-items-center rounded-md border border-line text-muted transition-colors duration-150 hover:border-red-500 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-primary"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Empty states */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center px-4 py-16 text-center">
            <PackageOpen size={40} className="text-muted" />
            <h3 className="mt-4 text-lg font-semibold">
              {courses.length === 0 ? "No courses yet" : "No matching courses"}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {courses.length === 0
                ? "Create your first course to see it here."
                : "Try a different search term."}
            </p>
            {courses.length === 0 && (
              <Link
                to="/admin/courses/new"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white"
              >
                <Plus size={16} /> Add Course
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {target && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={() => !deleting && setTarget(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg border border-line bg-surface p-6"
          >
            <span className="grid h-12 w-12 place-items-center rounded-md border border-red-500/30 text-red-600">
              <AlertTriangle size={24} />
            </span>
            <h2 className="mt-4 text-xl font-bold">Delete this course?</h2>
            <p className="mt-2 text-sm text-muted">
              <span className="font-semibold text-fg">{target.title}</span> will
              be removed permanently. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setTarget(null)}
                disabled={deleting}
                className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-surface-2 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-4 top-20 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${
            toast.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "border-red-500/30 bg-red-500/15 text-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <Check size={18} />
          ) : (
            <AlertTriangle size={18} />
          )}
          {toast.text}
        </div>
      )}
    </div>
  );
}
