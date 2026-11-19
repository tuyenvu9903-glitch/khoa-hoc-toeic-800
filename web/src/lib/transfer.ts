// Move progress to another device without a server: the whole saved state, compressed, travels in
// the link's #fragment (never sent to any server). Opening the link on the other device shows an
// import page. Works both ways: computer → phone, phone → computer, one computer → another.
import { parseState, type AppState } from "./state";

const toB64url = (bytes: Uint8Array) => {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromB64url = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

const canCompress = () => typeof CompressionStream !== "undefined";

/** "z…" = deflate-raw + base64url; "j…" = plain JSON in base64url (browsers without compression). */
export async function encodeState(state: AppState): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  return canCompress() ? "z" + toB64url(await pipe(bytes, new CompressionStream("deflate-raw"))) : "j" + toB64url(bytes);
}

/** Decode and validate a code made by encodeState. Throws a readable error. */
export async function decodeState(code: string): Promise<AppState> {
  let bytes: Uint8Array;
  try {
    const body = fromB64url(code.slice(1));
    if (code[0] === "z") {
      if (typeof DecompressionStream === "undefined") throw new Error("Trình duyệt này quá cũ để đọc link chuyển dữ liệu.");
      bytes = await pipe(body, new DecompressionStream("deflate-raw"));
    } else if (code[0] === "j") bytes = body;
    else throw new Error("bad prefix");
  } catch (e) {
    throw new Error(e instanceof Error && e.message.startsWith("Trình duyệt") ? e.message : "Link bị lỗi hoặc bị cắt mất một phần. Hãy sao chép lại cả link.");
  }
  let raw: unknown;
  try {
    raw = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error("Link bị lỗi hoặc bị cắt mất một phần. Hãy sao chép lại cả link.");
  }
  return parseState(raw);
}

/** Full link that opens the import page of this same site. */
export function transferLink(code: string, base = `${location.origin}${location.pathname}`): string {
  return `${base}#/import?d=${code}`;
}

/** Most phones scan a QR up to about this many characters reliably (byte mode, low error correction). */
export const QR_MAX = 2900;
