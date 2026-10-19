"use client";

import React, { useState } from "react";
import { Question, CandidateAssignment, ExamAttempt } from "@/db/schema";
import { ScorecardView } from "./ScorecardView";
import { CheckMark, CrossMark } from "./SixSigmaVisuals";
import {
  Users,
  BookOpen,
  BarChart3,
  Plus,
  Edit3,
  Trash2,
  Clock,
  Mail,
  Calendar,
  Check,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Award,
  Eye,
  X,
  Save,
  RotateCcw,
} from "lucide-react";

interface AdminDashboardProps {
  questions: Question[];
  assignments: CandidateAssignment[];
  attempts: ExamAttempt[];
  onRefreshData: () => Promise<void>;
  onTestCandidateEmail: (email: string, name: string) => void;
}

type AdminTab = "assignments" | "questions" | "scores";

export function AdminDashboard({
  questions,
  assignments,
  attempts,
  onRefreshData,
  onTestCandidateEmail,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("assignments");
  const [inspectingAttempt, setInspectingAttempt] =
    useState<ExamAttempt | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast((prev) => (prev?.text === text ? null : prev)), 4000);
  };

  const toLocalDateTimeInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  // ---- assignment form ----
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidateEmail, setNewCandidateEmail] = useState("");
  const [newValidFrom, setNewValidFrom] = useState(() =>
    toLocalDateTimeInput(new Date(Date.now() - 5 * 60 * 1000))
  );
  const [newValidUntil, setNewValidUntil] = useState(() =>
    toLocalDateTimeInput(new Date(Date.now() + 48 * 3600 * 1000))
  );
  const [newDuration, setNewDuration] = useState(40);
  const [newNotes, setNewNotes] = useState("");
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);

  const applyTimePreset = (
    preset: "now_48h" | "now_7d" | "express_1h" | "tomorrow_24h"
  ) => {
    const now = new Date();
    const h = 3600 * 1000;
    if (preset === "now_48h") {
      setNewValidFrom(toLocalDateTimeInput(new Date(now.getTime() - 5 * 60000)));
      setNewValidUntil(toLocalDateTimeInput(new Date(now.getTime() + 48 * h)));
    } else if (preset === "now_7d") {
      setNewValidFrom(toLocalDateTimeInput(new Date(now.getTime() - 5 * 60000)));
      setNewValidUntil(toLocalDateTimeInput(new Date(now.getTime() + 7 * 24 * h)));
    } else if (preset === "express_1h") {
      setNewValidFrom(toLocalDateTimeInput(new Date(now.getTime() - 2 * 60000)));
      setNewValidUntil(toLocalDateTimeInput(new Date(now.getTime() + h)));
    } else {
      setNewValidFrom(toLocalDateTimeInput(new Date(now.getTime() + 24 * h)));
      setNewValidUntil(toLocalDateTimeInput(new Date(now.getTime() + 48 * h)));
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidateName.trim() || !newCandidateEmail.trim()) {
      showToast("Provide both a name and an email.", "error");
      return;
    }
    setIsCreatingAssignment(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName: newCandidateName.trim(),
          candidateEmail: newCandidateEmail.trim().toLowerCase(),
          validFrom: new Date(newValidFrom).toISOString(),
          validUntil: new Date(newValidUntil).toISOString(),
          durationMinutes: newDuration,
          notes: newNotes.trim() || "Authorized by administrator",
        }),
      });
      const data = await res.json();
      if (!res.ok) showToast(data.error || "Failed to assign.", "error");
      else {
        showToast(`Assigned ${data.assignment.candidateEmail}.`);
        setNewCandidateName("");
        setNewCandidateEmail("");
        setNewNotes("");
        await onRefreshData();
      }
    } catch {
      showToast("Network error while assigning.", "error");
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  const handleQuickAssignmentAction = async (
    id: number,
    quickAction: "activate_now_48h" | "extend_24h" | "reset_retake"
  ) => {
    try {
      const res = await fetch(`/api/assignments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quickAction }),
      });
      if (res.ok) {
        showToast("Window updated.");
        await onRefreshData();
      } else showToast("Failed to update.", "error");
    } catch {
      showToast("Error updating.", "error");
    }
  };

  const handleDeleteAssignment = async (id: number, email: string) => {
    try {
      const res = await fetch(`/api/assignments/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Revoked access for ${email}.`);
        await onRefreshData();
      }
    } catch {
      showToast("Failed to revoke.", "error");
    }
  };

  // ---- questions ----
  const [questionSearch, setQuestionSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("All");
  const [editingQuestion, setEditingQuestion] =
    useState<Partial<Question> | null>(null);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  const openNewQuestionModal = () => {
    setEditingQuestion({
      questionNumber: questions.length + 1,
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A",
      explanation: "",
      dmaicPhase: "Define",
    });
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    if (
      !editingQuestion.questionText?.trim() ||
      !editingQuestion.optionA?.trim() ||
      !editingQuestion.optionB?.trim() ||
      !editingQuestion.optionC?.trim() ||
      !editingQuestion.optionD?.trim()
    ) {
      showToast("Fill in the question and all four options.", "error");
      return;
    }
    setIsSavingQuestion(true);
    try {
      const isEdit = !!editingQuestion.id;
      const url = isEdit
        ? `/api/questions/${editingQuestion.id}`
        : "/api/questions";
      const method = isEdit ? "PUT" : "POST";
      const safeNumber =
        Number.isFinite(editingQuestion.questionNumber) &&
        (editingQuestion.questionNumber as number) > 0
          ? editingQuestion.questionNumber
          : questions.length + 1;
      const payload = {
        questionNumber: safeNumber,
        questionText: (editingQuestion.questionText || "").trim(),
        optionA: (editingQuestion.optionA || "").trim(),
        optionB: (editingQuestion.optionB || "").trim(),
        optionC: (editingQuestion.optionC || "").trim(),
        optionD: (editingQuestion.optionD || "").trim(),
        correctOption: (editingQuestion.correctOption || "A")
          .toUpperCase()
          .slice(0, 1),
        explanation: (editingQuestion.explanation || "").trim(),
        dmaicPhase: editingQuestion.dmaicPhase || "Define",
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast(
          isEdit ? `Updated question #${safeNumber}.` : `Created question #${safeNumber}.`
        );
        setEditingQuestion(null);
        await onRefreshData();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save.", "error");
      }
    } catch {
      showToast("Error saving question.", "error");
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (q: Question) => {
    try {
      const res = await fetch(`/api/questions/${q.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Deleted question #${q.questionNumber}.`);
        await onRefreshData();
      }
    } catch {
      showToast("Failed to delete.", "error");
    }
  };

  const handleRestoreDefaultQuestions = async () => {
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_defaults" }),
      });
      if (res.ok) {
        showToast("Restored the official 25 questions.");
        await onRefreshData();
      }
    } catch {
      showToast("Failed to restore.", "error");
    }
  };

  const [scoreSearch, setScoreSearch] = useState("");

  if (inspectingAttempt) {
    return (
      <ScorecardView
        attempt={inspectingAttempt}
        questions={questions}
        onBack={() => setInspectingAttempt(null)}
        backLabel="Back to administration"
      />
    );
  }

  const totalAttempts = attempts.length;
  const passedCount = attempts.filter((a) => a.passed).length;
  const passRate =
    totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;
  const avgPercentage =
    totalAttempts > 0
      ? Math.round(
          attempts.reduce((acc, a) => acc + a.percentage, 0) / totalAttempts
        )
      : 0;
  const now = new Date();
  const activeAssignmentsCount = assignments.filter((a) => {
    const f = new Date(a.validFrom);
    const u = new Date(a.validUntil);
    return a.status !== "completed" && now >= f && now <= u;
  }).length;

  const filteredQuestions = questions.filter((q) => {
    if (phaseFilter !== "All" && q.dmaicPhase !== phaseFilter) return false;
    if (!questionSearch.trim()) return true;
    const s = questionSearch.toLowerCase();
    return (
      q.questionText.toLowerCase().includes(s) ||
      q.optionA.toLowerCase().includes(s) ||
      q.optionB.toLowerCase().includes(s) ||
      q.optionC.toLowerCase().includes(s) ||
      q.optionD.toLowerCase().includes(s) ||
      q.explanation.toLowerCase().includes(s)
    );
  });

  const filteredAttempts = attempts.filter((a) => {
    if (!scoreSearch.trim()) return true;
    const s = scoreSearch.toLowerCase();
    return (
      a.candidateName.toLowerCase().includes(s) ||
      a.candidateEmail.toLowerCase().includes(s)
    );
  });

  const kpis = [
    {
      Icon: BookOpen,
      label: "Question bank",
      value: `${questions.length}`,
      sub: "40 min · 70% pass",
      tone: "text-[#c4530a] bg-[#fff6ec] border-[#f0d9bf]",
    },
    {
      Icon: Users,
      label: "Assigned candidates",
      value: `${assignments.length}`,
      sub: `${activeAssignmentsCount} active now`,
      tone: "text-[#6d28d9] bg-[#f6f0ff] border-[#e2d4f5]",
    },
    {
      Icon: Award,
      label: "Completed attempts",
      value: `${totalAttempts}`,
      sub: `${passedCount} certified`,
      tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      Icon: BarChart3,
      label: "Cohort average",
      value: `${avgPercentage}%`,
      sub: `${passRate}% pass rate`,
      tone: "text-amber-700 bg-amber-50 border-amber-200",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 space-y-8 reveal-up">
      {/* toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl border shadow-lg flex items-center gap-3 reveal-up bg-white ${
            toast.type === "success" ? "border-emerald-200" : "border-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckMark className="w-5 h-5" />
          ) : (
            <CrossMark className="w-5 h-5" />
          )}
          <span className="text-sm font-medium text-[#15172a]">{toast.text}</span>
        </div>
      )}

      {/* header + KPIs */}
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div>
            <span className="eyebrow text-[#c4530a]">Administration</span>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#15172a] mt-1">
              Assessment control center
            </h1>
          </div>
          <button
            type="button"
            onClick={onRefreshData}
            className="px-4 py-2.5 rounded-full bg-white border border-[#e8e4db] hover:border-[#cfc9bb] text-sm font-medium text-[#15172a] flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-[#c4530a]" /> Sync
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <div
              key={k.label}
              style={{ animationDelay: `${i * 70}ms` }}
              className="count-up card-premium card-premium-hover rounded-2xl p-5 flex items-start justify-between"
            >
              <div>
                <div className="eyebrow text-[#9a9a90]">{k.label}</div>
                <div className="font-display text-3xl font-semibold text-[#15172a] mt-1.5">
                  {k.value}
                </div>
                <div className="text-xs text-[#747789] mt-0.5">{k.sub}</div>
              </div>
              <div
                className={`w-11 h-11 rounded-xl border flex items-center justify-center ${k.tone}`}
              >
                <k.Icon className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-7">
          {(
            [
              { id: "assignments", label: "Candidates & windows", icon: Users, badge: assignments.length },
              { id: "questions", label: "Questions & answers", icon: BookOpen, badge: questions.length },
              { id: "scores", label: "Scores & sheets", icon: BarChart3, badge: attempts.length },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#15172a] text-white shadow-sm"
                    : "bg-white border border-[#e8e4db] text-[#6b6e80] hover:text-[#15172a]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                <span
                  className={`font-data px-1.5 py-0.5 rounded-full text-[11px] ${
                    isActive ? "bg-white/20 text-white" : "bg-[#f4f2ec] text-[#6b6e80]"
                  }`}
                >
                  {t.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== TAB 1 ===== */}
      {activeTab === "assignments" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 fade-soft">
          <div className="lg:col-span-5">
            <form
              onSubmit={handleCreateAssignment}
              className="card-premium rounded-3xl p-7 space-y-5 lg:sticky lg:top-28"
            >
              <div>
                <span className="eyebrow text-[#c4530a]">New authorization</span>
                <h2 className="font-display text-xl font-semibold text-[#15172a] mt-1">
                  Invite a candidate
                </h2>
                <p className="text-sm text-[#747789] mt-1">
                  Only this email may sit the exam, strictly within the window
                  you set.
                </p>
              </div>

              <div>
                <label className="eyebrow text-[#9a9a90] block mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={newCandidateName}
                  onChange={(e) => setNewCandidateName(e.target.value)}
                  placeholder="e.g. Rohan Deshmukh"
                  className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#e0dccf] text-sm focus:outline-none focus:border-[#e2630f] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="eyebrow text-[#9a9a90] block mb-1.5">
                  Authorized email
                </label>
                <input
                  type="email"
                  required
                  value={newCandidateEmail}
                  onChange={(e) => setNewCandidateEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#e0dccf] text-sm font-data focus:outline-none focus:border-[#e2630f] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <span className="eyebrow text-[#9a9a90] block mb-2">
                  Quick windows
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "now_48h", label: "Active · 48h" },
                    { id: "now_7d", label: "Active · 7d" },
                    { id: "express_1h", label: "Express · 1h" },
                    { id: "tomorrow_24h", label: "Tomorrow" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyTimePreset(p.id as never)}
                      className="px-3 py-2 rounded-xl bg-[#faf9f6] hover:bg-[#fff6ec] border border-[#e8e4db] hover:border-[#f0d9bf] text-xs font-medium text-[#15172a] transition-all cursor-pointer text-left"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="eyebrow text-[#9a9a90] block mb-1.5">
                    Opens
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newValidFrom}
                    onChange={(e) => setNewValidFrom(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#faf9f6] border border-[#e0dccf] text-xs focus:outline-none focus:border-[#e2630f]"
                  />
                </div>
                <div>
                  <label className="eyebrow text-[#9a9a90] block mb-1.5">
                    Closes
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newValidUntil}
                    onChange={(e) => setNewValidUntil(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#faf9f6] border border-[#e0dccf] text-xs focus:outline-none focus:border-[#e2630f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="eyebrow text-[#9a9a90] block mb-1.5">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f6] border border-[#e0dccf] text-sm focus:outline-none focus:border-[#e2630f]"
                  />
                </div>
                <div>
                  <label className="eyebrow text-[#9a9a90] block mb-1.5">
                    Cohort note
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Batch A"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f6] border border-[#e0dccf] text-sm focus:outline-none focus:border-[#e2630f]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingAssignment}
                className="w-full py-3.5 rounded-full font-medium text-sm text-white bg-[#15172a] hover:bg-[#242740] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {isCreatingAssignment ? "Assigning…" : "Authorize & schedule"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7">
            <div className="card-premium rounded-3xl p-6">
              <h3 className="font-display text-lg font-semibold text-[#15172a] mb-1">
                Candidate roster ({assignments.length})
              </h3>
              <p className="text-xs text-[#747789] mb-5">
                Extend windows, allow retakes, or test a sign-in.
              </p>

              <div className="space-y-3.5">
                {assignments.map((a, idx) => {
                  const from = new Date(a.validFrom);
                  const until = new Date(a.validUntil);
                  const isCompleted = a.status === "completed";
                  const isUpcoming = !isCompleted && now < from;
                  const isExpired = !isCompleted && now > until;
                  const isActive = !isCompleted && now >= from && now <= until;
                  const matchingAttempt = attempts.find(
                    (att) =>
                      att.assignmentId === a.id ||
                      att.candidateEmail.toLowerCase() ===
                        a.candidateEmail.toLowerCase()
                  );

                  const badge = isActive
                    ? { t: "Active", c: "bg-emerald-50 text-emerald-700 border-emerald-200" }
                    : isUpcoming
                    ? { t: "Scheduled", c: "bg-amber-50 text-amber-700 border-amber-200" }
                    : isExpired
                    ? { t: "Expired", c: "bg-rose-50 text-rose-700 border-rose-200" }
                    : {
                        t: matchingAttempt
                          ? `Completed · ${matchingAttempt.percentage}%`
                          : "Completed",
                        c: "bg-violet-50 text-violet-700 border-violet-200",
                      };

                  return (
                    <div
                      key={a.id}
                      style={{ animationDelay: `${idx * 45}ms` }}
                      className="reveal-up inset-panel rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="text-base font-semibold text-[#15172a]">
                              {a.candidateName}
                            </h4>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${badge.c}`}
                            >
                              {badge.t}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#6b6e80] font-data mt-1">
                            <Mail className="w-3.5 h-3.5 text-[#c4530a]" />
                            {a.candidateEmail}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onTestCandidateEmail(a.candidateEmail, a.candidateName)
                            }
                            className="px-3 py-1.5 rounded-full bg-[#15172a] hover:bg-[#242740] text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            Test <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteAssignment(a.id, a.candidateEmail)
                            }
                            className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white rounded-xl p-3 border border-[#eceae4]">
                        <div className="flex items-center gap-2 text-[#5b5e70]">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            <strong>From:</strong> {from.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#5b5e70]">
                          <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>
                            <strong>Until:</strong> {until.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-[#9a9a90]">
                          {a.notes || `Duration: ${a.durationMinutes} min`}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {(isExpired || isUpcoming) && (
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickAssignmentAction(a.id, "activate_now_48h")
                              }
                              className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-medium transition-all cursor-pointer"
                            >
                              Activate 48h
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              handleQuickAssignmentAction(a.id, "extend_24h")
                            }
                            className="px-2.5 py-1 rounded-full bg-white hover:bg-[#f4f2ec] border border-[#e0dccf] text-[#6b6e80] text-xs font-medium transition-all cursor-pointer"
                          >
                            +24h
                          </button>
                          {isCompleted && (
                            <>
                              {matchingAttempt && (
                                <button
                                  type="button"
                                  onClick={() => setInspectingAttempt(matchingAttempt)}
                                  className="px-2.5 py-1 rounded-full bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" /> Score
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuickAssignmentAction(a.id, "reset_retake")
                                }
                                className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" /> Retake
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB 2 ===== */}
      {activeTab === "questions" && (
        <div className="space-y-6 fade-soft">
          <div className="card-premium rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <span className="eyebrow text-[#c4530a]">Master key</span>
                <h3 className="font-display text-lg font-semibold text-[#15172a]">
                  Answer key — tap a cell to edit
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRestoreDefaultQuestions}
                  className="px-3.5 py-2 rounded-full bg-white border border-[#e8e4db] hover:border-[#cfc9bb] text-xs font-medium text-[#6b6e80] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#c4530a]" /> Restore 25
                </button>
                <button
                  type="button"
                  onClick={openNewQuestionModal}
                  className="px-4 py-2 rounded-full bg-[#15172a] hover:bg-[#242740] text-white font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add question
                </button>
              </div>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-13 gap-2">
              {questions.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setEditingQuestion(q)}
                  className="p-2 rounded-xl bg-[#faf9f6] hover:bg-[#fff6ec] border border-[#e8e4db] hover:border-[#f0d9bf] text-center transition-all cursor-pointer group"
                >
                  <div className="text-[10px] text-[#9a9a90]">
                    Q{q.questionNumber}
                  </div>
                  <div className="font-display text-base font-bold text-[#c4530a] group-hover:scale-110 transition-transform">
                    {q.correctOption}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 text-[#9a9a90] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                placeholder="Search questions, options, concepts…"
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#e8e4db] text-sm focus:outline-none focus:border-[#e2630f]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {["All", "Define", "Measure", "Analyze", "Improve", "Control"].map(
                (phase) => (
                  <button
                    key={phase}
                    type="button"
                    onClick={() => setPhaseFilter(phase)}
                    className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      phaseFilter === phase
                        ? "bg-[#15172a] text-white"
                        : "bg-white border border-[#e8e4db] text-[#6b6e80] hover:text-[#15172a]"
                    }`}
                  >
                    {phase}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q) => (
              <div key={q.id} className="card-premium card-premium-hover rounded-3xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-data text-sm font-semibold text-[#9a9a90]">
                      #{q.questionNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-medium">
                      {q.dmaicPhase}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                      Key: {q.correctOption}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingQuestion(q)}
                      className="px-3.5 py-1.5 rounded-full bg-[#f4f2ec] hover:bg-[#15172a] hover:text-white text-[#15172a] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q)}
                      className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="font-display text-lg font-semibold text-[#15172a] mb-4">
                  {q.questionText}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {(
                    [
                      { letter: "A", text: q.optionA },
                      { letter: "B", text: q.optionB },
                      { letter: "C", text: q.optionC },
                      { letter: "D", text: q.optionD },
                    ] as const
                  ).map((opt) => {
                    const isCorrect = q.correctOption.toUpperCase() === opt.letter;
                    return (
                      <div
                        key={opt.letter}
                        className={`p-3 rounded-xl border text-sm flex items-center justify-between gap-2 ${
                          isCorrect
                            ? "bg-emerald-50 border-emerald-300 text-[#15172a] font-medium"
                            : "bg-[#faf9f6] border-[#e8e4db] text-[#6b6e80]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-data font-bold text-xs ${
                              isCorrect
                                ? "bg-emerald-500 text-white"
                                : "bg-[#f4f2ec] text-[#6b6e80]"
                            }`}
                          >
                            {opt.letter}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {isCorrect && (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="inset-panel rounded-xl p-3 text-sm text-[#5b5e70]">
                  <strong className="text-[#15172a]">Explanation: </strong>
                  {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TAB 3 ===== */}
      {activeTab === "scores" && (
        <div className="fade-soft">
          <div className="card-premium rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <span className="eyebrow text-[#c4530a]">Evaluation ledger</span>
                <h2 className="font-display text-xl font-semibold text-[#15172a]">
                  Candidate scores
                </h2>
              </div>
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-[#9a9a90] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={scoreSearch}
                  onChange={(e) => setScoreSearch(e.target.value)}
                  placeholder="Filter by name or email…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#faf9f6] border border-[#e8e4db] text-xs focus:outline-none focus:border-[#e2630f]"
                />
              </div>
            </div>

            {filteredAttempts.length === 0 ? (
              <div className="text-center py-14 text-[#9a9a90]">
                No candidate attempts match your filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#eceae4] eyebrow text-[#9a9a90]">
                      <th className="py-3.5 px-4">Candidate</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Score</th>
                      <th className="py-3.5 px-4">Result</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Submitted</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceae4] text-sm">
                    {filteredAttempts.map((att) => (
                      <tr key={att.id} className="hover:bg-[#faf9f6] transition-colors">
                        <td className="py-4 px-4 font-semibold text-[#15172a]">
                          {att.candidateName}
                        </td>
                        <td className="py-4 px-4 text-xs text-[#6b6e80] font-data">
                          {att.candidateEmail}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-data font-semibold text-[#15172a]">
                              {att.percentage}%
                            </span>
                            <div className="w-16 h-1.5 bg-[#eceae4] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  att.passed ? "bg-emerald-500" : "bg-rose-400"
                                }`}
                                style={{ width: `${att.percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {att.passed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3.5 h-3.5" /> Pass
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertCircle className="w-3.5 h-3.5" /> Below 70%
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-[#6b6e80] font-data">
                          {Math.floor(att.timeSpentSeconds / 60)}m{" "}
                          {att.timeSpentSeconds % 60}s
                        </td>
                        <td className="py-4 px-4 text-xs text-[#9a9a90]">
                          {new Date(att.submittedAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setInspectingAttempt(att)}
                            className="px-3.5 py-2 rounded-full bg-[#15172a] hover:bg-[#242740] text-white font-medium text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== QUESTION MODAL ===== */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-[#15172a]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto fade-soft">
          <form
            onSubmit={handleSaveQuestion}
            className="card-premium max-w-2xl w-full rounded-3xl overflow-hidden my-8"
          >
            <div className="h-1 rule-accent" />
            <div className="p-7 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#eceae4]">
                <div>
                  <span className="eyebrow text-[#c4530a]">Question editor</span>
                  <h3 className="font-display text-xl font-semibold text-[#15172a]">
                    {editingQuestion.id
                      ? `Edit question #${editingQuestion.questionNumber}`
                      : "New question"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="p-2 rounded-full bg-[#f4f2ec] hover:bg-[#ebe8e0] text-[#6b6e80] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="eyebrow text-[#9a9a90] block mb-1">No.</label>
                  <input
                    type="number"
                    required
                    value={editingQuestion.questionNumber ?? 1}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        questionNumber: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f6] border border-[#e0dccf] text-sm focus:outline-none focus:border-[#e2630f]"
                  />
                </div>
                <div>
                  <label className="eyebrow text-[#9a9a90] block mb-1">
                    Phase
                  </label>
                  <select
                    value={editingQuestion.dmaicPhase || "Define"}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        dmaicPhase: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f6] border border-[#e0dccf] text-sm focus:outline-none focus:border-[#e2630f]"
                  >
                    {["Define", "Measure", "Analyze", "Improve", "Control"].map(
                      (p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="eyebrow text-emerald-600 block mb-1">
                    Correct key
                  </label>
                  <select
                    value={editingQuestion.correctOption || "A"}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        correctOption: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 font-semibold text-sm focus:outline-none"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="eyebrow text-[#9a9a90] block mb-1">
                  Question stem
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingQuestion.questionText || ""}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      questionText: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#faf9f6] border border-[#e0dccf] text-sm focus:outline-none focus:border-[#e2630f]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["A", "B", "C", "D"] as const).map((letter) => {
                  const fieldKey = `option${letter}` as
                    | "optionA"
                    | "optionB"
                    | "optionC"
                    | "optionD";
                  const isCorrect = editingQuestion.correctOption === letter;
                  return (
                    <div key={letter}>
                      <label className="flex items-center justify-between eyebrow text-[#9a9a90] mb-1">
                        <span>Option {letter}</span>
                        {isCorrect && (
                          <span className="text-emerald-600 normal-case tracking-normal">
                            ★ correct
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        value={editingQuestion[fieldKey] || ""}
                        onChange={(e) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            [fieldKey]: e.target.value,
                          })
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f6] border text-sm focus:outline-none ${
                          isCorrect
                            ? "border-emerald-400"
                            : "border-[#e0dccf] focus:border-[#e2630f]"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="eyebrow text-[#9a9a90] block mb-1">
                  Explanation
                </label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ""}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      explanation: e.target.value,
                    })
                  }
                  placeholder="Why is the correct option right?"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#faf9f6] border border-[#e0dccf] text-sm focus:outline-none focus:border-[#e2630f]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eceae4]">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-5 py-2.5 rounded-full bg-[#f4f2ec] hover:bg-[#ebe8e0] text-[#6b6e80] text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuestion}
                  className="px-6 py-2.5 rounded-full bg-[#15172a] hover:bg-[#242740] text-white font-medium text-sm flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isSavingQuestion ? "Saving…" : "Save question"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
