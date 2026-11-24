import { Loader2 } from 'lucide-react';

interface Props {
  loading: boolean;
  idleText: string;
  loadingText: string;
}

export default function SubmitButton({ loading, idleText, loadingText }: Props) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 font-semibold text-white transition-colors duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {loading ? loadingText : idleText}
    </button>
  );
}