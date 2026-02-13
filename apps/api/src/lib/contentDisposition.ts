/**
 * B2/S3-safe Content-Disposition values.
 * B2 rejects filenames with parentheses, spaces, etc. in presigned URLs;
 * use token-safe characters only for the filename parameter.
 */

function tokenSafeFilename(filename: string): string {
  const sanitized = filename
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/["\\]/g, "_")
    .replace(/[()[\]\s,;:=?@{}|<>]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 180);
  return sanitized || "download";
}

/**
 * Build a Content-Disposition header value.
 * @param presignedSafe - Use true for B2 presigned URLs (omits filename* to avoid invalid token errors).
 */
export function buildContentDisposition(
  disposition: "inline" | "attachment",
  filename: string,
  presignedSafe = false,
): string {
  const fallback = tokenSafeFilename(filename);
  if (presignedSafe) {
    return `${disposition}; filename="${fallback}"`;
  }
  const encoded = encodeURIComponent(filename);
  return `${disposition}; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}
