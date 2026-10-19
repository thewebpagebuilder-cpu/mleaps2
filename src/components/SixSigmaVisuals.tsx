"use client";

import React from "react";

export function CheckMark({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="14" cy="14" r="12.5" className="fill-emerald-50 stroke-emerald-500" strokeWidth="1.5" />
      <path
        d="M8.5 14.3L12.2 18L19.6 10.2"
        stroke="#059669"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="30"
        className="animate-[drawStroke_0.5s_ease-out_forwards]"
      />
    </svg>
  );
}

export function CrossMark({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="14" cy="14" r="12.5" className="fill-rose-50 stroke-rose-400" strokeWidth="1.5" />
      <path
        d="M9.5 9.5L18.5 18.5"
        stroke="#e11d48"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="30"
        className="animate-[drawStroke_0.4s_ease-out_forwards]"
      />
      <path
        d="M18.5 9.5L9.5 18.5"
        stroke="#e11d48"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="30"
        className="animate-[drawStroke_0.5s_ease-out_forwards]"
      />
    </svg>
  );
}

const DMAIC = [
  { letter: "D", name: "Define", desc: "Charter · VOC · CTQ" },
  { letter: "M", name: "Measure", desc: "Baseline · Gage R&R" },
  { letter: "A", name: "Analyze", desc: "Pareto · FMEA" },
  { letter: "I", name: "Improve", desc: "Kaizen · Poka-Yoke" },
  { letter: "C", name: "Control", desc: "SPC · Control Plan" },
];

export function DmaicJourney() {
  return (
    <div className="grid grid-cols-5 gap-px rounded-2xl overflow-hidden border border-[#e8e4db] bg-[#e8e4db]">
      {DMAIC.map((s, i) => (
        <div
          key={s.name}
          style={{ animationDelay: `${i * 90}ms` }}
          className="reveal-up bg-white px-3 py-4 text-center group hover:bg-[#faf7f2] transition-colors"
        >
          <div className="w-9 h-9 mx-auto mb-2 rounded-full border border-[#e8d9c4] bg-gradient-to-br from-[#fff7ed] to-[#f3e8ff] flex items-center justify-center font-display font-bold text-[#c4530a] text-sm group-hover:scale-110 transition-transform">
            {s.letter}
          </div>
          <div className="text-xs font-semibold text-[#15172a]">{s.name}</div>
          <div className="text-[10px] text-[#9a9a90] mt-0.5 leading-tight">
            {s.desc}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BellCurvePanel() {
  return (
    <div className="card-premium rounded-3xl p-7 relative overflow-hidden">
      <div className="flex items-start justify-between mb-5">
        <div>
          <span className="eyebrow text-[#c4530a]">Statistical Target</span>
          <h3 className="font-display text-xl font-semibold text-[#15172a] mt-1">
            The Six Sigma Standard
          </h3>
          <p className="text-sm text-[#747789] mt-1">
            A 6σ process delivers just{" "}
            <span className="font-data font-semibold text-[#15172a]">3.4</span>{" "}
            defects per million opportunities.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-data text-2xl font-bold text-[#15172a]">
            99.99966%
          </div>
          <div className="text-[11px] text-[#9a9a90] uppercase tracking-wider">
            Yield
          </div>
        </div>
      </div>

      <div className="inset-panel rounded-2xl p-4 mb-6">
        <svg
          viewBox="0 0 500 150"
          className="w-full h-32 overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bellFill" x1="0" y1="0" x2="500" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.04" />
              <stop offset="35%" stopColor="#f97316" stopOpacity="0.16" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.22" />
              <stop offset="65%" stopColor="#7c3aed" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="bellLine" x1="0" y1="0" x2="500" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e2630f" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
          </defs>

          <line x1="20" y1="124" x2="480" y2="124" stroke="#dcd7cb" strokeWidth="1" />
          <line x1="70" y1="20" x2="70" y2="124" stroke="#e5a3ad" strokeWidth="1.2" strokeDasharray="4 4" />
          <text x="52" y="15" fill="#be123c" fontSize="9.5" fontWeight="700" fontFamily="monospace">LSL</text>
          <line x1="430" y1="20" x2="430" y2="124" stroke="#e5a3ad" strokeWidth="1.2" strokeDasharray="4 4" />
          <text x="412" y="15" fill="#be123c" fontSize="9.5" fontWeight="700" fontFamily="monospace">USL</text>
          <line x1="250" y1="18" x2="250" y2="124" stroke="#d6a93b" strokeWidth="1.2" strokeDasharray="3 3" />
          <text x="236" y="13" fill="#b45309" fontSize="9.5" fontWeight="700" fontFamily="monospace">μ</text>

          <path
            d="M 25 124 C 110 124, 160 118, 196 66 C 221 28, 236 18, 250 18 C 264 18, 279 28, 304 66 C 340 118, 390 124, 475 124 Z"
            fill="url(#bellFill)"
          />
          <path
            d="M 25 124 C 110 124, 160 118, 196 66 C 221 28, 236 18, 250 18 C 264 18, 279 28, 304 66 C 340 118, 390 124, 475 124"
            stroke="url(#bellLine)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />

          {[
            { x: 70, l: "-6σ" },
            { x: 130, l: "-3σ" },
            { x: 250, l: "0" },
            { x: 370, l: "+3σ" },
            { x: 430, l: "+6σ" },
          ].map((m) => (
            <g key={m.l}>
              <circle cx={m.x} cy="124" r="2.5" fill="#c4530a" />
              <text x={m.x} y="140" textAnchor="middle" fill="#8f9079" fontSize="9" fontFamily="monospace">
                {m.l}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <DmaicJourney />
    </div>
  );
}
