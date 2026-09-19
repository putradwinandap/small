"use client";

import { FormEvent, useEffect, useState } from "react";

type Habit = {
  id: string;
  name: string;
  action: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  inRecovery: boolean;
  completedDays: number;
  scheduledDays: number;
  checkIns: Array<{ date: string; status: "COMPLETE" | "MISSED" }>;
};

type Mode = "login" | "register";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const data = (await response.json()) as T & { error?: { message: string } };
  if (!response.ok) throw new Error(data.error?.message ?? "Something went wrong.");
  return data;
}

export function AppShell() {
  const [mode, setMode] = useState<Mode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [action, setAction] = useState("");
  const [habit, setHabit] = useState<Habit | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [progress, setProgress] = useState({ scheduledDays: 0, completedDays: 0 });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  async function loadHabits() {
    try {
      const data = await request<{ habits: Habit[]; progress: typeof progress }>("/api/habits");
      setHabits(data.habits);
      setHabit(data.habits.find((item) => item.status === "ACTIVE") ?? null);
      setProgress(data.progress);
      setAuthenticated(true);
    } catch {
      setAuthenticated(false);
    }
  }

  useEffect(() => {
    void loadHabits();
  }, []);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await request(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await loadHabits();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to continue.");
    } finally {
      setBusy(false);
    }
  }

  async function createHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await request("/api/habits", { method: "POST", body: JSON.stringify({ name, action }) });
      setName("");
      setAction("");
      await loadHabits();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create habit.");
    } finally {
      setBusy(false);
    }
  }

  async function checkIn(status: "complete" | "missed") {
    if (!habit) return;
    setBusy(true);
    setMessage("");
    try {
      await request(`/api/habits/${habit.id}/check-ins`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      await loadHabits();
      setMessage(
        status === "complete" ? "Small step recorded." : "Missed day recorded. You can recover.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to record check-in.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await request("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
    setHabit(null);
  }

  if (!authenticated) {
    return (
      <main className="shell">
        <section className="hero" aria-labelledby="page-title">
          <p className="eyebrow">SMALL</p>
          <h1 id="page-title">Change one thing. Let consistency do the rest.</h1>
          <p className="lede">Focus on one repeatable action until you are ready for the next.</p>
          <form className="card form" onSubmit={submitAuth}>
            <h2>{mode === "register" ? "Start small" : "Welcome back"}</h2>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button className="button" type="submit" disabled={busy}>
              {busy ? "One moment…" : mode === "register" ? "Create account" : "Log in"}
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() => setMode(mode === "register" ? "login" : "register")}
            >
              {mode === "register"
                ? "Already have an account? Log in"
                : "Need an account? Start small"}
            </button>
            {message && (
              <p className="message" role="alert">
                {message}
              </p>
            )}
          </form>
        </section>
      </main>
    );
  }

  if (!habit) {
    return (
      <main className="shell">
        <section className="hero" aria-labelledby="onboarding-title">
          <p className="eyebrow">YOUR FIRST SMALL CHANGE</p>
          <h1 id="onboarding-title">Make it smaller than you want to.</h1>
          <form className="card form" onSubmit={createHabit}>
            <label htmlFor="habit-name">Habit name</label>
            <input
              id="habit-name"
              placeholder="Read"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <label htmlFor="habit-action">The small action</label>
            <input
              id="habit-action"
              placeholder="Read one page"
              value={action}
              onChange={(event) => setAction(event.target.value)}
              required
            />
            <button className="button" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Begin this habit"}
            </button>
            {message && (
              <p className="message" role="alert">
                {message}
              </p>
            )}
          </form>
        </section>
      </main>
    );
  }

  const unlocked = progress.scheduledDays >= 14 && progress.completedDays >= 10;
  return (
    <main className="shell dashboard-shell">
      <header className="dashboard-header">
        <p className="eyebrow">SMALL</p>
        <button className="text-button" type="button" onClick={logout}>
          Log out
        </button>
      </header>
      <section className="dashboard" aria-labelledby="dashboard-title">
        <p className="eyebrow">YOUR ACTIVE HABIT</p>
        <h1 id="dashboard-title">{habit.name}</h1>
        <p className="lede">{habit.action}</p>
        <div className="card progress-card">
          <p className="card-label">CONSISTENCY</p>
          <strong>{progress.completedDays} completions</strong>
          <span>
            {progress.scheduledDays} scheduled days ·{" "}
            {unlocked
              ? "Next habit unlocked"
              : `${Math.max(0, 10 - progress.completedDays)} completions until unlock`}
          </span>
          {habit.inRecovery && (
            <p className="recovery" role="status">
              Recovery mode: three small steps in a row brings you back.
            </p>
          )}
        </div>
        <div className="actions">
          <button
            className="button"
            type="button"
            onClick={() => checkIn("complete")}
            disabled={busy}
          >
            I did it today
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => checkIn("missed")}
            disabled={busy}
          >
            Mark missed
          </button>
        </div>
        {unlocked && habits.filter((item) => item.status === "ACTIVE").length < 2 && (
          <form className="card form secondary-form" onSubmit={createHabit}>
            <h2>Your next small change</h2>
            <p className="form-help">You earned room for one more habit. Keep it small.</p>
            <label htmlFor="second-habit-name">Habit name</label>
            <input
              id="second-habit-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <label htmlFor="second-habit-action">The small action</label>
            <input
              id="second-habit-action"
              value={action}
              onChange={(event) => setAction(event.target.value)}
              required
            />
            <button className="button" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Add the next habit"}
            </button>
          </form>
        )}
        {habits.length > 1 && (
          <section className="history" aria-labelledby="history-title">
            <p className="eyebrow" id="history-title">
              YOUR HABITS
            </p>
            {habits.map((item) => (
              <div className="history-item" key={item.id}>
                <span>{item.name}</span>
                <small>{item.status.toLowerCase()}</small>
              </div>
            ))}
          </section>
        )}
        {message && (
          <p className="message" role="status">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
