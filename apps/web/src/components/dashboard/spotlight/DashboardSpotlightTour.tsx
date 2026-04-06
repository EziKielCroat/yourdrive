import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuthStore } from "../../../store/authStore";
import { useSidebarStore } from "../../../store/sidebarStore";
import {
  isDashboardTourCompleted,
  markDashboardTourCompleted,
} from "../../../lib/dashboardTourStorage";

type TourStep = {
  id: string;
  target: string | null;
  title: string;
  body: string;
  opensSidebar?: boolean;
};

/** Kratki, siguran ton — walkthrough, ne priručnik */
const STEPS: TourStep[] = [
  {
    id: "welcome",
    target: null,
    title: "Dobrodošli",
    body: "Kratak pregled ključnih mjesta. Preskoči u bilo kojem trenutku — Escape ili ispod.",
  },
  {
    id: "upload",
    target: "tour-upload",
    title: "Upload",
    body: "Plus dodaje datoteke. Isti gumb na svim širinama ekrana.",
  },
  {
    id: "sidebar-toggle",
    target: "tour-sidebar-toggle",
    title: "Izbornik",
    body: "Otvara i zatvara bočnu navigaciju.",
  },
  {
    id: "sidebar-nav",
    target: "tour-sidebar-nav",
    title: "Navigacija",
    body: "Tvoje datoteke, dijeljenje, favoriti i ostalo — sve na jednom mjestu.",
    opensSidebar: true,
  },
  {
    id: "search",
    target: "tour-search",
    title: "Pretraga",
    body: "Tekst i filteri — brzo do cilja.",
  },
  {
    id: "settings",
    target: "tour-settings",
    title: "Postavke",
    body: "Račun, sigurnost i obavijesti.",
  },
  {
    id: "storage",
    target: "tour-storage",
    title: "Prostor",
    body: "Pregled potrošnje i nadogradnja kad zatreba.",
    opensSidebar: true,
  },
  {
    id: "done",
    target: null,
    title: "Gotovo",
    body: "Možeš istraživati. Pomoć je u Help centru ako zatreba.",
  },
];

const PAD = 8;

const EASE = [0.25, 0.1, 0.25, 1] as const;
const DURATION_S = 0.26;
const EASE_CSS = "cubic-bezier(0.25, 0.1, 0.25, 1)";

function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function DashboardSpotlightTour() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setSidebarOpen = useSidebarStore((s) => s.setOpen);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [hole, setHole] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  const step = STEPS[stepIndex] ?? STEPS[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const shouldRun = useMemo(() => {
    if (!isAuthenticated || !user?.id) return false;
    return !isDashboardTourCompleted(user.id);
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!shouldRun) return;
    if (pathname !== "/dashboard") {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [shouldRun, pathname, navigate]);

  useEffect(() => {
    if (!shouldRun || typeof window === "undefined") return;
    if (pathname !== "/dashboard") return;
    const t = window.setTimeout(() => setActive(true), 500);
    return () => window.clearTimeout(t);
  }, [shouldRun, pathname]);

  const updateHole = useCallback(() => {
    const target = step.target;
    if (!target) {
      setHole(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${target}"]`);
    if (!el || !(el instanceof HTMLElement)) {
      setHole(null);
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.width < 2 && r.height < 2) {
      setHole(null);
      return;
    }
    setHole({
      top: r.top - PAD,
      left: r.left - PAD,
      width: r.width + PAD * 2,
      height: r.height + PAD * 2,
    });
    el.scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: getPrefersReducedMotion() ? "auto" : "smooth",
    });
  }, [step.target]);

  useLayoutEffect(() => {
    if (!active) return;
    if (step.opensSidebar) {
      setSidebarOpen(true);
    }
    const delay = step.opensSidebar ? 400 : step.target ? 64 : 0;
    const id = window.setTimeout(updateHole, delay);
    return () => window.clearTimeout(id);
  }, [active, stepIndex, step.target, step.opensSidebar, setSidebarOpen, updateHole]);

  useEffect(() => {
    if (!active) return;
    const onResize = () => updateHole();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [active, updateHole]);

  const finish = useCallback(() => {
    if (user?.id) markDashboardTourCompleted(user.id);
    setActive(false);
  }, [user?.id]);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  const next = useCallback(() => {
    if (stepIndex >= STEPS.length - 1) {
      finish();
      return;
    }
    setStepIndex((i) => i + 1);
  }, [stepIndex, finish]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, skip]);

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const id = window.requestAnimationFrame(() => {
      primaryBtnRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [active, stepIndex]);

  if (!active || !shouldRun || typeof document === "undefined") return null;

  const hasTarget = Boolean(step.target);
  const hasRing = hasTarget && hole !== null;
  const isIntroOrOutro = !step.target;

  const progress = stepIndex + 1;
  const total = STEPS.length;

  const transitionFast = reduceMotion
    ? { duration: 0.01 }
    : { duration: DURATION_S, ease: EASE };

  const transitionHole = reduceMotion
    ? { duration: 0.01 }
    : { duration: DURATION_S, ease: EASE };

  return createPortal(
    <Overlay
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      aria-describedby="tour-body"
    >
      <Backdrop
        $fullScrim={isIntroOrOutro || !hasRing}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transitionFast}
      />

      {hasTarget && hole && (
        <SpotlightRing
          style={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
          }}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transitionHole}
        />
      )}

      <CardPositioner>
        <AnimatePresence mode="wait">
          <TooltipCard
            key={step.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={transitionFast}
            aria-live="polite"
          >
            <CardInner>
              <StepMeta>
                <StepLabel>Korak {progress} od {total}</StepLabel>
                <ProgressTrack aria-hidden>
                  <ProgressFill $pct={(progress / total) * 100} />
                </ProgressTrack>
              </StepMeta>

              <Title id="tour-title">{step.title}</Title>
              <Body id="tour-body">{step.body}</Body>

              <Actions>
                <SkipButton type="button" onClick={skip}>
                  Preskoči
                </SkipButton>
                <PrimaryButton
                  ref={primaryBtnRef}
                  type="button"
                  onClick={next}
                >
                  {stepIndex >= STEPS.length - 1 ? "Zatvori" : "Dalje"}
                </PrimaryButton>
              </Actions>
            </CardInner>
          </TooltipCard>
        </AnimatePresence>
      </CardPositioner>
    </Overlay>,
    document.body,
  );
}

