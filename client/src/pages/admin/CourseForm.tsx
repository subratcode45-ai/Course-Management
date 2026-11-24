import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/axios';
import type { Course } from '../../types';
import { slugify } from '../../utils/format';

interface ModuleForm {
  title: string;
  lessons: string; // one lesson per line
}

const splitLines = (text: string) =>
  text.split('\n').map((s) => s.trim()).filter(Boolean);

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
  const [learn, setLearn] = useState(''); // one item per line
  const [modules, setModules] = useState<ModuleForm[]>([{ title: '', lessons: '' }]);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // prefill when editing
  useEffect(() => {
    if (!id) return;
    api
      .get<Course>(`/courses/${id}`)
      .then(({ data }) => {
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
      })
      .catch(() => setError('Could not load course'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateModule = (index: number, patch: Partial<ModuleForm>) =>
    setModules((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));

  const addModule = () => setModules((prev) => [...prev, { title: '', lessons: '' }]);

  const removeModule = (index: number) =>
    setModules((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
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
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="mx-auto max-w-3xl p-6 text-muted">Loading course...</p>;

  const input = 'w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30';
  const label = 'mb-1 block text-sm font-medium';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold">{isEdit ? 'Edit course' : 'Add course'}</h1>
      {error && <p role="alert" className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={label}>Title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={input} />
        </div>

        <div>
          <label className={label}>Description</label>
          <textarea required rows={4} value={description}
            onChange={(e) => setDescription(e.target.value)} className={input} />
        </div>

        <div>
          <label className={label}>Thumbnail URL</label>
          <input required value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} className={input} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Price (₹, 0 for free)</label>
            <input type="number" min={0} required value={price}
              onChange={(e) => setPrice(e.target.value)} className={input} />
          </div>
          <div>
            <label className={label}>Instructor</label>
            <input required value={instructor}
              onChange={(e) => setInstructor(e.target.value)} className={input} />
          </div>
          <div>
            <label className={label}>Duration (e.g. 3 Months)</label>
            <input required value={duration}
              onChange={(e) => setDuration(e.target.value)} className={input} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className={input}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className={label}>Mode</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)} className={input}>
                <option>Online</option>
                <option>Offline</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className={label}>What you'll learn (one item per line)</label>
          <textarea rows={5} value={learn} onChange={(e) => setLearn(e.target.value)} className={input} />
        </div>

        <div>
          <label className={label}>Curriculum</label>
          <div className="space-y-3">
            {modules.map((m, i) => (
              <div key={i} className="rounded-lg border border-line bg-surface p-3">
                <div className="mb-2 flex gap-2">
                  <input placeholder={`Module ${i + 1} title`} value={m.title}
                    onChange={(e) => updateModule(i, { title: e.target.value })} className={input} />
                  {modules.length > 1 && (
                    <button type="button" onClick={() => removeModule(i)}
                      className="rounded-md border border-red-500/30 px-3 text-sm text-red-600">
                      Remove
                    </button>
                  )}
                </div>
                <textarea rows={4} placeholder="Lessons (one per line)" value={m.lessons}
                  onChange={(e) => updateModule(i, { lessons: e.target.value })} className={input} />
              </div>
            ))}
          </div>
          <button type="button" onClick={addModule} className="mt-2 text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-primary">
            + Add module
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <button disabled={saving} className="rounded-md bg-primary px-5 py-2 text-white transition-colors duration-150 hover:bg-primary-hover disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            {saving ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}
          </button>
          <button type="button" onClick={() => navigate('/admin')} className="rounded-md border border-line px-5 py-2 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-primary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}