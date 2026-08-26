"use client";

import { create } from "zustand";

type OrderStep = "cart" | "checkout";

interface OrderFlowState {
  open: boolean;
  step: OrderStep;
  openCart: () => void;
  openCheckout: () => void;
  close: () => void;
  setStep: (step: OrderStep) => void;
}

export const useOrderFlowStore = create<OrderFlowState>((set) => ({
  open: false,
  step: "cart",
  openCart: () => set({ open: true, step: "cart" }),
  openCheckout: () => set({ open: true, step: "checkout" }),
  close: () => set({ open: false }),
  setStep: (step) => set({ step }),
}));
