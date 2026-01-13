
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Prize, WheelConfig } from '../types';

interface WheelProps {
  prizes: Prize[];
  config: WheelConfig;
  onSpinEnd: (prize: Prize) => void;
  isSpinning: boolean;
}

const Wheel: React.FC<WheelProps> = ({ prizes, config, onSpinEnd, isSpinning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  const [imageElements, setImageElements] = useState<Record<string, HTMLImageElement>>({});

  const activePrizes = useMemo(() => prizes.filter(p => p.enabled), [prizes]);
  const totalWeight = useMemo(() => activePrizes.reduce((sum, p) => sum + p.probability, 0), [activePrizes]);

  useEffect(() => {
    activePrizes.forEach(prize => {
      if (prize.image && !imageElements[prize.id]) {
        const img = new Image();
        img.src = prize.image;
        img.onload = () => setImageElements(prev => ({ ...prev, [prize.id]: img }));
      }
    });
  }, [activePrizes]);

  const easeOutBack = (x: number, intensity: number): number => {
    const c1 = 1.70158 * (intensity / 3);
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };

  const drawWheel = (currentRotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 25;

    ctx.clearRect(0, 0, size, size);

    // 外圈
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e3c78';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 6;
    ctx.stroke();

    if (activePrizes.length === 0) return;

    let startAngle = currentRotation;

    activePrizes.forEach((prize) => {
      const sliceAngle = (prize.probability / totalWeight) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;
      ctx.font = 'bold 15px "Noto Sans TC"';
      
      const probText = config.showProbabilityOnWheel 
        ? ` (${((prize.probability / totalWeight) * 100).toFixed(0)}%)` 
        : '';
      
      ctx.fillText(prize.label + probText, radius - 55, 6);

      const img = imageElements[prize.id];
      if (img) {
        ctx.drawImage(img, radius - 45, -18, 34, 34);
      } else if (prize.icon) {
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(prize.icon, radius - 30, 10);
      }
      
      ctx.restore();
      startAngle += sliceAngle;
    });

    // 中心
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFD54F';
    ctx.fill();
    ctx.strokeStyle = '#F9A825';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('★', centerX, centerY + 10);
  };

  useEffect(() => {
    drawWheel(rotation);
  }, [activePrizes, rotation, imageElements, config.showProbabilityOnWheel]);

  useEffect(() => {
    if (!isSpinning || activePrizes.length === 0) return;

    const startTime = Date.now();
    const duration = config.duration * 1000;
    const directionMult = config.direction === 'cw' ? 1 : -1;
    
    const randomVal = Math.random() * totalWeight;
    let accumulated = 0;
    let winnerIndex = 0;
    for (let i = 0; i < activePrizes.length; i++) {
      accumulated += activePrizes[i].probability;
      if (randomVal <= accumulated) { winnerIndex = i; break; }
    }

    let winnerStartWeight = 0;
    for (let i = 0; i < winnerIndex; i++) winnerStartWeight += activePrizes[i].probability;
    const winnerRangeStartAngle = (winnerStartWeight / totalWeight) * 2 * Math.PI;
    const winnerRangeEndAngle = ((winnerStartWeight + activePrizes[winnerIndex].probability) / totalWeight) * 2 * Math.PI;
    const winnerTargetAngle = (winnerRangeStartAngle + winnerRangeEndAngle) / 2;

    const startRot = rotationRef.current % (Math.PI * 2);
    const baseRotations = config.rotations * 2 * Math.PI;
    
    let finalTargetAngle = (2 * Math.PI - winnerTargetAngle) - (Math.PI / 2);
    while(finalTargetAngle < 0) finalTargetAngle += Math.PI * 2;
    
    const targetRotation = directionMult * (baseRotations + finalTargetAngle);
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const ease = easeOutBack(progress, config.bounceIntensity);
      const currentRot = startRot + (targetRotation * ease);
      setRotation(currentRot);
      rotationRef.current = currentRot;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => onSpinEnd(activePrizes[winnerIndex]), 400);
      }
    };

    requestAnimationFrame(animate);
  }, [isSpinning]);

  return (
    <div className="relative">
      <div className="absolute top-[-45px] left-1/2 -translate-x-1/2 z-20 animate-leaf drop-shadow-2xl">
        <svg width="55" height="55" viewBox="0 0 24 24" fill="#E53935" className="rotate-180 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
        </svg>
      </div>
      <canvas 
        ref={canvasRef} 
        width={550} 
        height={550} 
        className="rounded-full shadow-2xl border-8 border-white/40 bg-white/5" 
      />
    </div>
  );
};

export default Wheel;
