"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  matchPrefix?: boolean;
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

export function AppShell({
  brand,
  subBrand,
  groups,
  user,
  theme = "ink",
  children,
}: {
  brand: string;
  subBrand?: string;
  groups: NavGroup[];
  user: React.ReactNode;
  theme?: "ink" | "slate";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const activeCheck = (item: NavItem) => {
    if (item.matchPrefix) return pathname.startsWith(item.href);
    return pathname === item.href;
  };

  const sidebarBg =
    theme === "ink"
      ? "bg-slate-950 text-slate-200"
      : "bg-slate-900 text-slate-200";

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="flex">
        {/* Mobile top bar */}
        <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            {brand}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="메뉴"
            className="rounded-md border border-border p-2"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform md:static md:translate-x-0",
            sidebarBg,
            open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 px-5 py-5">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
                  {subBrand ?? "Cellings"}
                </div>
                <div className="mt-1 text-lg font-semibold">{brand}</div>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {groups.map((group, gi) => (
                <div key={gi} className="mb-4">
                  {group.label ? (
                    <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {group.label}
                    </div>
                  ) : null}
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = activeCheck(item);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              active
                                ? "bg-white/10 text-white"
                                : "text-slate-300 hover:bg-white/5 hover:text-white",
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-5 w-5 items-center justify-center text-slate-400 group-hover:text-white",
                                active && "text-white",
                              )}
                            >
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="border-t border-white/10 px-4 py-4 text-sm">{user}</div>
          </div>
        </aside>

        {open ? (
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="사이드바 닫기"
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
          />
        ) : null}

        <main className="flex-1 md:ml-0">
          <div className="min-h-screen px-4 pb-16 pt-16 md:px-8 md:pt-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
