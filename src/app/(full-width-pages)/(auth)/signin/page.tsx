import Link from "next/link";
import { Metadata } from "next";
import RedirectIfAuthenticated from "@/components/auth/RedirectIfAuthenticated";

export const metadata: Metadata = {
  title: "Sign in | Tepay",
  description: "Choose admin, agent, or company sign in",
};

export default function SignInHubPage() {
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <RedirectIfAuthenticated />
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Sign in
        </h1>
        <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">Pick your portal — each uses a separate login.</p>
        <ul className="flex flex-col gap-3">
          <li>
            <Link
              href="/signin/admin"
              className="block rounded-lg border border-gray-200 bg-white px-4 py-4 text-sm font-medium text-gray-800 transition hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-brand-600 dark:hover:bg-white/[0.03]"
            >
              Admin
            </Link>
          </li>
          <li>
            <Link
              href="/signin/agent"
              className="block rounded-lg border border-gray-200 bg-white px-4 py-4 text-sm font-medium text-gray-800 transition hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-brand-600 dark:hover:bg-white/[0.03]"
            >
              Agent
            </Link>
          </li>
          <li>
            <Link
              href="/signin/company"
              className="block rounded-lg border border-gray-200 bg-white px-4 py-4 text-sm font-medium text-gray-800 transition hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-brand-600 dark:hover:bg-white/[0.03]"
            >
              Company
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
