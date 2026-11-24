import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RotateCcw, Search, SearchX } from 'lucide-react';
import api from '../api/axios';
import CourseCard from '../Components/CourseCard';
import CourseCardSkeleton from '../Components/CourseCardSkeleton';
import type { Course } from '../types';

type Sort = 'newest' | 'low' | 'high';

function FilterGroup({
  label, options, value, onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary ${
            value === o ? 'bg-primary text-white' : 'border border-line bg-surface text-muted hover:text-fg'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All');
  const [mode, setMode] = useState('All');
  const [price, setPrice] = useState('All');
  const [sort, setSort] = useState<Sort>('newest');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .get<Course[]>('/courses')
      .then((res) => setCourses(res.data))
      .catch(() => setError('Could not load courses. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = courses.filter(
      (c) =>
        (!q || [c.title, c.instructor, c.description].some((f) => f?.toLowerCase().includes(q))) &&
        (level === 'All' || c.level === level) &&
        (mode === 'All' || c.mode === mode) &&
        (price === 'All' || (price === 'Free' ? c.price === 0 : c.price > 0))
    );
    if (sort === 'low') list.sort((a, b) => a.price - b.price);
    if (sort === 'high') list.sort((a, b) => b.price - a.price);
    return list; // "newest" keeps the API order (already newest first)
  }, [courses, search, level, mode, price, sort]);

  const hasFilters = search || level !== 'All' || mode !== 'All' || price !== 'All' || sort !== 'newest';
  const clearFilters = () => {
    setSearch(''); setLevel('All'); setMode('All'); setPrice('All'); setSort('newest');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold sm:text-5xl">Course catalog</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Browse courses by level, format, and price.
      </p>

      {/* Toolbar */}
      <div className="mt-8 space-y-4 rounded-lg border border-line bg-surface p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses, instructors..."
              className="w-full rounded-md border border-line bg-page py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-md border border-line bg-page px-3 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="newest">Sort: Newest first</option>
            <option value="low">Price: Low to high</option>
            <option value="high">Price: High to low</option>
          </select>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:gap-x-8">
          <FilterGroup label="Level" options={['All', 'Beginner', 'Intermediate', 'Advanced']} value={level} onChange={setLevel} />
          <FilterGroup label="Mode" options={['All', 'Online', 'Offline']} value={mode} onChange={setMode} />
          <FilterGroup label="Price" options={['All', 'Free', 'Paid']} value={price} onChange={setPrice} />
        </div>

        <div className="flex items-center justify-between border-t border-line pt-3 text-sm">
          <p className="text-muted">
            {loading ? 'Loading courses...' : (
              <>
                <span className="font-semibold text-fg">{filtered.length}</span>{' '}
                {filtered.length === 1 ? 'course' : 'courses'} found
              </>
            )}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="font-medium text-primary hover:underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle size={20} aria-hidden="true" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-md border border-red-500/40 px-3 py-1.5 text-sm text-red-600 hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)
          : filtered.map((c) => <CourseCard key={c._id} course={c} />)}
      </div>

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-lg border border-dashed border-line py-16 text-center">
          <SearchX size={40} className="text-muted" aria-hidden="true" />
          <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
          <p className="mt-1 text-sm text-muted">Try changing your search or filters.</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}