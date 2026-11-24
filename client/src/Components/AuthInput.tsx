import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: ReactNode;
}

export default function AuthInput({ label, icon, type = 'text', ...rest }: Props) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          {icon}
        </span>
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          {...rest}
          className="w-full rounded-md border border-line bg-page py-3 pl-11 pr-11 text-sm outline-none transition-colors duration-150 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}