const JPEG = Buffer.from([0xff, 0xd8, 0xff]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const GIF87 = Buffer.from("GIF87a");
const GIF89 = Buffer.from("GIF89a");
const RIFF = Buffer.from("RIFF");
const WEBP = Buffer.from("WEBP");

function startsWith(buffer: Buffer, signature: Buffer, offset = 0): boolean {
  if (buffer.length < offset + signature.length) {
    return false;
  }
  return signature.compare(buffer, offset, offset + signature.length) === 0;
}

/** True when the buffer looks like JPEG, PNG, GIF, or WebP (not SVG / HTML). */
export function isAllowedImageBuffer(buffer: Buffer | undefined): boolean {
  if (!buffer || buffer.length < 12) {
    return false;
  }

  const head = buffer.subarray(0, Math.min(buffer.length, 512)).toString("utf8").toLowerCase();
  if (head.includes("<svg") || head.includes("<?xml") || head.includes("<!doctype html") || head.includes("<html")) {
    return false;
  }

  if (startsWith(buffer, JPEG) || startsWith(buffer, PNG) || startsWith(buffer, GIF87) || startsWith(buffer, GIF89)) {
    return true;
  }

  // WebP: RIFF....WEBP
  return startsWith(buffer, RIFF) && startsWith(buffer, WEBP, 8);
}

const BLOCKED_EXTENSIONS = new Set([".svg", ".svgz", ".xml", ".html", ".htm"]);

export function isBlockedImageName(filename: string | undefined): boolean {
  const name = String(filename || "").toLowerCase();
  const dot = name.lastIndexOf(".");
  if (dot < 0) {
    return false;
  }
  return BLOCKED_EXTENSIONS.has(name.slice(dot));
}

export function isAllowedImageMime(mimetype: string | undefined): boolean {
  const type = String(mimetype || "").toLowerCase();
  return type === "image/jpeg" || type === "image/jpg" || type === "image/png" || type === "image/gif" || type === "image/webp";
}
