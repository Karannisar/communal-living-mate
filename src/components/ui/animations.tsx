
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function FadeIn({ children, className, delay = 0, duration = 0.5 }: FadeInProps) {
  const style = {
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };

  return (
    <div className={cn("animate-fade-in", className)} style={style}>
      {children}
    </div>
  );
}

interface SlideInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function SlideIn({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.5,
  direction = "up"
}: SlideInProps) {
  const style = {
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };

  const directionClass = {
    up: "animate-slide-up",
    down: "animate-slide-down",
    left: "animate-slide-left",
    right: "animate-slide-right",
  }[direction];

  return (
    <div className={cn(directionClass, className)} style={style}>
      {children}
    </div>
  );
}

interface ScaleInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function ScaleIn({ children, className, delay = 0, duration = 0.3 }: ScaleInProps) {
  const style = {
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };

  return (
    <div className={cn("animate-scale-in", className)} style={style}>
      {children}
    </div>
  );
}

interface StaggeredChildrenProps {
  children: ReactNode[];
  className?: string;
  childClassName?: string;
  staggerDelay?: number;
  initialDelay?: number;
  animation?: "fade" | "scale" | "slide-up" | "slide-down" | "slide-left" | "slide-right";
}

export function StaggeredChildren({
  children,
  className,
  childClassName,
  staggerDelay = 0.1,
  initialDelay = 0,
  animation = "fade"
}: StaggeredChildrenProps) {
  const getAnimationClass = () => {
    switch (animation) {
      case "scale":
        return "animate-scale-in";
      case "slide-up":
        return "animate-slide-up";
      case "slide-down":
        return "animate-slide-down";
      case "slide-left":
        return "animate-slide-left";
      case "slide-right":
        return "animate-slide-right";
      case "fade":
      default:
        return "animate-fade-in";
    }
  };

  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(getAnimationClass(), childClassName)}
          style={{ animationDelay: `${initialDelay + index * staggerDelay}s` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
