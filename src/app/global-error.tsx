"use client";

import { useEffect } from "react";

/** Last-resort boundary: only used when the root layout itself fails. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[temidire] root error", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#06122A", color: "#F5EFE0" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            padding: "24px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ maxWidth: 420 }}>
            <p style={{ color: "#C9A24B", fontSize: 14 }}>Temidire International College</p>
            <h1 style={{ fontSize: 32, margin: "12px 0" }}>The site could not start.</h1>
            <p style={{ color: "#F5EFE0B3", lineHeight: 1.6 }}>
              Please try again in a moment. If it persists, contact the school office
              on +234 803 555 0142.
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: 24,
                borderRadius: 999,
                border: "none",
                background: "#C9A24B",
                color: "#06122A",
                fontWeight: 600,
                padding: "12px 24px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
