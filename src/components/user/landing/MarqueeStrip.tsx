"use client";

import { Londrina_Outline } from "next/font/google";

const londrinaOutline = Londrina_Outline({
  subsets: ["latin"],
  weight: "400",
});

const marqueeItems = ["Standard Taxi", "Premium Taxi", "Luxury Taxi"];

export default function MarqueeStrip() {
  const loopItems = [...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#131416] py-4 sm:py-5 md:py-7 lg:py-10">
      <div className="marquee-track">
        {[0, 1].map((groupIdx) => (
          <div key={groupIdx} className="marquee-group" aria-hidden={groupIdx === 1}>
            {loopItems.map((item, index) => {
              const isInitiallyFilled = groupIdx === 0 && index === 0;
              return (
                <div key={`${item}-${index}`} className="marquee-item">
                  <span className="text-xl text-brand-500 sm:text-2xl md:text-3xl">✦</span>
                  <span
                    className={`${londrinaOutline.className} marquee-text text-3xl leading-none sm:text-4xl md:text-5xl lg:text-6xl ${
                      isInitiallyFilled ? "is-filled" : ""
                    }`}
                  >
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <style jsx>{`
        .marquee-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: marqueeMove 30s linear infinite;
        }
        .marquee-group {
          display: flex;
          flex-shrink: 0;
        }
        .marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          padding-right: 0.65rem;
        }
        @media (min-width: 640px) {
          .marquee-item {
            gap: 0.9rem;
            padding-right: 0.9rem;
          }
        }
        @media (min-width: 768px) {
          .marquee-item {
            gap: 1.25rem;
            padding-right: 1.25rem;
          }
        }
        .marquee-text {
          color: transparent;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.38);
          transition: color 0.28s ease, -webkit-text-stroke-color 0.28s ease;
        }
        .marquee-text.is-filled {
          color: var(--color-brand-500);
          -webkit-text-stroke: 1px var(--color-brand-500);
        }
        .marquee-text:hover {
          color: var(--color-brand-500);
          -webkit-text-stroke: 1px var(--color-brand-500);
        }
        @keyframes marqueeMove {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
