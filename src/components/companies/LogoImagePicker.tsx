"use client";
import React, { useRef } from "react";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

type Props = {
  /** Shown inside the picker (server URL, `/uploads/...`, or `blob:` preview). */
  previewSrc: string | null;
  /** Called when user selects a valid file (parent may upload or store for later). */
  onFile: (file: File) => void;
  disabled?: boolean;
  uploading?: boolean;
  /** Smaller tile for modals */
  compact?: boolean;
};

export default function LogoImagePicker({ previewSrc, onFile, disabled, uploading, compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const size = compact ? "h-24 w-24" : "h-28 w-28 max-w-full";

  return (
    <div className="flex flex-col items-stretch gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onFile(file);
        }}
      />
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className={`group relative flex ${size} cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-brand-400 hover:bg-brand-50/50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800/60 dark:hover:border-brand-500 dark:hover:bg-brand-900/20`}
      >
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob: and user uploads
          <img src={previewSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 px-2 text-center">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Choose image</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white">
            Uploading…
          </div>
        )}
      </button>
      <p className="text-[10px] text-gray-400 dark:text-gray-500">JPG, PNG, WebP, GIF · max 2 MB</p>
    </div>
  );
}
