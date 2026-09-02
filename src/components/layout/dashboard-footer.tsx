"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

export default function DashboardFooter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Thank you for subscribing to School Sphere updates!");
    setEmail("");
  };

  return (
    <footer className="mt-14 space-y-12 pt-4 select-none">
      {/* Top CTA Banner matching reference image */}
      <div className="relative overflow-hidden rounded-3xl bg-[#092b21] px-8 py-10 sm:px-12 sm:py-14 md:px-16 md:py-16 text-white shadow-2xl">
        {/* Soft atmospheric depth highlight */}
        <div className="absolute -right-12 -top-12 h-72 w-72 rounded-full bg-[#10b981]/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-72 w-72 rounded-full bg-[#84cc16]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            {/* Pill badge matching reference */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#b5f242] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#092b21] shadow-sm">
              <GraduationCap className="h-3.5 w-3.5 text-[#092b21]" />
              <span>Start Learning Today</span>
            </div>

            {/* Big Headline */}
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-white leading-[1.12]">
              Join Our University <br />
              And Achieve Success
            </h2>
          </div>

          {/* Action Pill Button matching reference */}
          <div className="shrink-0">
            <Link href="/login">
              <button className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-xs md:text-sm font-bold text-[#092b21] hover:bg-[#f1f5f3] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md">
                <span>Apply Now Today</span>
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter matching reference layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pt-2">
        {/* Brand Column */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-2.5">
            {/* Modern dual-stripe emblem like EduNova */}
            <div className="flex items-center gap-1">
              <div className="h-6 w-2 rounded-full bg-[#a3e635]" />
              <div className="h-6 w-2 rounded-full bg-[#84cc16]" />
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              School Sphere
            </span>
          </div>

          <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed max-w-xs">
            Gain future-ready skills with expert-led courses and modern academic management.
          </p>

          {/* Email Subscription Box */}
          <form onSubmit={handleSubscribe} className="relative max-w-[280px] pt-1">
            <div className="flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 pl-5 pr-1.5 py-1.5 shadow-sm focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
              <input
                type="email"
                placeholder="enter your mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
              />
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#092b21] dark:bg-[#b5f242] text-white dark:text-[#092b21] hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-sm"
                title="Subscribe"
              >
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        </div>

        {/* 3 Links Columns matching reference image */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {/* Main Pages */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm md:text-base font-bold text-zinc-900 dark:text-white tracking-tight">
              Main Pages
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-normal">
              <li>
                <Link href="/public" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/public#overview" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/subjects" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Programs
                </Link>
              </li>
              <li>
                <Link href="/classes" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Programs Details
                </Link>
              </li>
              <li>
                <Link href="/lessons" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Academics
                </Link>
              </li>
            </ul>
          </div>

          {/* Utility Pages */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm md:text-base font-bold text-zinc-900 dark:text-white tracking-tight">
              Utility Pages
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-normal">
              <li>
                <Link href="/students" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Enrollment
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Blogs Details
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Events Details
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm md:text-base font-bold text-zinc-900 dark:text-white tracking-tight">
              Social Links
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-normal">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Linkedin
                </a>
              </li>
              <li>
                <a
                  href="https://behance.net"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Behance
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar matching reference */}
      <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-8 pb-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-normal">
        <div>
          <span>&copy;2026 All Rights Reserved</span>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/public" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/public" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
