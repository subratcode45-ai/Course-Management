import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // skip touch devices
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    let x = 0, y = 0, rx = 0, ry = 0, raf = 0;

    const setVisible = (v: boolean) => {
      dot.current?.classList.toggle('cursor-visible', v);
      ring.current?.classList.toggle('cursor-visible', v);
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      const target = e.target as Element;
      setVisible(!target.closest('input, textarea, select'));
      ring.current?.classList.toggle(
        'is-hover',
        !!target.closest('a, button, summary, [role="button"], [data-cursor]')
      );
    };

    // ring eases toward the mouse position every frame
    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMove);
    root.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      root.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
      root.classList.remove('has-custom-cursor');
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" />
      <div ref={dot} className="cursor-dot" />
    </>
  );
}