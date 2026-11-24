import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Course } from '../types';
import { formatPrice, initials } from '../utils/format';

export default function CourseCard({ course }: { course: Course }) {
  const free = course.price === 0;

  return (
    <Link
      to={`/courses/${course._id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors duration-150 hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="relative aspect-16/10- overflow-hidden bg-surface-2">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-medium text-white ${
              course.mode === 'Online' ? 'bg-[#3d8068]' : 'bg-[#a85d32]'
            }`}
          >
            {course.mode}
          </span>
          <span className="rounded-md bg-[#26312b]/90 px-2.5 py-1 text-xs font-medium text-white">
            {course.level}
          </span>
        </div>
        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-[#26312b]/90 px-2.5 py-1 text-xs text-white">
          <Clock size={12} aria-hidden="true" /> {course.duration}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-xl font-semibold leading-snug">{course.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{course.description}</p>

        <div className="mt-4 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-line text-[10px] font-semibold text-primary" aria-hidden="true">
            {initials(course.instructor)}
          </span>
          <span className="text-xs text-muted">{course.instructor}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-5">
          {free ? (
            <span className="text-sm font-semibold text-accent">Free</span>
          ) : (
            <span className="text-xl font-bold">{formatPrice(course.price)}</span>
          )}
          <span className="text-sm font-semibold text-primary">
            View course
          </span>
        </div>
      </div>
    </Link>
  );
}