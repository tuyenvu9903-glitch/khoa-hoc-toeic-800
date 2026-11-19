import { useNavigate } from "react-router-dom";
import { PROGRAM_DAYS } from "../domain/progress";
import { studyAheadDay } from "../lib/state";
import { update } from "../lib/store";

/** "Học vượt": shown once today's day is finished; opens the next day without waiting for tomorrow. */
export function StudyAheadButton({ day, className = "" }: { day: number; className?: string }) {
  const navigate = useNavigate();
  if (day >= PROGRAM_DAYS) return null;
  return (
    <button
      type="button"
      className={`btn-primary !py-1.5 ${className}`}
      onClick={() => {
        update((s) => studyAheadDay(s, new Date()));
        navigate("/today");
      }}
    >
      🚀 Học vượt: mở Ngày {day + 1} ngay
    </button>
  );
}
