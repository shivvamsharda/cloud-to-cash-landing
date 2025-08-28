import { cn } from "@/lib/utils";
import React from "react";

interface CloudPuffsProps {
  variant?: number;
  className?: string;
  children?: React.ReactNode;
}

// Reusable cloud made from overlapping circles (puffs)
// Uses design tokens for color: hsl(var(--button-green))
const CloudPuffs: React.FC<CloudPuffsProps> = ({ variant = 0, className, children }) => {
  const variants: string[][] = [
    // Variant 0 - Based on user's reference
    [
      "absolute w-40 h-40 top-8 left-12",
      "absolute w-32 h-32 top-10 left-0",
      "absolute w-32 h-32 top-10 right-0",
      "absolute w-28 h-28 bottom-0 left-20",
    ],
    // Variant 1 - Slightly different proportions/positions
    [
      "absolute w-44 h-44 top-6 left-10",
      "absolute w-28 h-28 top-12 left-2",
      "absolute w-36 h-36 top-12 right-4",
      "absolute w-28 h-28 bottom-0 left-16",
    ],
    // Variant 2 - Another arrangement for variety
    [
      "absolute w-40 h-40 top-7 left-16",
      "absolute w-28 h-28 top-12 left-4",
      "absolute w-32 h-32 top-9 right-2",
      "absolute w-24 h-24 bottom-2 left-24",
    ],
  ];

  const circles = variants[variant % variants.length];

  return (
    <div className={cn("relative", className)}>
      {/* Puffs */}
      <div className="absolute inset-0">
        {circles.map((c, i) => (
          <div
            key={i}
            className={cn(
              c,
              "rounded-full bg-[hsl(var(--button-green))] shadow-[0_0_40px_hsl(var(--button-green)/0.35)]"
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

export default CloudPuffs;
