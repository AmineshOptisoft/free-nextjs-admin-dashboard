/**
 * Shrinks large camera photos before storing as data URLs (reduces MySQL packet size).
 * Browser-only — call from client components / handlers.
 */
export function compressImageDataUrlIfLarge(
  dataUrl: string,
  opts?: { maxSide?: number; quality?: number; maxChars?: number },
): Promise<string> {
  const maxSide = opts?.maxSide ?? 1600;
  const quality = opts?.quality ?? 0.82;
  const maxChars = opts?.maxChars ?? 1_100_000;

  return new Promise((resolve) => {
    if (typeof window === "undefined" || !dataUrl.startsWith("data:image/")) {
      resolve(dataUrl);
      return;
    }
    if (dataUrl.includes("application/pdf")) {
      resolve(dataUrl);
      return;
    }
    if (dataUrl.length <= maxChars) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      try {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (!w || !h) {
          resolve(dataUrl);
          return;
        }
        const scale = Math.min(1, maxSide / Math.max(w, h));
        w = Math.max(1, Math.round(w * scale));
        h = Math.max(1, Math.round(h * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const jpeg = canvas.toDataURL("image/jpeg", quality);
        resolve(jpeg.length < dataUrl.length ? jpeg : dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
