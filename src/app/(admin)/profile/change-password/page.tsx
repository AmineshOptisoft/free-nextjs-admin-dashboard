"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

export default function ChangePasswordPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update your password to keep your account secure.
        </p>
      </div>

      <ComponentCard title="Change Password">
        <form className="space-y-6">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input 
              id="currentPassword"
              type="password" 
              placeholder="Enter current password" 
            />
          </div>
          
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword"
                type="password" 
                placeholder="Enter new password" 
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword"
                type="password" 
                placeholder="Confirm new password" 
              />
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.
            </p>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600"
              >
                Update Password
              </button>
              <button
                type="button"
                className="px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
