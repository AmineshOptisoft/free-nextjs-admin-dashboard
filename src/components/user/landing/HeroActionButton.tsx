"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export type HeroButtonVariant = "primary" | "secondary" | "outline";

export default function HeroActionButton({
  href,
  variant,
  children,
}: {
  href: string;
  variant: HeroButtonVariant;
  children: ReactNode;
}) {
  const variantClasses: Record<
    HeroButtonVariant,
    {
      button: string;
      textRest: string;
      textHover: string;
      spreadClass: string;
    }
  > = {
    primary: {
      button: "bg-brand-500 text-white border border-brand-500",
      textRest: "#ffffff",
      textHover: "#111111",
      spreadClass: "bg-white",
    },
    secondary: {
      button: "bg-white text-black border border-white",
      textRest: "#111111",
      textHover: "#ffffff",
      spreadClass: "bg-brand-500",
    },
    outline: {
      button: "bg-transparent text-white border border-white/70",
      textRest: "#ffffff",
      textHover: "#111111",
      spreadClass: "bg-white",
    },
  };

  const cfg = variantClasses[variant];

  return (
    <motion.div initial="rest" whileHover="hover" animate="rest" className="inline-flex">
      <Link
        href={href}
        className={`relative isolate overflow-hidden rounded-md px-5 py-3 text-xs font-extrabold tracking-wide transition-colors ${cfg.button}`}
      >
        <motion.span
          variants={{
            rest: { color: cfg.textRest },
            hover: { color: cfg.textHover },
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative z-10"
        >
          {children}
        </motion.span>
        <motion.span
          aria-hidden="true"
          variants={{
            rest: { height: 0, opacity: 1 },
            hover: { height: 260, opacity: 1 },
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={`pointer-events-none absolute left-1/2 top-1/2 z-0 w-[150%] -translate-x-1/2 -translate-y-1/2 rotate-80 ${cfg.spreadClass}`}
        />
      </Link>
    </motion.div>
  );
}
