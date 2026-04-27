export function imageAlt(handle: string, realm?: string) {
  return `Post preview by ${handle}${realm ? ` in ${realm}` : ""}`;
}

export function imageTone(url?: string) {
  if (!url) return "text";
  return url.includes("photo") ? "photo" : "media";
}
