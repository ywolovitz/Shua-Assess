import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Mobile-first Daily Check-In
 * - Date at the top
 * - 60s circular countdown (anticlockwise)
 * - Three 0–10 sliders: Effort, Participation, Calm / Regulation
 *
 * Drop this into your React app and render <DailyCheckIn />
 * Tailwind optional but used for nice defaults.
 */
export default function DailyCheckIn({ onSave }) {
  const [effort, setEffort] = useState(5);
  const [participation, setParticipation] = useState(5);
  const [calm, setCalm] = useState(5);
  const [locked, setLocked] = useState(false);
  const [comments, setComments] = useState({
    effort: "",
    participation: "",
    calm: "",
  });
  const [modal, setModal] = useState({
    open: false,
    field: null,
    label: "",
    draft: "",
  });

  // Format local date nicely (e.g., Wed, 12 Nov 2025)
  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  // Optional: when timer completes, lock inputs
  const handleComplete = useCallback(() => setLocked(true), []);

  return (
    <div className="min-h-dvh bg-white text-gray-900 flex flex-col items-center px-4 py-5 sm:px-6">
      {/* Date */}
      <header className="w-full max-w-md mb-4">
        <div className="text-center">
          <p className="text-sm uppercase tracking-wide text-gray-500">
            Today
          </p>
          <h1 className="text-2xl font-bold">{today}</h1>
        </div>
      </header>

      {/* Countdown */}
      <section className="w-full max-w-md flex flex-col items-center mb-4">
        <TimerCircle
          duration={60}
          size={240}
          strokeWidth={16}
          autoStart
          onComplete={handleComplete}
        />
        <p className="mt-2 text-sm text-gray-500">
          You have 60 seconds to rate today
        </p>
      </section>

      {/* Sliders */}
      <main className="w-full max-w-md grid gap-4">
        <SliderCard
          label="Effort"
          value={effort}
          onChange={setEffort}
          disabled={locked}
          onOpenComment={() =>
            setModal({
              open: true,
              field: "effort",
              label: "Effort",
              draft: comments.effort,
            })
          }
          hasComment={Boolean(comments.effort.trim())}
        />
        <SliderCard
          label="Participation"
          value={participation}
          onChange={setParticipation}
          disabled={locked}
          onOpenComment={() =>
            setModal({
              open: true,
              field: "participation",
              label: "Participation",
              draft: comments.participation,
            })
          }
          hasComment={Boolean(comments.participation.trim())}
        />
        <SliderCard
          label="Calm / Regulation"
          value={calm}
          onChange={setCalm}
          disabled={locked}
          onOpenComment={() =>
            setModal({
              open: true,
              field: "calm",
              label: "Calm / Regulation",
              draft: comments.calm,
            })
          }
          hasComment={Boolean(comments.calm.trim())}
        />

        {/* Action Row */}
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 text-base font-medium shadow-sm active:scale-[0.99] disabled:opacity-50"
            onClick={() => {
              setEffort(5);
              setParticipation(5);
              setCalm(5);
              setLocked(false);
              setComments({
                effort: "",
                participation: "",
                calm: "",
              });
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className="flex-1 rounded-2xl bg-blue-600 text-white px-4 py-3 text-base font-semibold shadow-sm active:scale-[0.99] disabled:opacity-60"
            onClick={() => {
              const payload = {
                date: new Date().toISOString(),
                effort,
                participation,
                calm,
                comments,
                lockedAfter60s: locked,
              };
              if (typeof onSave === "function") {
                onSave(payload);
              } else {
                console.log("Submit:", payload);
              }
            }}
          >
            Save
          </button>
        </div>

        {locked && (
          <p className="text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl py-2">
            Time&apos;s up — sliders locked. You can still Save or Reset.
          </p>
        )}
      </main>

      <footer className="mt-auto pt-6 pb-2 text-center text-xs text-gray-400">
        <p>Built for mobile portrait • No external deps</p>
      </footer>

      {modal.open && (
        <CommentModal
          label={modal.label}
          value={modal.draft}
          onChange={(next) =>
            setModal((prev) => ({
              ...prev,
              draft: next,
            }))
          }
          onClose={() =>
            setModal({
              open: false,
              field: null,
              label: "",
              draft: "",
            })
          }
          onSave={() => {
            if (!modal.field) {
              setModal({
                open: false,
                field: null,
                label: "",
                draft: "",
              });
              return;
            }
            setComments((prev) => ({
              ...prev,
              [modal.field]: modal.draft.trim(),
            }));
            setModal({
              open: false,
              field: null,
              label: "",
              draft: "",
            });
          }}
          onDiscard={() => {
            setModal({
              open: false,
              field: null,
              label: "",
              draft: "",
            });
          }}
        />
      )}
    </div>
  );
}

/** Simple labeled slider (0–10) with big touch target */
function SliderCard({
  label,
  value,
  onChange,
  disabled,
  onOpenComment,
  hasComment,
}) {
  return (
    <div className="relative rounded-2xl border border-gray-200 p-4 shadow-sm">
      <button
        type="button"
        onClick={onOpenComment}
        className={`absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
          hasComment
            ? "border-blue-200 bg-blue-50 text-blue-600"
            : "border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-500"
        }`}
        aria-label={`Add comment for ${label}`}
      >
        <TextIcon />
      </button>
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-base font-semibold">{label}</h2>
        <span className="text-xl font-bold tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full accent-blue-600 h-8"
        aria-label={`${label} slider`}
      />
      <div className="flex justify-between text-[11px] text-gray-500 mt-1">
        <span>0</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}

/**
 * Circular countdown timer (anticlockwise sweep)
 * Uses requestAnimationFrame for smooth, accurate timing.
 */
function TimerCircle({
  duration = 60,
  size = 220,
  strokeWidth = 14,
  autoStart = true,
  onComplete,
}) {
  const r = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const CIRC = useMemo(() => 2 * Math.PI * r, [r]);

  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(autoStart);

  const rafRef = useRef(null);
  const startRef = useRef(null);
  const carriedElapsedRef = useRef(0);
  const audioCtxRef = useRef(null);

  const playChime = useCallback(() => {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext || null;
    if (!AudioContextClass) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContextClass();
    }

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, now);
    oscillator.frequency.linearRampToValueAtTime(880, now + 0.4);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 1.3);

    void ctx.resume?.().catch(() => {});
  }, []);

  // keep a stable reference to onComplete so re-renders (e.g., slider changes) don't restart the timer
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!running) return undefined;

    startRef.current = performance.now() - carriedElapsedRef.current * 1000;

    const tick = (t) => {
      const elapsed = (t - startRef.current) / 1000;
      const remainingNow = Math.max(duration - elapsed, 0);
      setRemaining(remainingNow);

      if (remainingNow > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
        carriedElapsedRef.current = duration;
        playChime();
        onCompleteRef.current?.();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, duration, playChime]);

  const elapsed = Math.min(duration - remaining, duration);
  const progress = elapsed / duration; // 0→1
  const dashOffset = CIRC * (1 - progress); // fill anticlockwise starting at 12 o'clock

  // mm:ss for center display
  const s = Math.max(0, Math.ceil(remaining));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  const displayText = `${mm}:${ss}`;

  const pause = () => {
    if (!running) return;
    setRunning(false);
    carriedElapsedRef.current = elapsed;
  };
  const resume = () => {
    if (running || remaining <= 0) return;
    setRunning(true);
  };
  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    carriedElapsedRef.current = 0;
    setRemaining(duration);
    setRunning(autoStart);
  };

  // Pause/resume/reset functions currently unused, but leave them for future controls.
  void pause;
  void resume;
  void reset;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#e6e6e9"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress (anticlockwise, starting at 12 o'clock) */}
        <g
          transform={`rotate(-90 ${size / 2} ${size / 2}) translate(${size} 0) scale(-1 1)`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="#3b82f6"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
          />
        </g>
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-3xl font-extrabold tabular-nums select-none">
          {displayText}
        </div>
      </div>
    </div>
  );
}

