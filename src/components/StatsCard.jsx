"use client";
import React, { useState } from 'react';
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

  // Configurar el color de fondo del contenedor
  const getContainerBg = () => {
    switch (colorScheme) {
      case "blue":
        return "bg-blue-900";
      case "green":
        return "bg-green-900";
      case "red":
        return "bg-red-900";
      case "yellow":
        return "bg-amber-900";
      default:
        return "bg-blue-900";
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-black border border-gray-800 rounded-lg p-5 relative overflow-hidden group/card"
    >
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="text-sm font-medium text-gray-400 group-hover/card:text-white transition-colors">{title}</div>
          <div className="text-2xl font-bold text-white mt-1">{value}</div>
          {subValue && <div className="text-xs text-gray-400 group-hover/card:text-white/80 transition-colors mt-1">{subValue}</div>}
        </div>
        <div className="w-12 h-12 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xl">
          {icon}
        </div>
      </div>
      
      {linkText && linkHref && (
        <a href={linkHref} className="mt-4 text-[#38bdf8] text-sm hover:text-[#0ea5e9] flex items-center relative z-10">
          {linkText} <span className="ml-1">→</span>
        </a>
      )}
      
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <CanvasRevealEffect
              containerClassName={getContainerBg()}
              colors={getColors()}
              dotSize={2}
              animationSpeed={5}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatsCard;