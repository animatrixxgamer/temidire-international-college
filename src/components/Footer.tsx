"use client";
import { useState } from "react";
import Crest from "@/components/motion/Crest";
import { TransitionLink } from "@/components/motion/PageTransition";
import { school } from "@/content/siteContent";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
      if (res.ok) setEmail("");
    } catch {
      setState("error");
    }
  };

  return (
    <footer className="border-t border-ivory-100/10 bg-navy-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Crest className="h-14 w-11" motto="" />
            <div>
              <p className="font-serif text-lg font-semibold">Temidire</p>
              <p className="text-xs text-ivory-100/60">International College</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-ivory-100/60">{school.address}</p>
          <p className="mt-2 text-sm text-ivory-100/60">{school.phone}</p>
          <p className="text-sm text-ivory-100/60">{school.email}</p>
        </div>

        <nav aria-label="School">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ivory-100/50">School</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ["/schools", "Our schools"],
              ["/academics", "Academics"],
              ["/admissions", "Admissions"],
              ["/transport", "School bus"],
              ["/about", "About us"],
            ].map(([href, label]) => (
              <li key={href}>
                <TransitionLink href={href} className="text-ivory-100/70 hover:text-gold-500">
                  {label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Community">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ivory-100/50">Community</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ["/news", "News & events"],
              ["/gallery", "Gallery"],
              ["/student-life", "Student life"],
              ["/alumni", "Alumni"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <li key={href}>
                <TransitionLink href={href} className="text-ivory-100/70 hover:text-gold-500">
                  {label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ivory-100/50">Term news by email</h3>
          <p className="mt-4 text-sm text-ivory-100/60">One short email at the start of each term. No spam.</p>
          <form onSubmit={subscribe} className="mt-4">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <div className="flex gap-2">
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-ivory-100/20 bg-navy-800 px-3 py-2 text-sm placeholder:text-ivory-100/40"
              />
              <button
                type="submit"
                disabled={state === "sending"}
                className="rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 disabled:opacity-50"
              >
                {state === "sending" ? "…" : "Join"}
              </button>
            </div>
            {state === "done" && <p className="mt-2 text-sm text-emerald-600">You're on the list. Thank you.</p>}
            {state === "error" && <p className="mt-2 text-sm text-ember-500">Something went wrong. Try again.</p>}
          </form>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-ivory-100/50">
            <span className="rounded-full border border-ivory-100/20 px-3 py-1">Ondo State MoE approved</span>
            <span className="rounded-full border border-ivory-100/20 px-3 py-1">WAEC centre</span>
            <span className="rounded-full border border-ivory-100/20 px-3 py-1">NECO centre</span>
          </div>
        </div>
      </div>
      <div className="border-t border-ivory-100/10 py-6 text-center text-xs text-ivory-100/40">
        © {new Date().getFullYear()} {school.name}, {school.address}. All rights reserved.
      </div>
    </footer>
  );
}
