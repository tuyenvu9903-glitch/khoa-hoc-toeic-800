# TOEIC 800 Bootcamp

Khóa tự học TOEIC **400 → 800 trong 8 tuần**. Là một web tĩnh chạy hoàn toàn trong trình duyệt, deploy được lên **GitHub Pages**, không cần server hay database.

Phase 1: kiến trúc. Phase 2: lộ trình 56 ngày + Dashboard "Hôm nay tôi phải học gì?" + lưu tiến độ. Phase 7 (làm sớm): luyện từ vựng kiểu Quizlet + lặp lại ngắt quãng.

## Deploy lên GitHub Pages

1. Push code lên nhánh `main`.
2. Vào repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Workflow `.github/workflows/deploy.yml` tự typecheck, test, build và deploy mỗi lần push.
4. Trang chạy ở `https://<user>.github.io/<tên-repo>/`.

## Luyện từ vựng (kiểu Quizlet)

127 từ TOEIC theo 10 chủ đề (nơi làm việc, họp hành, du lịch, khách sạn, nhà hàng, mua sắm, chăm sóc khách hàng, giao hàng, lịch trình…), kèm nghĩa tiếng Việt, ví dụ và paraphrase hay gặp.

- **Học từ mới:** trắc nghiệm Anh→Việt, Việt→Anh, rồi gõ lại từ (cho phép thử lại một lần nếu sai một chữ). Từ sai sẽ quay lại sớm.
- **Thẻ ghi nhớ:** thẻ lật 3D, chấm 4 mức (Chưa nhớ / Khó / Nhớ / Dễ). Phím tắt: Space lật thẻ, 1–4 chấm. Có nút nghe phát âm.
- **Gõ từ bắn gà:** gà rơi xuống mang nghĩa tiếng Việt, gõ đúng từ tiếng Anh thì tàu bay bắn.
- Mỗi từ học xong được xếp lịch ôn lại (SM-2 đơn giản), tối đa 15 từ mới mỗi ngày. Hoàn thành phiên sẽ tự đánh dấu nhiệm vụ "Từ vựng" trên Dashboard.
- Thêm từ mới: sửa `web/src/data/vocabulary.ts`.

## Lưu tiến độ

- Tiến độ (hồ sơ, điểm, câu sai, nhiệm vụ đã tick) lưu trong **localStorage của trình duyệt**, nên chỉ có trên đúng trình duyệt và máy đó.
- Xóa dữ liệu duyệt web, dùng chế độ ẩn danh hoặc đổi máy sẽ **mất tiến độ**.
- Vào **Dữ liệu & sao lưu** để tải file `.json` sao lưu và nhập lại ở máy/trình duyệt khác. Nên sao lưu mỗi tuần.

## Chạy trên máy (khi sửa code)

Cần Node.js 20+.

```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm test
npm run build
```

## Cấu trúc

- `web/src/data/curriculum.ts`: giáo trình 8 tuần, 56 ngày, skill tree, mẫu nhiệm vụ.
- `web/src/data/vocabulary.ts`: từ vựng theo chủ đề.
- `web/src/data/listening.ts`, `reading.ts`: câu luyện Nghe (Part 2–4) và Đọc (Part 5, 7), tự soạn.
- `web/src/data/dailyPlan.ts`: bài học từng ngày của lộ trình 56 ngày.
- `CLAUDE.md` và `.claude/skills/`: hướng dẫn cho Claude Code (thêm từ vựng, thêm câu hỏi, push).
- `web/src/domain/`: adaptive, nhiệm vụ hằng ngày, ngày/tuần, điểm, SRS, phiên luyện từ, chế độ Học, game Bắn gà và Gõ từ.
- `web/src/lib/`: trạng thái + lưu trữ + tổng hợp dashboard.
- `docs/ARCHITECTURE.md`: kiến trúc; `docs/MASTER_PROMPT.md`: spec gốc.

Stack: React, TypeScript (strict), Vite, Tailwind, React Hook Form, Zod, Vitest.


## Bắn gà từ vựng

Trong tab **Từ vựng** có game *Bắn gà*: điều khiển tàu bay (rê chuột/kéo ngón tay, hoặc ← → + Space), bắn con gà mang nghĩa đúng, né trứng, 10 vòng, 5 mạng. Kết quả được xếp lịch ôn lại (SRS) và kỷ lục được lưu cùng tiến độ.
