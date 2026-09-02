"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Sparkles,
} from "lucide-react";

interface VisualDateTimePickerProps {
  value?: string; // ISO string
  onChange: (isoString: string) => void;
  placeholder?: string;
  className?: string;
  title?: string;
}

export default function VisualDateTimePicker({
  value,
  onChange,
  placeholder = "Select date & time...",
  className = "",
  title = "Select Date & Time",
}: VisualDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse initial date safely
  const parseInitial = (val?: string) => {
    if (!val) return new Date();
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  // Temp working date inside modal before confirming
  const [tempDate, setTempDate] = useState<Date>(() => parseInitial(value));
  const [viewMonth, setViewMonth] = useState<number>(() => parseInitial(value).getMonth());
  const [viewYear, setViewYear] = useState<number>(() => parseInitial(value).getFullYear());
  const [clockMode, setClockMode] = useState<"hours" | "minutes">("hours");

  // Synchronize when opening
  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const d = parseInitial(value);
    setTempDate(d);
    setViewMonth(d.getMonth());
    setViewYear(d.getFullYear());
    setClockMode("hours");
    setIsOpen(true);
  };

  // Confirm selection
  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(tempDate.toISOString());
    setIsOpen(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
  };

  // Formatting display
  const formatDisplay = (d?: Date) => {
    if (!value && !d) return "";
    const target = d || parseInitial(value);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const m = months[target.getMonth()];
    const day = target.getDate().toString().padStart(2, "0");
    const y = target.getFullYear();
    const h24 = target.getHours();
    const min = target.getMinutes().toString().padStart(2, "0");
    const ampm = h24 >= 12 ? "PM" : "AM";
    const h12 = (h24 % 12 === 0 ? 12 : h24 % 12).toString().padStart(2, "0");
    return `${m} ${day}, ${y} · ${h12}:${min} ${ampm}`;
  };

  // Time components of working temp date
  const hours24 = tempDate.getHours();
  const minutes = tempDate.getMinutes();
  const isPM = hours24 >= 12;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  // Day selection
  const handleSelectDay = (e: React.MouseEvent, day: number) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = new Date(tempDate);
    updated.setFullYear(viewYear);
    updated.setMonth(viewMonth);
    updated.setDate(day);
    setTempDate(updated);
  };

  // Hour selection
  const handleSelectHour = (h12: number) => {
    const updated = new Date(tempDate);
    let h24 = h12;
    if (isPM && h12 < 12) h24 += 12;
    if (!isPM && h12 === 12) h24 = 0;
    updated.setHours(h24);
    setTempDate(updated);
    setClockMode("minutes"); // Advance to minutes selection
  };

  // Minute selection
  const handleSelectMinute = (m: number) => {
    const updated = new Date(tempDate);
    updated.setMinutes(m);
    setTempDate(updated);
  };

  // AM/PM Toggle
  const handleToggleAmPm = (e: React.MouseEvent, targetAmPm: "AM" | "PM") => {
    e.preventDefault();
    e.stopPropagation();
    const updated = new Date(tempDate);
    let currentH = updated.getHours();
    if (targetAmPm === "PM" && currentH < 12) {
      updated.setHours(currentH + 12);
    } else if (targetAmPm === "AM" && currentH >= 12) {
      updated.setHours(currentH - 12);
    }
    setTempDate(updated);
  };

  // Quick preset adjust
  const handleAddMinutes = (e: React.MouseEvent, minsToAdd: number) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = new Date(tempDate);
    updated.setMinutes(updated.getMinutes() + minsToAdd);
    setTempDate(updated);
    setViewMonth(updated.getMonth());
    setViewYear(updated.getFullYear());
  };

  // Month navigation
  const prevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Calendar math
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Visual Clock coordinates
  const clockRadius = 72; // Radius for numbers placement
  const clockCenter = 95; // Center of clock face (190x190 SVG)

  const hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const hourAngle = (hours12 % 12) * 30; // 30 deg per hour
  const minuteAngle = minutes * 6; // 6 deg per minute
  const currentAngle = clockMode === "hours" ? hourAngle : minuteAngle;

  const handRad = ((currentAngle - 90) * Math.PI) / 180;
  const handX = clockCenter + clockRadius * Math.cos(handRad);
  const handY = clockCenter + clockRadius * Math.sin(handRad);

  // Click anywhere on clock dial
  const handleClockDialClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - clockCenter;
    const y = e.clientY - rect.top - clockCenter;

    let deg = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;

    if (clockMode === "hours") {
      let h = Math.round(deg / 30);
      if (h === 0) h = 12;
      handleSelectHour(h);
    } else {
      let m = Math.round(deg / 6);
      if (m === 60) m = 0;
      handleSelectMinute(m);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 hover:border-blue-500 transition-colors cursor-pointer text-left shadow-xs group"
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="h-3.5 w-3.5 text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
          <span className={value ? "font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-400"}>
            {value ? formatDisplay() : placeholder}
          </span>
        </div>
        <ClockIcon className="h-3.5 w-3.5 text-zinc-400 shrink-0 group-hover:text-blue-500 transition-colors" />
      </button>

      {/* Screen-Centered Modal rendered within the same React tree to avoid Radix UI pointer locks */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={handleCancel}
        >
          {/* Modal Dialog Body */}
          <div
            className="relative z-[101] flex flex-col w-full max-w-[680px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40">
              <div>
                <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Select the calendar date on the left and set the exact time on the visual clock on the right.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main Body: Date Picker (Left) + Visual Clock (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800/80 p-6 gap-6">
              {/* ============ LEFT: CALENDAR DATE PICKER ============ */}
              <div className="flex flex-col justify-between">
                <div>
                  {/* Month / Year Navigator */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="font-heading font-bold text-sm text-zinc-900 dark:text-white">
                      {monthNames[viewMonth]} {viewYear}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={prevMonth}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={nextMonth}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                      <span key={d} className="text-[11px] font-semibold text-zinc-400">
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {/* Previous month leading days */}
                    {Array.from({ length: firstDayIndex }).map((_, i) => {
                      const prevDayNum = daysInPrevMonth - firstDayIndex + i + 1;
                      return (
                        <span
                          key={`prev-${i}`}
                          className="h-8 w-8 flex items-center justify-center text-xs text-zinc-300 dark:text-zinc-700 mx-auto select-none"
                        >
                          {prevDayNum}
                        </span>
                      );
                    })}

                    {/* Current month days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const isSelected =
                        tempDate.getDate() === dayNum &&
                        tempDate.getMonth() === viewMonth &&
                        tempDate.getFullYear() === viewYear;
                      const isToday =
                        new Date().getDate() === dayNum &&
                        new Date().getMonth() === viewMonth &&
                        new Date().getFullYear() === viewYear;

                      return (
                        <button
                          key={dayNum}
                          type="button"
                          onClick={(e) => handleSelectDay(e, dayNum)}
                          className={`h-8 w-8 flex items-center justify-center text-xs rounded-xl transition-all mx-auto font-medium cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30 scale-105"
                              : isToday
                              ? "border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Today shortcut */}
                <div className="flex justify-between items-center pt-4 mt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const now = new Date();
                      setViewMonth(now.getMonth());
                      setViewYear(now.getFullYear());
                      setTempDate(now);
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                  >
                    Jump to Today
                  </button>
                  <span className="text-xs text-zinc-400 font-mono">
                    {tempDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>

              {/* ============ RIGHT: VISUAL CLOCK TIME PICKER ============ */}
              <div className="flex flex-col items-center justify-between">
                {/* Digital Time & AM/PM Readout */}
                <div className="flex items-center justify-between w-full pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5 font-mono text-base">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setClockMode("hours");
                      }}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        clockMode === "hours"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {hours12.toString().padStart(2, "0")}
                    </button>
                    <span className="text-zinc-400 font-bold text-lg animate-pulse">:</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setClockMode("minutes");
                      }}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        clockMode === "minutes"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {minutes.toString().padStart(2, "0")}
                    </button>
                  </div>

                  {/* AM / PM Toggle */}
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
                    <button
                      type="button"
                      onClick={(e) => handleToggleAmPm(e, "AM")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        !isPM
                          ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleToggleAmPm(e, "PM")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isPM
                          ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>

                {/* Visual Radial Clock Face with full interactive surface */}
                <div
                  onClick={handleClockDialClick}
                  className="relative h-[190px] w-[190px] my-2 select-none cursor-pointer group"
                >
                  <svg className="h-full w-full pointer-events-none" viewBox="0 0 190 190">
                    {/* Outer dial */}
                    <circle
                      cx={clockCenter}
                      cy={clockCenter}
                      r={88}
                      className="fill-zinc-50/90 dark:fill-zinc-900/60 stroke-zinc-200 dark:stroke-zinc-800 group-hover:stroke-blue-500/40 transition-colors"
                      strokeWidth="1.5"
                    />

                    {/* Clock Hand line */}
                    <line
                      x1={clockCenter}
                      y1={clockCenter}
                      x2={handX}
                      y2={handY}
                      className="stroke-blue-600 transition-all duration-150"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Center Pivot */}
                    <circle cx={clockCenter} cy={clockCenter} r={4} className="fill-blue-600" />

                    {/* Pointer glow & indicator */}
                    <circle cx={handX} cy={handY} r={16} className="fill-blue-600/20" />
                    <circle cx={handX} cy={handY} r={3.5} className="fill-white" />
                  </svg>

                  {/* Clock Numbers Overlay (z-10 with pointer-events-auto) */}
                  {clockMode === "hours" ? (
                    // 12 Hours
                    hoursList.map((h, i) => {
                      const angle = (i * 30 - 90) * (Math.PI / 180);
                      const x = clockCenter + clockRadius * Math.cos(angle);
                      const y = clockCenter + clockRadius * Math.sin(angle);
                      const isSelected = hours12 === h;

                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSelectHour(h);
                          }}
                          style={{
                            left: `${x}px`,
                            top: `${y}px`,
                            transform: "translate(-50%, -50%)",
                          }}
                          className={`absolute z-10 h-7 w-7 flex items-center justify-center rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-110"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {h}
                        </button>
                      );
                    })
                  ) : (
                    // 12 Minute markers
                    minutesList.map((m, i) => {
                      const angle = (i * 30 - 90) * (Math.PI / 180);
                      const x = clockCenter + clockRadius * Math.cos(angle);
                      const y = clockCenter + clockRadius * Math.sin(angle);
                      const isSelected = Math.abs(minutes - m) < 2.5;

                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSelectMinute(m);
                          }}
                          style={{
                            left: `${x}px`,
                            top: `${y}px`,
                            transform: "translate(-50%, -50%)",
                          }}
                          className={`absolute z-10 h-7 w-7 flex items-center justify-center rounded-full text-[11px] font-mono font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 font-bold scale-110"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {m.toString().padStart(2, "0")}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Mode switcher & Presets */}
                <div className="flex items-center justify-between w-full pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                  <span className="text-[11px] text-zinc-400 capitalize">
                    Setting {clockMode}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleAddMinutes(e, 15)}
                      className="px-2 py-0.5 rounded-md text-[11px] border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                    >
                      +15m
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleAddMinutes(e, 30)}
                      className="px-2 py-0.5 rounded-md text-[11px] border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                    >
                      +30m
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleAddMinutes(e, 60)}
                      className="px-2 py-0.5 rounded-md text-[11px] border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                    >
                      +1h
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span>{formatDisplay(tempDate)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  Apply Date & Time
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
