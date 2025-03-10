"use client";
import React, { useState } from 'react';
// Cambiar la importación para usar framer-motion directamente
import { AnimatePresence, motion } from "framer-motion";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";

const StatsCard = ({ icon, title, value, subValue, linkText, linkHref, colorScheme = "blue" }) => {
  const [hovered, setHovered] = useState(false);
  
  // Configurar colores basados en el esquema
  const getColors = () => {
    switch (colorScheme) {
      case "blue":
        return [[56, 189, 248]]; // #38bdf8
      case "green":
        return [[74, 222, 128]]; // #4ade80
      case "red":
        return [[248, 113, 113]]; // #f87171
      case "yellow":
        return [[251, 191, 36]]; // #fbbf24
      default:
        return [[56, 189, 248]];
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-[#1e293b] border border-[#334155] rounded-lg p-5 relative overflow-hidden"
    >
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="text-sm font-medium text-[#94a3b8]">{title}</div>
          <div className="text-2xl font-bold text-white mt-1">{value}</div>
          {subValue && <div className="text-xs text-[#94a3b8] mt-1">{subValue}</div>}
        </div>
        <div className="w-12 h-12 rounded-lg bg-[#334155] text-white flex items-center justify-center text-xl">
          {icon}
        </div>
      </div>
      
      {linkText && linkHref && (
        <a href={linkHref} className="mt-4 text-[#38bdf8] text-sm hover:text-[#0ea5e9] flex items-center relative z-10">
          {linkText} <span className="ml-1">→</span>
        </a>
      )}
      
      {/* Simplificamos el efecto para asegurar que funcione */}
      {hovered && (
        <div className="absolute inset-0">
          <CanvasRevealEffect
            containerClassName="bg-transparent"
            colors={getColors()}
            dotSize={2}
            animationSpeed={5}
            opacities={[0.1, 0.1, 0.1, 0.2, 0.2, 0.3, 0.3, 0.4, 0.5, 0.6]}
          />
        </div>
      )}
    </div>
  );
};

export default StatsCard;