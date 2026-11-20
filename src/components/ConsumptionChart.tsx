import { useState } from 'react';
import { motion } from 'motion/react';
import type { ConsumptionPoint } from '../lib/aquasenseTypes';

interface ConsumptionChartProps {
  data: ConsumptionPoint[];
  periodLabel: string;
}

export function ConsumptionChart({ data, periodLabel }: ConsumptionChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center bg-[#F3F6F9] rounded-lg border border-[#DCE5EC] text-sm text-[#5A7184]">
        Sem registos disponíveis para o período seleccionado.
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.liters, d.habitualLiters)),
    10
  );
  const niceMax = Math.ceil((maxValue * 1.15) / 10) * 10;

  const width = 640;
  const height = 224;
  const padLeft = 52;
  const padRight = 16;
  const padTop = 20;
  const padBottom = 34;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const step = chartW / data.length;
  const barWidth = Math.min(34, Math.max(12, step * 0.56));

  const yPos = (val: number) => padTop + chartH - (val / niceMax) * chartH;

  const habitualPolyline = data
    .map((d, i) => `${(padLeft + i * step + step / 2).toFixed(1)},${yPos(d.habitualLiters).toFixed(1)}`)
    .join(' ');

  const gridTicks = [0, 0.25, 0.5, 0.75, 1];
  const inspected = activeIndex !== null ? data[activeIndex] : null;
  const totalPeriodLiters = Math.round(data.reduce((sum, d) => sum + d.liters, 0));
  const totalHabitualLiters = Math.round(data.reduce((sum, d) => sum + d.habitualLiters, 0));

  return (
    <div>
      {/* Inspect readout bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs text-[#5A7184]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#0D76A8] inline-block" aria-hidden="true" />
            <span>Consumo registado</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-[#07334E] inline-block" aria-hidden="true" />
            <span>Padrão habitual</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#DC2626] inline-block" aria-hidden="true" />
            <span>Desvio elevado (&ge;30%)</span>
          </span>
        </div>

        <div className="font-mono tabular-nums text-[#07334E] font-medium">
          {inspected ? (
            <span>
              {inspected.label}: {Math.round(inspected.liters).toLocaleString('pt-PT')} L (habitual{' '}
              {Math.round(inspected.habitualLiters).toLocaleString('pt-PT')} L)
            </span>
          ) : (
            <span>
              Total ({periodLabel}): {totalPeriodLiters.toLocaleString('pt-PT')} L · Habitual:{' '}
              {totalHabitualLiters.toLocaleString('pt-PT')} L
            </span>
          )}
        </div>
      </div>

      {/* Responsive Animated SVG chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Gráfico interactivo de histórico de consumo para ${periodLabel}`}
          className="w-full h-auto min-w-[440px]"
          onMouseLeave={() => setActiveIndex(null)}
        >
          {/* Horizontal grid lines */}
          {gridTicks.map((ratio) => {
            const val = Math.round(niceMax * ratio);
            const y = yPos(val);
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#E2ECF2"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-[#5A7184] text-[10px] font-mono"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Interactive focus vertical hairline */}
          {activeIndex !== null && (
            <line
              x1={padLeft + activeIndex * step + step / 2}
              y1={padTop}
              x2={padLeft + activeIndex * step + step / 2}
              y2={padTop + chartH}
              stroke="#38B2DA"
              strokeOpacity="0.45"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Animated Consumption bars */}
          {data.map((item, i) => {
            const cx = padLeft + i * step + step / 2;
            const x = cx - barWidth / 2;
            const y = yPos(item.liters);
            const barH = Math.max(2, padTop + chartH - y);
            const isSpike = item.liters >= item.habitualLiters * 1.3;
            const isHovered = activeIndex === i;

            return (
              <g
                key={`${periodLabel}-${item.label}`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                className="cursor-pointer"
              >
                <motion.rect
                  x={x}
                  width={barWidth}
                  rx="3"
                  initial={{ y: padTop + chartH, height: 0 }}
                  animate={{
                    y,
                    height: barH,
                    fill: isSpike ? '#DC2626' : isHovered ? '#07334E' : '#0D76A8',
                    fillOpacity: isHovered ? 1 : 0.88,
                  }}
                  transition={{ duration: 0.42, ease: 'easeOut' }}
                />
                {isHovered && (
                  <text
                    x={cx}
                    y={Math.max(padTop - 4, y - 6)}
                    textAnchor="middle"
                    className="fill-[#07334E] text-[10px] font-mono font-bold"
                  >
                    {Math.round(item.liters)}L
                  </text>
                )}
                <text
                  x={cx}
                  y={height - 10}
                  textAnchor="middle"
                  className={`text-[10.5px] font-mono ${
                    isHovered ? 'fill-[#07334E] font-semibold' : 'fill-[#5A7184]'
                  }`}
                >
                  {item.label}
                </text>
              </g>
            );
          })}

          {/* Animated Habitual baseline dashed line */}
          <polyline
            fill="none"
            stroke="#07334E"
            strokeWidth="2"
            strokeDasharray="6 4"
            points={habitualPolyline}
            className="animate-aqua-orbit pointer-events-none"
          />
          {data.map((item, i) => {
            const cx = padLeft + i * step + step / 2;
            const cy = yPos(item.habitualLiters);
            const isHovered = activeIndex === i;
            return (
              <g key={`dot-${item.label}`} className="pointer-events-none">
                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={7}
                    fill="#38B2DA"
                    fillOpacity="0.25"
                  />
                )}
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={2.6}
                  initial={{ cy, r: 2.6 }}
                  animate={{ cy, r: isHovered ? 4.2 : 2.6 }}
                  transition={{ duration: 0.3 }}
                  fill="#FFFFFF"
                  stroke="#07334E"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
