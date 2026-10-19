"use client";

import React from "react";

interface MleapsLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  withWordmark?: boolean;
  className?: string;
}

export function MleapsLogo({
  size = "md",
  className = "",
}: MleapsLogoProps) {
  const dimensions = {
    xs: { width: 118, height: 47 },
    sm: { width: 150, height: 60 },
    md: { width: 190, height: 76 },
    lg: { width: 250, height: 100 },
    xl: { width: 320, height: 128 },
  }[size];

  return (
    <div className={`inline-flex items-center select-none group ${className}`}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 460 185"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <linearGradient
            id="mlOrange"
            x1="20"
            y1="145"
            x2="185"
            y2="12"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#F2690F" />
            <stop offset="52%" stopColor="#F5921B" />
            <stop offset="100%" stopColor="#F9B233" />
          </linearGradient>
          <linearGradient
            id="mlPurple"
            x1="145"
            y1="40"
            x2="430"
            y2="155"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#6D28D9" />
            <stop offset="50%" stopColor="#5B21B6" />
            <stop offset="100%" stopColor="#3B1484" />
          </linearGradient>
        </defs>

        <g className="transition-transform duration-500 ease-out group-hover:-translate-y-[1px]">
          <path
            d="M 24 134 L 24 34 L 44 34 L 96 86 L 154 28 L 141 18 L 185 8 L 173 50 L 164 38 L 96 106 L 42 52 L 42 134 Z"
            fill="url(#mlOrange)"
          />
          <path
            d="M 54 74 L 96 116 L 146 66 L 146 84 L 96 134 L 54 92 Z"
            fill="url(#mlOrange)"
          />
        </g>

        <g>
          <path
            d="M 146 65 L 168 43 L 168 134 L 146 134 Z"
            fill="url(#mlPurple)"
          />
          <text
            x="174"
            y="134"
            fill="url(#mlPurple)"
            fontFamily="'Fraunces', Georgia, serif"
            fontWeight="800"
            fontSize="94"
            letterSpacing="-3"
          >
            eaps
          </text>
        </g>

        <text
          x="24"
          y="167"
          fill="#2A2C3E"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="600"
          fontSize="20"
          letterSpacing="14.5"
        >
          CONSULTING
        </text>
      </svg>
    </div>
  );
}
