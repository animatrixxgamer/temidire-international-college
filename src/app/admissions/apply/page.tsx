"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/components/motion/tokens";
import { PLACEHOLDER } from "@/content/siteContent";

type Form = {
  childName: string;
  dateOfBirth: string;
  gender: string;
  level: string;
  previousSchool: string;
  guardianName: string;
  relationship: string;
  phone: string;
  whatsappSame: boolean;
  whatsapp: string;
  email: string;
  address: string;
  notes: string;
  heardVia: string;
  consent: boolean;
};

const EMPTY: Form = {
  childName: "", dateOfBirth: "", gender: "", level: "", previousSchool: "",
  guardianName: "", relationship: "Mother", phone: "", whatsappSame: true, whatsapp: "",
  email: "", address: "", notes: "", heardVia: "", consent: false,
};

const LEVELS = ["CRECHE", "NURSERY", "PRIMARY", "SECONDARY"];
const RELATIONSHIPS = ["Mother", "Father", "Guardian", "Other"];
const HEARD = ["Friend or family", "Church/Mosque", "Online", "Passed by the school", "Radio", "Other"];

const STEPS = ["Child", "Guardian", "Notes", "Review"] as const;

function normalisePhone(raw: string): string {
  let p = raw.replace(/[^\d+]/g, "");
  if (p.startsWith("+234")) p = "0" + p.slice(4);
  if (p.startsWith("234") && p.length >= 11) p = "0" + p.slice(3);
  return p;
}

function validate(step: number, f: Form): Partial<Record<keyof Form, string>> {
  const e: Partial<Record<keyof Form, string>> = {};
  const phoneOk = (p: string) => /^0[7-9][01]\d{8}$/.test(normalisePhone(p));
  if (step === 0) {
    if (f.childName.trim().length < 3) e.childName = "Enter the child's full name";
    if (!f.dateOfBirth) e.dateOfBirth = "Enter the child's date of birth";
    if (!f.gender) e.gender = "Choose one";
    if (!f.level) e.level = "Choose the class you are applying for";
  }
  if (step === 1) {
    if (f.guardianName.trim().length < 3) e.guardianName = "Enter your full name";
    if (!phoneOk(f.phone)) e.phone = "Enter a phone number like 0803 123 4567";
    if (!f.whatsappSame && f.whatsapp && !phoneOk(f.whatsapp)) e.whatsapp = "Enter a number like 0803 123 4567, or tick “same as phone”";
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter an email like name@example.com — or leave it empty";
    if (f.address.trim().length < 5) e.address = "Enter your home address so we can plan visits and transport";
  }
  if (step === 3) {
    if (!f.consent) e.consent = "Please tick the box to consent";
  }
  return e;
}

