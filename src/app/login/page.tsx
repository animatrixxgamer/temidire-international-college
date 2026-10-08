"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import Crest from "@/components/motion/Crest";

function LoginForm() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [state, setState] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setState("idle");
    }
  };

  return (
    <motion.main
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`grid min-h-screen place-items-center px-6 pt-16 ${error ? "motion-safe:animate-wiggle" : ""}`}
    >
      <div className="w-full max-w-sm rounded-3xl border border-ivory-100/10 bg-navy-800/60 p-8 backdrop-blur">
        <Crest className="mx-auto h-20 w-16" motto="" />
        <h1 className="mt-4 text-center font-serif text-2xl">Portal login</h1>
        <p className="mt-1 text-center text-sm text-ivory-100/60">Staff, students and parents</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email" type="email" required autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <div className="relative">
              <input
                id="password" type={show ? "text" : "password"} required autoComplete="current-password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5 pr-16 focus:border-gold-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-ivory-100/50 hover:text-gold-500"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {error && (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-ember-500">
              {error}
            </motion.p>
          )}
          <button
            type="submit"
            disabled={state === "sending"}
            className="w-full rounded-full bg-gold-500 py-3 font-semibold text-navy-950 disabled:opacity-60"
          >
            {state === "sending" ? "Checking…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-ivory-100/40">
          Students, parents and staff all sign in here — we take you to the right place.
        </p>
      </div>
    </motion.main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
