import type { ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';

const points = [
  'Clear lessons with practical exercises',
  'Access to purchased courses from your account',
  'Study at your own pace',
];

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Brand panel (desktop only) */}
      <div className="hidden border-r border-line bg-surface-2 p-12 lg:flex lg:flex-col lg:justify-between">
        <div>
          <h2 className="max-w-md text-4xl font-bold leading-tight">
            Learn development in manageable steps.
          </h2>
          <p className="mt-4 max-w-md leading-7 text-muted">
            CourseHub gives you a direct place to browse lessons, enroll, and keep learning.
          </p>
        </div>

        <ul className="space-y-4">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-3 text-sm">
              <CheckCircle2 size={20} className="shrink-0 text-primary" aria-hidden="true" />
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>

          <div className="mt-8 rounded-lg border border-line bg-surface p-6 sm:p-8">
            {children}
          </div>

          <p className="mt-6 text-center text-sm text-muted">{footer}</p>
        </div>
      </div>
    </div>
  );
}