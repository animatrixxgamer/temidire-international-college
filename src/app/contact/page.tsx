"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal, SplitHeading } from "@/components/motion/primitives";
import { school } from "@/content/siteContent";

export default function ContactPage() {
  const reduce = useReducedMotion();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "Admissions enquiry", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to send");
      setState("done");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <main className="pt-16">
      <section className="mx-auto max-w-4xl px-6 pb-12 pt-20 text-center">
        <Reveal>
          <p className="text-sm tracking-wide text-gold-500">Contact us</p>
          <SplitHeading text="Come and see us on an ordinary day" className="mt-3 font-serif text-3xl md:text-5xl" />
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 lg:grid-cols-2">
        {/* Info + map */}
        <Reveal>
          <div className="space-y-5">
            {[
              ["Address", school.address],
              ["Phone / WhatsApp", `${school.phone} · ${school.hours}`],
              ["Email", school.email],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-ivory-100/12 bg-navy-800/60 p-5">
                <p className="text-xs uppercase tracking-wider text-ivory-100/50">{k}</p>
                <p className="mt-1 font-semibold">{v}</p>
              </div>
            ))}
            <a
              href={`https://wa.me/${school.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-navy-950"
            >
              Chat on WhatsApp
            </a>
            {/* Map of Ondo */}
            <div className="relative overflow-hidden rounded-2xl border border-ivory-100/12">
              <iframe
                title="Map of Ondo Town"
                src="https://www.openstreetmap.org/export/embed.html?bbox=4.79%2C7.05%2C4.89%2C7.14&layer=mapnik&marker=7.0955%2C4.8436"
                className="h-64 w-full grayscale-[30%]"
                loading="lazy"
              />
              <motion.span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 -ml-2 -mt-2 h-4 w-4 rounded-full bg-gold-500"
                initial={reduce ? false : { y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.4 }}
              />
            </div>
            <p className="text-xs text-ivory-100/40">Map is centered on Ondo Town — we'll pin the exact campus address once confirmed.</p>
          </div>
        </Reveal>

        {/* Form */}
        <Reveal delay={0.1}>
          {state === "done" ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-gold-500/30 bg-navy-800/60 p-10 text-center">
              <motion.svg viewBox="0 0 100 100" className="h-20 w-20">
                <motion.circle
                  cx="50" cy="50" r="44" fill="none" stroke="#C9A24B" strokeWidth="4" strokeLinecap="round"
                  initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }}
                />
                <motion.path
                  d="M30 52 45 66 72 36" fill="none" stroke="#0E7C5B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.45 }}
                />
              </motion.svg>
              <h2 className="mt-6 font-serif text-2xl">Message sent</h2>
              <p className="mt-2 text-ivory-100/70">Thank you — we reply within two working days.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5 rounded-2xl border border-ivory-100/12 bg-navy-800/60 p-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">Your name *</label>
                <input
                  id="name" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5 focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium">Email</label>
                  <input
                    id="email" type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1.5 w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5 focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium">Phone</label>
                  <input
                    id="phone" type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1.5 w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5 focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium">Subject</label>
                <select
                  id="subject" value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5 focus:border-gold-500 focus:outline-none"
                >
                  {["Admissions enquiry", "Fees and payments", "School bus", "Something else"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium">Message *</label>
                <textarea
                  id="message" required rows={5} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5 focus:border-gold-500 focus:outline-none"
                />
              </div>
              {state === "error" && <p className="text-sm text-ember-500">{error}</p>}
              <button
                type="submit"
                disabled={state === "sending"}
                className="w-full rounded-full bg-gold-500 py-3 font-semibold text-navy-950 disabled:opacity-60"
              >
                {state === "sending" ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </Reveal>
      </section>
    </main>
  );
}
