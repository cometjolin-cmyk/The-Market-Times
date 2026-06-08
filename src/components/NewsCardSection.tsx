import React, { useState, useEffect } from "react";
import { Newspaper, ArrowUpRight, Loader2, RefreshCw } from "lucide-react";

interface NewsItem {
  title: string;
  snippet: string;
  url: string;
}

interface NewsCardSectionProps {
  symbol: string;
  chineseName: string;
}

export default function NewsCardSection({ symbol, chineseName }: NewsCardSectionProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      // Resolve proper query symbol representation
      let querySymbol = symbol.trim().toUpperCase();
      if (!querySymbol.includes(".") && ["2330", "2317", "2454"].includes(querySymbol)) {
        querySymbol = `${querySymbol}.TW`;
      }

      const res = await fetch(`/api/get_raw_news?symbol=${encodeURIComponent(querySymbol)}`);
      if (!res.ok) {
        throw new Error("無法連接至即時新聞 API");
      }
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.news)) {
        setNews(data.news);
      } else {
        throw new Error("查無該標的之即時新聞資料");
      }
    } catch (err: any) {
      console.error("News fetch error:", err);
      setError(err.message || "新聞資料獲取失敗，系統已自動啟用保險模式。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [symbol]);

  return (
    <div className="bg-[#FAF8F5] border border-nyt-ink p-5 md:p-6 shadow-sm rounded-sm" id="news-card-section-container">
      
      {/* Editorial Header */}
      <div className="flex justify-between items-center border-b-2 border-nyt-ink pb-3 mb-5">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-nyt-brick shrink-0" />
          <div>
            <h3 className="font-serif-display font-black text-lg md:text-xl text-nyt-ink leading-tight">
              即時個股動態與新聞原稿 Press Bulletins
            </h3>
            <p className="font-serif-body text-[11px] text-nyt-gray-light leading-none mt-1">
              後端直拋外網 API 數據分發，100% 真實資訊 &bull; 點擊標題直接跳轉原報導
            </p>
          </div>
        </div>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="p-1.5 hover:bg-nyt-border/50 text-nyt-ink disabled:text-nyt-gray-light rounded-full transition-colors cursor-pointer"
          title="重新整理新聞原稿"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-6 h-6 text-nyt-brick animate-spin" />
          <span className="font-serif-body text-xs text-nyt-gray-light italic">新聞分發路由正取得 Yahoo Finance 原稿中...</span>
        </div>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="font-serif-body text-xs text-nyt-brick italic">
            [系統提示] 目前無法獲取該標的的最新真實數據，請稍後再試。
          </p>
          <button
            onClick={fetchNews}
            className="mt-3 font-sans text-xs text-nyt-ink border border-nyt-ink px-3 py-1 hover:bg-nyt-ink hover:text-white rounded-sm transition-all"
          >
            重試連線
          </button>
        </div>
      ) : news.length === 0 ? (
        <div className="py-8 text-center">
          <p className="font-serif-body text-xs text-nyt-gray-light italic">
            暫時沒有該標的的相關新聞公告。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {news.map((item, index) => (
            <div 
              key={index} 
              className="bg-white border border-nyt-border hover:border-nyt-ink p-4 flex flex-col justify-between transition-all hover:shadow-md group rounded-sm"
              id={`news-card-item-${index}`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-sans font-bold bg-[#EAE5DC] text-nyt-ink px-1.5 py-0.5 uppercase rounded-xs">
                    {symbol}
                  </span>
                  <span className="text-[9px] font-mono text-nyt-gray-light">
                    Bulletin #[{index + 1}]
                  </span>
                </div>
                
                <h4 className="font-serif-display font-bold text-sm md:text-base text-nyt-ink group-hover:text-nyt-brick transition-colors leading-snug line-clamp-2">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    referrerPolicy="no-referrer"
                    className="hover:underline flex items-baseline gap-1"
                  >
                    <span>{item.title}</span>
                  </a>
                </h4>

                <p className="font-serif-body text-xs text-nyt-gray-dark leading-relaxed line-clamp-3">
                  {item.snippet}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-dashed border-[#EAE5DC] flex justify-between items-center text-[11px] font-sans">
                <span className="text-[10px] text-nyt-brick font-bold tracking-wider uppercase">
                  Verified Raw News
                </span>
                <a 
                  href={item.url} 
                  target="_blank" 
                  referrerPolicy="no-referrer"
                  className="font-bold text-nyt-ink hover:text-nyt-brick flex items-center gap-0.5 underline transition-colors group-hover:translate-x-0.5 duration-150"
                >
                  <span>閱讀原文</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
