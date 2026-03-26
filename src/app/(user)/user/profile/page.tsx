import React from "react";
import AddressCard from "@/components/user/profile/AddressCard";
import { userProfile } from "@/data/user/profile";
import Link from "next/link";

export default function UserProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">My Profile</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account details and saved addresses.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/user/forgot-password"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
          >
            Forgot Password
          </Link>
          <Link
            href="/user/change-password"
            className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Change Password
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Personal Information
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{userProfile.fullName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{userProfile.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{userProfile.phone}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Saved Addresses
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {userProfile.addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      </div>
    </div>
  );
}
