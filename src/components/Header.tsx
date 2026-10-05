"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TransitionLink } from "@/components/motion/PageTransition";
import Crest from "@/components/motion/Crest";
import { school } from "@/content/siteContent";
import { EASE_OUT } from "@/components/motion/tokens";

const LINKS = [
  { href: "/schools", label: "Schools" },
  { href: "/admissions", label: "Admissions" },
  { href: "/academics", label: "Academics" },
  { href: "/news", label: "News" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const pathname = usePathname();
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const active = LINKS.find((l) => pathname.startsWith(l.href))?.label ?? null;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[8000] transition-colors duration-500 ${
          scrolled ? "bg-navy-950/90 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <TransitionLink href="/" className="flex items-center gap-2" aria-label="Temidire International College home">
            <Crest className="h-10 w-8" motto="" />
            <span className="font-serif text-lg font-semibold tracking-tight">Temidire</span>
            <span className="hidden text-xs text-ivory-100/60 sm:inline">International College</span>
          </TransitionLink>

          <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
            {LINKS.map((l) => (
              <TransitionLink
                key={l.href}
                href={l.href}
                className="relative py-2 text-sm text-ivory-100/85 hover:text-ivory-100"
                onMouseEnter={() => setHover(l.label)}
                onMouseLeave={() => setHover(null)}
              >
                {l.label}
                {(hover === l.label || (hover === null && active === l.label)) && (
                  <motion.span
                    layoutId="nav-ribbon"
                    className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full bg-gold-500"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </TransitionLink>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <TransitionLink href="/login" className="text-sm text-ivory-100/70 hover:text-ivory-100">
              Login
            </TransitionLink>
            <TransitionLink
              href="/admissions/apply"
              className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950 transition hover:brightness-110"
            >
              Apply now
            </TransitionLink>
          </div>

          <button
            className="grid h-11 w-11 place-items-center rounded-full border border-ivory-100/20 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span aria-hidden className="relative block h-3 w-5">
              <span className={`absolute left-0 top-0 h-0.5 w-5 bg-ivory-100 transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-1.5 h-0.5 w-5 bg-ivory-100 transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-3 h-0.5 w-5 bg-ivory-100 transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Mobile"
            className="fixed inset-0 z-[7500] flex flex-col justify-center bg-navy-950 px-8 lg:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ul className="space-y-2">
              {[...LINKS, { href: "/login", label: "Portal login" }].map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.4, ease: EASE_OUT }}
                >
                  <TransitionLink
                    href={l.href}
                    className="block py-2 font-serif text-3xl text-ivory-100"
                  >
                    {l.label}
                  </TransitionLink>
                </motion.li>
              ))}
            </ul>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4, ease: EASE_OUT }}
              className="mt-10"
            >
              <TransitionLink
                href="/admissions/apply"
                className="block rounded-full bg-gold-500 px-6 py-4 text-center font-semibold text-navy-950"
              >
                Apply now
              </TransitionLink>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
