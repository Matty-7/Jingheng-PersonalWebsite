"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { SceneMotionControl, useSceneMotion } from "./scene_motion";
import { useImageStatus } from "./image_status";

const amber = "#e4a952";
const ivory = "#d5ddd9";
const blue = "#78a6cb";
const panel = "#171b1e";

function ScreenHeader({ title }: { title: string }) {
  return (
    <>
      <rect width="500" height="350" fill={panel} />
      <rect width="500" height="16" fill="#343d47" />
      {["MENU", "YAS", "OAS", "CASHFLOW", "CURVES"].map((label, index) => (
        <g key={label}>
          <rect
            x={3 + index * 80}
            y="3"
            width="76"
            height="10"
            fill={index === 0 ? "#a87930" : "#283f52"}
          />
          <text
            x={8 + index * 80}
            y="10.5"
            fill={index === 0 ? "#11191d" : blue}
          >
            {label}
          </text>
        </g>
      ))}
      <text x="7" y="29" fill={ivory}>
        {title}
      </text>
      <path d="M5 35H495" stroke={blue} strokeWidth="0.7" />
    </>
  );
}

function Reading({
  x,
  y,
  values,
  delay = 0,
}: {
  x: number;
  y: number;
  values: [string, string, string];
  delay?: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {values.map((value, index) => (
        <text
          key={index}
          textAnchor="end"
          className={`terminal-cell-frame terminal-cell-frame-${index} scene-motion`}
          style={{ animationDelay: `${-index * 4 - delay}s` } as CSSProperties}
          fill={index === 0 ? ivory : index === 1 ? "#a9c694" : amber}
        >
          {value}
        </text>
      ))}
    </g>
  );
}

function YieldScreen() {
  const columns = ["-100", "-50", "BASE", "+50", "+100"];
  const rows = [
    ["Price", "98.12", "97.34", "96.50", "95.61", "94.68"],
    ["Yield", "4.21", "4.58", "4.96", "5.35", "5.75"],
    ["Avg Life", "5.82", "6.15", "6.48", "6.73", "6.91"],
    ["Duration", "3.76", "4.02", "4.28", "4.49", "4.64"],
    ["I Spread", "42.8", "45.1", "47.4", "49.6", "51.9"],
    ["Prepay", "142", "126", "110", "97", "86"],
  ];
  return (
    <>
      <ScreenHeader title="MORTGAGE ANALYTICS  /  YIELD TABLE" />
      <text x="8" y="48" fill={amber}>
        AGENCY MBS
      </text>
      <text x="121" y="48" fill={ivory}>
        FIXED RATE / POOL LEVEL
      </text>
      <text x="8" y="62" fill={amber}>
        Price
      </text>
      <rect x="47" y="53" width="58" height="12" fill={amber} />
      <text x="52" y="62" fill="#172028">
        96-16
      </text>
      <text x="126" y="62" fill={amber}>
        Coupon 5.000
      </text>
      <text x="273" y="62" fill={amber}>
        Prepay 110 PSA
      </text>
      <rect x="5" y="73" width="490" height="14" fill="#334858" />
      <text x="10" y="83" fill={ivory}>
        RATE SHIFT (BP)
      </text>
      {columns.map((label, i) => (
        <text key={label} x={205 + i * 68} y="83" textAnchor="end" fill={blue}>
          {label}
        </text>
      ))}
      {rows.map((row, i) => (
        <g key={row[0]}>
          {i % 2 === 0 && (
            <rect
              x="5"
              y={89 + i * 19}
              width="490"
              height="18"
              fill="#ffffff"
              opacity="0.025"
            />
          )}
          <text x="10" y={101 + i * 19} fill={amber}>
            {row[0]}
          </text>
          {row.slice(1).map((value, j) => (
            <text
              key={j}
              x={205 + j * 68}
              y={101 + i * 19}
              textAnchor="end"
              fill={ivory}
            >
              {value}
            </text>
          ))}
        </g>
      ))}
      <path d="M5 211H495 M249 230V326" stroke="#53616a" strokeWidth="0.7" />
      <rect x="5" y="214" width="490" height="13" fill="#334858" />
      <text x="10" y="223" fill={ivory}>
        OAS ANALYTICS
      </text>
      <text x="259" y="223" fill={ivory}>
        STATIC ANALYTICS
      </text>
      {["OAS", "OAD", "Convexity", "Option Cost", "Yield"].map((label, i) => (
        <g key={label}>
          <text x="10" y={242 + i * 17} fill={amber}>
            {label}
          </text>
          <Reading
            x={235}
            y={242 + i * 17}
            values={
              [
                ["28.4", "28.6", "28.3"],
                ["4.28", "4.29", "4.27"],
                ["-0.62", "-0.61", "-0.63"],
                ["53.1", "53.3", "53.0"],
                ["4.960", "4.964", "4.958"],
              ][i] as [string, string, string]
            }
            delay={i * 0.6}
          />
        </g>
      ))}
      {[
        "WAL           6.48",
        "Mod Duration  4.35",
        "Yield Spread  47.4",
        "Factor        0.72",
        "Pay Freq   Monthly",
      ].map((label, i) => (
        <text key={label} x="259" y={242 + i * 17} fill={amber}>
          {label}
        </text>
      ))}
      <rect x="5" y="331" width="490" height="15" fill="#252e36" />
      <text x="10" y="341" fill={blue}>
        GOVT 2Y 4.02 5Y 4.15 10Y 4.31 30Y 4.57
      </text>
    </>
  );
}

