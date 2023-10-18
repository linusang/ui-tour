import type { Placement } from "@floating-ui/vue";
import { ComputedRef } from "vue";

export interface UITourExposed {
  start: () => void;
}

export interface UITourContext {
  prev(): void;
  next(): void;
  exit(): Promise<void>;
  currentIndex: ComputedRef<number>;
  totalStops: ComputedRef<number>;
}

export interface UITourStopContext {
  targetElementId: string;
  placement: Placement;
  renderContent: ((props: UITourStopSlotProps) => any) | undefined;
}

export interface UITourStopSlotProps {
  prev: () => void;
  next: () => void;
  exit: () => Promise<void>;
  currentIndex: number;
  totalStops: number;
}
