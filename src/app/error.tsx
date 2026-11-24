"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary. Logs the failure so it shows up in the hosting
 * provider's error stream, then offers a way back into the site.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[temidire] page error", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-navy-950 px-6 text-center text-ivory-100">
      <div className="max-w-md">
        <p className="text-sm tracking-wide text-gold-500">Something went wrong</p>
        <h1 className="mt-3 font-serif text-4xl">This page tripped over.</h1>
        <p className="mt-4 text-ivory-100/70">
          The school office has the details. Try again — if it keeps happening,
          call us and we&apos;ll sort it out.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-ivory-100/40">Reference: {error.digest}</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-gold-500 px-6 py-3 font-semibold text-navy-950 transition hover:brightness-110"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-ivory-100/25 px-6 py-3 font-semibold text-ivory-100 transition hover:border-gold-500"
          >
            Back to the homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
