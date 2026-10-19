"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Question, CandidateAssignment } from "@/db/schema";
import { MleapsLogo } from "./MleapsLogo";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Send,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

interface LiveExamArenaProps {
  questions: Question[];
  assignment: CandidateAssignment;
  candidateName: string;
  candidateEmail: string;
  onSubmitExam: (payload: {
    answers: Record<string, string>;
    timeSpentSeconds: number;
    startedAt: string;
  }) => Promise<void>;
  onCancelExam: () => void;
}

export function LiveExamArena({
  questions,
  assignment,
  candidateName,
  candidateEmail,
  onSubmitExam,
  onCancelExam,
}: LiveExamArenaProps) {
  const durationSeconds = (assignment.durationMinutes || 40) * 60;
  const [startedAt] = useState(() => new Date().toISOString());
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animKey, setAnimKey] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex] || questions[0];

  const handleConfirmSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const timeSpent = Math.max(1, durationSeconds - secondsLeft);
    try {
      await onSubmitExam({ answers, timeSpentSeconds: timeSpent, startedAt });
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  }, [answers, durationSeconds, isSubmitting, onSubmitExam, secondsLeft, startedAt]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleConfirmSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleConfirmSubmit]);

  const navigateToQuestion = useCallback(
    (targetIdx: number) => {
      if (targetIdx < 0 || targetIdx >= questions.length) return;
      setDirection(targetIdx >= currentIndex ? "next" : "prev");
      setCurrentIndex(targetIdx);
      setAnimKey((k) => k + 1);
    },
    [currentIndex, questions.length]
  );

  const handleSelectOption = useCallback(
    (optionLetter: "A" | "B" | "C" | "D") => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({
        ...prev,
        [String(currentQuestion.id)]: optionLetter,
      }));
    },
    [currentQuestion]
  );

  const toggleFlagCurrent = useCallback(() => {
    if (!currentQuestion) return;
    const qId = String(currentQuestion.id);
    setFlaggedIds((prev) => ({ ...prev, [qId]: !prev[qId] }));
  }, [currentQuestion]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSubmitModal) return;
      const key = e.key.toUpperCase();
      if (["A", "B", "C", "D"].includes(key)) {
        handleSelectOption(key as "A" | "B" | "C" | "D");
      } else if (e.key === "ArrowRight" && currentIndex < questions.length - 1) {
        navigateToQuestion(currentIndex + 1);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        navigateToQuestion(currentIndex - 1);
      } else if (key === "F") {
        toggleFlagCurrent();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentIndex,
    handleSelectOption,
    navigateToQuestion,
    questions.length,
    showSubmitModal,
    toggleFlagCurrent,
  ]);

  const formatTimer = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flaggedIds).filter(Boolean).length;
  const progressPercent =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;

  if (!currentQuestion) return null;

  const selectedOptionForCurrent = answers[String(currentQuestion.id)];
  const isCurrentFlagged = !!flaggedIds[String(currentQuestion.id)];
  const options: { letter: "A" | "B" | "C" | "D"; text: string }[] = [
    { letter: "A", text: currentQuestion.optionA },
    { letter: "B", text: currentQuestion.optionB },
    { letter: "C", text: currentQuestion.optionC },
    { letter: "D", text: currentQuestion.optionD },
  ];

  const timerTone =
    secondsLeft < 180
      ? "bg-rose-50 border-rose-200 text-rose-700"
      : secondsLeft < 600
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-white border-[#e8e4db] text-[#15172a]";

  return (
    <div className="min-h-screen flex flex-col">
      {/* exam header */}
      <header className="sticky top-0 z-30 bg-[#faf9f6]/90 backdrop-blur-xl border-b border-[#e8e4db]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <MleapsLogo size="xs" />
            <div className="hidden sm:block pl-4 border-l border-[#e8e4db]">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" /> Proctored
                </span>
              </div>
              <p className="text-sm font-semibold text-[#15172a] mt-0.5">
                {candidateName}{" "}
                <span className="text-xs font-normal text-[#9a9a90]">
                  · {candidateEmail}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2.5 px-4 py-2 rounded-full border ${timerTone} ${
                secondsLeft < 180 ? "animate-pulse" : ""
              }`}
            >
              <Clock className="w-4 h-4" />
              <div>
                <div className="eyebrow opacity-70 leading-none text-[9px]">
                  Remaining
                </div>
                <div className="font-data text-lg font-bold leading-tight">
                  {formatTimer(secondsLeft)}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-2.5 rounded-full font-medium text-sm text-white bg-[#15172a] hover:bg-[#242740] shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Submit</span>
            </button>
          </div>
        </div>
        <div className="h-0.5 w-full bg-[#eceae4]">
          <div
            className="h-full rule-accent transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* arena body */}
      <main className="max-w-7xl w-full mx-auto px-5 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-7 flex-1 pb-14">
        {/* question */}
        <div className="lg:col-span-8">
          <div
            key={`${currentQuestion.id}-${animKey}`}
            className={`card-premium rounded-3xl overflow-hidden ${
              direction === "next" ? "slide-swap" : "slide-swap-back"
            }`}
          >
            <div className="h-1 rule-accent" />
            <div className="p-7 sm:p-9">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
                <div className="flex items-center gap-3">
                  <span className="font-data text-sm font-semibold text-[#9a9a90]">
                    {String(currentIndex + 1).padStart(2, "0")}
                    <span className="text-[#cfcabb]">
                      {" "}
                      / {String(questions.length).padStart(2, "0")}
                    </span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-violet-50 text-violet-700 border border-violet-200">
                    {currentQuestion.dmaicPhase}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedOptionForCurrent && (
                    <button
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => {
                          const copy = { ...prev };
                          delete copy[String(currentQuestion.id)];
                          return copy;
                        })
                      }
                      className="px-3 py-1.5 rounded-full text-xs font-medium text-[#6b6e80] hover:text-[#15172a] bg-[#f4f2ec] hover:bg-[#ebe8e0] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={toggleFlagCurrent}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCurrentFlagged
                        ? "bg-amber-50 border-amber-300 text-amber-700"
                        : "bg-[#f4f2ec] border-transparent text-[#6b6e80] hover:text-[#15172a]"
                    }`}
                  >
                    <Flag
                      className={`w-3.5 h-3.5 ${
                        isCurrentFlagged ? "fill-amber-500 text-amber-500" : ""
                      }`}
                    />
                    {isCurrentFlagged ? "Flagged" : "Flag"}
                  </button>
                </div>
              </div>

              <h2 className="font-display text-2xl sm:text-[1.7rem] font-semibold text-[#15172a] leading-snug mb-8">
                {currentQuestion.questionText}
              </h2>

              <div className="space-y-3">
                {options.map((opt, idx) => {
                  const isSelected = selectedOptionForCurrent === opt.letter;
                  return (
                    <button
                      key={opt.letter}
                      type="button"
                      onClick={() => handleSelectOption(opt.letter)}
                      style={{ animationDelay: `${idx * 55}ms` }}
                      className={`reveal-up w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 group cursor-pointer ${
                        isSelected
                          ? "bg-[#fff8f1] border-[#e2630f] shadow-[0_6px_24px_-12px_rgba(226,99,15,0.5)]"
                          : "bg-white border-[#e8e4db] hover:border-[#cfc9bb] hover:bg-[#faf9f6]"
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-base shrink-0 transition-all ${
                          isSelected
                            ? "bg-[#e2630f] text-white"
                            : "bg-[#f4f2ec] text-[#6b6e80] group-hover:bg-[#ece8df]"
                        }`}
                      >
                        {opt.letter}
                      </div>
                      <span
                        className={`flex-1 text-base sm:text-[17px] leading-relaxed ${
                          isSelected
                            ? "text-[#15172a] font-medium"
                            : "text-[#3c3f52]"
                        }`}
                      >
                        {opt.text}
                      </span>
                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-[#e2630f] flex items-center justify-center fade-soft">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-[#e0dccf] group-hover:border-[#cfc9bb] transition-colors" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-9 pt-6 border-t border-[#eceae4] flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => navigateToQuestion(currentIndex - 1)}
                  className="px-5 py-3 rounded-full font-medium text-sm bg-[#f4f2ec] hover:bg-[#ebe8e0] disabled:opacity-40 disabled:pointer-events-none text-[#15172a] flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="hidden sm:block text-xs text-[#9a9a90]">
                  Tip: press A–D or ← →
                </span>
                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => navigateToQuestion(currentIndex + 1)}
                    className="px-6 py-3 rounded-full font-medium text-sm text-white bg-[#15172a] hover:bg-[#242740] flex items-center gap-2 transition-all cursor-pointer"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="px-6 py-3 rounded-full font-medium text-sm text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Review & submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* navigator */}
        <div className="lg:col-span-4 space-y-5">
          <div className="card-premium rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-semibold text-[#15172a]">
                Question map
              </h3>
              <span className="font-data text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f4f2ec] text-[#6b6e80]">
                {answeredCount}/{questions.length}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2.5 mb-5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answers[String(q.id)];
                const isFlagged = !!flaggedIds[String(q.id)];
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => navigateToQuestion(idx)}
                    className={`relative h-11 rounded-xl font-data font-semibold text-xs transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-[#e2630f] text-white shadow-md scale-105"
                        : isAnswered
                        ? "bg-[#15172a] text-white"
                        : "bg-[#f4f2ec] text-[#6b6e80] hover:bg-[#ebe8e0]"
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-xs text-[#6b6e80] pt-4 border-t border-[#eceae4]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#e2630f]" /> Current
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#15172a]" /> Answered (
                {answeredCount})
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#f4f2ec] border border-[#e0dccf]" />{" "}
                Pending ({questions.length - answeredCount})
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" /> Flagged (
                {flaggedCount})
              </div>
            </div>
          </div>

          <div className="card-premium rounded-3xl p-6">
            <h4 className="eyebrow text-[#c4530a] mb-3">Examination rules</h4>
            <ul className="text-sm text-[#5b5e70] space-y-2 leading-relaxed">
              <li>· Pass threshold is 70% — 18 of 25 correct.</li>
              <li>· One correct answer per question; no penalty for wrong.</li>
              <li>· The timer auto-submits when it reaches zero.</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="mt-5 w-full py-3 rounded-full font-medium text-sm text-white bg-[#15172a] hover:bg-[#242740] transition-all cursor-pointer"
            >
              Finish & grade ({answeredCount}/{questions.length})
            </button>
            <button
              type="button"
              onClick={onCancelExam}
              className="mt-2 w-full py-2 rounded-full text-xs font-medium text-[#9a9a90] hover:text-[#15172a] transition-all cursor-pointer"
            >
              Exit without submitting
            </button>
          </div>
        </div>
      </main>

      {/* submit modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-[#15172a]/40 backdrop-blur-sm flex items-center justify-center p-4 fade-soft">
          <div className="card-premium max-w-lg w-full rounded-3xl overflow-hidden">
            <div className="h-1 rule-accent" />
            <div className="p-7 sm:p-9">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-[#15172a] flex items-center justify-center text-[#f9b233]">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-[#15172a]">
                    Submit your assessment?
                  </h3>
                  <p className="text-xs text-[#9a9a90]">
                    Six Sigma Green Belt · Mock Examination
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden border border-[#eceae4] bg-[#eceae4] my-6">
                {[
                  { v: answeredCount, k: "Answered", c: "text-emerald-600" },
                  {
                    v: questions.length - answeredCount,
                    k: "Unanswered",
                    c: "text-rose-600",
                  },
                  { v: flaggedCount, k: "Flagged", c: "text-amber-600" },
                ].map((s) => (
                  <div key={s.k} className="bg-white p-4 text-center">
                    <div className={`font-data text-2xl font-bold ${s.c}`}>
                      {s.v}
                    </div>
                    <div className="eyebrow text-[#9a9a90] mt-0.5">{s.k}</div>
                  </div>
                ))}
              </div>

              {questions.length - answeredCount > 0 && (
                <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-800">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    You have {questions.length - answeredCount} unanswered
                    question(s). These will be marked incorrect.
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowSubmitModal(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-[#6b6e80] hover:text-[#15172a] bg-[#f4f2ec] hover:bg-[#ebe8e0] transition-all cursor-pointer"
                >
                  Keep working
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmSubmit}
                  className="px-6 py-2.5 rounded-full text-sm font-medium text-white bg-[#15172a] hover:bg-[#242740] transition-all cursor-pointer"
                >
                  {isSubmitting ? "Grading…" : "Confirm & view scorecard"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
