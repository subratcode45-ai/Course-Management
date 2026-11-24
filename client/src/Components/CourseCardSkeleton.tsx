export default function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="skeleton aspect-16/10 w-full rounded-none!" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-5 w-4/5" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-2/3" />
        <div className="flex items-center gap-2 pt-2">
          <div className="skeleton h-7 w-7 rounded-full!" />
          <div className="skeleton h-3 w-24" />
        </div>
        <div className="flex items-center justify-between pt-3">
          <div className="skeleton h-6 w-20" />
          <div className="skeleton h-8 w-28" />
        </div>
      </div>
    </div>
  );
}