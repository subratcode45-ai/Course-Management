import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../api/axios';
import CourseCard from '../Components/CourseCard';
import CourseCardSkeleton from '../Components/CourseCardSkeleton';
import type { Course } from '../types';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await api.get<Course[]>('/courses');
        setCourses(res.data.slice(0, 3));
      } catch(err) {
        console.error(err)
      } finally {
        setLoading(false);
      }
    };

    void loadCourses();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="mb-4 text-sm font-medium text-primary">Practical online courses</p>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-[4rem]">
              Learn development with a clear, practical curriculum.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
              Study at your own pace, follow useful exercises, and keep the projects you build.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Browse courses <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a
                href="#how-it-works"
                className="rounded-lg border border-line bg-surface px-5 py-3 text-sm font-semibold transition-colors duration-150 hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                How it works
              </a>
            </div>
          </div>
          <img
            src={"./image.png"}
            alt="Developer studying course material at a desk"
            className="aspect-4/3 w-full rounded-lg border border-line object-cover"
          />
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-7 flex items-end justify-between gap-6 border-b border-line pb-5">
          <div>
            <h2 className="text-3xl font-bold">Featured courses</h2>
            <p className="mt-2 text-muted">A few courses available to begin with.</p>
          </div>
          <Link
            to="/courses"
            className="hidden items-center gap-1 text-sm font-semibold text-primary sm:flex focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            View all <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)
            : courses.map((c) => <CourseCard key={c._id} course={c} />)}
        </div>
      </section>

      {/* Why */}
      <section className="border-y border-line bg-surface-2/45">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:py-16">
          <h2 className="text-3xl font-bold leading-tight">Built for focused, self-paced study</h2>
          <div className="max-w-2xl">
            <p className="leading-7 text-muted">
              CourseHub keeps the path straightforward. You can read the course outline,
              enroll once, and return to lessons as often as you need.
            </p>
            <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <li className="border-l-2 border-primary pl-3">Clear lesson structure</li>
              <li className="border-l-2 border-primary pl-3">One-time course purchase</li>
              <li className="border-l-2 border-primary pl-3">Practical examples and exercises</li>
              <li className="border-l-2 border-primary pl-3">Courses in your personal dashboard</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 lg:py-20">
        <h2 className="text-3xl font-bold">Getting started</h2>
        <div className="mt-7 max-w-3xl divide-y divide-line border-y border-line">
          <div className="py-5">
            <h3 className="font-semibold">Choose a course</h3>
            <p className="mt-1 text-sm leading-6 text-muted">Review the outline and choose the level that fits you.</p>
          </div>
          <div className="py-5">
            <h3 className="font-semibold">Complete enrollment</h3>
            <p className="mt-1 text-sm leading-6 text-muted">Use the course payment flow to add it to your account.</p>
          </div>
          <div className="py-5">
            <h3 className="font-semibold">Learn from your dashboard</h3>
            <p className="mt-1 text-sm leading-6 text-muted">Open lessons and work through the material at a comfortable pace.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:pb-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-lg border border-primary/30 bg-primary px-6 py-9 text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold">Find a course to start today</h2>
            <p className="mt-2 max-w-xl text-sm text-white/80">Browse the catalog and choose a topic that matches your current goals.</p>
          </div>
          <Link
            to="/courses"
            className="shrink-0 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#1e2a24] transition-colors duration-150 hover:bg-[#eef1ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Browse courses
          </Link>
        </div>
      </section>
    </div>
  );
}