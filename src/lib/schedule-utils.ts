export interface ScheduleSlot {
  name: string;
  time: string;
  subjectName?: string;
  className?: string;
  teacherName?: string;
}

export const TIME_SLOTS = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

export const DAYS = ["MON", "TUE", "WED", "THU", "FRI"] as const;

export function buildScheduleMatrix(
  lessons: any[] = [],
  fallbackSchedule?: Record<string, Record<string, { name: string; time: string } | null>>
) {
  const matrix: Record<string, Record<string, ScheduleSlot | null>> = {
    "8:00 AM": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
    "9:00 AM": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
    "10:00 AM": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
    "11:00 AM": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
    "12:00 PM": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
    "1:00 PM": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
    "2:00 PM": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
    "3:00 PM": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
    "4:00 PM": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
  };

  if (!lessons || lessons.length === 0) {
    if (fallbackSchedule) {
      return fallbackSchedule;
    }
    return matrix;
  }

  let mappedCount = 0;

  lessons.forEach((lesson) => {
    const rawDay = String(lesson.day || "").toUpperCase();
    let dayKey: string | null = null;
    if (rawDay.includes("MON")) dayKey = "MON";
    else if (rawDay.includes("TUE")) dayKey = "TUE";
    else if (rawDay.includes("WED")) dayKey = "WED";
    else if (rawDay.includes("THU")) dayKey = "THU";
    else if (rawDay.includes("FRI")) dayKey = "FRI";

    if (!dayKey) return;

    let hour = 9;
    let startLabel = "";
    let endLabel = "";

    if (lesson.startTime) {
      const d = new Date(lesson.startTime);
      if (!isNaN(d.getTime())) {
        hour = d.getUTCHours() || d.getHours();
        startLabel = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
      } else {
        startLabel = String(lesson.startTime);
      }
    }

    if (lesson.endTime) {
      const d = new Date(lesson.endTime);
      if (!isNaN(d.getTime())) {
        endLabel = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
      } else {
        endLabel = String(lesson.endTime);
      }
    }

    let slotKey = "9:00 AM";
    if (hour <= 8) slotKey = "8:00 AM";
    else if (hour === 9) slotKey = "9:00 AM";
    else if (hour === 10) slotKey = "10:00 AM";
    else if (hour === 11) slotKey = "11:00 AM";
    else if (hour === 12) slotKey = "12:00 PM";
    else if (hour === 13) slotKey = "1:00 PM";
    else if (hour === 14) slotKey = "2:00 PM";
    else if (hour === 15) slotKey = "3:00 PM";
    else slotKey = "4:00 PM";

    const displayName = lesson.class?.name
      ? `${lesson.class.name} - ${lesson.name || lesson.subject?.name || "Class"}`
      : lesson.name || lesson.subject?.name || "Lesson";

    const timeRange = startLabel && endLabel ? `${startLabel} - ${endLabel}` : startLabel || slotKey;

    if (matrix[slotKey]) {
      matrix[slotKey][dayKey] = {
        name: displayName,
        time: timeRange,
        subjectName: lesson.subject?.name,
        className: lesson.class?.name,
        teacherName: lesson.teacher ? `${lesson.teacher.name} ${lesson.teacher.surname}` : undefined,
      };
      mappedCount++;
    }
  });

  if (mappedCount === 0 && fallbackSchedule) {
    return fallbackSchedule;
  }

  return matrix;
}
