import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/guard";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-svh">
      <aside className="flex w-52 shrink-0 flex-col border-r border-line p-5">
        <p className="sys-tag mb-8">Perimeter console</p>
        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/admin" className="rounded-md px-3 py-2 text-fog transition-colors hover:bg-elevated hover:text-snow">
            Projects
          </Link>
          <Link href="/admin/media" className="rounded-md px-3 py-2 text-fog transition-colors hover:bg-elevated hover:text-snow">
            Media
          </Link>
          <a href="/" target="_blank" className="rounded-md px-3 py-2 text-fog transition-colors hover:bg-elevated hover:text-snow">
            View site ↗
          </a>
        </nav>
        <div className="mt-auto">
          <p className="mb-2 truncate text-xs text-dim">{session.user.email}</p>
          <SignOutButton />
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
