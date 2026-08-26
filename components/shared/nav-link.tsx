"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLinkStatus } from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type MatchMode = "exact" | "prefix" | ((pathname: string) => boolean);

function pathMatches(pathname: string, href: string, match: MatchMode) {
  if (typeof match === "function") return match(pathname);
  if (match === "exact" || href === "/") return pathname === href;
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type State = { active: boolean; pending: boolean };

/**
 * Prefetching nav link that highlights immediately on tap (pending)
 * so tab switches feel instant while the next page streams in.
 */
export function NavLink({
  href,
  match = "prefix",
  className,
  linkClassName,
  children,
  ...rest
}: {
  href: string;
  match?: MatchMode;
  className?: string | ((state: State) => string);
  linkClassName?: string;
  children: ReactNode | ((state: State) => ReactNode);
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const pathname = usePathname();
  const active = pathMatches(pathname, href, match);

  return (
    <Link href={href} prefetch className={linkClassName} {...rest}>
      <NavLinkBody active={active} className={className}>
        {children}
      </NavLinkBody>
    </Link>
  );
}

function NavLinkBody({
  active,
  className,
  children,
}: {
  active: boolean;
  className?: string | ((state: State) => string);
  children: ReactNode | ((state: State) => ReactNode);
}) {
  const { pending } = useLinkStatus();
  const state: State = { active: active || pending, pending };
  return (
    <span
      className={
        typeof className === "function" ? className(state) : cn(className)
      }
    >
      {typeof children === "function" ? children(state) : children}
    </span>
  );
}
