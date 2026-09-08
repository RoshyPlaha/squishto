"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/stats", label: "Stats" },
  { href: "/blog", label: "Blog" },
];

function focusUrlInput() {
  const el = document.getElementById("url-input");
  if (el) el.focus();
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="relative z-10 px-4 pt-4 md:px-11 md:pt-11">
      <div className="mx-auto flex max-w-[1280px] items-center gap-4 rounded-full bg-surface py-3 pr-3 pl-5 md:gap-7 md:py-3 md:pr-3 md:pl-6">
        <Link
          href="/"
          className="font-display text-lg tracking-wide text-text uppercase no-underline md:text-xl"
        >
          squish.to
        </Link>
        <nav className="flex items-center gap-4 md:gap-7">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={
                  "text-sm font-medium no-underline md:text-[15px] " +
                  (href === "/" ? "hidden md:inline-block " : "") +
                  (active ? "text-text" : "text-text-dim")
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex-1" />
        {pathname === "/" ? (
          <button
            type="button"
            onClick={focusUrlInput}
            className="hidden rounded-full bg-lime px-6 py-3 text-[15px] font-semibold text-ink no-underline hover:bg-lime-hover md:inline-block"
          >
            Squish a link
          </button>
        ) : (
          <Link
            href="/"
            className="hidden rounded-full bg-lime px-6 py-3 text-[15px] font-semibold text-ink no-underline hover:bg-lime-hover md:inline-block"
          >
            Squish a link
          </Link>
        )}
      </div>
    </header>
  );
}