function CommentModal({ label, value, onChange, onSave, onDiscard, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-5 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={`${label} comment`}
      >
        <header className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {label} comment
          </h3>
          <p className="text-sm text-gray-500">
            Capture any notes or context you&apos;d like to remember.
          </p>
        </header>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-32 w-full resize-none rounded-2xl border border-gray-200 p-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder="Type your comment..."
        />
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-300"
            onClick={() => {
              onDiscard();
            }}
          >
            Discard
          </button>
          <button
            type="button"
            className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            onClick={() => {
              onSave();
            }}
          >
            Save
          </button>
        </div>
        <button
          type="button"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          onClick={onClose}
          aria-label="Close comment dialog"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function TextIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M4 4.75A1.75 1.75 0 0 1 5.75 3h12.5A1.75 1.75 0 0 1 20 4.75v10.5A1.75 1.75 0 0 1 18.25 17H8.06l-3.34 3.34A1 1 0 0 1 3 19.657V4.75Zm1.75-.25a.25.25 0 0 0-.25.25v12.69l2.72-2.72a1 1 0 0 1 .71-.29h11.32a.25.25 0 0 0 .25-.25V4.75a.25.25 0 0 0-.25-.25H5.75Z" />
      <path d="M8.75 7a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5A.75.75 0 0 1 8.75 7Zm0 3a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 8.75 10Zm0 3a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z" />
    </svg>
  );
}

