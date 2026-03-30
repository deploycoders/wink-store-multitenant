"use client";

import { motion } from "framer-motion";

const steps = [
  { id: 1, name: "Shopping cart" },
  { id: 2, name: "Checkout details" },
  { id: 3, name: "Order complete" },
];

export default function CartStepper({ currentStep = 1 }) {
  return (
    <div className="w-full py-6 sm:py-8">
      <div className="max-w-xl mx-auto flex items-center justify-between px-6">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-center group flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-500
                ${
                  step.id === currentStep
                    ? "bg-ink text-paper shadow-lg shadow-ink/20"
                    : step.id < currentStep
                      ? "bg-honey text-ink"
                      : "bg-honey-light text-honey-dark"
                }
              `}
              >
                {step.id}
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-[0.15em] whitespace-nowrap
                ${step.id === currentStep ? "text-ink" : "text-honey-dark"}
              `}
              >
                {step.name}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 h-px bg-honey-light mx-2 mb-6 md:mx-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
