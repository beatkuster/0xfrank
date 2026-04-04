"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="200" rx="44" fill="#0d0d14" />
              <polygon
                points="100,28 148,56 148,112 100,140 52,112 52,56"
                fill="none"
                stroke="#c8f135"
                strokeWidth="3"
              />
              <polygon
                points="100,46 134,66 134,106 100,126 66,106 66,66"
                fill="none"
                stroke="#c8f135"
                strokeWidth="1"
                opacity="0.35"
              />
              <polygon points="100,64 122,77 122,103 100,116 78,103 78,77" fill="#c8f135" />
              <rect x="91" y="78" width="18" height="3.5" fill="#0d0d14" />
              <rect x="91" y="85" width="12" height="3.5" fill="#0d0d14" />
              <rect x="91" y="92" width="3.5" height="14" fill="#0d0d14" />
              <circle cx="100" cy="28" r="4" fill="#c8f135" />
              <circle cx="148" cy="56" r="4" fill="#c8f135" />
              <circle cx="148" cy="112" r="4" fill="#c8f135" />
              <circle cx="100" cy="140" r="4" fill="#c8f135" />
              <circle cx="52" cy="112" r="4" fill="#c8f135" />
              <circle cx="52" cy="56" r="4" fill="#c8f135" />
            </svg>
            <span className="font-mono font-bold text-lg">
              <span style={{ color: "#666680" }}>0x</span>
              <span style={{ color: "#c8f135" }}>Frank</span>
            </span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4">
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
};
