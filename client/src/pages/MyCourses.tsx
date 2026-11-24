import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import CourseCard from "../Components/CourseCard";
import type { Course } from "../types";
import CourseCardSkeleton from "../Components/CourseCardSkeleton";

export default function MyCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Course[]>("/enroll/my-courses")
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="mx-auto grid max-w-6xl gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 text-4xl font-bold">My courses</h1>

      {courses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line py-12 text-center">
          <p className="text-muted">You haven't enrolled in a course yet.</p>
          <Link
            to="/courses"
            className="mt-4 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c._id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
