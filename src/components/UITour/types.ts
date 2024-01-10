import type { Placement } from "@floating-ui/vue";
import { ComputedRef, Ref } from "vue";

export interface UITourExposed {
  start: () => void;
}

export interface UITourContext {
  prev(): void;
  next(): void;
  exit(): Promise<void>;
  currentIndex: ComputedRef<number>;
  totalStops: ComputedRef<number>;
  registerStop: (stop: UITourStopContext) => number;
}

export interface UITourInternalContext {
  showFloatingContent(elementId: string): Promise<void>;
  showModalContent(): Promise<void>;
  showContent: Ref<boolean>;
  setFloating(el: HTMLElement): void;
  setFloatingContent(el: HTMLElement): void;
  setModal(el: HTMLElement): void;
  setFloatingArrow(el: HTMLElement): void;
  computedFloatingStyles: ComputedRef<Record<string, any>>;
  arrowPositionStyles: ComputedRef<Record<string, any>>;
}

export interface UITourStopContext {
  targetElementId: string | undefined;
  placement: Placement | "modal";
  spotlightPadding: number;
}

export interface UITourStopSlotProps {
  prev: () => void;
  next: () => void;
  exit: () => Promise<void>;
  currentIndex: number;
  totalStops: number;
}
