'use client';

import React, { useEffect, useRef } from 'react';
import { DivisionPodium } from '../../types/organizer';
import { Trophy, Medal, Award, Sparkles } from 'lucide-react';

interface TvOlympicPodiumProps {
  podium: DivisionPodium;
  divisionName?: string;
  subtitle?: string;
  themeMode?: 'dark' | 'green' | 'light';
}

export const TvOlympicPodium: React.FC<TvOlympicPodiumProps> = ({
  podium,
  divisionName,
  subtitle = 'Official Podium · Medal Ceremony Completed',
  themeMode = 'dark',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Celebratory victory confetti particle physics engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#fbbf24', '#f59e0b', '#10b981', '#38bdf8', '#cbd5e1', '#ffffff', '#ec4899'];
    const particleCount = 75;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      r: Math.random() * 5 + 3,
      d: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngleInc: Math.random() * 0.05 + 0.03,
      tiltAngle: 0,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleInc;
        p.y += (Math.cos(p.d) + 1 + p.r / 2) * 0.55;
        p.x += Math.sin(p.d) * 0.9;
        p.tilt = Math.sin(p.tiltAngle) * 12;

        if (p.y > height) {
          p.x = Math.random() * width;
          p.y = -15;
        }

        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const { gold, silver, bronze } = podium;
  const isLight = themeMode === 'light';

  return (
    <div className="relative w-full min-h-[520px] h-full flex flex-col justify-end items-center overflow-hidden pb-4 select-none">
      {/* Confetti celebration canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10 w-full h-full" />

      {/* Podium Structure Grid (Silver #2, Gold #1, Bronze #3) */}
      <div className="relative z-20 w-full max-w-[1240px] grid grid-cols-3 items-end gap-4 md:gap-8 px-4 h-full">
        {/* ========================================================
            #2 SILVER PEDESTAL (LEFT, MID HEIGHT ~190px)
            ======================================================== */}
        <div className="flex flex-col items-center justify-end h-full">
          {/* Athlete Platform Floating Above Pedestal */}
          <div className="flex flex-col items-center text-center mb-4 w-full animate-fade-in">
            <div
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs md:text-sm font-black tracking-wider uppercase border-2 shadow-sm mb-2.5 ${
                isLight
                  ? 'bg-slate-200 border-slate-400 text-slate-800'
                  : 'bg-gradient-to-r from-slate-300/30 via-slate-200/20 to-slate-400/30 border-slate-200 text-slate-100 shadow-[0_0_20px_rgba(203,213,225,0.35)] backdrop-blur'
              }`}
            >
              <Medal size={16} className={isLight ? 'text-slate-700' : 'text-slate-200'} />
              <span>Silver Medalist</span>
            </div>
            <h3
              className={`font-black text-xl md:text-3xl tracking-tight line-clamp-2 ${
                isLight
                  ? 'text-slate-900 drop-shadow-none font-black'
                  : 'text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]'
              }`}
            >
              {silver.team}
            </h3>
            <div
              className={`text-[11px] md:text-xs font-semibold flex items-center gap-2 mt-1 ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              <span>{silver.seed || '#2 Seed'}</span>
              <span>&bull;</span>
              <span className="truncate max-w-[180px]">{silver.club || 'Finalist'}</span>
            </div>
            {silver.score && (
              <div
                className={`mt-2 text-[10px] md:text-xs font-mono font-bold px-2.5 py-1 rounded shadow-sm ${
                  isLight
                    ? 'bg-white border border-slate-300 text-slate-800'
                    : 'bg-black/50 border border-slate-600/60 text-slate-200'
                }`}
              >
                {silver.score}
              </div>
            )}
          </div>

          {/* 3D Tiered Pedestal Block */}
          <div
            className="w-full h-[180px] md:h-[200px] rounded-t-2xl relative flex flex-col items-center justify-start pt-4 overflow-hidden border-t-4 border-l-2 border-r-2 border-t-slate-200 border-l-slate-400/60 border-r-slate-500/60 shadow-[0_20px_40px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.25)]"
            style={{
              background: 'linear-gradient(180deg, #475569 0%, #334155 45%, #1e293b 100%)',
            }}
          >
            {/* Top Lip Specular Reflection Highlight */}
            <div
              className="absolute top-0 left-0 right-0 h-3 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)',
              }}
            />

            {/* Giant Embossed Metallic Rank Number 2 */}
            <span
              className="font-black text-6xl md:text-8xl leading-none select-none tracking-tighter drop-shadow-[0_6px_14px_rgba(0,0,0,0.8)] font-sans"
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              2
            </span>
            <span className="text-sm md:text-lg tracking-widest uppercase text-slate-300 font-bold opacity-90 mt-1">
              Silver
            </span>
          </div>
        </div>

        {/* ========================================================
            #1 GOLD PEDESTAL (CENTER, TALLEST HEIGHT ~260px)
            ======================================================== */}
        <div className="flex flex-col items-center justify-end h-full">
          {/* Athlete Platform Floating Above Pedestal */}
          <div className="flex flex-col items-center text-center mb-4 w-full animate-fade-in scale-105">
            <div
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs md:text-base font-black tracking-wider uppercase border-2 shadow-sm mb-2.5 ${
                isLight
                  ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-md'
                  : 'bg-gradient-to-r from-amber-400/35 via-yellow-300/30 to-amber-500/35 border-yellow-300 text-yellow-200 shadow-[0_0_30px_rgba(251,191,36,0.5)] backdrop-blur'
              }`}
            >
              <Trophy size={18} className={isLight ? 'text-amber-600 animate-pulse' : 'text-yellow-300 animate-pulse'} />
              <span>Tournament Champions</span>
              <Sparkles size={16} className={isLight ? 'text-amber-600' : 'text-yellow-300'} />
            </div>
            <h2
              className={`font-black text-2xl md:text-4xl tracking-tight line-clamp-2 ${
                isLight
                  ? 'text-slate-950 drop-shadow-none font-black'
                  : 'text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]'
              }`}
            >
              {gold.team}
            </h2>
            <div
              className={`text-xs md:text-sm font-semibold flex items-center gap-2 mt-1 ${
                isLight ? 'text-amber-900 font-bold' : 'text-amber-200'
              }`}
            >
              <span>{gold.seed || '#1 Seed'}</span>
              <span>&bull;</span>
              <span className="truncate max-w-[220px]">{gold.club || 'Tournament Champion'}</span>
            </div>
            {gold.score && (
              <div
                className={`mt-2 text-xs md:text-sm font-mono font-black px-3.5 py-1 rounded shadow-sm ${
                  isLight
                    ? 'bg-amber-100 border-2 border-amber-400 text-amber-950'
                    : 'bg-black/60 border-2 border-amber-400/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                }`}
              >
                {gold.score}
              </div>
            )}
          </div>

          {/* 3D Tiered Pedestal Block */}
          <div
            className="w-full h-[240px] md:h-[280px] rounded-t-2xl relative flex flex-col items-center justify-start pt-5 overflow-hidden border-t-4 border-l-2 border-r-2 border-t-yellow-300 border-l-amber-500/80 border-r-amber-700/80 shadow-[0_25px_50px_rgba(0,0,0,0.8),inset_0_2px_6px_rgba(255,255,255,0.4)]"
            style={{
              background: 'linear-gradient(180deg, #b45309 0%, #78350f 45%, #451a03 100%)',
            }}
          >
            {/* Top Lip Specular Reflection Highlight */}
            <div
              className="absolute top-0 left-0 right-0 h-4 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, transparent 100%)',
              }}
            />

            {/* Giant Embossed Metallic Rank Number 1 */}
            <span
              className="font-black text-7xl md:text-9xl leading-none select-none tracking-tighter drop-shadow-[0_8px_18px_rgba(0,0,0,0.8)] font-sans"
              style={{
                background: 'linear-gradient(180deg, #fef08a 0%, #ca8a04 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              1
            </span>
            <span className="text-base md:text-xl tracking-widest uppercase text-yellow-200 font-extrabold opacity-95 mt-1">
              Champion
            </span>
          </div>
        </div>

        {/* ========================================================
            #3 BRONZE PEDESTAL (RIGHT, LOWEST HEIGHT ~140px)
            ======================================================== */}
        <div className="flex flex-col items-center justify-end h-full">
          {/* Athlete Platform Floating Above Pedestal */}
          <div className="flex flex-col items-center text-center mb-4 w-full animate-fade-in">
            <div
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs md:text-sm font-black tracking-wider uppercase border-2 shadow-sm mb-2.5 ${
                isLight
                  ? 'bg-orange-100 border-orange-400 text-orange-950 shadow-md'
                  : 'bg-gradient-to-r from-amber-600/30 via-orange-500/20 to-amber-700/30 border-orange-300 text-orange-200 shadow-[0_0_20px_rgba(217,119,6,0.35)] backdrop-blur'
              }`}
            >
              <Award size={16} className={isLight ? 'text-orange-600' : 'text-orange-300'} />
              <span>Bronze Medalist</span>
            </div>
            <h3
              className={`font-black text-xl md:text-3xl tracking-tight line-clamp-2 ${
                isLight
                  ? 'text-slate-900 drop-shadow-none font-black'
                  : 'text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]'
              }`}
            >
              {bronze.team}
            </h3>
            <div
              className={`text-[11px] md:text-xs font-semibold flex items-center gap-2 mt-1 ${
                isLight ? 'text-orange-900 font-bold' : 'text-orange-200/80'
              }`}
            >
              <span>{bronze.seed || '#3 Seed'}</span>
              <span>&bull;</span>
              <span className="truncate max-w-[180px]">{bronze.club || '3rd Place'}</span>
            </div>
            {bronze.score && (
              <div
                className={`mt-2 text-[10px] md:text-xs font-mono font-bold px-2.5 py-1 rounded shadow-sm ${
                  isLight
                    ? 'bg-white border border-orange-300 text-slate-800'
                    : 'bg-black/50 border border-orange-700/60 text-orange-200'
                }`}
              >
                {bronze.score}
              </div>
            )}
          </div>

          {/* 3D Tiered Pedestal Block */}
          <div
            className="w-full h-[140px] md:h-[160px] rounded-t-2xl relative flex flex-col items-center justify-start pt-4 overflow-hidden border-t-4 border-l-2 border-r-2 border-t-orange-300 border-l-amber-700/70 border-r-amber-900/70 shadow-[0_20px_40px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.25)]"
            style={{
              background: 'linear-gradient(180deg, #92400e 0%, #78350f 45%, #451a03 100%)',
            }}
          >
            {/* Top Lip Specular Reflection Highlight */}
            <div
              className="absolute top-0 left-0 right-0 h-3 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)',
              }}
            />

            {/* Giant Embossed Metallic Rank Number 3 */}
            <span
              className="font-black text-6xl md:text-8xl leading-none select-none tracking-tighter drop-shadow-[0_6px_14px_rgba(0,0,0,0.8)] font-sans"
              style={{
                background: 'linear-gradient(180deg, #fed7aa 0%, #c2410c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              3
            </span>
            <span className="text-sm md:text-lg tracking-widest uppercase text-orange-200 font-bold opacity-90 mt-1">
              Bronze
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