function CashflowScreen() {
  return (
    <>
      <ScreenHeader title="CASHFLOW PROJECTIONS  /  CURVE ANALYSIS" />
      <text x="8" y="48" fill={amber}>
        Frequency
      </text>
      <rect x="79" y="39" width="68" height="12" fill={amber} />
      <text x="84" y="48" fill="#172028">
        Monthly
      </text>
      <text x="170" y="48" fill={amber}>
        Scenario
      </text>
      <text x="230" y="48" fill={ivory}>
        BASE
      </text>
      <text x="364" y="48" fill={blue}>
        Collateral Flow
      </text>
      <rect x="5" y="57" width="490" height="14" fill="#334858" />
      {["Period", "Balance", "Principal", "Interest", "Cashflow"].map(
        (label, i) => (
          <text
            key={label}
            x={i === 0 ? 10 : 105 + i * 95}
            y="67"
            textAnchor={i === 0 ? "start" : "end"}
            fill={blue}
          >
            {label}
          </text>
        ),
      )}
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          {i % 2 === 0 && (
            <rect
              x="5"
              y={73 + i * 15}
              width="490"
              height="14"
              fill="#ffffff"
              opacity="0.025"
            />
          )}
          <text x="10" y={83 + i * 15} fill={ivory}>
            {String(i + 1).padStart(2, "0")}
          </text>
          {[2400000 - i * 18400, 18400, 10000 - i * 77, 28400 - i * 77].map(
            (value, j) => (
              <text
                key={j}
                x={200 + j * 95}
                y={83 + i * 15}
                textAnchor="end"
                fill={amber}
              >
                {value.toLocaleString("en-US")}
              </text>
            ),
          )}
        </g>
      ))}
      <path d="M5 212H495" stroke={blue} strokeWidth="0.7" />
      <text x="10" y="224" fill={ivory}>
        YIELD CURVES
      </text>
      <text x="335" y="224" fill={blue}>
        Nominal maturity (years)
      </text>
      <g transform="translate(42 236)">
        {[0, 22, 44, 66, 88].map((y) => (
          <path key={y} d={`M0 ${y}H438`} stroke="#354047" strokeWidth="0.6" />
        ))}
        {[0, 73, 146, 219, 292, 365, 438].map((x, i) => (
          <g key={x}>
            <path d={`M${x} 0V88`} stroke="#354047" strokeWidth="0.6" />
            <text x={x} y="99" textAnchor="middle" fill={blue}>
              {["0.5", "1", "2", "5", "10", "20", "30"][i]}
            </text>
          </g>
        ))}
        <path d="M0 0V88H438" fill="none" stroke={blue} strokeWidth="0.7" />
        <path
          className="terminal-yield-curve scene-motion"
          d="M0 73 C48 77 92 80 146 70 S226 47 292 39 S365 18 438 11"
          fill="none"
          stroke="#88aec9"
          strokeWidth="1.5"
        />
        <path
          className="terminal-yield-curve terminal-yield-secondary scene-motion"
          d="M0 62 C55 65 110 66 146 61 S230 38 292 30 S366 15 438 19"
          fill="none"
          stroke="#bdc799"
          strokeWidth="1.5"
        />
        <text x="-8" y="7" textAnchor="end" fill={blue}>
          5.0
        </text>
        <text x="-8" y="48" textAnchor="end" fill={blue}>
          4.5
        </text>
        <text x="-8" y="87" textAnchor="end" fill={blue}>
          4.0
        </text>
      </g>
    </>
  );
}

function MarketActivity() {
  return (
    <svg className="terminal-market" viewBox="0 0 1672 941" focusable="false">
      <defs>
        <clipPath id="terminal-left-screen">
          <path d="M389 297L626 293L626 467L390 476Z" />
        </clipPath>
        <clipPath id="terminal-right-screen">
          <path d="M649 293L889 292L890 453L649 463Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#terminal-left-screen)">
        <path d="M389 297L626 293L626 467L390 476Z" fill={panel} />
        <g transform="matrix(.472 -.008 .003 .492 390 297)">
          <YieldScreen />
        </g>
      </g>
      <g clipPath="url(#terminal-right-screen)">
        <path d="M649 293L889 292L890 453L649 463Z" fill={panel} />
        <g transform="matrix(.480 -.010 0 .464 649 295)">
          <CashflowScreen />
        </g>
      </g>
    </svg>
  );
}

export function TerminalScene() {
  const { scene, paused, ready, toggle } = useSceneMotion();
  const { image_ref, state, on_load, on_error } = useImageStatus();
  return (
    <div className="closing-art">
      <div
        className="terminal-scene"
        ref={scene}
        data-paused={paused}
        data-image-state={state}
      >
        <div className="terminal-artboard">
          <Image
            unoptimized
            className="terminal-background"
            ref={image_ref}
            onLoad={on_load}
            onError={on_error}
            src="/images/writing-terminal.jpg"
            width={1672}
            height={941}
            loading="lazy"
            alt="An illustrated walnut desk with a slim Bloomberg Terminal on central silver monitor arms, a colored keyboard and wireless mouse, illustrative mortgage analytics, cashflow tables and yield curves, and a sunlit window"
          />
          <div className="terminal-effects" aria-hidden="true">
            <MarketActivity />
          </div>
        </div>
      </div>
      {ready && state === "loaded" && (
        <SceneMotionControl paused={paused} toggle={toggle} subject="desk" />
      )}
    </div>
  );
}
