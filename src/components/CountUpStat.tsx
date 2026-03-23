"use client";

import { useEffect, useRef, useState } from "react";

function formatAnimatedValue(current: number, target: number): string {
  // Format the animated number the same way as the final value
  if (target >= 1_000_000) {
    return `${(current / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (target >= 1_000) {
    return `${(current / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return Math.round(current).toString();
}

export default function CountUpStat({
  value,
  isHovered,
  className,
}: {
  value: number;
  isHovered: boolean;
  className?: string;
}) {
  const [display, setDisplay] = useState("0");
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isHovered) {
      setDisplay("0");
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const duration = 600; // ms
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * value;
      setDisplay(formatAnimatedValue(current, value));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isHovered, value]);

  return (
    <span className={className}>
      {display}
    </span>
  );
}
