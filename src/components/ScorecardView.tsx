"use client";

import React, { useState } from "react";
import { ExamAttempt, Question } from "@/db/schema";
import { MleapsLogo } from "./MleapsLogo";
import { CheckMark, CrossMark } from "./SixSigmaVisuals";
import {
  Clock,
  Calendar,
  Mail,
  User,
  Check,
  X,
  Printer,
  ArrowLeft,
  BookOpen,
  Quote,
} from "lucide-react";

interface ScorecardViewProps {
  attempt: ExamAttempt;
  questions: Question[];
  onBack: () => void;
  backLabel?: string;
}

export function ScorecardView({
  attempt,
  questions,
  onBack,
  backLabel = "Back",
}: ScorecardViewProps) {
  const [filterMode, setFilterMode] = useState<"all" | "correct" | "incorrect">(
    "all"
  );
  const [selectedPhase, setSelectedPhase] = useState("All");

  const formatDuration = (sec: number) =>
    `${Math.floor(sec / 60)}m ${sec % 60}s`;

  const phases = ["Define", "Measure", "Analyze", "Improve", "Control"];
  const phaseStats = phases.map((phase) => {
    const phaseQs = questions.filter((q) => q.dmaicPhase === phase);
    let correct = 0;
    for (const q of phaseQs) {
      const userAns = attempt.answers?.[String(q.id)];
      if (userAns && userAns.toUpperCase() === q.correctOption.toUpperCase())
        correct += 1;
    }
    return {
      phase,
      correct,
      total: phaseQs.length,
      pct: phaseQs.length > 0 ? Math.round((correct / phaseQs.length) * 100) : 0,
    };
  });

  const filteredQuestions = questions.filter((q) => {
    const userAns = attempt.answers?.[String(q.id)];
    const isCorrect =
      userAns && userAns.toUpperCase() === q.correctOption.toUpperCase();
    if (filterMode === "correct" && !isCorrect) return false;
    if (filterMode === "incorrect" && isCorrect) return false;
    if (selectedPhase !== "All" && q.dmaicPhase !== selectedPhase) return false;
    return true;
  });

  const sigmaEstimate =
    attempt.percentage >= 96
      ? "6.0σ — World class"
      : attempt.percentage >= 88
      ? "5.2σ — Excellence"
      : attempt.percentage >= 80
      ? "4.6σ — High capability"
      : attempt.percentage >= 70
      ? "4.0σ — Green Belt standard"
      : "2.8σ — Needs improvement";

  const circumference = 2 * Math.PI * 66;

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-10 space-y-8 reveal-up">
      {/* action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-full bg-white border border-[#e8e4db] hover:border-[#cfc9bb] text-sm font-medium text-[#15172a] flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#c4530a]" /> {backLabel}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-full bg-[#15172a] hover:bg-[#242740] text-sm font-medium text-white flex items-center gap-2 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#f9b233]" /> Print transcript
        </button>
      </div>

      {/* certificate hero */}
      <div className="card-premium rounded-3xl overflow-hidden">
        <div className="h-1.5 rule-accent line-grow" />
        <div className="p-7 sm:p-11">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-9 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-4">
                <MleapsLogo size="md" />
              </div>
              <div>
                <span className="eyebrow text-[#c4530a]">
                  Official Evaluation Transcript
                </span>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#15172a] mt-1.5 leading-tight">
                  Six Sigma Green Belt
                  <br />
                  Certification Assessment
                </h1>
              </div>

              <div
                className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${
                  attempt.passed
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-rose-50 border-rose-200"
                }`}
              >
                {attempt.passed ? (
                  <CheckMark className="w-7 h-7" />
                ) : (
                  <CrossMark className="w-7 h-7" />
                )}
                <div>
                  <div className="text-sm font-semibold text-[#15172a]">
                    {attempt.passed
                      ? "Certified — Green Belt standard met"
                      : "Below passing threshold (70%)"}
                  </div>
                  <div className="text-xs text-[#747789]">
                    Benchmark · {sigmaEstimate}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  {
                    Icon: User,
                    label: "Candidate",
                    value: attempt.candidateName,
                    tone: "text-[#c4530a]",
                  },
                  {
                    Icon: Mail,
                    label: "Email",
                    value: attempt.candidateEmail,
                    tone: "text-[#6d28d9]",
                  },
                  {
                    Icon: Clock,
                    label: "Time taken",
                    value: formatDuration(attempt.timeSpentSeconds),
                    tone: "text-[#15172a]",
                  },
                  {
                    Icon: Calendar,
                    label: "Date",
                    value: new Date(attempt.submittedAt).toLocaleDateString(
                      undefined,
                      { year: "numeric", month: "short", day: "numeric" }
                    ),
                    tone: "text-emerald-600",
                  },
                ].map((d) => (
                  <div
                    key={d.label}
                    className="inset-panel rounded-xl p-3.5 flex items-center gap-3"
                  >
                    <d.Icon className={`w-5 h-5 shrink-0 ${d.tone}`} />
                    <div className="min-w-0">
                      <div className="eyebrow text-[#9a9a90]">{d.label}</div>
                      <div className="text-sm font-semibold text-[#15172a] truncate">
                        {d.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* gauge */}
            <div className="lg:col-span-5 flex flex-col items-center inset-panel rounded-3xl p-7">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e2630f" />
                      <stop offset="55%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#6d28d9" />
                    </linearGradient>
                  </defs>
                  <circle cx="80" cy="80" r="66" fill="none" stroke="#eceae4" strokeWidth="13" />
                  <circle
                    cx="80"
                    cy="80"
                    r="66"
                    fill="none"
                    stroke="url(#gaugeGrad)"
                    strokeWidth="13"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - attempt.percentage / 100)}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-5xl font-semibold text-[#15172a]">
                    {attempt.percentage}
                    <span className="text-2xl text-[#9a9a90]">%</span>
                  </span>
                  <span className="font-data text-sm font-semibold text-[#c4530a]">
                    {attempt.score} / {attempt.totalQuestions}
                  </span>
                </div>
              </div>
              <div className="w-full grid grid-cols-2 gap-3 mt-6">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center">
                  <div className="font-data text-lg font-bold text-emerald-700">
                    {attempt.score}
                  </div>
                  <div className="text-[11px] text-emerald-700/80">Correct</div>
                </div>
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-center">
                  <div className="font-data text-lg font-bold text-rose-700">
                    {attempt.totalQuestions - attempt.score}
                  </div>
                  <div className="text-[11px] text-rose-700/80">Incorrect</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DMAIC breakdown */}
      <div className="card-premium rounded-3xl p-7 sm:p-9">
        <div className="mb-6">
          <span className="eyebrow text-[#c4530a]">Competency diagnostics</span>
          <h2 className="font-display text-xl font-semibold text-[#15172a] mt-1">
            Performance by DMAIC domain
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {phaseStats.map((st, idx) => (
            <div
              key={st.phase}
              style={{ animationDelay: `${idx * 70}ms` }}
              className="reveal-up inset-panel rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#15172a]">
                  {st.phase}
                </span>
                <span className="font-data text-xs font-semibold text-[#c4530a]">
                  {st.correct}/{st.total}
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#eceae4] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rule-accent rounded-full transition-all duration-700"
                  style={{ width: `${st.pct}%` }}
                />
              </div>
              <div className="text-right text-xs text-[#9a9a90] font-data">
                {st.pct}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* answer key */}
      <div className="card-premium rounded-3xl p-7 sm:p-9 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#eceae4]">
          <div>
            <span className="eyebrow text-[#c4530a] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Examiner review
            </span>
            <h2 className="font-display text-xl font-semibold text-[#15172a] mt-1">
              Answer key & explanations
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 no-print">
            {(
              [
                { id: "all", label: `All (${questions.length})` },
                { id: "correct", label: `Correct (${attempt.score})` },
                {
                  id: "incorrect",
                  label: `Incorrect (${attempt.totalQuestions - attempt.score})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterMode(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  filterMode === tab.id
                    ? "bg-[#15172a] text-white"
                    : "bg-[#f4f2ec] text-[#6b6e80] hover:bg-[#ebe8e0]"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-[#e0dccf] text-[#15172a] focus:outline-none focus:border-[#e2630f]"
            >
              <option value="All">All phases</option>
              {phases.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const chosen = attempt.answers?.[String(q.id)];
            const isCorrect =
              chosen && chosen.toUpperCase() === q.correctOption.toUpperCase();
            const opts: { letter: "A" | "B" | "C" | "D"; text: string }[] = [
              { letter: "A", text: q.optionA },
              { letter: "B", text: q.optionB },
              { letter: "C", text: q.optionC },
              { letter: "D", text: q.optionD },
            ];
            return (
              <div
                key={q.id}
                style={{ animationDelay: `${Math.min(idx * 35, 350)}ms` }}
                className={`reveal-up rounded-2xl p-5 sm:p-6 border ${
                  isCorrect
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-rose-50/40 border-rose-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-data text-sm font-semibold text-[#9a9a90]">
                      Q{q.questionNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-medium">
                      {q.dmaicPhase}
                    </span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <Check className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700">
                        <X className="w-3.5 h-3.5" />{" "}
                        {chosen
                          ? `Chose ${chosen} · key ${q.correctOption}`
                          : `Unanswered · key ${q.correctOption}`}
                      </span>
                    )}
                  </div>
                  <div className="shrink-0">
                    {isCorrect ? (
                      <CheckMark className="w-6 h-6" />
                    ) : (
                      <CrossMark className="w-6 h-6" />
                    )}
                  </div>
                </div>

                <h3 className="font-display text-lg font-semibold text-[#15172a] mb-4">
                  {q.questionText}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {opts.map((o) => {
                    const isRight = o.letter === q.correctOption.toUpperCase();
                    const isUser = chosen && o.letter === chosen.toUpperCase();
                    return (
                      <div
                        key={o.letter}
                        className={`p-3 rounded-xl border text-sm flex items-center justify-between gap-2 ${
                          isRight
                            ? "bg-emerald-50 border-emerald-300 text-[#15172a] font-medium"
                            : isUser
                            ? "bg-rose-50 border-rose-300 text-rose-800 font-medium"
                            : "bg-white border-[#e8e4db] text-[#6b6e80]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-data font-bold text-xs shrink-0 ${
                              isRight
                                ? "bg-emerald-500 text-white"
                                : isUser
                                ? "bg-rose-500 text-white"
                                : "bg-[#f4f2ec] text-[#6b6e80]"
                            }`}
                          >
                            {o.letter}
                          </span>
                          <span>{o.text}</span>
                        </div>
                        {isRight && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 shrink-0">
                            Key
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="inset-panel rounded-xl p-3.5 flex items-start gap-2.5 text-sm text-[#5b5e70]">
                  <Quote className="w-4 h-4 text-[#c4530a] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#15172a]">
                      Why {q.correctOption}:{" "}
                    </span>
                    {q.explanation}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
