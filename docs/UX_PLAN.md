# UX plan: "Friendly learning coach"

Companion to `ROADMAP.md` (content and engine work). Status as of 2026-11-19.

## Audit of the current UI

- **Navigation:** 8 tabs in a top bar (Dashboard, Lộ trình, Từ vựng, Nghe, Đọc, Thi thử, Dữ liệu); icon-only on
  phones, no bottom navigation. No Progress page.
- **Dashboard:** shows a score of 400 (L 200 / R 200) taken from defaults set at sign-up, which looks like a
  real result. No single primary action; the learner picks among four "Luyện ngay" buttons.
- **Daily flow:** steps exist (missions) but there is no guided sequence, no "continue where I left off",
  and no completion screen per step.
- **Learning vs exam:** listening practice already has replay/speed/transcript; exam mode exists (mini test,
  short mock) with no explanations before submission.
- **Missing:** error notebook page, grammar lessons with exercises, IPA/audio on flashcards, highlighting and
  vocabulary lookup in reading, XP/badges, weekly report, study-time tracking.
- **Reusable:** `card`/`btn-*` classes, `Ring`, `Stat`, session components (Part2/Set/Part5/Part7),
  `ExamRunner`/`ExamReview`, `domain/progress.ts` (day gating), store with JSON backup.

## Design system

- Primary green `#16A34A` (`brand-600`). Buttons with white text use `brand-700` `#15803D` (5:1 contrast;
  white on `#16A34A` is only 3.3:1).
- Pastel surfaces: mint `#DFF5E8`, cream `#FFF4D6`, blue `#E7EFFF`, purple `#F4EAFE`, coral `#FFF0EC`
  (Tailwind `bg-p-mint`, `bg-p-cream`, `bg-p-blue`, `bg-p-purple`, `bg-p-coral`). Text on pastel stays slate-800.
- Font: Be Vietnam Pro (Google Fonts), fallback system UI. Cards 16px radius, 1px border, soft shadow.
- Category colours: vocabulary purple, grammar blue, listening mint, reading cream, errors coral.

## Navigation

- Desktop (≥1024px): left sidebar — Trang chủ, Từ vựng, Nghe, Đọc, Tiến độ, Thi thử; below a divider the
  contextual links Lộ trình, Dữ liệu & sao lưu.
- Mobile: bottom bar with the same six destinations (icon + short label, ≥44px targets); a slim top bar with
  logo and links to Lộ trình / Dữ liệu.

## Wireframes

```
Home                                   Today (/today)
┌──────────────────────────────────┐   ┌──────────────────────────────┐
│ Chào Tuyên 👋   Ngày 3/56 · 🔥2   │   │ Ngày 3 · Lịch làm việc        │
│ [ ▶ Tiếp tục: Bước 2 · Ngữ pháp ] │   │ ●──●──○──○──○  2/5 · ~85 phút │
│ Hôm nay: 2/4 bước · ~85 phút còn  │   │ ✓ 1 Từ vựng          30'      │
├───────────────┬──────────────────┤   │ ▶ 2 Ngữ pháp  [Làm]   20'      │
│ Kế hoạch hôm  │ Điểm (thi thật / │   │ ○ 3 Nghe              35'      │
│ nay (5 bước)  │ ước lượng)       │   │ ○ 4 Đọc               30'      │
│               │ Từ cần ôn: 12    │   │ ○ 5 Ôn lỗi (nếu có)   10'      │
└───────────────┴──────────────────┘   └──────────────────────────────┘
```

## Phases

1. **Foundation (this phase):** design tokens and font; sidebar + bottom navigation; Today page with the
   guided steps and one-click resume; Dashboard rebuilt around "Bắt đầu / Tiếp tục học hôm nay"; scores only
   from real tests (empty state otherwise); Progress page with real data (scores, accuracy by Part, vocabulary
   mastery, days completed, streak).
2. **Errors & assessment:** error notebook (stores the chosen answer, filters by Part and category, review
   queue) as step 5; a short daily assessment as step 6; "next step" feedback after each step.
3. **Learning screens:** flashcards with IPA/audio/collocations and Unknown/Difficult/Known; listening
   learning mode polish; reading highlight, word lookup, mobile Passage/Questions switch, reading-speed tracking.
4. **Grammar lessons:** short Vietnamese lesson → examples → traps → exercises → review quiz.
2b. **Vocabulary games (both kept: "Bắn gà" and "Gõ từ bắn gà"):** Easy/Normal/Hard with progressive speed,
   short rounds, daily challenge, personal best per mode and difficulty, combo and speed bonuses; word filters
   (topic, difficulty, recently learned, weak words, due for review) from the course database; end-of-round
   review of right/wrong words with meanings, mistakes logged and wrong words scheduled for SRS, "play again
   with weak words"; pause/resume, keyboard and touch; shared real statistics (accuracy, average response
   time, best combo, games played, retention). Existing records (`shooterBest`, `typingBest`) are preserved.
5. **Motivation & analytics:** XP from real activity, badges, weekly achievements, study-time tracking,
   weekly report.
6. **Full mock test (200 q)** once the original question bank is large enough (see ROADMAP).
