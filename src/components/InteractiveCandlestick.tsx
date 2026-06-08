import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Layers, ArrowRight, HelpCircle } from "lucide-react";

export default function InteractiveCandlestick() {
  const [open, setOpen] = useState(100);
  const [close, setClose] = useState(120);
  const [high, setHigh] = useState(140);
  const [low, setLow] = useState(80);

  // Auto-adjust dependencies to maintain valid financial logic
  useEffect(() => {
    // High must be >= max of open and close
    const maxVal = Math.max(open, close);
    if (high < maxVal) {
      setHigh(maxVal);
    }
  }, [open, close]);

  useEffect(() => {
    // Low must be <= min of open and close
    const minVal = Math.min(open, close);
    if (low > minVal) {
      setLow(minVal);
    }
  }, [open, close]);

  const handleHighChange = (val: number) => {
    const maxVal = Math.max(open, close);
    if (val >= maxVal) {
      setHigh(val);
    }
  };

  const handleLowChange = (val: number) => {
    const minVal = Math.min(open, close);
    if (val <= minVal) {
      setLow(val);
    }
  };

  const handleOpenChange = (val: number) => {
    setOpen(val);
    // Dynamic sanity adjustments
    if (val > high) setHigh(val);
    if (val < low) setLow(val);
  };

  const handleCloseChange = (val: number) => {
    setClose(val);
    // Dynamic sanity adjustments
    if (val > high) setHigh(val);
    if (val < low) setLow(val);
  };

  const resetValues = () => {
    setOpen(100);
    setClose(120);
    setHigh(140);
    setLow(80);
  };

  const isBullish = close >= open;
  const candleColor = isBullish ? "var(--color-nyt-forest)" : "var(--color-nyt-brick)";
  const bodyTop = isBullish ? close : open;
  const bodyBottom = isBullish ? open : close;

  // Generate Editorial description in traditional Chinese
  const getEditorialCommentary = () => {
    const priceDiff = Math.abs(close - open);
    const upperWick = high - bodyTop;
    const lowerWick = bodyBottom - low;

    if (close === open) {
      if (high > open && low < open) {
        return "今天開盤與收盤的價格居然一模一樣！在股票世界裡，這叫做『十字星』。這代表多方與空方激烈打鬥了一整天，最後精疲力竭打成平手，誰也沒佔上風。市場上的大家都在觀望，不知道明天會往哪個方向走。";
      }
      return "今天大家好像都去放假了，開盤和收盤完全一動也不動。整天交易死氣沉沉，成交量極低，市場冷冷清清，連一丁點小波動都沒有。";
    }

    if (isBullish) {
      if (priceDiff > 35) {
        return "哇！今天買方力量極為強大！一開盤大家就像瘋了一樣狂買，不斷把價格往上推，最後更昂首收在最高點附近。這在股市裡叫『大陽線』（綠色實體很長），代表多頭佔據絕對優勢，看漲信心整個爆棚！";
      }
      if (upperWick > priceDiff * 1.5) {
        return "今天盤中本來局勢大好，一度衝上超高點，但可惜上面的賣壓太重，快收盤時硬生生被壓了回來，留下一根顯著的『上影線』。雖然最後還是漲的（綠色），但代表上去有阻力，大家追高的熱情有點退燒了。";
      }
      if (lowerWick > priceDiff * 1.5) {
        return "今天上演了精彩的『絕地大反攻』！開盤後空方瘋狂往下砍，股價一度崩跌到谷底，還好低點吸引了神祕的大本營進場撿便宜，拼命把股價往上拉抬。最後意外地逆轉收漲（綠色）。像這樣底部的『下影線』很長，是非常強的抗跌防線！";
      }
      return "今天是一個溫和的晴天。買方穩健前行，雖然沒有驚天動地的暴漲，但也穩穩收了個小綠盤，整體市場非常溫暖、踏實。";
    } else {
      if (priceDiff > 35) {
        return "慘烈！今天一開盤大家就在恐慌倒貨，賣股的壓力像瀑布一樣宣洩，多方毫無還手餘地，股價一路被灌到快要最低點收盤。這就是傳說中的『大陰線』（紅色實體很長），代表市場人心惶惶，避險氣氛非常悲觀。";
      }
      if (lowerWick > priceDiff * 1.5) {
        return "今天盤中一度跌到大家心驚膽顫，以為要崩盤了。幸好跌到深處時，有一批冷靜的內行資金進場抄底護盤，強行把股價拉回了一大截，留下超級長的下影線。雖然最後結算還是跌的（紅色），但這條長尾巴代表下方防守很頑強！";
      }
      if (upperWick > priceDiff * 1.5) {
        return "今天多方開盤時開開心心想往上衝，沒想到在中途被無情的賣單一巴掌拍回原形，最後甚至被一路打壓到接近最低點收盤。這種『倒錘線』（倒立長釘子）很危險，代表好不容易點燃的火花又被澆熄，空方氣燄十分囂張。";
      }
      return "今天賣方稍微佔了上風。市場氣氛偏向冷靜與保守，價格被微微往下推倒了一點點。不算跌很重，只是一次理性、克制的小幅調整。";
    }
  };

  // SVG Scalers
  const svgHeight = 360;
  const svgWidth = 320;
  const scaleY = (p: number) => {
    // Map value 40-180 to SVG 310-50
    return 310 - ((p - 40) / (180 - 40)) * (310 - 50);
  };

  return (
    <div className="bg-white border border-nyt-ink p-5 md:p-6 shadow-sm rounded-sm" id="candle-interactive-lab">
      
      {/* Editorial Title */}
      <div className="border-b border-nyt-ink pb-3 mb-6 flex justify-between items-baseline">
        <div>
          <span className="text-[10px] font-mono font-bold text-nyt-brick uppercase tracking-widest block">
            NYT Studio Data Interactive
          </span>
          <h3 className="font-serif-display font-extrabold text-xl text-nyt-ink">
            K 線幾何物理學 K-Line Physics Lab
          </h3>
        </div>
        <button
          onClick={resetValues}
          className="p-1 px-2.5 border border-nyt-border font-sans text-[10px] text-nyt-gray-light hover:text-nyt-ink hover:border-nyt-ink rounded-sm transition-colors uppercase tracking-widest flex items-center gap-1 font-bold"
        >
          <RefreshCw className="w-3 h-3" /> 重設參數
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" id="candlestick-interactive-grid">
        
        {/* Sliders Control Panel (LG 5 column grid) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-nyt-cream border border-nyt-border p-4 rounded-sm">
            <h4 className="font-serif-display font-bold text-xs text-nyt-brick mb-3 uppercase tracking-wider">
              參數微調軌道 Controls
            </h4>
            
            {/* Open Price Control */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-sans">
                <span className="font-semibold text-nyt-ink">開盤價 (Open Price)</span>
                <span className="font-mono text-nyt-gray-light font-bold">${open}</span>
              </div>
              <input
                id="slider-open"
                type="range"
                min="50"
                max="170"
                value={open}
                onChange={(e) => handleOpenChange(parseInt(e.target.value))}
                className="w-full accent-nyt-ink cursor-pointer"
              />
            </div>

            {/* Close Price Control */}
            <div className="space-y-1 mt-4">
              <div className="flex justify-between text-xs font-sans">
                <span className="font-semibold text-nyt-ink">收盤價 (Close Price)</span>
                <span className={`font-mono font-bold ${isBullish ? "text-nyt-forest" : "text-nyt-brick"}`}>
                  ${close}
                </span>
              </div>
              <input
                id="slider-close"
                type="range"
                min="50"
                max="170"
                value={close}
                onChange={(e) => handleCloseChange(parseInt(e.target.value))}
                className="w-full accent-nyt-ink cursor-pointer"
              />
            </div>

            {/* High Price Control */}
            <div className="space-y-1 mt-4">
              <div className="flex justify-between text-xs font-sans">
                <span className="font-semibold text-nyt-ink">最高價 (High Price)</span>
                <span className="font-mono text-nyt-forest font-bold">${high}</span>
              </div>
              <input
                id="slider-high"
                type="range"
                min="50"
                max="180"
                value={high}
                onChange={(e) => handleHighChange(parseInt(e.target.value))}
                className="w-full accent-nyt-ink cursor-pointer"
              />
            </div>

            {/* Low Price Control */}
            <div className="space-y-1 mt-4">
              <div className="flex justify-between text-xs font-sans">
                <span className="font-semibold text-nyt-ink">最低價 (Low Price)</span>
                <span className="font-mono text-nyt-brick font-bold">${low}</span>
              </div>
              <input
                id="slider-low"
                type="range"
                min="40"
                max="170"
                value={low}
                onChange={(e) => handleLowChange(parseInt(e.target.value))}
                className="w-full accent-nyt-ink cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-3 border border-nyt-border font-serif-body text-xs text-nyt-gray-light leading-relaxed">
            <span className="font-sans font-bold text-[10px] text-nyt-brick block uppercase mb-1">
              ※ 技術學物理原則
            </span>
            <span>在嚴密之市場幾何中：最高價不能低於開/收盤中最大者；最低價亦不能高於開/收盤中最小者。當您拖動開盤或收盤突破臨界時，極值滑桿將由程式自動連動防呆。</span>
          </div>
        </div>

        {/* Scaled Candlestick Render Canvas (LG 4 column grid) */}
        <div className="lg:col-span-4 flex justify-center bg-nyt-cream border border-nyt-border p-4 rounded-sm relative">
          
          <svg className="w-full max-w-[260px] h-[330px]" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            
            {/* Dynamic horizontal background guide-lines */}
            {[50, 75, 100, 125, 150, 175].map((level, idx) => (
              <g key={idx}>
                <line
                  x1={40}
                  y1={scaleY(level)}
                  x2={280}
                  y2={scaleY(level)}
                  stroke="#E8E2D5"
                  strokeWidth={1}
                />
                <text
                  x={36}
                  y={scaleY(level) + 3}
                  textAnchor="end"
                  className="font-mono text-[9px] fill-nyt-gray-light"
                >
                  ${level}
                </text>
              </g>
            ))}

            {/* Candlestick shadow line (wick) */}
            <line
              x1={160}
              y1={scaleY(high)}
              x2={160}
              y2={scaleY(low)}
              stroke={candleColor}
              strokeWidth={2}
              className="transition-all duration-200"
            />

            {/* Candlestick body rect */}
            <rect
              x={130}
              y={scaleY(bodyTop)}
              width={60}
              height={Math.max(3, Math.abs(scaleY(close) - scaleY(open)))}
              fill={candleColor}
              stroke="#121212"
              strokeWidth={1.5}
              className="transition-all duration-200"
            />

            {/* Guideline: High Price Indicator */}
            <line
              x1={160}
              y1={scaleY(high)}
              x2={240}
              y2={scaleY(high)}
              stroke="var(--color-nyt-ink)"
              strokeWidth={0.5}
              strokeDasharray="2,2"
            />
            <text
              x={245}
              y={scaleY(high) + 3}
              className="font-serif-body text-[10px] fill-nyt-gray-dark font-bold"
            >
              最高價 ${high}
            </text>

            {/* Guideline: Body Top Indicator */}
            <line
              x1={160}
              y1={scaleY(bodyTop)}
              x2={240}
              y2={scaleY(bodyTop)}
              stroke="var(--color-nyt-ink)"
              strokeWidth={0.5}
              strokeDasharray="2,2"
            />
            <text
              x={245}
              y={scaleY(bodyTop) + 3}
              className="font-serif-body text-[10px] fill-nyt-gray-dark"
            >
              {isBullish ? `收盤價 $${close}` : `開盤價 $${open}`}
            </text>

            {/* Guideline: Body Bottom Indicator */}
            <line
              x1={160}
              y1={scaleY(bodyBottom)}
              x2={240}
              y2={scaleY(bodyBottom)}
              stroke="var(--color-nyt-ink)"
              strokeWidth={0.5}
              strokeDasharray="2,2"
            />
            <text
              x={245}
              y={scaleY(bodyBottom) + 3}
              className="font-serif-body text-[10px] fill-nyt-gray-dark"
            >
              {isBullish ? `開盤價 $${open}` : `收盤價 $${close}`}
            </text>

            {/* Guideline: Low Price Indicator */}
            <line
              x1={160}
              y1={scaleY(low)}
              x2={240}
              y2={scaleY(low)}
              stroke="var(--color-nyt-ink)"
              strokeWidth={0.5}
              strokeDasharray="2,2"
            />
            <text
              x={245}
              y={scaleY(low) + 3}
              className="font-serif-body text-[10px] fill-nyt-gray-dark font-bold text-nyt-brick"
            >
              最低價 ${low}
            </text>
          </svg>

          {/* Inline floating tag: Bullish/Bearish */}
          <div className="absolute top-2.5 right-2.5">
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-widest font-bold text-white ${
              isBullish ? "bg-nyt-forest" : "bg-nyt-brick"
            }`}>
              {isBullish ? "陽線 Bullish" : "陰線 Bearish"}
            </span>
          </div>

        </div>

        {/* Dynamic Editorial Op-Ed commentary (LG 3 column grid) */}
        <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-nyt-border pt-4 lg:pt-0 lg:pl-6 h-full flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-nyt-brick uppercase tracking-widest block mb-2 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-nyt-brick" />
              開盤社論動態直擊 Commentary
            </span>
            <div className="font-serif-body text-xs md:text-sm text-nyt-ink leading-relaxed text-justify space-y-2">
              <p className="first-line:uppercase first-line:tracking-wide">
                {getEditorialCommentary()}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-nyt-border pt-4">
            <div className="flex items-center space-x-1.5 text-xs font-mono text-nyt-gray-light">
              <Layers className="w-4.5 h-4.5" />
              <span>實體高度: {Math.abs(close - open)} 點</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs font-mono text-nyt-gray-light mt-1">
              <ArrowRight className="w-4.5 h-4.5" />
              <span>振幅大小: {(((high - low) / open) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
