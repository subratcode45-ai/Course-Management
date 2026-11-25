import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import type { Course } from '../../types';
import { slugify } from '../../utils/format';
import ThumbnailUpload from './ThumbnailUpload';

interface ModuleForm {
  title: string;
  lessons: string; // one lesson per line
}

const splitLines = (text: string) =>
  text.split('\n').map((s) => s.trim()).filter(Boolean);

const inputClass =
  'w-full rounded-xl border border-line bg-page px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function FormSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <div className="skeleton h-8 w-48" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4 rounded-2xl border border-line bg-surface p-6">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton h-10 w-full rounded-xl!" />
          <div className="skeleton h-10 w-full rounded-xl!" />
        </div>
      ))}
    </div>
  );
}

export default function CourseForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [price, setPrice] = useState('0');
  const [instructor, setInstructor] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [mode, setMode] = useState('Online');
  const [learn, setLearn] = useState('');
  const [modules, setModules] = useState<ModuleForm[]>([{ title: '', lessons: '' }]);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // prefill when editing
  useEffect(() => {
    if (!id) return;

    const loadCourse = async () => {
      try {
        const { data } = await api.get<Course>(`/courses/${id}`);
        setTitle(data.title);
        setDescription(data.description);
        setThumbnail(data.thumbnail);
        setPrice(String(data.price));
        setInstructor(data.instructor);
        setDuration(data.duration);
        setLevel(data.level);
        setMode(data.mode);
        setLearn((data.whatYouWillLearn ?? []).join('\n'));
        setModules(
          data.curriculum?.length
            ? data.curriculum.map((m) => ({ title: m.title, lessons: m.lessons.join('\n') }))
            : [{ title: '', lessons: '' }]
        );
      } catch {
        setError('Could not load this course.');
      } finally {
        setLoading(false);
      }
    };

    void loadCourse();
  }, [id]);

  const updateModule = (index: number, patch: Partial<ModuleForm>) =>
    setModules((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));

  const addModule = () => setModules((prev) => [...prev, { title: '', lessons: '' }]);

  const removeModule = (index: number) =>
    setModules((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // the old URL input had `required`; the upload component needs this manual check
    if (!thumbnail) {
      setError('Please upload a thumbnail image.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);

    const payload = {
      title,
      slug: slugify(title),
      description,
      thumbnail,
      price: Number(price),
      instructor,
      duration,
      level,
      mode,
      whatYouWillLearn: splitLines(learn),
      curriculum: modules
        .filter((m) => m.title.trim())
        .map((m) => ({ title: m.title.trim(), lessons: splitLines(m.lessons) })),
    };

    try {
      if (isEdit) await api.put(`/courses/${id}`, payload);
      else await api.post('/courses', payload);
      navigate('/admin');
    } catch (err) {
      setError(
        axios.isAxiosError(err) ? err.response?.data?.message ?? 'Save failed' : 'Save failed'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' }); // so the error banner is seen
      setSaving(false);
    }
  };

  if (loading) return <FormSkeleton />;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <h1 className="mt-3 text-3xl font-extrabold">{isEdit ? 'Edit course' : 'Add a new course'}</h1>
      <p className="mt-1 text-muted">
        {isEdit ? 'Update the details below and save.' : 'Fill in the details to publish a course.'}
      </p>

      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="mt-8 space-y-6">
        {/* 1. Basic info */}
        <Card title="Basic info">
          <Field label="Title">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. React & TypeScript: Build Modern Web Apps"
              className={inputClass}
            />
          </Field>

          <Field label="Description">
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this course about and who is it for?"
              className={inputClass}
            />
          </Field>

          {/* plain div, not Field: a <label> wrapping a button can open the file dialog twice */}
          <div>
            <span className="mb-1.5 block text-sm font-medium">Thumbnail</span>
            <ThumbnailUpload value={thumbnail} onChange={setThumbnail} onBusyChange={setUploading} />
            <span className="mt-1.5 block text-xs text-muted">
              A 16:10 image fits best on the cards.
            </span>
          </div>
        </Card>

        {/* 2. Details */}
        <Card title="Details">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Price (₹)" hint="Enter 0 for a free course.">
              <input
                type="number"
                min={0}
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Instructor">
              <input
                required
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Duration" hint="For example: 8 Weeks, 3 Months.">
              <input
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Level">
                <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputClass}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </Field>
              <Field label="Mode">
                <select value={mode} onChange={(e) => setMode(e.target.value)} className={inputClass}>
                  <option>Online</option>
                  <option>Offline</option>
                </select>
              </Field>
            </div>
          </div>
        </Card>

        {/* 3. What you'll learn */}
        <Card title="What you'll learn" subtitle="Shown as a checklist on the course page.">
          <Field label="Learning points" hint="One point per line.">
            <textarea
              rows={6}
              value={learn}
              onChange={(e) => setLearn(e.target.value)}
              placeholder={'Build REST APIs with Express\nDesign databases with MongoDB'}
              className={inputClass}
            />
          </Field>
        </Card>

        {/* 4. Curriculum */}
        <Card title="Curriculum" subtitle="Group lessons into modules.">
          {modules.map((m, i) => (
            <div key={i} className="rounded-xl border border-line bg-page p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-2 font-mono text-xs">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <input
                  value={m.title}
                  onChange={(e) => updateModule(i, { title: e.target.value })}
                  placeholder={`Module ${i + 1} title`}
                  aria-label={`Module ${i + 1} title`}
                  className={inputClass}
                />
                {modules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeModule(i)}
                    aria-label={`Remove module ${i + 1}`}
                    title="Remove module"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line text-muted transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <textarea
                rows={4}
                value={m.lessons}
                onChange={(e) => updateModule(i, { lessons: e.target.value })}
                placeholder="Lessons, one per line"
                aria-label={`Module ${i + 1} lessons`}
                className={inputClass}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addModule}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-line px-4 py-2 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary/5"
          >
            <Plus size={16} /> Add module
          </button>
        </Card>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-30 -mx-4 mt-8 border-t border-line bg-page/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            disabled={saving}
            className="rounded-xl border border-line px-5 py-2.5 text-sm font-medium transition hover:bg-surface-2 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {(saving || uploading) && <Loader2 size={16} className="animate-spin" />}
            {uploading ? 'Uploading...' : saving ? 'Saving...' : isEdit ? 'Update course' : 'Create course'}
          </button>
        </div>
      </div>
    </form>
  );
}