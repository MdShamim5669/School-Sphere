"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Plus, Minus, Search, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const defaultFaqs: FAQItem[] = [
  {
    id: "faq-1",
    question: "What programs are available at School Sphere?",
    answer:
      "School Sphere offers diverse programs in business, technology, arts, sciences, and health, designed to prepare students for global careers with practical skills, innovative learning experiences, and personalized academic support.",
  },
  {
    id: "faq-2",
    question: "How do I apply for admission?",
    answer:
      "Prospective students and guardians can submit applications directly through the online enrollment portal, submit prerequisite transcripts, and schedule an on-campus evaluation or diagnostic placement session.",
  },
  {
    id: "faq-3",
    question: "Are scholarships offered?",
    answer:
      "Yes, School Sphere provides merit-based academic scholarships, leadership awards, and need-based institutional tuition support for qualifying applicants each academic term.",
  },
  {
    id: "faq-4",
    question: "What is campus life like at School Sphere?",
    answer:
      "Campus life is vibrant and collaborative, featuring robotics teams, competitive athletics tournaments, performing arts societies, digital publication clubs, and community volunteer initiatives.",
  },
  {
    id: "faq-5",
    question: "Can I study remotely?",
    answer:
      "Yes, digital lecture materials, assignment submissions, and interactive timetable schedules are fully accessible through student and parent portals with hybrid support.",
  },
  {
    id: "faq-6",
    question: "How can I contact the admissions office?",
    answer:
      "You can contact admissions directly via email at admissions@schoolsphere.edu, by phone at +1 (800) 555-SPHERE, or by visiting our central administrative office during regular campus hours.",
  },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>("faq-1");
  const [ragQuery, setRagQuery] = useState("");
  const [isRagActive, setIsRagActive] = useState(false);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleRagSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;
    toast.info(`RAG Query: "${ragQuery}" — ready for RAG system integration`);
  };

  return (
    <section id="faq" className="py-16 md:py-24 px-6 md:px-12 max-w-6xl mx-auto w-full select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Heading, Badge, Subtitle & RAG Query Box */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick Answers Pill matching reference */}
          <div className="inline-flex items-center gap-2 rounded-md bg-[#092b21] dark:bg-[#0c3327] px-3.5 py-1.5 text-[11px] font-bold tracking-wider text-[#a3e635] uppercase border border-[#a3e635]/20 shadow-sm">
            <GraduationCap className="h-3.5 w-3.5 text-[#a3e635]" />
            <span>Quick Answers</span>
          </div>

          {/* Big Headline in Plus Jakarta Sans matching reference */}
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-zinc-900 dark:text-white leading-[1.15]">
            Everything You <br />
            Want To Know
          </h2>

          {/* Subtitle matching reference */}
          <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed max-w-sm">
            Browse categories to find courses that perfectly match your interests today.
          </p>

          {/* RAG System Query Container */}
          <div className="pt-2">
            <form onSubmit={handleRagSearch} className="space-y-2">
              <div className="relative flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-1.5 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
                <Search className="h-4 w-4 text-zinc-400 ml-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Ask AI or search campus knowledge..."
                  value={ragQuery}
                  onChange={(e) => setRagQuery(e.target.value)}
                  className="w-full bg-transparent px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex h-7 px-3 items-center gap-1 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-200 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors cursor-pointer shrink-0"
                >
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>RAG</span>
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 px-1 font-mono">
                Powered by School Sphere RAG Knowledge Index
              </p>
            </form>
          </div>
        </div>

        {/* Right Column: Accordion FAQ List matching reference image */}
        <div className="lg:col-span-7 space-y-3">
          {defaultFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#121215] transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <span className="font-heading text-sm md:text-base font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {faq.question}
                  </span>
                  <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-zinc-600 dark:text-zinc-300">
                    {isOpen ? (
                      <Minus className="h-4 w-4 stroke-[2.5]" />
                    ) : (
                      <Plus className="h-4 w-4 stroke-[2.5]" />
                    )}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-5 pb-5 pt-0 border-t border-zinc-200/40 dark:border-zinc-800/40">
                        <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed pt-3">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
