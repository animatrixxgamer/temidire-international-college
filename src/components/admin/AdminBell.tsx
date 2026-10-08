"use client";
import { useRouter } from "next/navigation";
import {
  NotificationBell,
  type BellNotification,
} from "@/components/admin/NotificationBell";

/** Admin-shell wrapper: opens the bell dropdown and jumps to the inbox. */
export default function AdminBell({
  unread,
  items,
}: {
  unread: number;
  items: BellNotification[];
}) {
  const router = useRouter();
  return (
    <NotificationBell
      unreadCount={unread}
      items={items}
      onItemSelect={() => router.push("/admin/inbox")}
      className="shrink-0"
    />
  );
}
