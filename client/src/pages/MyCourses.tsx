import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  RotateCcw,
} from "lucide-react";
import api from "../api/axios";
import CourseCardSkeleton from "../Components/CourseCardSkeleton";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types";
import { initials } from "../utils/format";

function EnrolledCard({ course }: { course: Course }) {
  return (
    <Link
      to={`/courses/${course._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="relative aspect-16/10 overflow-hidden bg-surface-2">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[11px] font-medium text-white">
          <CheckCircle2 size={12} /> Purchased
        </span>
        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-0.5 font-mono text-[11px] text-white backdrop-blur">
          <Clock size={12} /> {course.duration}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug">
          {course.title}
        </h3>

        <div className="mt-3 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
            {initials(course.instructor)}
          </span>
          <span className="text-xs text-muted">{course.instructor}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-5 text-sm">
          <span className="text-muted">
            {course.level} · {course.mode}
          </span>
          <span className="rounded-lg bg-surface-2 px-3 py-1.5 font-medium transition group-hover:bg-primary group-hover:text-white">
            Open course
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function MyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get<Course[]>("/enroll/my-courses");
      setCourses(res.data);
    } catch {
      setError("Could not load your courses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="h-screen mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">My courses</h1>
      <p className="mt-2 text-muted">
        {loading
          ? "Loading your courses..."
          : courses.length > 0
            ? `${user ? `${user.name.split(" ")[0]}, you're` : "You're"} enrolled in ${courses.length} ${
                courses.length === 1 ? "course" : "courses"
              }.`
            : "Courses you buy will show up here."}
      </p>

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

      {/* Grid */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))
          : courses.map((c) => <EnrolledCard key={c._id} course={c} />)}
      </div>

      {/* Empty */}
      {!loading && !error && courses.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-4 py-16 text-center">
          <BookOpen size={40} className="text-muted" />
          <h2 className="mt-4 text-lg font-semibold">
            You haven't purchased any course yet
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Browse the catalog and pick something to start learning.
          </p>
          <Link
            to="/courses"
            className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
          >
            Browse courses
          </Link>
        </div>
      )}
    </div>
  );
}
