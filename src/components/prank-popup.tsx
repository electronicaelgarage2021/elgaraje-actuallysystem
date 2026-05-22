"use client";

import { useState, useEffect } from "react";

const EMOJIS = ["💖", "🌸", "💜", "🌺", "💗", "🌷", "💛", "🌻", "💚", "🌹", "💕", "🌼", "🩷", "🪻", "🩵", "🌈"];
const COLORS = ["#FF00FF", "#FF1493", "#FF69B4", "#FFD700", "#00FF7F", "#00FFFF", "#FF4500", "#DA70D6", "#7FFF00", "#FF6EC7"];

interface Particle {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export function PrankPopup() {
  const [show, setShow] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const p: Particle[] = [];
    for (let i = 0; i < 60; i++) {
      p.push({
        id: i,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 4,
        size: 16 + Math.random() * 28,
      });
    }
    setParticles(p);
    setShow(true);
  }, []);

  if (!show) return null;

  const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

  return (
    <div
      onClick={() => setShow(false)}
      className="fixed inset-0 z-[9999] flex items-center justify-center cursor-pointer"
      style={{ background: "radial-gradient(circle, #1a0030 0%, #0a0015 100%)" }}
    >
      <style>{`
        @keyframes prank-fall {
          0% { transform: translateY(-60px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.6; }
        }
        @keyframes prank-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes prank-glow {
          0% { text-shadow: 0 0 20px #ff00ff, 0 0 40px #ff00ff; }
          25% { text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff; }
          50% { text-shadow: 0 0 20px #ffff00, 0 0 40px #ffff00; }
          75% { text-shadow: 0 0 20px #ff4500, 0 0 40px #ff4500; }
          100% { text-shadow: 0 0 20px #ff00ff, 0 0 40px #ff00ff; }
        }
        @keyframes prank-rainbow {
          0% { color: #FF00FF; }
          16% { color: #FF4500; }
          33% { color: #FFD700; }
          50% { color: #00FF7F; }
          66% { color: #00FFFF; }
          83% { color: #DA70D6; }
          100% { color: #FF00FF; }
        }
        @keyframes prank-border {
          0% { border-color: #FF00FF; box-shadow: 0 0 30px #FF00FF44, inset 0 0 30px #FF00FF22; }
          25% { border-color: #00FFFF; box-shadow: 0 0 30px #00FFFF44, inset 0 0 30px #00FFFF22; }
          50% { border-color: #FFD700; box-shadow: 0 0 30px #FFD70044, inset 0 0 30px #FFD70022; }
          75% { border-color: #FF4500; box-shadow: 0 0 30px #FF450044, inset 0 0 30px #FF450022; }
          100% { border-color: #FF00FF; box-shadow: 0 0 30px #FF00FF44, inset 0 0 30px #FF00FF22; }
        }
      `}</style>

      {/* Falling emojis */}
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "fixed",
            left: `${p.left}%`,
            top: -60,
            fontSize: p.size,
            animation: `prank-fall ${p.duration}s ${p.delay}s linear infinite`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* Main content */}
      <div
        className="relative z-10 text-center px-8 py-12 rounded-3xl max-w-lg mx-4"
        style={{
          background: "rgba(20, 0, 40, 0.85)",
          backdropFilter: "blur(20px)",
          border: "3px solid #FF00FF",
          animation: "prank-pulse 2s ease-in-out infinite, prank-border 3s linear infinite",
        }}
      >
        <div className="text-6xl mb-4">
          {"👑"}
        </div>
        <h1
          className="text-3xl md:text-4xl font-black mb-3 leading-tight"
          style={{
            animation: "prank-rainbow 3s linear infinite, prank-glow 3s linear infinite",
            fontFamily: "'Anton', sans-serif",
            letterSpacing: 2,
          }}
        >
          Hecho por tu reina<br />de la primavera
        </h1>
        <div className="text-4xl mt-4 flex justify-center gap-2">
          {["🌸", "💖", "🌺", "💗", "🌷"].map((e, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                animation: `prank-pulse 1.5s ${i * 0.2}s ease-in-out infinite`,
              }}
            >
              {e}
            </span>
          ))}
        </div>
        <p className="text-gray-500 text-xs mt-6">toca para cerrar</p>
      </div>
    </div>
  );
}
