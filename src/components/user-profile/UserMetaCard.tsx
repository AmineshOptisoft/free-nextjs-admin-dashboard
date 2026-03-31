"use client";
import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();

  const [admin, setAdmin] = useState<{
    id?: number;
    name?: string;
    email?: string;
    username?: string;
    createdAt?: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formUsername, setFormUsername] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && !data.error) {
          setAdmin(data);
          setFormName(data.name || "");
          setFormEmail(data.email || "");
          setFormUsername(data.username || "");
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/admin/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, email: formEmail, username: formUsername }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdmin(data);
        setSaveMsg("✅ Profile updated!");
        setTimeout(() => { setSaveMsg(""); closeModal(); }, 1500);
      } else {
        setSaveMsg("❌ " + (data.error || "Failed to update"));
      }
    } catch {
      setSaveMsg("❌ An error occurred");
    } finally {
      setSaving(false);
    }
  };

  // Generate initials for avatar
  const initials = admin?.name
    ? admin.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">

            {/* Avatar with initials */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-2xl font-extrabold shadow-lg shadow-brand-500/30">
              {initials}
            </div>

            <div className="order-3 xl:order-2">
              <h4 className="mb-1 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {admin?.name ?? "—"}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {admin?.email ?? "—"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block" />
                <span className="inline-block text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/20 dark:text-brand-400 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Admin
                </span>
              </div>
              {admin?.username && (
                <p className="mt-1 text-xs text-gray-400 text-center xl:text-left">@{admin.username}</p>
              )}
            </div>

            {/* Member since badge */}
            <div className="flex items-center order-2 grow xl:order-3 xl:justify-end">
              <div className="text-right">
                <p className="text-xs text-gray-400">Member since</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {admin?.createdAt
                    ? new Date(admin.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill="" />
            </svg>
            Edit
          </button>
        </div>
      </div>

      {/* ── Edit Modal ───────────────────────────────────────────── */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] m-4">
        <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-10">
          <div className="mb-6">
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Edit Profile</h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update your admin account information.</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div>
              <Label>Full Name</Label>
              <Input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label>Username</Label>
              <Input
                type="text"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>

            {saveMsg && (
              <p className={`text-sm font-medium ${saveMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
                {saveMsg}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2 justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} type="button">
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
