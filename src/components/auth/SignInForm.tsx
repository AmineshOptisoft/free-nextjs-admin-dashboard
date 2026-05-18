"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import RedirectIfAuthenticated from "./RedirectIfAuthenticated";

export type SignInRole = "admin" | "agent" | "company";

const roleConfig = {
  admin: {
    api: "/api/auth/login/admin",
    title: "Admin sign in",
    subtitle: "Enter your admin email and password.",
    loginLabel: "Email",
    loginPlaceholder: "admin@example.com",
    loginType: "email" as const,
    loginAutocomplete: "email",
  },
  agent: {
    api: "/api/auth/login/agent",
    title: "Agent sign in",
    subtitle: "Enter your agent username and password.",
    loginLabel: "Username",
    loginPlaceholder: "Username",
    loginType: "text" as const,
    loginAutocomplete: "username",
  },
  company: {
    api: "/api/auth/login/company",
    title: "Company sign in",
    subtitle: "Enter your company username and password.",
    loginLabel: "Username",
    loginPlaceholder: "Username",
    loginType: "text" as const,
    loginAutocomplete: "username",
  },
} as const;

const successPath: Record<SignInRole, string> = {
  admin: "/",
  agent: "/agent-dashboard",
  company: "/company-dashboard",
};

type Props = { role: SignInRole; backHref?: string };

export default function SignInForm({ role, backHref = "/signin" }: Props) {
  const router = useRouter();
  const cfg = roleConfig[role];
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const login = String(fd.get("login") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!login || !password) {
      setError(role === "admin" ? "Email and password are required." : "Username and password are required.");
      return;
    }
    setLoading(true);
    try {
      const body =
        role === "admin"
          ? JSON.stringify({ email: login.toLowerCase(), password })
          : JSON.stringify({ username: login, password });
      const res = await fetch(cfg.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Sign in failed.");
        return;
      }
      localStorage.setItem("auth_role", role);
      window.location.href = successPath[role];
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <RedirectIfAuthenticated />
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href={backHref}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {cfg.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{cfg.subtitle}</p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {error && (
                  <p className="text-sm text-error-500 dark:text-error-400" role="alert">
                    {error}
                  </p>
                )}
                <div>
                  <Label>
                    {cfg.loginLabel} <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    name="login"
                    type={cfg.loginType}
                    placeholder={cfg.loginPlaceholder}
                    autoComplete={cfg.loginAutocomplete || "off"}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading ? "Signing in…" : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Wrong portal?{" "}
                <Link href="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                  Choose role
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