export default function ApplyPage() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Form, boolean>>>({});
  const [resume, setResume] = useState(false);
  const [sending, setSending] = useState(false);
  const [netError, setNetError] = useState<string | null>(null);
  const [ref, setRef] = useState<string | null>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  // ——— autosave to localStorage on every change ———
  useEffect(() => {
    const saved = localStorage.getItem("tmd-apply");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Form;
        if (parsed && parsed.childName) {
          setF(parsed);
          setResume(true);
        }
      } catch { /* ignore */ }
    }
  }, []);
  useEffect(() => {
    if (ref) return;
    localStorage.setItem("tmd-apply", JSON.stringify(f));
  }, [f, ref]);

  const clearSaved = useCallback(() => {
    localStorage.removeItem("tmd-apply");
    setF(EMPTY);
    setStep(0);
    setResume(false);
    setTouched({});
    setErrors({});
  }, []);

  const errs = useMemo(() => validate(step, f), [step, f]);

  const next = () => {
    setTouched((t) => ({ ...t, ...Object.fromEntries(Object.keys(errs).map((k) => [k, true])) }));
    if (Object.keys(errs).length === 0) setStep((s) => Math.min(s + 1, 3));
  };

  const submit = async () => {
    const e3 = validate(3, f);
    setTouched((t) => ({ ...t, consent: true }));
    if (Object.keys(e3).length) return setErrors(e3);
    setSending(true);
    setNetError(null);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, phone: normalisePhone(f.phone), whatsapp: f.whatsappSame ? normalisePhone(f.phone) : normalisePhone(f.whatsapp) }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      const data = await res.json();
      setRef(data.reference);
      localStorage.removeItem("tmd-apply");
    } catch {
      setNetError("We couldn't send your application — check your connection and try again. Your answers are safe on this device.");
    } finally {
      setSending(false);
    }
  };

  // ——— Success moment ———
  if (ref) {
    return (
      <main className="grid min-h-screen place-items-center bg-navy-950 px-6 pt-16">
        <div className="w-full max-w-md text-center">
          <motion.div
            initial={reduce ? false : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="relative mx-auto grid h-24 w-24 place-items-center"
          >
            <motion.svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
              <motion.circle
                cx="50" cy="50" r="44" fill="none" stroke="#C9A24B" strokeWidth="4" strokeLinecap="round"
                initial={{ pathLength: reduce ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </motion.svg>
            <motion.svg viewBox="0 0 40 40" className="h-10 w-10">
              <motion.path
                d="M8 21 17 30 33 10" fill="none" stroke="#0E7C5B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: reduce ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: reduce ? 0 : 0.45, ease: "easeOut" }}
              />
            </motion.svg>
          </motion.div>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : 0.5, duration: 0.5 }}
            className="mt-8 font-serif text-3xl"
          >
            Application received
          </motion.h1>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : 0.65, duration: 0.5 }}
          >
            <p className="mt-4 text-ivory-100/70">We'll call or WhatsApp you within two working days.</p>
            <div className="mt-6 rounded-xl border border-gold-500/40 bg-navy-800 p-4">
              <p className="text-xs uppercase tracking-wider text-ivory-100/50">Your reference</p>
              <p className="mt-1 font-serif text-2xl text-gold-500">{ref}</p>
              <button
                onClick={() => navigator.clipboard?.writeText(ref)}
                className="mt-2 rounded-full border border-gold-500/50 px-4 py-1 text-sm text-gold-500 hover:bg-gold-500/10"
              >
                Copy reference
              </button>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/"
                className="rounded-full bg-gold-500 px-6 py-3 font-semibold text-navy-950"
              >
                Back to home
              </Link>
            </div>
            {PLACEHOLDER && (
              <p className="mt-6 text-xs text-ivory-100/40">
                Demo build: applications are saved to the school database and visible in the admin dashboard.
              </p>
            )}
          </motion.div>
        </div>
      </main>
    );
  }

  const field = (key: keyof Form, label: string, opts?: { type?: string; required?: boolean; hint?: string; children?: React.ReactNode }) => (
    <div>
      <label htmlFor={key} className="block text-sm font-medium">
        {label} {opts?.required !== false && <span className="text-gold-500">*</span>}
      </label>
      {opts?.children ?? (
        <input
          id={key}
          type={opts?.type ?? "text"}
          value={String(f[key] ?? "")}
          onChange={(e) => set(key, e.target.value as never)}
          onBlur={() => setTouched((t) => ({ ...t, [key]: true }))}
          aria-invalid={!!(touched[key] && errors[key])}
          className={`mt-1.5 w-full rounded-md border bg-navy-800 px-3 py-2.5 text-ivory-100 outline-none transition focus:border-gold-500 ${
            touched[key] && errors[key] ? "border-ember-500" : "border-ivory-100/20"
          }`}
        />
      )}
      {touched[key] && errors[key] ? (
        <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm text-ember-500">
          {errors[key]}
        </motion.p>
      ) : (
        opts?.hint && <p className="mt-1 text-sm text-ivory-100/50">{opts.hint}</p>
      )}
    </div>
  );

  return (
    <main className="mx-auto max-w-xl px-6 pb-32 pt-28 md:pb-24">
      <h1 className="font-serif text-3xl md:text-4xl">Apply to Temidire</h1>
      <p className="mt-2 text-ivory-100/70">About five minutes. Your answers save automatically on this device.</p>

      {resume && step === 0 && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-gold-500/40 bg-navy-800 p-4 text-sm">
          <span>Welcome back — continue where you stopped?</span>
          <button onClick={() => setResume(false)} className="font-semibold text-gold-500">
            Continue
          </button>
        </div>
      )}

      {/* Progress: gold ribbon fills */}
      <div className="relative mt-8 h-1 rounded-full bg-ivory-100/15">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gold-500"
          initial={false}
          animate={{ width: `${((step + (ref ? 1 : 0)) / STEPS.length) * 100}%` }}
          transition={{ duration: reduce ? 0 : 0.4, ease: EASE_OUT }}
        />
      </div>
      <ol className="mt-2 flex justify-between text-xs text-ivory-100/50">
        {STEPS.map((s, i) => (
          <li key={s} className={i <= step ? "text-gold-500" : ""}>
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: reduce ? 0 : 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reduce ? 0 : -24 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="mt-10 space-y-6"
        >
          {step === 0 && (
            <>
              {field("childName", "Child's full name", { required: true })}
              {field("dateOfBirth", "Date of birth", { type: "date" })}
              <div>
                <span className="block text-sm font-medium">Gender <span className="text-gold-500">*</span></span>
                <div className="mt-2 flex gap-2">
                  {["Female", "Male"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => { set("gender", g); setTouched((t) => ({ ...t, gender: true })); }}
                      className={`rounded-full border px-5 py-2 text-sm ${f.gender === g ? "border-gold-500 bg-gold-500/10 text-gold-500" : "border-ivory-100/20 text-ivory-100/70"}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {touched.gender && errors.gender && <p className="mt-1 text-sm text-ember-500">{errors.gender}</p>}
              </div>
              <div>
                <label htmlFor="level" className="block text-sm font-medium">Class applying for <span className="text-gold-500">*</span></label>
                <select
                  id="level"
                  value={f.level}
                  onChange={(e) => set("level", e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-ivory-100/20 bg-navy-800 px-3 py-2.5"
                >
                  <option value="">Choose…</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>)}
                </select>
                {touched.level && errors.level && <p className="mt-1 text-sm text-ember-500">{errors.level}</p>}
              </div>
              {field("previousSchool", "Previous school (optional)", { required: false })}
            </>
          )}

          {step === 1 && (
            <>
              {field("guardianName", "Your full name")}
              <div>
                <label htmlFor="relationship" className="block text-sm font-medium">Relationship to the child</label>
                <select id="relationship" value={f.relationship} onChange={(e) => set("relationship", e.target.value)} className="mt-1.5 w-full rounded-md border border-ivory-100/20 bg-navy-800 px-3 py-2.5">
                  {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              {field("phone", "Phone number", { type: "tel", hint: "We call or WhatsApp within two working days." })}
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={f.whatsappSame}
                  onChange={(e) => set("whatsappSame", e.target.checked)}
                  className="h-4 w-4 accent-[#C9A24B]"
                />
                WhatsApp is the same number
              </label>
              {!f.whatsappSame && field("whatsapp", "WhatsApp number", { type: "tel", required: false })}
              {field("email", "Email (optional)", { type: "email", required: false })}
              {field("address", "Home address")}
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium">
                  Anything we should know? <span className="text-ivory-100/40">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={f.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Medical needs, learning support, talents…"
                  className="mt-1.5 w-full rounded-md border border-ivory-100/20 bg-navy-800 px-3 py-2.5"
                />
              </div>
              <div>
                <label htmlFor="heardVia" className="block text-sm font-medium">How did you hear about us?</label>
                <select id="heardVia" value={f.heardVia} onChange={(e) => set("heardVia", e.target.value)} className="mt-1.5 w-full rounded-md border border-ivory-100/20 bg-navy-800 px-3 py-2.5">
                  <option value="">Choose…</option>
                  {HEARD.map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-4 rounded-2xl border border-ivory-100/15 bg-navy-800/60 p-6 text-sm">
                {[
                  ["Child", `${f.childName} · ${f.gender || "—"} · ${f.dateOfBirth || "—"}`],
                  ["Class", f.level],
                  ["Previous school", f.previousSchool || "—"],
                  ["Guardian", `${f.guardianName} (${f.relationship})`],
                  ["Phone", f.phone],
                  ["WhatsApp", f.whatsappSame ? "Same as phone" : f.whatsapp],
                  ["Email", f.email || "—"],
                  ["Address", f.address],
                  ["Notes", f.notes || "—"],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between gap-4 border-b border-ivory-100/10 pb-2 last:border-0">
                    <span className="shrink-0 text-ivory-100/50">{k}</span>
                    <span className="text-right">{v as string}</span>
                  </div>
                ))}
              </div>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={f.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#C9A24B]"
                />
                <span>
                  I confirm these details are correct and consent to Temidire International College contacting me
                  about this application.
                </span>
              </label>
              {touched.consent && errors.consent && <p className="text-sm text-ember-500">{errors.consent}</p>}
              <button onClick={clearSaved} className="text-sm text-ivory-100/50 underline hover:text-ivory-100">
                Start over with a blank form
              </button>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {netError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 rounded-xl border border-ember-500 bg-ember-500/10 p-4 text-sm">
          {netError}
        </motion.div>
      )}

      {/* Sticky bottom action bar (mobile-anchored) */}
      <div className="fixed inset-x-0 bottom-0 z-[8600] border-t border-ivory-100/10 bg-navy-950/95 p-4 backdrop-blur md:static md:mt-10 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="mx-auto flex max-w-xl justify-between gap-4">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-full border border-ivory-100/30 px-6 py-3 disabled:opacity-30"
          >
            Back
          </button>
          {step < 3 ? (
            <button onClick={next} className="rounded-full bg-gold-500 px-8 py-3 font-semibold text-navy-950">
              Next
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={sending}
              className="rounded-full bg-gold-500 px-8 py-3 font-semibold text-navy-950 disabled:opacity-60"
            >
              {sending ? "Sending…" : "Submit application"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
