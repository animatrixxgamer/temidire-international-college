"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
      className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-ember-500 hover:bg-ember-500/10"
    >
      Sign out
    </button>
  );
}
