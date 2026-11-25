import { useRef, useState, type DragEvent } from 'react';
import axios from 'axios';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import { imageUrl } from '../../utils/format';

const MAX_MB = 5;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface Props {
  value: string; // the stored path or URL
  onChange: (path: string) => void;
  onBusyChange?: (busy: boolean) => void;
}

export default function ThumbnailUpload({ value, onChange, onBusyChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File) => {
    setError('');
    if (!TYPES.includes(file.type)) return setError('Please choose a JPG, PNG or WebP image.');
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Image must be smaller than ${MAX_MB} MB.`);

    const local = URL.createObjectURL(file);
    setPreview(local);
    setProgress(0);
    setUploading(true);
    onBusyChange?.(true);

    const body = new FormData();
    body.append('thumbnail', file);

    try {
      const { data } = await api.post<{ url: string }>('/upload/thumbnail', body, {
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      onChange(data.url);
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message ?? 'Upload failed' : 'Upload failed');
    } finally {
      setPreview('');
      URL.revokeObjectURL(local);
      setUploading(false);
      onBusyChange?.(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  const shown = preview || imageUrl(value);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = ''; // lets the same file be picked again
        }}
      />

      {shown ? (
        <div className="max-w-sm">
          <div className="relative aspect-16/10 overflow-hidden rounded-xl border border-line bg-surface-2">
            <img src={shown} alt="Thumbnail preview" className="h-full w-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-white">
                <Loader2 className="animate-spin" size={24} />
                <span className="text-sm font-medium">Uploading {progress}%</span>
                <div className="h-1.5 w-2/3 overflow-hidden rounded-full bg-white/30">
                  <div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium transition hover:bg-surface-2 disabled:opacity-60"
            >
              Change image
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => onChange('')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-red-500 transition hover:border-red-500 hover:bg-red-500/10 disabled:opacity-60"
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex aspect-16/10 w-full max-w-sm flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 text-center transition ${
            dragging ? 'border-primary bg-primary/10' : 'border-line bg-surface-2 hover:border-primary/60'
          }`}
        >
          <ImagePlus size={30} className="text-muted" />
          <span className="mt-2 text-sm font-medium">Click to upload or drag an image here</span>
          <span className="mt-1 text-xs text-muted">JPG, PNG or WebP, up to {MAX_MB} MB</span>
        </button>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}