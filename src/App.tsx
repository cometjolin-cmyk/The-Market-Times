import React, { useState, useEffect } from "react";
import { IndexResponse, Article, StockInfo } from "./types";
import GlobalLiteratureHub from "./components/GlobalLiteratureHub";
import StockChart from "./components/StockChart";
import DefinitionHover from "./components/DefinitionHover";
import InteractiveLabs from "./components/InteractiveLabs";
import InstitutionalIntelligence from "./components/InstitutionalIntelligence";
import NewsCardSection from "./components/NewsCardSection";
import { 
  TrendingUp, 
  BookOpen, 
  BrainCircuit, 
  HelpCircle, 
  Search, 
  ArrowLeft, 
  BookOpenCheck, 
  FileText, 
  Lightbulb, 
  Calendar,
  Sparkles,
  Info,
  Loader2,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Bot
} from "lucide-react";

export default function App() {
  // Routing views state
  const [route, setRoute] = useState<"home" | "learn" | "learn-article" | "analysis" | "labs" | "institutional">("home");
  const [selectedSlug, setSelectedSlug] = useState<string>("candlestick-chart");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("2330");
  
  // Market index values
  const [indexes, setIndexes] = useState<IndexResponse[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [stockDetail, setStockDetail] = useState<StockInfo | null>(null);
  
  // Custom stock search symbol
  const [searchSymbol, setSearchSymbol] = useState("2330");
  const [searchError, setSearchError] = useState("");

  // Gemini stock editorial specific state
  const [geminiStockSummary, setGeminiStockSummary] = useState<{
    headline: string;
    subHeadline: string;
    intro: string;
    paragraphs: string[];
    summaryBullet: string[];
  } | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);

  // --- QUIZ ADDITIONS ---
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizArticle, setQuizArticle] = useState<{ slug: string; title: string; content: string } | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizData, setQuizData] = useState<{ question: string; options: string[]; correctAnswerIndex: number; explanation: string } | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleOpenQuiz = async (slug: string, title: string, content: string) => {
    setIsQuizOpen(true);
    setQuizArticle({ slug, title, content });
    setQuizLoading(true);
    setQuizData(null);
    setSelectedOption(null);
    setShowExplanation(false);

    try {
      const res = await fetch("/api/gemini/article-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title, content })
      });
      if (!res.ok) throw new Error("Quiz API failed");
      const data = await res.json();
      setQuizData(data);
    } catch (e) {
      console.error("Failed to load quiz", e);
    } finally {
      setQuizLoading(false);
    }
  };
  // --------------------------------------

  // Poll global index boards
  const fetchIndexes = async () => {
    try {
      const res = await fetch("/api/indexes");
      const data = await res.json();
      setIndexes(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Pre-load items
  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/articles");
      const data = await res.json();
      setArticles(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadArticleBySlug = async (slug: string) => {
    try {
      const res = await fetch(`/api/articles/${slug}`);
      const data = await res.json();
      setCurrentArticle(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadStockData = async (symbol: string) => {
    try {
      setSearchError("");
      const res = await fetch(`/api/stocks/${symbol}`);
      if (!res.ok) {
        throw new Error("找不到個股資料");
      }
      const data = await res.json();
      setStockDetail(data);
      // Reset Gemini report when symbol transitions
      setGeminiStockSummary(null);
    } catch (e) {
      setSearchError("輸入無效代號（僅限 2330, 2317, 2454, NVDA, AAPL, TSLA）");
    }
  };

  // Generate specific editorial block for stock
  const handleGenerateStockEditorial = async () => {
    if (!stockDetail) return;
    setGeminiLoading(true);
    try {
      const lastPoint = stockDetail.data[stockDetail.data.length - 1];
      const prevPoint = stockDetail.data[stockDetail.data.length - 2];
      const pct = prevPoint ? ((lastPoint.close - prevPoint.close) / prevPoint.close) * 100 : 0;
      
      const res = await fetch("/api/gemini/editorial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: `${stockDetail.chineseName} (${stockDetail.symbol})`,
          recentPrice: lastPoint.close,
          percentChange: pct.toFixed(2) + "%",
          customContext: `針對這檔個股歷史日K、五日線等結構為散戶撰防守策略建議。`
        })
      });
      const data = await res.json();
      setGeminiStockSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setGeminiLoading(false);
    }
  };

  useEffect(() => {
    fetchIndexes();
    fetchArticles();
    loadStockData(selectedSymbol);

    // Live Index updates every 8 seconds
    const interval = setInterval(fetchIndexes, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadStockData(selectedSymbol);
  }, [selectedSymbol]);

  useEffect(() => {
    if (selectedSlug) {
      loadArticleBySlug(selectedSlug);
    }
  }, [selectedSlug]);

  const handleSelectSymbol = (sym: string) => {
    setSelectedSymbol(sym);
    setSearchSymbol(sym);
    setRoute("analysis");
    // Scroll window smoothly down to component
    setTimeout(() => {
      document.getElementById("stock-analysis-terminal")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const cleanSym = searchSymbol.trim().toUpperCase();
      if (["2330", "2317", "2454", "NVDA", "AAPL", "TSLA"].includes(cleanSym)) {
        setSelectedSymbol(cleanSym);
      } else {
        setSearchError("請輸入以下熱門代號：2330, 2317, 2454, NVDA, AAPL, TSLA");
      }
    }
  };

  const today = new Date();
  const formatOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const strDate = today.toLocaleDateString('zh-TW', formatOptions);

  return (
    <div className="min-h-screen bg-nyt-cream text-nyt-ink pb-12 flex flex-col selection:bg-[#EAE4D9]" id="root-container">
      {/* 1. TOP STATELY HEADER (New York Times style) */}
      <header className="px-4 md:px-8 pt-6 max-w-7xl mx-auto w-full">
        {/* Fine border top lines */}
        <div className="border-t border-nyt-ink/30 h-1"></div>
        <div className="border-t border-nyt-ink/80 pt-2 flex justify-between text-[10px] tracking-widest font-mono text-nyt-gray-dark uppercase">
          <span>VOL. CLIN... No. 59,204</span>
          <span className="hidden md:inline">TAIPEI &amp; NEW YORK SPECIAL EDITION</span>
          <span>EST. 2026-06</span>
        </div>

        {/* Grand Title: THE MARKET TIMES */}
        <div className="text-center my-4 md:my-6 relative">
          <h1 className="font-serif-display font-black text-4xl md:text-6xl tracking-tight text-nyt-ink uppercase select-none cursor-default py-1">
            THE MARKET TIMES
          </h1>
          <p className="font-serif-display text-xs md:text-sm font-semibold tracking-widest text-nyt-gray-light italic -mt-1">
            紐 時 財 經 網 — 智 能 估 值 社 論 與 新 手 進 階 指 南
          </p>
        </div>

        {/* Date, Location, Issue Info inside enclosed lines */}
        <div className="border-t-2 border-b border-nyt-ink py-2 flex flex-col md:flex-row justify-between items-center text-xs font-sans tracking-wide">
          <div className="flex items-center space-x-1 font-semibold text-nyt-gray-dark mb-1 md:mb-0">
            <Calendar className="w-3.5 h-3.5 text-nyt-brick" />
            <span>{strDate}</span>
          </div>
          <p className="font-serif-body text-[11px] text-nyt-gray-light text-center md:text-right italic">
            「數據固然真實，唯有社論點燃投資者心中理性之火。」 &bull; 雙日一版
          </p>
        </div>

        {/* Continuous Horizontal Live Index Ticker Tape (水準細線跑馬燈/看板) */}
        <div className="border-b border-nyt-ink/30 overflow-hidden py-2.5 bg-[#FAF8F5]">
          <div className="flex space-x-8 whitespace-nowrap animate-marquee select-none group">
            {/* Render 2 duplicates to create seamless marquee loop */}
            {[1, 2].map(iteration => (
              <div key={iteration} className="inline-flex space-x-8 shrink-0 font-mono text-xs items-center">
                {indexes.map((idx, key) => {
                  const isProfit = idx.change >= 0;
                  return (
                    <span key={key} className="inline-flex items-center space-x-2">
                      <span className="font-semibold text-nyt-ink tracking-tight uppercase">{idx.name.split(" ")[0]}</span>
                      <span className="font-bold text-nyt-gray-dark font-mono">
                        {idx.value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </span>
                      <span className={`font-semibold font-mono ${isProfit ? "text-nyt-forest" : "text-nyt-brick"}`}>
                        {isProfit ? "▲" : "▼"}{idx.percent.toFixed(2)}%
                      </span>
                      <span className="text-nyt-border font-sans text-[10px]">|</span>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Classic Tab Navigation menu enclosed inside pristine thin lines */}
        <nav className="mt-4 flex justify-center border-b border-nyt-ink pb-3 font-serif-display text-sm">
          <div className="flex flex-wrap justify-center gap-1.5 md:gap-4 uppercase tracking-widest font-extrabold text-[11px] md:text-xs font-serif-display">
            <button
              id="navigation-tab-home"
              onClick={() => setRoute("home")}
              className={`px-4 py-2 border transition-all duration-150 rounded-sm cursor-pointer ${
                route === "home" 
                  ? "bg-nyt-ink text-nyt-cream border-nyt-ink shadow-sm" 
                  : "bg-transparent text-nyt-gray-light border-transparent hover:text-nyt-ink hover:border-nyt-border"
              }`}
            >
              📰 每日報表與社論 Daily Editorial
            </button>
            <button
              id="navigation-tab-analysis"
              onClick={() => setRoute("analysis")}
              className={`px-4 py-2 border transition-all duration-150 rounded-sm cursor-pointer ${
                route === "analysis" 
                  ? "bg-nyt-ink text-nyt-cream border-nyt-ink shadow-sm" 
                  : "bg-transparent text-nyt-gray-light border-transparent hover:text-nyt-ink hover:border-nyt-border"
              }`}
            >
              📈 個股 K 線與大盤流速指標
            </button>
            <button
              id="navigation-tab-institutional"
              onClick={() => setRoute("institutional")}
              className={`px-4 py-2 border transition-all duration-150 rounded-sm cursor-pointer ${
                route === "institutional" 
                  ? "bg-nyt-ink text-nyt-cream border-nyt-ink shadow-sm" 
                  : "bg-transparent text-nyt-gray-light border-transparent hover:text-nyt-ink hover:border-nyt-border"
              }`}
            >
              🏛️ 機構級深度研究 Institutional Desk
            </button>
            <button
              id="navigation-tab-learn"
              onClick={() => {
                setRoute("learn");
                // Reset slug default
                setSelectedSlug("candlestick-chart");
              }}
              className={`px-4 py-2 border transition-all duration-150 rounded-sm cursor-pointer ${
                route === "learn" || route === "learn-article"
                  ? "bg-nyt-ink text-nyt-cream border-nyt-ink shadow-sm" 
                  : "bg-transparent text-nyt-gray-light border-transparent hover:text-nyt-ink hover:border-nyt-border"
              }`}
            >
              🎓 新手理財講堂 (Academy)
            </button>
            <button
              id="navigation-tab-labs"
              onClick={() => setRoute("labs")}
              className={`px-4 py-2 border transition-all duration-150 rounded-sm cursor-pointer ${
                route === "labs" 
                  ? "bg-nyt-ink text-nyt-cream border-nyt-ink shadow-sm" 
                  : "bg-transparent text-nyt-gray-light border-transparent hover:text-nyt-ink hover:border-nyt-border"
              }`}
            >
              🔬 數據互動實驗室 Interactive Labs
            </button>
          </div>
        </nav>
      </header>

      {/* 2. DYNAMIC ROUTED VIEWPORT CONTAINER */}
      <main className="px-4 md:px-8 max-w-7xl mx-auto w-full flex-grow mt-6">
        
        {/* Dynamic Route: HOME */}
        {route === "home" && (
          <div className="space-y-8 animate-fadeIn">
            {/* ZONE 2 (Bridge/Middle): 全球財經文獻與實時特稿追蹤 (GlobalLiteratureHub) */}
            <div className="pb-12">
              <GlobalLiteratureHub indexes={indexes} onSelectSymbol={handleSelectSymbol} />
            </div>
          </div>
        )}

        {/* Dynamic Route: STOCK ANALYSIS VIEWER */}
        {route === "analysis" && (
          <div className="animate-fadeIn space-y-8" id="stock-analysis-terminal">
            <div className="text-center max-w-2xl mx-auto pb-4 mb-4 border-b border-nyt-border">
              <span className="font-mono text-[9px] text-nyt-brick uppercase tracking-widest font-extrabold bg-[#FAF8F5] px-2 py-0.5 border border-nyt-border rounded-xs">
                A級實戰操作技術區 &bull; REAL-TIME MARKET PRACTICE
              </span>
              <h2 className="font-serif-display font-extrabold text-3xl text-nyt-ink mt-3 mb-1">
                個股 K 線與大盤流速指標
              </h2>
              <p className="font-serif-body text-sm text-nyt-gray-light leading-relaxed">
                自定義搜索藍籌代號，探勘 5日/20日 均線與成交量柱狀分布。呼喚 AI 生成紐時風評述特稿。
              </p>
            </div>

            {/* Custom stock input picker search box */}
            <div className="max-w-xl mx-auto bg-white border border-nyt-ink p-4 rounded-sm shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nyt-gray-light" />
                  <input
                    type="text"
                    id="stock-symbol-search-input"
                    value={searchSymbol}
                    onChange={(e) => {
                      setSearchSymbol(e.target.value);
                      setSearchError("");
                    }}
                    onKeyDown={handleSearchKeyPress}
                    placeholder="輸入個股代號 (e.g. 2330, 2317, 2454, NVDA)"
                    className="w-full font-sans text-xs pl-9 pr-3 py-2.5 bg-white border border-nyt-border focus:border-nyt-ink focus:outline-none rounded-sm uppercase font-semibold text-nyt-ink"
                  />
                </div>
                <button
                  onClick={() => {
                    const clean = searchSymbol.trim().toUpperCase();
                    if (["2330", "2317", "2454", "NVDA", "AAPL", "TSLA"].includes(clean)) {
                      setSelectedSymbol(clean);
                    } else {
                      setSearchError("請輸入以下熱門代號：2330, 2317, 2454, NVDA, AAPL, TSLA");
                    }
                  }}
                  className="bg-nyt-ink hover:bg-nyt-gray-dark text-white font-sans text-xs font-semibold px-6 py-2.5 shrink-0 transition-colors duration-150 uppercase tracking-widest rounded-sm"
                >
                  搜尋並重繪 K 線
                </button>
              </div>

              {searchError ? (
                <p className="text-xs text-nyt-brick font-serif-body mt-2.5 text-center font-semibold">
                  * {searchError}
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-1.5 items-center justify-center font-sans text-[10px] text-nyt-gray-light">
                  <span className="font-bold mr-1">推薦快速標籤:</span>
                  {["2330", "2317", "2454", "NVDA", "AAPL", "TSLA"].map(sym => (
                    <button
                      key={sym}
                      onClick={() => handleSelectSymbol(sym)}
                      className={`px-2 py-0.5 border rounded-sm hover:border-nyt-ink cursor-pointer ${
                        selectedSymbol === sym ? "border-nyt-brick text-nyt-brick font-bold" : "border-nyt-border"
                      }`}
                    >
                      {sym === "2330" ? "2330台積電" : sym === "2454" ? "2454聯發科" : sym === "2317" ? "2317鴻海" : sym}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Candlestick Chart Render space */}
            {stockDetail ? (
              <div className="space-y-6">
                <StockChart 
                  symbol={stockDetail.symbol} 
                  chineseName={stockDetail.chineseName} 
                  data={stockDetail.data} 
                  currency={stockDetail.currency}
                  currencySymbol={stockDetail.currencySymbol}
                  marketType={stockDetail.marketType}
                  unit={stockDetail.unit}
                />

                <NewsCardSection 
                  symbol={stockDetail.symbol} 
                  chineseName={stockDetail.chineseName} 
                />

                {/* AI Generative Op-Ed panel for this particular Bluechip */}
                <div className="bg-white border border-nyt-border p-6 rounded-sm shadow-sm mt-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-nyt-ink pb-4 mb-4">
                    <div>
                      <h3 className="font-serif-display font-extrabold text-xl text-nyt-ink flex items-center gap-1.5">
                        <BrainCircuit className="w-5 h-5 text-nyt-brick" />
                        AI 主筆特稿評論：{stockDetail.chineseName} ({stockDetail.symbol}) 
                      </h3>
                      <p className="font-serif-body text-xs text-nyt-gray-light mt-1">
                        調用 Google Gemini 客製分析模型，依據當前股價波動、5日均線、20日雙月線大波段進行紐時深度特寫撰寫。
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateStockEditorial}
                      disabled={geminiLoading}
                      className="mt-3 md:mt-0 px-5 py-2.5 bg-nyt-brick hover:bg-red-800 disabled:bg-[#DFD9D0] text-white font-sans text-xs font-bold uppercase tracking-widest flex items-center space-x-1.5 transition-colors duration-150 rounded-sm cursor-pointer"
                    >
                      {geminiLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>主筆正在擬稿中...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>產生紐時分析特稿</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Gemini Rendered Output card */}
                  {geminiLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="w-8 h-8 text-nyt-brick animate-spin" />
                      <p className="font-serif-body italic text-sm text-nyt-gray-light">
                        紐時紐約與台北分部研究室正在調校該股對應之 AI 本益比與除息訊號，請稍候片刻...
                      </p>
                    </div>
                  ) : geminiStockSummary ? (
                    <div className="animate-fadeIn font-serif-body text-sm leading-relaxed text-nyt-ink space-y-4">
                      <div className="text-center py-4 bg-[#FAF8F5] border-y border-nyt-border mb-4">
                        <span className="font-mono text-[10px] text-nyt-brick uppercase tracking-widest font-bold">
                          紐時特稿 &bull; SPECIAL FINANCIAL OP-ED FOR THE MARKET TIMES
                        </span>
                        <h4 className="font-serif-display font-black text-2xl md:text-3xl text-nyt-ink mt-2 leading-none">
                          {geminiStockSummary.headline}
                        </h4>
                        <p className="font-serif-display italic text-nyt-gray-light text-sm mt-2">
                          {geminiStockSummary.subHeadline}
                        </p>
                      </div>

                      <p className="font-serif-display italic text-nyt-gray-light text-center text-xs mb-4">
                        {geminiStockSummary.intro}
                      </p>

                      <div className="md:columns-2 gap-6 text-justify leading-relaxed pb-4 text-nyt-ink border-b border-nyt-border">
                        {geminiStockSummary.paragraphs.map((p, idx) => (
                          <p key={idx} className="mb-4">{p}</p>
                        ))}
                      </div>

                      <div className="mt-4 p-4 bg-[#F2EDE2] border-l-4 border-nyt-brick">
                        <h5 className="font-serif-display font-bold text-xs text-nyt-brick mb-2 uppercase tracking-wide">
                          本期大師戰略提示 Master Strategies
                        </h5>
                        <ul className="list-disc pl-5 font-sans text-xs text-nyt-gray-dark space-y-1">
                          {geminiStockSummary.summaryBullet.map((bullet, idx) => (
                            <li key={idx}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 border border-dashed border-nyt-border rounded-sm text-center bg-[#FAF8F5]">
                      <Sparkles className="w-8 h-8 text-nyt-border mx-auto mb-3" />
                      <p className="font-serif-body text-xs text-nyt-gray-light leading-relaxed max-w-sm mx-auto">
                        目前尚未產生本個股之 AI 特別評論。點選上方「<span className="text-nyt-brick font-semibold">產生紐時分析特稿</span>」按鈕，Gemini 將立即調閱這檔個股歷史均線趨勢與成交量，為您書寫專業社論。
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 border border-dashed border-nyt-border rounded-sm text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-nyt-gray-light mb-3" />
                <p className="text-xs font-serif-body text-nyt-gray-light">
                  大盤與個股數據解析中...
                </p>
              </div>
            )}
          </div>
        )}


        {/* Dynamic Route: LEARN ACADEMY LIST */}
        {route === "learn" && (
          <div className="animate-fadeIn space-y-6">
            <div className="text-center max-w-2xl mx-auto pb-4 mb-4 border-b border-nyt-border">
              <h2 className="font-serif-display font-extrabold text-3xl text-nyt-ink mb-2">
                理財新手培訓專區 Learn Center
              </h2>
              <p className="font-serif-body text-sm text-nyt-gray-light leading-relaxed">
                我們深信，每位涉足風浪之中的交易者，都應具備解構價格圖、計算本益比等核心基本功。研讀以下講堂專題，透過「字詞懸停系統」即時獲得高精度解釋。
              </p>
            </div>

            {/* Structured single column academic layout (極致的單欄式文章列表) */}
            <div className="max-w-3xl mx-auto space-y-6" id="learning-article-list">
              {articles.map((art, i) => (
                <div 
                  key={art.slug}
                  className="bg-white border border-nyt-border p-6 rounded-sm hover:border-nyt-ink transition-all duration-200 shadow-sm flex flex-col md:flex-row md:items-start md:justify-between cursor-pointer group"
                  onClick={() => {
                    setSelectedSlug(art.slug);
                    setRoute("learn-article");
                  }}
                >
                  <div className="flex-1 md:pr-6">
                    <div className="flex items-center space-x-2 mb-2 font-sans text-[10px] tracking-widest uppercase text-nyt-brick font-bold">
                      <BookOpenCheck className="w-3.5 h-3.5" />
                      <span>{art.category}</span>
                    </div>
                    <h3 className="font-serif-display font-extrabold text-xl md:text-2xl text-nyt-ink group-hover:text-nyt-brick transition-colors duration-150 leading-tight mb-2">
                      {art.chineseTitle}
                    </h3>
                    <p className="font-serif-body text-xs text-nyt-gray-light italic mb-1">
                      {art.title}
                    </p>
                    <p className="font-sans text-xs text-nyt-gray-dark leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                   <div className="mt-4 md:mt-0 flex md:flex-col items-baseline md:items-end justify-between border-t md:border-t-0 border-nyt-border pt-3 md:pt-0 font-sans text-xs shrink-0 self-stretch md:self-auto gap-4">
                     <div className="text-right shrink-0">
                       <span className="text-nyt-gray-light italic">{art.author}</span>
                       <span className="text-[10px] bg-nyt-cream border border-nyt-border px-2 py-0.5 mt-2 rounded-sm uppercase tracking-widest text-nyt-gray-dark font-mono block">
                         {art.readingTime}
                       </span>
                     </div>
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         handleOpenQuiz(art.slug, art.chineseTitle, art.content);
                       }}
                       className="bg-transparent hover:bg-nyt-brick border border-nyt-brick text-nyt-brick hover:text-white font-sans text-[10px] font-extrabold px-3 py-1.5 transition-all duration-150 rounded-sm uppercase tracking-wider block shadow-xs cursor-pointer"
                     >
                       ✍️ 測驗你的投資邏輯
                     </button>
                   </div>
                </div>
              ))}
            </div>
            
            {/* Micro instruction badge */}
            <div className="max-w-2xl mx-auto mt-6 bg-[#FAF8F5] border border-nyt-border p-4 rounded-sm">
              <p className="font-serif-body text-xs text-nyt-gray-light text-center mb-3">
                * 本專區之文章內容中，若單詞底端帶有 <span className="border-b border-dashed border-nyt-brick text-nyt-brick font-semibold">對角線虛線</span> 印記，表明其為核心理財術語，當滑鼠懸停 (或在載體上點按) 時將於頁面提示高階剖析。
              </p>
              <div className="border-t border-dashed border-[#E2E2E2] pt-2.5 flex flex-wrap justify-between items-center text-[10px] font-sans text-nyt-gray-light">
                <div className="flex items-center space-x-1 flex-wrap">
                  <svg className="w-3 h-3 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>本講堂之學術與數據理論來源：</span>
                  <span className="font-medium text-nyt-ink">臺灣證券交易所 (TWSE) 投資人知識專專區</span>
                  <span className="mx-1 text-gray-300">|</span>
                  <a href="https://www.cfainstitute.org" target="_blank" rel="noopener noreferrer" className="text-nyt-ink underline underline-offset-2 hover:text-nyt-brick transition-all font-medium">CFA Institute Literature ↗</a>
                  <span className="mx-1 text-gray-300">|</span>
                  <span className="font-medium text-nyt-ink">葛拉漢《聰明的投資人》理論模型</span>
                </div>
                <span className="text-gray-400 font-serif-body">A級理財學術認證</span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Route: LEARN DETAILED ARTICLE PAGE */}
        {route === "learn-article" && currentArticle && (
          <div className="animate-fadeIn max-w-3xl mx-auto">
            {/* Back button */}
            <button 
              id="back-to-learning-btn"
              onClick={() => setRoute("learn")}
              className="mb-6 flex items-center space-x-1.5 font-sans text-xs font-semibold text-nyt-gray-light hover:text-nyt-ink transition-colors duration-150"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回講堂清單 Back to Learn List</span>
            </button>

            {/* Print paper styled headers */}
            <div className="border-b border-nyt-ink pb-4 mb-6">
              <span className="font-sans text-[10px] font-bold text-nyt-brick uppercase tracking-widest block mb-2">
                {currentArticle.category} &bull; 特約講學特稿
              </span>
              <h2 className="font-serif-display font-extrabold text-3xl md:text-4xl text-nyt-ink leading-tight tracking-tight mb-2">
                {currentArticle.chineseTitle}
              </h2>
              <p className="font-serif-display text-lg text-nyt-gray-light italic leading-normal">
                {currentArticle.title}
              </p>
              
              <div className="mt-4 flex flex-wrap justify-between items-center text-xs font-mono text-nyt-gray-dark pt-3 border-t border-nyt-border">
                <span>專欄撰寫員：{currentArticle.author}</span>
                <span>研學時程指標：{currentArticle.readingTime}</span>
              </div>
            </div>

            {/* Article detailed content with custom parser that maps keywords to DefinitionHover tooltips */}
            <div className="font-serif-body text-sm md:text-base text-nyt-ink leading-relaxed space-y-6 text-justify pb-10 border-b border-nyt-border">
              {currentArticle.content.split("\n\n").map((paragraphText, idx) => {
                // Inline dictionary substitution for terms:
                // We parse strings like "<b class="term-hover..." data-term="...">KEYWORD</b>" and render real component tags
                const tokens = paragraphText.split(/(<b class="term-hover[^>]+>[^<]+<\/b>)/g);
                
                return (
                  <p key={idx}>
                    {tokens.map((token, tokenIdx) => {
                      if (token.startsWith("<b class=")) {
                        // Extract keyword and term matching indicators
                        const termMatch = token.match(/data-term="([^"]+)"/);
                        const labelMatch = token.match(/>([^<]+)<\/b>/);
                        if (termMatch && labelMatch) {
                          const term = termMatch[1];
                          const label = labelMatch[1];
                          return (
                            <DefinitionHover key={tokenIdx} term={term}>
                              {label}
                            </DefinitionHover>
                          );
                        }
                      }
                      return token;
                    })}
                  </p>
                );
              })}
            </div>

            {/* 🚀 關鍵加強：單篇理財講堂學術來源與理論文獻註腳 (Article Source Footnote) */}
            <div className="mt-8 pt-4 border-t border-dashed border-[#E2E2E2] flex flex-wrap justify-between items-center text-[10px] font-sans text-nyt-gray-light">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>學術引言與理論依據文獻：</span>
                <span className="font-medium text-nyt-ink">臺灣證券交易所 (TWSE) 投資人知識專區</span>
                <span className="mx-1.5 text-gray-300">|</span>
                <a href="https://www.cfainstitute.org" target="_blank" rel="noopener noreferrer" className="text-nyt-ink underline underline-offset-2 hover:text-nyt-brick transition-all font-medium">CFA Institute Study Book ↗</a>
                <span className="mx-1.5 text-gray-300">|</span>
                <span className="font-medium text-nyt-ink">葛拉漢、巴菲特價值估值思維</span>
              </div>
              <span className="text-gray-400 font-serif-body">本學術特稿經理財學術委員會審定認可</span>
            </div>

            {/* Preceding/next Navigation shortcut inside a neat paper block */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#FAF8F5] border border-[#CCCCCC] p-5 rounded-sm">
              <div className="text-left font-sans text-xs">
                <span className="text-nyt-gray-light block text-[10px] uppercase tracking-wider font-bold">當前閱研 PROGRESS</span>
                <span className="font-serif-display font-extrabold text-[#111111] text-sm">{currentArticle.chineseTitle}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => handleOpenQuiz(currentArticle.slug, currentArticle.chineseTitle, currentArticle.content)}
                  className="bg-nyt-brick hover:bg-red-800 border border-nyt-brick text-white font-sans text-xs font-bold px-5 py-2.5 transition-all duration-150 uppercase tracking-widest rounded-sm flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>✍️ 測驗我的投資邏輯 (Quiz)</span>
                </button>
                <button
                  onClick={() => setRoute("learn")}
                  className="bg-transparent hover:bg-nyt-ink border border-nyt-ink text-nyt-ink hover:text-nyt-cream font-sans text-xs font-semibold px-5 py-2.5 transition-all duration-150 uppercase tracking-widest rounded-sm cursor-pointer"
                >
                  完課並返回
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Route: INTERACTIVE SIMULATION LABS */}
        {route === "labs" && (
          <div className="animate-fadeIn space-y-6">
            <InteractiveLabs />
          </div>
        )}

        {/* Dynamic Route: INSTITUTIONAL INTELLIGENCE DESK */}
        {route === "institutional" && (
          <div className="animate-fadeIn space-y-6">
            <InstitutionalIntelligence />
          </div>
        )}

      </main>

      {/* 3. PRINT STYLE FOOTER */}
      <footer className="mt-16 border-t border-nyt-ink pt-8 max-w-7xl mx-auto w-full px-4 md:px-8 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-b border-nyt-border pb-6 font-sans text-xs text-nyt-gray-light">
          <div>
            <h4 className="font-serif-display font-extrabold text-nyt-ink mb-2 uppercase tracking-wide">
              關於 THE MARKET TIMES
            </h4>
            <p className="leading-relaxed font-serif-body">
              我們是以《紐約時報》極致新聞排版風格為靈感建立的虛擬股票學習論壇。結合尖端大型語言模型 (Large Language Models) 對市場波動進行高保真論證分析，協助理財新手在安全、優美的介面中熟稔 K 線幾何指標。
            </p>
          </div>
          <div>
            <h4 className="font-serif-display font-extrabold text-nyt-ink mb-2 uppercase tracking-wide">
              名詞懸停術語系統 Glossary
            </h4>
            <p className="leading-relaxed font-serif-body">
              所有文章之關鍵標籤皆已預裝主筆室常設字典。滑鼠移至帶點狀襯底單詞上，即可在不打斷閱讀的格局下，迅速獲悉如本益比、陽線錘子、除權息平衡的最佳解構。
            </p>
          </div>
          <div>
            <h4 className="font-serif-display font-extrabold text-nyt-ink mb-2 uppercase tracking-wide">
              資產配置免責聲明 Disclaimer
            </h4>
            <p className="leading-relaxed text-[11px] font-sans">
              * 紐時財經網所顯示之所有股指看板變動、個股歷史成交價格及 AI 生成之報告、分析論調，均僅供學理學習與技術展示目的使用，不構成任何真實證券交易或投資理財之特定保證或要約。
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row justify-between items-center text-[11px] font-mono text-nyt-gray-light uppercase tracking-wider">
          <span>&copy; 2026 THE MARKET TIMES INC. ALL RIGHTS RESERVED.</span>
          <span className="mt-2 md:mt-0">版權所有 紐時財經學習特權版 &bull; VOL. CLXXV</span>
        </div>
      </footer>

      {/* 4. CHINESE TRADITIONAL QUIZ MODAL */}
      {isQuizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nyt-ink/65 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#FAF8F5] border-3 border-nyt-ink p-6 md:p-8 shadow-2xl rounded-xs flex flex-col max-h-[90vh] overflow-y-auto">
            {/* Header banner */}
            <div className="border-b-2 border-nyt-ink pb-4 mb-6 text-center">
              <span className="font-mono text-[9px] text-[#A6192E] font-bold uppercase tracking-widest bg-[#EFECE6] px-2 py-0.5 border border-[#CCCCCC]">
                紐時投資邏輯檢定 &bull; EXAMINEE DIALOG
              </span>
              <h3 className="font-serif-display font-black text-2xl text-nyt-ink mt-3">
                {quizArticle?.title || "學術測驗"}
              </h3>
              <p className="font-serif-body text-xs italic text-nyt-gray-light mt-1">
                根據文章授課核心，考驗您的情境決策深度
              </p>
            </div>

            {/* Loading Indicator */}
            {quizLoading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-[#A6192E] animate-spin" />
                <p className="font-serif-body italic text-sm text-nyt-gray-light">
                  正在為您調集該理財主旨之核心考題，主筆室正在核閱中...
                </p>
              </div>
            ) : quizData ? (
              <div className="space-y-6">
                {/* Question */}
                <div className="p-4 bg-white border border-[#D5D2C9] rounded-sm">
                  <span className="font-mono text-[10px] text-[#A6192E] uppercase tracking-wider font-extrabold block mb-1.5">
                    情境問答題 CASE QUESTION
                  </span>
                  <p className="font-serif-display font-extrabold text-[#111111] text-[16px] leading-relaxed animate-fadeIn">
                    {quizData.question}
                  </p>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {quizData.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === quizData.correctAnswerIndex;
                    let optionStyle = "border-[#D5D2C9] hover:border-nyt-ink hover:bg-[#FAF8F5]";
                    
                    if (showExplanation) {
                      if (isCorrect) {
                        optionStyle = "border-green-600 bg-green-50 text-green-900";
                      } else if (isSelected) {
                        optionStyle = "border-[#A6192E] bg-red-50 text-[#A6192E]";
                      } else {
                        optionStyle = "border-[#E5E5E5] opacity-60";
                      }
                    } else if (isSelected) {
                      optionStyle = "border-nyt-ink bg-nyt-ink text-white font-bold";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={showExplanation}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full text-left p-4 border rounded-sm font-sans text-xs flex items-start gap-3 transition-all duration-150 cursor-pointer ${optionStyle}`}
                      >
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono shrink-0 ${
                          isSelected ? "bg-nyt-ink text-white border-transparent" : "border-nyt-border bg-white text-nyt-ink"
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-relaxed flex-1">{opt}</span>
                        {showExplanation && isCorrect && <Check className="w-4 h-4 text-green-600 shrink-0 self-center" />}
                        {showExplanation && isSelected && !isCorrect && <X className="w-4 h-4 text-[#A6192E] shrink-0 self-center" />}
                      </button>
                    );
                  })}
                </div>

                {/* Submit button / Action bar */}
                {!showExplanation ? (
                  <div className="pt-4 border-t border-[#D5D2C9] flex justify-end">
                    <button
                      disabled={selectedOption === null}
                      onClick={() => setShowExplanation(true)}
                      className="px-6 py-2.5 bg-[#A6192E] disabled:bg-[#DFD9D0] hover:bg-red-800 disabled:text-nyt-gray-light text-white font-sans text-xs font-bold uppercase tracking-widest rounded-sm transition-colors duration-150 cursor-pointer"
                    >
                      送出答案交卷
                    </button>
                  </div>
                ) : (
                  <div className="animate-fadeIn space-y-4 pt-4 border-t border-[#D5D2C9]">
                    <div className="p-5 bg-[#F2EDE2] border-l-4 border-nyt-brick italic">
                      <h4 className="font-serif-display font-bold text-sm text-nyt-brick flex items-center gap-1.5 mb-2">
                        <Sparkles className="w-4 h-4" />
                        【 紐時主筆專利解密 】
                      </h4>
                      <p className="font-serif-body text-xs text-nyt-ink leading-relaxed text-justify whitespace-pre-line">
                        {quizData.explanation}
                      </p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          setIsQuizOpen(false);
                          setQuizArticle(null);
                          setQuizData(null);
                        }}
                        className="px-6 py-2.5 bg-nyt-ink hover:bg-nyt-gray-dark text-white font-sans text-xs font-bold uppercase tracking-widest rounded-sm transition-colors duration-150 cursor-pointer"
                      >
                        完成關閉測驗
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-nyt-gray-light font-serif-body text-xs">
                出題發生未知重力偏移，請關閉並重新整理。
              </div>
            )}

            {/* Quick close corner cross button */}
            <button
              onClick={() => {
                setIsQuizOpen(false);
                setQuizArticle(null);
                setQuizData(null);
              }}
              className="absolute top-4 right-4 text-nyt-gray-light hover:text-nyt-ink transition-colors duration-150 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
