import NumberFlow from '@number-flow/react';
import React from "react";

export function PricingInteraction({
  starterMonth,
  starterAnnual,
  proMonth,
  proAnnual,
  eliteMonth,
  eliteAnnual,
  onGetStarted,
}: {
  starterMonth: number;
  starterAnnual: number;
  proMonth: number;
  proAnnual: number;
  eliteMonth: number;
  eliteAnnual: number;
  onGetStarted?: () => void;
}) {
  const [active, setActive] = React.useState(1);
  const [period, setPeriod] = React.useState(0);
  const [starter, setStarter] = React.useState(starterMonth);
  const [pro, setPro] = React.useState(proMonth);
  const [elite, setElite] = React.useState(eliteMonth);

  const handleChangePeriod = (index: number) => {
    setPeriod(index);
    if (index === 0) {
      setStarter(starterMonth);
      setPro(proMonth);
      setElite(eliteMonth);
    } else {
      setStarter(starterAnnual);
      setPro(proAnnual);
      setElite(eliteAnnual);
    }
  };

  return (
    <div className="border-2 border-border rounded-[32px] p-3 shadow-md max-w-sm w-full flex flex-col items-center gap-3 bg-card">
      <div className="rounded-full relative w-full bg-muted p-1.5 flex items-center">
        <button
          className="font-semibold rounded-full w-full p-1.5 text-foreground z-20 text-sm"
          onClick={() => handleChangePeriod(0)}
        >
          Monthly
        </button>
        <button
          className="font-semibold rounded-full w-full p-1.5 text-foreground z-20 text-sm"
          onClick={() => handleChangePeriod(1)}
        >
          Yearly
        </button>
        <div
          className="p-1.5 flex items-center justify-center absolute inset-0 w-1/2 z-10"
          style={{
            transform: `translateX(${period * 100}%)`,
            transition: "transform 0.3s",
          }}
        >
          <div className="bg-background shadow-sm rounded-full w-full h-full border border-border"></div>
        </div>
      </div>

      <div className="w-full relative flex flex-col items-center justify-center gap-3">
        {/* Starter */}
        <div
          className="w-full flex justify-between cursor-pointer border-2 border-border p-4 rounded-2xl"
          onClick={() => setActive(0)}
        >
          <div className="flex flex-col items-start">
            <p className="font-semibold text-xl text-foreground">Starter</p>
            <p className="text-muted-foreground text-md flex">
              <span className="text-foreground font-medium flex items-center">
                $&nbsp;
                <NumberFlow className="text-foreground font-medium" value={starter} />
              </span>
              /month
            </p>
          </div>
          <div
            className="border-2 size-6 rounded-full mt-0.5 p-1 flex items-center justify-center"
            style={{
              borderColor: active === 0 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              transition: "border-color 0.3s",
            }}
          >
            <div
              className="size-3 rounded-full"
              style={{
                backgroundColor: "hsl(var(--primary))",
                opacity: active === 0 ? 1 : 0,
                transition: "opacity 0.3s",
              }}
            />
          </div>
        </div>

        {/* Pro */}
        <div
          className="w-full flex justify-between cursor-pointer border-2 border-border p-4 rounded-2xl"
          onClick={() => setActive(1)}
        >
          <div className="flex flex-col items-start">
            <p className="font-semibold text-xl flex items-center gap-2 text-foreground">
              Pro
              <span className="py-1 px-2 block rounded-lg bg-primary/20 text-primary text-sm">
                Popular
              </span>
            </p>
            <p className="text-muted-foreground text-md flex">
              <span className="text-foreground font-medium flex items-center">
                $&nbsp;
                <NumberFlow className="text-foreground font-medium" value={pro} />
              </span>
              /month
            </p>
          </div>
          <div
            className="border-2 size-6 rounded-full mt-0.5 p-1 flex items-center justify-center"
            style={{
              borderColor: active === 1 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              transition: "border-color 0.3s",
            }}
          >
            <div
              className="size-3 rounded-full"
              style={{
                backgroundColor: "hsl(var(--primary))",
                opacity: active === 1 ? 1 : 0,
                transition: "opacity 0.3s",
              }}
            />
          </div>
        </div>

        {/* Elite */}
        <div
          className="w-full flex justify-between cursor-pointer border-2 border-border p-4 rounded-2xl"
          onClick={() => setActive(2)}
        >
          <div className="flex flex-col items-start">
            <p className="font-semibold text-xl text-foreground">Elite</p>
            <p className="text-muted-foreground text-md flex">
              <span className="text-foreground font-medium flex items-center">
                $&nbsp;
                <NumberFlow className="text-foreground font-medium" value={elite} />
              </span>
              /month
            </p>
          </div>
          <div
            className="border-2 size-6 rounded-full mt-0.5 p-1 flex items-center justify-center"
            style={{
              borderColor: active === 2 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              transition: "border-color 0.3s",
            }}
          >
            <div
              className="size-3 rounded-full"
              style={{
                backgroundColor: "hsl(var(--primary))",
                opacity: active === 2 ? 1 : 0,
                transition: "opacity 0.3s",
              }}
            />
          </div>
        </div>

        {/* Selection indicator */}
        <div
          className="w-full h-[88px] absolute top-0 border-[3px] border-primary rounded-2xl pointer-events-none"
          style={{
            transform: `translateY(${active * 88 + 12 * active}px)`,
            transition: "transform 0.3s",
          }}
        />
      </div>

      <button
        onClick={onGetStarted}
        className="rounded-full gold-gradient text-primary-foreground text-lg font-semibold w-full p-3 active:scale-95 transition-transform duration-300"
      >
        Get Started
      </button>
    </div>
  );
}
