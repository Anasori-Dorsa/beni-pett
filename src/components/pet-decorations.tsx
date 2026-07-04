import type { CSSProperties } from "react";

/** Small SVG paw print */
export function Paw({ className = "", style, size = 24 }: { className?: string; style?: CSSProperties; size?: number }) {
  return (
    <svg
      className={`paw ${className}`}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <ellipse cx="12" cy="17" rx="4" ry="3.2" />
      <ellipse cx="6" cy="11" rx="1.9" ry="2.6" />
      <ellipse cx="10" cy="7" rx="1.9" ry="2.6" />
      <ellipse cx="14" cy="7" rx="1.9" ry="2.6" />
      <ellipse cx="18" cy="11" rx="1.9" ry="2.6" />
    </svg>
  );
}

type PawSpec = { top?: string; left?: string; right?: string; bottom?: string; size?: number; rot?: number; delay?: string; trail?: boolean; tx?: number; ty?: number };

/** A scatter of animated paw prints. Absolute-positioned; place inside a `relative` parent. */
export function PawScatter({ paws }: { paws: PawSpec[] }) {
  return (
    <>
      {paws.map((p, i) => (
        <Paw
          key={i}
          size={p.size ?? 22}
          className={p.trail ? "paw-trail" : ""}
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            bottom: p.bottom,
            animationDelay: p.delay ?? `${i * 0.4}s`,
            ["--paw-rot" as any]: `${p.rot ?? 0}deg`,
            ["--paw-tx" as any]: `${p.tx ?? 180}px`,
            ["--paw-ty" as any]: `${p.ty ?? -60}px`,
          }}
        />
      ))}
    </>
  );
}

/** A stylized dog peeking from behind (for hiding behind title). */
export function PeekingDog({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      className={`peek-pet ${className}`}
      style={style}
      viewBox="0 0 120 120"
      width="120"
      height="120"
      aria-hidden="true"
    >
      {/* body */}
      <ellipse cx="60" cy="95" rx="34" ry="22" fill="var(--clay)" />
      {/* tail */}
      <path className="tail" d="M92 90 Q108 70 100 55" stroke="var(--clay)" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* head */}
      <ellipse cx="60" cy="55" rx="26" ry="24" fill="var(--clay)" />
      {/* ears */}
      <ellipse cx="38" cy="42" rx="8" ry="14" fill="oklch(0.55 0.05 55)" transform="rotate(-25 38 42)" />
      <ellipse cx="82" cy="42" rx="8" ry="14" fill="oklch(0.55 0.05 55)" transform="rotate(25 82 42)" />
      {/* eyes */}
      <circle cx="52" cy="55" r="3" fill="var(--espresso)" />
      <circle cx="68" cy="55" r="3" fill="var(--espresso)" />
      <circle cx="53" cy="54" r="1" fill="white" />
      <circle cx="69" cy="54" r="1" fill="white" />
      {/* nose + smile */}
      <ellipse cx="60" cy="64" rx="3" ry="2.2" fill="var(--espresso)" />
      <path d="M55 70 Q60 74 65 70" stroke="var(--espresso)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** A stylized cat peeking. */
export function PeekingCat({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      className={`peek-pet ${className}`}
      style={style}
      viewBox="0 0 120 120"
      width="120"
      height="120"
      aria-hidden="true"
    >
      <ellipse cx="60" cy="95" rx="30" ry="20" fill="var(--espresso)" />
      <path className="tail" d="M32 88 Q14 78 22 60" stroke="var(--espresso)" strokeWidth="6" strokeLinecap="round" fill="none" />
      <ellipse cx="60" cy="58" rx="24" ry="21" fill="var(--espresso)" />
      {/* ears */}
      <polygon points="40,42 34,20 52,36" fill="var(--espresso)" />
      <polygon points="80,42 86,20 68,36" fill="var(--espresso)" />
      <polygon points="42,38 40,26 48,34" fill="var(--clay)" />
      <polygon points="78,38 80,26 72,34" fill="var(--clay)" />
      {/* eyes */}
      <ellipse cx="51" cy="58" rx="3" ry="4" fill="oklch(0.85 0.12 100)" />
      <ellipse cx="69" cy="58" rx="3" ry="4" fill="oklch(0.85 0.12 100)" />
      <ellipse cx="51" cy="58" rx="1" ry="3.5" fill="var(--espresso)" />
      <ellipse cx="69" cy="58" rx="1" ry="3.5" fill="var(--espresso)" />
      {/* nose + whiskers */}
      <path d="M58 66 L62 66 L60 69 Z" fill="var(--clay)" />
      <path d="M40 62 L52 64 M40 66 L52 66 M68 64 L80 62 M68 66 L80 66" stroke="var(--clay)" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}