import React, { useState } from "react";

// Dictionary dictionary for instant tooltips
const DICTIONARY: Record<string, string> = {
  "陽線": "陽線 (Bullish Candle)：收盤價高於開盤價，代表價格上漲。在紐時大盤中是以沉穩的深墨綠色 (#005A36) 展現，象徵多頭主導與資本流入。",
  "陰線": "陰線 (Bearish Candle)：收盤價低於開盤價，代表價格下跌。我們以優雅磚紅色 (#990000) 顯示，代表空頭沽壓力道與避險情緒。",
  "錘子線": "錘子線 (Hammer)：實體極短但下影線極長的單 K 線，代表盤中賣方瘋狂壓低股價，但隨後多頭進場掃空、強勢收復地盤，常是底部回檔反攻強烈訊號。",
  "高本益比": "高本益比 (High P/E)：估值顯著高於平均。代表市場對該股未來三年獲利倍數成長懷有極高期待，常見於引領革命的半導體、AI晶片或平台股。",
  "低本益比": "低本益比 (Low P/E)：估值偏低，可能意味著股價低迷。需注意是否落入產品過期、毛利縮水的『價值陷阱』，不可盲目撿便宜。",
  "價值陷阱": "價值陷阱 (Value Trap)：看似便宜、本益比極低，其實公司商業模式已被顛覆、營收倒退。買下後可能不跌反跌，估值再也無法重返往日榮光。",
  "除權息參考價": "除權息參考價：扣除派發出的現金股利後，在除權息當日開盤的基礎點位，使市場總市值前後保持完全能量守恆。",
  "盈餘分配率": "盈餘分配率 (Payout Ratio)：指企業賺得的純益中，有多少是以現金股金方式分發予股東。比率過高可能制約了下一代科研產品的再配置能力。",
  "護城河": "護城河 (Moat)：企業長線最重要的生命壁壘。指的是公司相對於競爭對手所擁有的結構性壟斷特許優勢，如極高切換成本（Switching Cost）、專利防線、網絡效應或規模物理門檻，保護企業的利潤與生存壽命不受侵襲。",
  "第一性原理": "第一性原理 (First Principles Thinking)：一種將複雜問題或成本結構，逐層拆解到最核心、無法再被否認的基礎物理或技術原子層面，並在此基礎上精確向上重建的決策推演哲學。拒絕依賴任何陳舊的「類比與經驗法則」，常能孕育極低成本的破壞式創新。"
};

const SHOW_ARTICLE_LINKS: Record<string, { label: string; slug: string }> = {
  "護城河": { label: "👉 點選研讀蓋茲大師專題：《大師思維導論》", slug: "masters-thinking" },
  "第一性原理": { label: "👉 點選研讀馬斯克大師專題：《大師思維導論》", slug: "masters-thinking" }
};

interface DefinitionHoverProps {
  term: string;
  children: React.ReactNode;
  key?: React.Key;
}

export default function DefinitionHover({ term, children }: DefinitionHoverProps) {
  const [isVisible, setIsVisible] = useState(false);
  const definition = DICTIONARY[term] || `名詞解釋：${term}，金融工具或交易指標。`;

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = SHOW_ARTICLE_LINKS[term];
    if (link) {
      const event = new CustomEvent("navigate-learn-article", { detail: { slug: link.slug } });
      window.dispatchEvent(event);
    }
  };

  return (
    <span
      className="relative inline-block group"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)}
    >
      <span className="cursor-help border-b border-dashed border-nyt-brick text-nyt-ink hover:text-nyt-brick transition-all duration-150 inline">
        {children}
      </span>
      
      {isVisible && (
        <span className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-nyt-cream border border-nyt-ink text-nyt-ink shadow-lg text-xs leading-relaxed font-sans transition-all duration-200 rounded-sm">
          <span className="block font-semibold mb-1 border-b border-nyt-border pb-1 font-serif-display text-nyt-brick">
            {term} 專用術語解析
          </span>
          {definition}
          {SHOW_ARTICLE_LINKS[term] && (
            <button
              onClick={handleLinkClick}
              className="block mt-2 pt-1.5 border-t border-dashed border-nyt-border text-left w-full text-nyt-brick hover:text-nyt-ink transition-colors font-bold cursor-pointer font-serif-display text-[11px]"
            >
              {SHOW_ARTICLE_LINKS[term].label}
            </button>
          )}
          <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-nyt-ink"></span>
        </span>
      )}
    </span>
  );
}
