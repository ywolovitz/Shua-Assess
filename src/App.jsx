import { useEffect, useMemo, useRef, useState } from "react";
import DailyCheckIn from "./components/DailyCheckIn.jsx";

const STORAGE_KEY = "daily-check-in-last-assess-date";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [view, setView] = useState("home");
  const [sessionKey, setSessionKey] = useState(0);
  const [lastAssessDate, setLastAssessDate] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Unable to access localStorage", err);
      return null;
    }
  });
  const [todayKey, setTodayKey] = useState(() => getTodayKey());
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      const freshKey = getTodayKey();
      setTodayKey((prev) => (prev === freshKey ? prev : freshKey));
    }, 60_000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (lastAssessDate) {
      try {
        localStorage.setItem(STORAGE_KEY, lastAssessDate);
      } catch (err) {
        console.warn("Unable to persist date", err);
      }
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, [lastAssessDate]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const assessDisabled = useMemo(
    () => lastAssessDate === todayKey,
    [lastAssessDate, todayKey]
  );

  const handleStartAssessment = () => {
    setSessionKey((prev) => prev + 1);
    setView("checkin");
  };

  const handleSaveAssessment = (payload) => {
    console.log("Submit:", payload);
    setLastAssessDate(todayKey);
    setView("home");
    setToastMessage("Thank you");
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 5_000);
  };

  return (
    <div className="relative min-h-dvh bg-slate-100 text-slate-900">
      {view === "home" ? (
        <HomeScreen disabled={assessDisabled} onStart={handleStartAssessment} />
      ) : (
        <DailyCheckIn key={sessionKey} onSave={handleSaveAssessment} />
      )}

      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}

function HomeScreen({ disabled, onStart }) {
  const logoSrc = `${import.meta.env.BASE_URL}assets/logo.png`;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-lg">
        <img
          src={logoSrc}
          alt="Torah Academy logo"
          className="mx-auto mb-6 h-20 w-auto"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Daily Shua Check-In
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Take a quick moment to reflect on today&apos;s effort, participation,
          and calm.
        </p>
        <button
          type="button"
          className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-blue-300"
          onClick={onStart}
          disabled={disabled}
        >
          {disabled ? "Assessment complete for today" : "Assess for Today"}
        </button>
      </div>
    </div>
  );
}

function Toast({ message }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <div className="rounded-full bg-gray-900/90 px-4 py-2 text-sm font-medium text-white shadow-lg">
        {message}
      </div>
    </div>
  );
}
