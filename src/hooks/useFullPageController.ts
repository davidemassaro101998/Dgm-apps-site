import { useState, useEffect, useRef, useCallback } from "react";

export const TOTAL_SECTIONS = 4;

interface UseFullPageControllerOptions {
  totalSections?: number;
  isLocked?: boolean;
  onSectionChange?: (index: number) => void;
}

export function useFullPageController(options?: UseFullPageControllerOptions) {
  const total = options?.totalSections ?? TOTAL_SECTIONS;
  const isLocked = Boolean(options?.isLocked);

  const [activeSection, setActiveSection] = useState(0);
  const activeSectionRef = useRef(0);
  activeSectionRef.current = activeSection;

  const isAnimatingRef = useRef(false);
  const queuedDirectionRef = useRef<-1 | 0 | 1>(0);

  // Wheel tracking & trackpad inertia suppression
  const lastWheelTimestampRef = useRef(0);
  const lastDeltaYRef = useRef(0);
  const consecutiveDecaysRef = useRef(0);
  const cooldownUntilRef = useRef(0);

  // Touch tracking
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const touchInOverlayRef = useRef(false);

  // Check if event occurred inside an active overlay/modal/drawer
  const isInsideOverlay = useCallback((target: EventTarget | null) => {
    if (isLocked) return true;
    if (target instanceof Element) {
      if (
        target.closest('[role="dialog"]') ||
        target.closest('[data-overlay="true"]') ||
        target.closest('[data-scrollable="true"]')
      ) {
        return true;
      }
    }
    // Also check if any open modal exists in the document
    return Boolean(document.querySelector('[role="dialog"], [data-overlay="true"]'));
  }, [isLocked]);

  const goToSection = useCallback((targetIndex: number) => {
    const clamped = Math.max(0, Math.min(total - 1, targetIndex));
    if (clamped === activeSectionRef.current) {
      queuedDirectionRef.current = 0;
      return;
    }

    isAnimatingRef.current = true;
    setActiveSection(clamped);
    activeSectionRef.current = clamped;
    options?.onSectionChange?.(clamped);

    // Curated smooth animation duration (750ms)
    setTimeout(() => {
      isAnimatingRef.current = false;
      cooldownUntilRef.current = Date.now() + 120; // 120ms inertia rest barrier

      // Check if a deliberate next gesture was queued during animation
      if (queuedDirectionRef.current !== 0) {
        const nextDir = queuedDirectionRef.current;
        queuedDirectionRef.current = 0;
        const nextTarget = activeSectionRef.current + nextDir;
        if (nextTarget >= 0 && nextTarget < total) {
          goToSection(nextTarget);
        }
      }
    }, 750);
  }, [total, options]);

  const changeSection = useCallback((dir: -1 | 1) => {
    goToSection(activeSectionRef.current + dir);
  }, [goToSection]);

  useEffect(() => {
    // Wheel Listener with strict inertia rejection and queuing
    const handleWheel = (e: WheelEvent) => {
      if (isInsideOverlay(e.target)) {
        return; // Allow native scroll inside modals/drawers
      }

      // Prevent default page scroll jitter
      e.preventDefault();

      const absDeltaY = Math.abs(e.deltaY);
      const absDeltaX = Math.abs(e.deltaX);

      // Ignore predominantly horizontal swipes or micro-jitter
      if (absDeltaY < 8 || absDeltaY < absDeltaX) return;

      const now = Date.now();
      const timeDelta = now - lastWheelTimestampRef.current;
      const prevDelta = lastDeltaYRef.current;
      const dir: -1 | 1 = e.deltaY > 0 ? 1 : -1;

      // Track acceleration vs decay to recognize physical gestures vs trackpad inertia
      const isAccelerating = absDeltaY > prevDelta * 1.25 && absDeltaY > 15;
      const isPauseThenStroke = timeDelta > 160 && absDeltaY > 12;

      if (absDeltaY < prevDelta) {
        consecutiveDecaysRef.current += 1;
      } else {
        consecutiveDecaysRef.current = 0;
      }

      lastWheelTimestampRef.current = now;
      lastDeltaYRef.current = absDeltaY;

      if (isAnimatingRef.current) {
        // Queue if user makes a fresh deliberate gesture during transition
        if (isAccelerating || isPauseThenStroke) {
          queuedDirectionRef.current = dir;
        }
        return;
      }

      // If we just finished an animation, block residual momentum decay events
      if (now < cooldownUntilRef.current) {
        if (!isAccelerating && !isPauseThenStroke) {
          return;
        }
      }

      // Ignore low trailing inertia if consecutive decay is occurring
      if (consecutiveDecaysRef.current > 3 && !isAccelerating && timeDelta < 80) {
        return;
      }

      // Trigger section change
      changeSection(dir);
    };

    // Touch Event Handling on Mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (isInsideOverlay(e.target)) {
        touchInOverlayRef.current = true;
        return;
      }
      touchInOverlayRef.current = false;
      if (e.touches.length > 0) {
        touchStartYRef.current = e.touches[0].clientY;
        touchStartXRef.current = e.touches[0].clientX;
        touchStartTimeRef.current = Date.now();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchInOverlayRef.current || isInsideOverlay(e.target)) {
        return;
      }
      // Prevent browser pull-to-refresh or native viewport pan
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchInOverlayRef.current || isInsideOverlay(e.target)) {
        touchInOverlayRef.current = false;
        return;
      }
      if (!e.changedTouches || e.changedTouches.length === 0) return;

      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
      const deltaX = touchStartXRef.current - e.changedTouches[0].clientX;
      const duration = Date.now() - touchStartTimeRef.current;
      const absDeltaY = Math.abs(deltaY);
      const absDeltaX = Math.abs(deltaX);

      // Must be a vertical swipe of sufficient distance and reasonable speed
      if (absDeltaY > 35 && absDeltaY > absDeltaX * 1.15 && duration < 700) {
        const dir: -1 | 1 = deltaY > 0 ? 1 : -1;
        if (isAnimatingRef.current) {
          queuedDirectionRef.current = dir;
        } else {
          changeSection(dir);
        }
      }
    };

    // Keyboard Arrow / Page Navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInsideOverlay(document.activeElement)) return;
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") return;

      let dir: -1 | 1 | null = null;
      if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) {
        dir = 1;
      } else if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) {
        dir = -1;
      } else if (e.key === "Home") {
        e.preventDefault();
        goToSection(0);
        return;
      } else if (e.key === "End") {
        e.preventDefault();
        goToSection(total - 1);
        return;
      }

      if (dir !== null) {
        e.preventDefault();
        if (isAnimatingRef.current) {
          queuedDirectionRef.current = dir;
        } else {
          changeSection(dir);
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [changeSection, goToSection, isInsideOverlay, total]);

  return {
    activeSection,
    goToSection,
  };
}
