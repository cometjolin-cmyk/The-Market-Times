import React, { useState, useRef, useEffect, useMemo } from "react";
import { StockDataPoint } from "../types";
import { PlusCircle, Info, TrendingUp } from "lucide-react";

interface StockChartProps {
  symbol: string;
  chineseName: string;
  data: StockDataPoint[];
  currency?: string;
  currencySymbol?: string;
  marketType?: string;
  unit?: string;
}

export default function StockChart({ 
  symbol, 
  chineseName, 
  data,
  currency,
  currencySymbol,
  marketType,
  unit
}: StockChartProps) {
  const [activeInterval, setActiveInterval] = useState<"all" | "15d" | "20d">("all");
  const [showMA5, setShowMA5] = useState(true);
  const [showMA20, setShowMA20] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  
  const chartRef = useRef<SVGSVGElement | null>(null);

  // Derive indicators
  const isTaiwanSymbol = symbol === "2330" || symbol === "2317" || symbol === "2454" || symbol.toUpperCase().endsWith(".TW");
  const actualCurrency = currency || (isTaiwanSymbol ? "TWD" : "USD");
  const actualSymbol = currencySymbol || (isTaiwanSymbol ? "NT$" : "$");
  const actualMarket = marketType || (isTaiwanSymbol ? "台股" : "美股");
  const actualUnit = unit || (isTaiwanSymbol ? "張" : "股");

  // Filter based on selected interval length
  const filteredData = useMemo(() => {
    if (activeInterval === "15d") return data.slice(-15);
    if (activeInterval === "20d") return data.slice(-20);
    return data;
  }, [data, activeInterval]);

  // Compute Moving Averages (MA) based on Full Data to avoid edge clipping, then align with filtered list
  const computedData = useMemo(() => {
    return filteredData.map((d, index) => {
      // Find index within parent data
      const origIndex = data.findIndex(item => item.date === d.date);
      
      // Calculate MA5
      let ma5: number | null = null;
      if (origIndex >= 4) {
        const slice = data.slice(origIndex - 4, origIndex + 1);
        const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
        ma5 = sum / 5;
      }

      // Calculate MA20
      let ma20: number | null = null;
      if (origIndex >= 19) {
        const slice = data.slice(origIndex - 19, origIndex + 1);
        const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
        ma20 = sum / 20;
      }

      return {
        ...d,
        ma5,
        ma20
      };
    });
  }, [filteredData, data]);

  // Track coordinates for current mouse position to snap to candlesticks
  const activePoint = useMemo(() => {
    if (hoverIndex !== null && computedData[hoverIndex]) {
      return computedData[hoverIndex];
    }
    // Default to last available point if not hovered
    return computedData[computedData.length - 1];
  }, [hoverIndex, computedData]);

  // Calculate Highs and Lows of price for scaling
  const priceLimits = useMemo(() => {
    if (computedData.length === 0) return { min: 0, max: 100 };
    // 動態定義域 (Domain): 先從傳入的 data 數組中找出 highs 與 lows 的極值
    const highs = computedData.map(d => d.high);
    const lows = computedData.map(d => d.low);
    const dataMax = Math.max(...highs);
    const dataMin = Math.min(...lows);
    
    // 緩衝計算：設定 Y 軸的 domain 為 [dataMin * 0.95, dataMax * 1.05]，確保 K 線圖上下保有 5% 的視覺留白
    return {
      min: Math.max(0, dataMin * 0.95),
      max: dataMax * 1.05
    };
  }, [computedData]);

  // Scaler settings with NYT-style layout (Right side axis labels)
  const width = 800;
  const height = 380;
  const priceHeight = 280; // height allocated for primary stock candles
  const volumeHeight = 70; // height allocated for volume layout at bottom
  const paddingLeft = 20;  // Space minimized on left for NYT elegance
  const paddingRight = 65; // Spacious right padding for right-positioned labels
  const paddingTop = 15;
  const volumeGap = 15; // gap between price chart and volume chart

  const scaleY = (p: number) => {
    const ratio = (p - priceLimits.min) / (priceLimits.max - priceLimits.min);
    return priceHeight + paddingTop - ratio * priceHeight;
  };

  const maxVolume = useMemo(() => {
    return Math.max(...computedData.map(d => d.volume), 1);
  }, [computedData]);

  const scaleVolumeY = (v: number) => {
    const ratio = v / maxVolume;
    const top = priceHeight + paddingTop + volumeGap;
    return top + volumeHeight - ratio * volumeHeight;
  };

  // 刻度優化 & 紐時風格刻度線生成
  const horizontalGridTicks = useMemo(() => {
    const { min, max } = priceLimits;
    const range = max - min;
    const midpoint = (min + max) / 2;
    let step = range / 4;

    // 根據價格區間自動調整刻度密度
    if (midpoint > 1000) {
      // 如果價格 > 1000，刻度間距設為 50 或 100
      if (step > 75) {
        step = Math.round(step / 100) * 100;
        step = step === 0 ? 100 : step;
      } else {
        step = Math.round(step / 50) * 50;
        step = step === 0 ? 50 : step;
      }
    } else if (midpoint < 100) {
      // 價格 < 100 保持原定均分步長（後續會控制小數點顯示至第二位）
      step = range / 4;
    } else {
      // 介於 100 至 1000 之間的合理步長對齊
      if (step > 35) {
        step = Math.round(step / 50) * 50;
        step = step === 0 ? 50 : step;
      } else if (step > 15) {
        step = Math.round(step / 20) * 20;
        step = step === 0 ? 20 : step;
      } else {
        step = Math.round(step / 10) * 10;
        step = step === 0 ? 10 : step;
      }
    }

    if (midpoint >= 100) {
      // 整數倍數對齊刻度線，視覺極其專業
      const result = [];
      let curr = Math.ceil(min / step) * step;
      while (curr <= max) {
        if (curr >= min) {
          result.push(curr);
        }
        curr += step;
      }
      if (result.length < 3) {
        const fallbacks = [];
        const fallbackStep = range / 4;
        for (let i = 0; i <= 4; i++) {
          fallbacks.push(min + fallbackStep * i);
        }
        return fallbacks;
      }
      return result;
    } else {
      // 價格 < 100 顯示 4 個均分刻度，顯示至小數點後兩位
      const result = [];
      const step4 = range / 4;
      for (let i = 0; i <= 4; i++) {
        result.push(min + step4 * i);
      }
      return result;
    }
  }, [priceLimits]);

  // Tool for formatting labels
  const formatTickVal = (tick: number) => {
    const { min, max } = priceLimits;
    const midpoint = (min + max) / 2;
    if (midpoint < 100) {
      // 如果價格 < 100，則顯示至小數點後兩位
      return tick.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      return tick.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    }
  };

  // Mouse move handlers for premium snapping behavior
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!chartRef.current) return;
    const svgRect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    
    const chartContentWidth = width - paddingLeft - paddingRight;
    const step = chartContentWidth / computedData.length;
    
    let index = Math.floor((x - paddingLeft) / step);
    if (index < 0) index = 0;
    if (index >= computedData.length) index = computedData.length - 1;
    
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Convert MA values into beautiful SVG path strings
  const getPathString = (field: "ma5" | "ma20") => {
    let path = "";
    const chartContentWidth = width - paddingLeft - paddingRight;
    const step = chartContentWidth / computedData.length;
    
    computedData.forEach((d, i) => {
      const val = d[field];
      if (val !== null) {
        const xCoord = paddingLeft + (i * step) + (step / 2);
        const yCoord = scaleY(val);
        if (path === "") {
          path = `M ${xCoord} ${yCoord}`;
        } else {
          path += ` L ${xCoord} ${yCoord}`;
        }
      }
    });
    return path;
  };

  return (
    <div className="bg-nyt-cream border border-nyt-ink p-5 md:p-6" id="stock-panel-component">
      {/* Top Banner: NYT Fine Print Ticker details */}
      <div className="border-b border-nyt-border pb-3 mb-5 flex flex-wrap justify-between items-baseline">
        <div className="flex items-center space-x-3">
          <span className="font-serif-display font-semibold text-2xl tracking-tight text-nyt-ink">
            {chineseName} <span className="font-sans text-sm font-semibold tracking-wider text-nyt-gray-light">({symbol})</span>
          </span>
          <span className="text-xs bg-[#E5E0D5] px-2 py-0.5 rounded-sm uppercase tracking-widest font-mono text-nyt-gray-dark">
            {actualMarket}現股
          </span>
        </div>
        
        {/* Toggles/Selector controls styled like print menu */}
        <div className="flex items-center space-x-2 mt-2 md:mt-0 font-sans text-xs">
          <span className="text-nyt-gray-light font-medium mr-2">時間跨度:</span>
          {(["all", "20d", "15d"] as const).map(interval => (
            <button
              id={`btn-interval-${interval}`}
              key={interval}
              onClick={() => setActiveInterval(interval)}
              className={`px-3 py-1 border transition-all duration-150 uppercase tracking-widest font-semibold ${
                activeInterval === interval
                  ? "bg-nyt-ink text-nyt-cream border-nyt-ink"
                  : "bg-transparent text-nyt-ink border-nyt-border hover:border-nyt-ink"
              }`}
            >
              {interval === "all" ? "全部 (30天)" : interval === "20d" ? "20日" : "15日"}
            </button>
          ))}
        </div>
      </div>

      {/* Live HUD - showing historical prices on hover */}
      <div className="bg-[#FAF8F5] border-l-4 border-nyt-ink p-4 mb-4 grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs text-nyt-gray-dark">
        <div>
          <span className="block text-[10px] text-nyt-gray-light uppercase tracking-wider font-sans">日期 Date</span>
          <span className="font-semibold text-nyt-ink">{activePoint?.date}</span>
        </div>
        <div>
          <span className="block text-[10px] text-nyt-gray-light uppercase tracking-wider font-sans">開盤價 Open</span>
          <span className="font-semibold text-nyt-ink font-mono">{actualSymbol} {activePoint ? activePoint.open.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</span>
        </div>
        <div>
          <span className="block text-[10px] text-nyt-gray-light uppercase tracking-wider font-sans">高 / 低 H / L</span>
          <span className="font-semibold">
            <span className="text-nyt-forest font-semibold">{actualSymbol} {activePoint ? activePoint.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</span>
            <span className="text-nyt-gray-light mx-1">/</span>
            <span className="text-nyt-brick font-semibold">{actualSymbol} {activePoint ? activePoint.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</span>
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-nyt-gray-light uppercase tracking-wider font-sans">收盤價 Close</span>
          <span className={`font-semibold ${activePoint?.close >= activePoint?.open ? "text-nyt-forest" : "text-nyt-brick"}`}>
            {actualSymbol} {activePoint ? activePoint.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="block text-[10px] text-nyt-gray-light uppercase tracking-wider font-sans">成交量 Volume</span>
          <span className="font-semibold text-nyt-ink">{activePoint ? activePoint.volume.toLocaleString() : "0"} {actualUnit}</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative border border-nyt-border bg-white overflow-hidden p-1">
        <svg
          ref={chartRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Horizontal Grid lines */}
          {horizontalGridTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={scaleY(tick)}
                x2={width - paddingRight}
                y2={scaleY(tick)}
                stroke="#F1F1F1"
                strokeWidth={1}
              />
              <text
                x={width - paddingRight + 8}
                y={scaleY(tick) + 3}
                textAnchor="start"
                className="font-mono text-[9px] fill-nyt-gray-light"
              >
                {actualSymbol} {formatTickVal(tick)}
              </text>
            </g>
          ))}

          {/* Volume baseline separator line */}
          <line
            x1={paddingLeft}
            y1={priceHeight + paddingTop}
            x2={width - paddingRight}
            y2={priceHeight + paddingTop}
            stroke="#121212"
            strokeWidth={1.5}
          />
          
          <text
            x={paddingLeft}
            y={priceHeight + paddingTop + volumeGap + 12}
            textAnchor="start"
            className="font-mono text-[9px] fill-nyt-gray-light uppercase"
          >
            Vol
          </text>

          {/* Draw Candle Bars & Volume details */}
          {computedData.map((d, i) => {
            const chartContentWidth = width - paddingLeft - paddingRight;
            const step = chartContentWidth / computedData.length;
            const xCenter = paddingLeft + (i * step) + (step / 2);
            
            const isBullish = d.close >= d.open;
            // Candle metrics
            const bodyY = isBullish ? scaleY(d.close) : scaleY(d.open);
            // Height minimum of 2px
            const bodyHeight = Math.max(2, Math.abs(scaleY(d.close) - scaleY(d.open)));
            const candleColor = isBullish ? "var(--color-nyt-forest)" : "var(--color-nyt-brick)";
            
            // Volume metrics
            const volY = scaleVolumeY(d.volume);
            const volH = Math.max(2, priceHeight + paddingTop + volumeGap + volumeHeight - volY);

            // Column width scaling for candles
            const candleWidth = Math.max(4, step * 0.7);

            return (
              <g key={i}>
                {/* Candle high/low thin stick */}
                <line
                  x1={xCenter}
                  y1={scaleY(d.high)}
                  x2={xCenter}
                  y2={scaleY(d.low)}
                  stroke={candleColor}
                  strokeWidth={1.5}
                />
                
                {/* Candle solid filled bar */}
                <rect
                  x={xCenter - candleWidth / 2}
                  y={bodyY}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={candleColor}
                />

                {/* Draw Volume block bar */}
                <rect
                  x={xCenter - candleWidth / 2}
                  y={volY}
                  width={candleWidth}
                  height={volH}
                  fill={isBullish ? "#D0E7DB" : "#F6D2D2"}
                  stroke={candleColor}
                  strokeWidth={0.5}
                  opacity={0.85}
                />

                {/* Small indicator on the X date axis */}
                {i % 4 === 0 && (
                  <g>
                    <line
                      x1={xCenter}
                      y1={priceHeight + paddingTop}
                      x2={xCenter}
                      y2={priceHeight + paddingTop + 4}
                      stroke="#AAAAAA"
                      strokeWidth={1}
                    />
                    <text
                      x={xCenter}
                      y={priceHeight + paddingTop + 16}
                      textAnchor="middle"
                      className="font-mono text-[9px] fill-nyt-gray-light"
                    >
                      {d.date.slice(5)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Overlays: Line formulas */}
          {showMA5 && (
            <path
              d={getPathString("ma5")}
              fill="none"
              stroke="#5D7574"
              strokeWidth={1.5}
              opacity={0.9}
            />
          )}

          {showMA20 && (
            <path
              d={getPathString("ma20")}
              fill="none"
              stroke="#A84C2C"
              strokeWidth={1.5}
              strokeDasharray="2,2"
              opacity={0.9}
            />
          )}

          {/* Mouse Snapping Interaction overlays */}
          {hoverIndex !== null && (
            <g>
              {/* Vertical Crosshair line */}
              <line
                x1={paddingLeft + (hoverIndex * ((width - paddingLeft - paddingRight) / computedData.length)) + (((width - paddingLeft - paddingRight) / computedData.length) / 2)}
                y1={paddingTop}
                x2={paddingLeft + (hoverIndex * ((width - paddingLeft - paddingRight) / computedData.length)) + (((width - paddingLeft - paddingRight) / computedData.length) / 2)}
                y2={height - 15}
                stroke="#121212"
                strokeWidth={0.5}
                strokeDasharray="3,3"
              />
              
              {/* Horizontal crosshair tracking line */}
              <line
                x1={paddingLeft}
                y1={scaleY(computedData[hoverIndex].close)}
                x2={width - paddingRight}
                y2={scaleY(computedData[hoverIndex].close)}
                stroke="#121212"
                strokeWidth={0.5}
                strokeDasharray="3,3"
              />

              {/* Text tooltip pill bubble displaying price on hover */}
              <circle
                cx={paddingLeft + (hoverIndex * ((width - paddingLeft - paddingRight) / computedData.length)) + (((width - paddingLeft - paddingRight) / computedData.length) / 2)}
                cy={scaleY(computedData[hoverIndex].close)}
                r={4}
                fill="#121212"
                stroke="#FFFFFF"
                strokeWidth={1}
              />
            </g>
          )}
        </svg>
      </div>

      {/* Control panel & legends for technical overlays */}
      <div className="mt-4 flex flex-wrap justify-between items-center text-xs text-nyt-gray-dark border-t border-nyt-border pt-4">
        <div className="flex flex-wrap gap-4 items-center mb-2 md:mb-0">
          <label className="flex items-center space-x-2 cursor-pointer font-sans select-none">
            <input
              type="checkbox"
              checked={showMA5}
              onChange={() => setShowMA5(!showMA5)}
              className="accent-nyt-gray-dark"
            />
            <span className="inline-flex items-center">
              <span className="w-3 h-0.5 bg-[#5D7574] inline-block mr-1"></span>
              MA5 5日均線
            </span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer font-sans select-none">
            <input
              type="checkbox"
              checked={showMA20}
              onChange={() => setShowMA20(!showMA20)}
              className="accent-nyt-gray-dark"
            />
            <span className="inline-flex items-center">
              <span className="w-3 h-0.5 border-t border-dashed border-[#A84C2C] inline-block mr-1"></span>
              MA20 20日雙月線
            </span>
          </label>
        </div>
        
        {/* Helper instructions in tiny layout */}
        <p className="text-[10px] text-nyt-gray-light flex items-center space-x-1 font-serif-body">
          <Info className="w-3.5 h-3.5 text-nyt-brick" />
          <span>滑鼠游標移入圖上，可取得歷史單日開盤、高、低、收盤價及成交量，輔助複習 K 線結構學。</span>
        </p>
      </div>

      {/* 🚀 關鍵加強：個股 K 線原始數據及均線來源註腳 (Stock K-Line Data Source Footnote) */}
      <div className="mt-4 pt-3 border-t border-dashed border-[#E2E2E2] flex flex-wrap justify-between items-center text-[10px] font-sans text-nyt-gray-light">
        <div className="flex items-center space-x-1.5 flex-wrap">
          <svg className="w-3 h-3 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>個股 K 線原始歷史數據來源：</span>
          <a 
            href={symbol.match(/^[0-9]+$/) ? `https://finance.yahoo.com/quote/${symbol}.TW` : `https://finance.yahoo.com/quote/${symbol}`}
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-nyt-ink underline underline-offset-2 hover:text-nyt-brick transition-colors font-medium"
          >
            Yahoo Finance ({symbol.match(/^[0-9]+$/) ? `${symbol}.TW` : symbol}) ↗
          </a>
          <span className="mx-1.5 text-gray-300">|</span>
          <a 
            href="https://www.twse.com.tw" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-nyt-ink underline underline-offset-2 hover:text-nyt-brick transition-colors font-medium"
          >
            臺灣證券交易所 (TWSE) ↗
          </a>
        </div>
        <span className="text-gray-400 font-serif-body">
          雙月波段 MA 均線由前端實時高保真計算
        </span>
      </div>
    </div>
  );
}
