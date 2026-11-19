import { useState } from "react";
import qrcode from "qrcode-generator";
import { useAppState } from "../lib/store";
import { encodeState, QR_MAX, transferLink } from "../lib/transfer";

/** Make an SVG QR code, or null when the text is too long for a phone to scan. */
function qrSvg(text: string): string | null {
  if (text.length > QR_MAX) return null;
  try {
    const qr = qrcode(0, "L");
    qr.addData(text, "Byte");
    qr.make();
    return qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  } catch {
    return null;
  }
}

/** "Chuyển sang máy khác": a link (and QR) holding this device's progress, for a phone or another computer. */
export function TransferCard() {
  const state = useAppState();
  const [link, setLink] = useState<{ url: string; qr: string | null; at: Date } | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const make = async () => {
    setNote(null);
    try {
      const url = transferLink(await encodeState(state));
      setLink({ url, qr: qrSvg(url), at: new Date() });
    } catch {
      setNote("Không tạo được link trên trình duyệt này. Hãy dùng “Tải file sao lưu” rồi “Nhập từ file…” ở máy kia.");
    }
  };
  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.url);
      setNote("Đã sao chép link. Gửi cho chính bạn (Zalo “Cloud của tôi”, Messenger, email…) rồi mở trên máy kia.");
    } catch {
      setNote("Không sao chép tự động được. Nhấn giữ vào ô link bên dưới để sao chép.");
    }
  };
  const share = async () => {
    if (!link) return;
    try {
      await navigator.share({ title: "Tiến độ TOEIC 800", url: link.url });
    } catch {
      // Closing the share sheet is not an error.
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4 text-sm">
      <p className="font-semibold">📲 Chuyển sang máy khác (điện thoại ↔ máy tính)</p>
      <p className="text-slate-600">
        Tạo một link chứa toàn bộ tiến độ hiện tại. Mở link trên máy kia (quét mã QR bằng camera điện thoại, hoặc gửi link cho
        chính bạn) rồi xác nhận là học tiếp được. Dữ liệu nằm trong link, không gửi lên máy chủ nào. Ai có link sẽ xem được tiến
        độ của bạn, nên chỉ gửi cho chính mình.
      </p>
      <button type="button" className="btn-primary" onClick={() => void make()}>
        {link ? "Tạo lại link (tiến độ mới nhất)" : "Tạo link chuyển dữ liệu"}
      </button>
      {link && (
        <div className="space-y-3">
          {link.qr ? (
            <div className="flex flex-wrap items-center gap-4">
              <div
                className="h-64 w-64 max-w-full shrink-0 rounded-lg border border-slate-200 bg-white p-1"
                role="img"
                aria-label="Mã QR chứa link chuyển dữ liệu"
                // Generated locally by qrcode-generator from our own link: no outside markup.
                dangerouslySetInnerHTML={{ __html: link.qr }}
              />
              <p className="max-w-xs text-slate-600">
                Mở camera điện thoại, quét mã này rồi bấm vào link hiện ra. Ở máy kia, bấm <strong>“Dùng tiến độ này”</strong>.
              </p>
            </div>
          ) : (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
              Tiến độ đã khá nhiều nên link quá dài để làm mã QR. Hãy sao chép hoặc chia sẻ link bên dưới, hoặc dùng file sao lưu.
            </p>
          )}
          <input readOnly value={link.url} onFocus={(e) => e.currentTarget.select()} aria-label="Link chuyển dữ liệu" className="field font-mono text-xs" />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-ghost" onClick={() => void copy()}>Sao chép link</button>
            {canShare && (
              <button type="button" className="btn-ghost" onClick={() => void share()}>Chia sẻ…</button>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Link chứa tiến độ lúc {link.at.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}. Học thêm ở máy này thì tạo
            lại link trước khi chuyển. Nhận dữ liệu sẽ thay thế tiến độ đang có ở máy kia.
          </p>
        </div>
      )}
      {note && <p role="status" className="text-slate-700">{note}</p>}
    </div>
  );
}