/* —— Design tokens: bijela / svijetloplava / meki sivi, bez agresivnih sjena —— */

const Overlay = styled.div`
  --tour-blue: #0f85ff;
  --tour-blue-muted: #e8f4ff;
  --tour-text: #0f172a;
  --tour-text-secondary: #64748b;
  --tour-border: #e2e8f0;
  --tour-scrim: rgba(15, 23, 42, 0.36);
  --tour-scrim-light: rgba(248, 250, 252, 0.82);

  position: fixed;
  inset: 0;
  z-index: 100050;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
`;

const Backdrop = styled(motion.div)<{ $fullScrim: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: ${({ $fullScrim }) =>
    $fullScrim ? "var(--tour-scrim-light)" : "transparent"};
  backdrop-filter: ${({ $fullScrim }) => ($fullScrim ? "blur(4px)" : "none")};
`;

/** Jednostavan prsten + scrim — bez plave sjene / glowa */
const SpotlightRing = styled(motion.div)`
  position: fixed;
  z-index: 1;
  pointer-events: none;
  border-radius: 12px;
  box-shadow:
    0 0 0 1px rgba(148, 163, 184, 0.45),
    0 0 0 9999px var(--tour-scrim);
`;

const CardPositioner = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(20px, env(safe-area-inset-top))
    max(20px, env(safe-area-inset-right))
    max(24px, env(safe-area-inset-bottom))
    max(20px, env(safe-area-inset-left));
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

const TooltipCard = styled(motion.div)`
  width: min(400px, 100%);
  max-height: min(520px, 85vh);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid var(--tour-border);
  border-radius: 12px;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 8px 28px rgba(15, 23, 42, 0.07);
`;

const CardInner = styled.div`
  padding: 22px 22px 20px;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const StepMeta = styled.div`
  margin-bottom: 16px;
`;

const StepLabel = styled.span`
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--tour-text-secondary);
  margin-bottom: 8px;
`;

const ProgressTrack = styled.div`
  height: 3px;
  width: 100%;
  border-radius: 999px;
  background: #f1f5f9;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  border-radius: 999px;
  background: var(--tour-blue);
  transition: width 0.26s ${EASE_CSS};
`;

const Title = styled.h2`
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--tour-text);
  letter-spacing: -0.02em;
`;

const Body = styled.p`
  margin: 0 0 22px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--tour-text-secondary);
  flex: 1;
  overflow-y: auto;
  min-height: 0;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 4px;
`;

const SkipButton = styled.button`
  background: transparent;
  border: none;
  padding: 8px 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--tour-text-secondary);
  cursor: pointer;
  transition: color 0.2s ${EASE_CSS};

  &:hover {
    color: var(--tour-text);
  }

  &:focus-visible {
    outline: 2px solid var(--tour-blue);
    outline-offset: 2px;
    border-radius: 6px;
  }
`;

const PrimaryButton = styled.button`
  margin-left: auto;
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: #ffffff;
  background: var(--tour-blue);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  transition:
    background 0.2s ${EASE_CSS},
    transform 0.2s ${EASE_CSS};

  &:hover {
    background: #0a6fd4;
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid var(--tour-blue);
    outline-offset: 2px;
  }
`;
