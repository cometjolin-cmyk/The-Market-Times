import React, { useState } from "react";
import InteractiveCandlestick from "./InteractiveCandlestick";
import { Sparkles, BarChart2, DollarSign, Rocket, PieChart, ShieldAlert, ChevronRight, Activity, ArrowRightLeft } from "lucide-react";

export default function InteractiveLabs() {
  const [activeTab, setActiveTab] = useState<"candle" | "institutional" | "pe" | "matching">("candle");

  // 1. Institutional Trading Balance States
  const [foreignBuy, setForeignBuy] = useState(1); // -5 to +5 multiplier
  const [trustBuy, setTrustBuy] = useState(0); 
  const [dealerBuy, setDealerBuy] = useState(-1);
  const totalBalance = foreignBuy + trustBuy + dealerBuy;
  const indexValue = 21568 + totalBalance * 150;

  // 2. PE bubble valuation states
  const [growthRate, setGrowthRate] = useState(15); // percent 5% to 50%
  const chipmakerEPS = 12;
  const bakeryEPS = 8;
  const bakeryPE = 12; // Stable conventional
  const chipmakerPE = Math.floor(12 + growthRate * 0.9); // Dynamic PE mapping growth expectation
  const chipmakerPrice = chipmakerEPS * chipmakerPE;
  const bakeryPrice = bakeryEPS * bakeryPE;

  // 3. Matching Game Order Book States
  const [orderBookBids, setOrderBookBids] = useState([
    { id: 1, price: 835, qty: 120 },
    { id: 2, price: 834, qty: 250 },
    { id: 3, price: 833, qty: 400 }
  ]);
  const [orderBookAsks, setOrderBookAsks] = useState([
    { id: 4, price: 836, qty: 150 },
    { id: 5, price: 837, qty: 300 },
    { id: 6, price: 838, qty: 500 }
  ]);
  const [recentTransactions, setRecentTransactions] = useState([
    { time: "13:28", price: 835.5, size: 50, type: "buy" },
    { time: "13:29", price: 835, size: 200, type: "sell" }
  ]);

  const executeMarketOrder = (type: "buy" | "sell") => {
    if (type === "buy") {
      // Buy hits lowest Ask
      if (orderBookAsks.length === 0) return;
      const targetAsk = orderBookAsks[0];
      const execPrice = targetAsk.price;
      
      // Animate hit
      setRecentTransactions(prev => [
        { time: "13:30", price: execPrice, size: 100, type: "buy" },
        ...prev.slice(0, 4)
      ]);

      // Remove or slice quantity
      if (targetAsk.qty <= 100) {
        setOrderBookAsks(prev => prev.slice(1));
      } else {
        setOrderBookAsks(prev => [
          { ...targetAsk, qty: targetAsk.qty - 100 },
          ...prev.slice(1)
        ]);
      }
    } else {
      // Sell hits highest Bid
      if (orderBookBids.length === 0) return;
      const targetBid = orderBookBids[0];
      const execPrice = targetBid.price;

      setRecentTransactions(prev => [
        { time: "13:30", price: execPrice, size: 100, type: "sell" },
        ...prev.slice(0, 4)
      ]);

      if (targetBid.qty <= 100) {
        setOrderBookBids(prev => prev.slice(1));
      } else {
        setOrderBookBids(prev => [
          { ...targetBid, qty: targetBid.qty - 100 },
          ...prev.slice(1)
        ]);
      }
    }
  };

  const resetOrderBook = () => {
    setOrderBookBids([
      { id: 1, price: 835, qty: 120 },
      { id: 2, price: 834, qty: 250 },
      { id: 3, price: 833, qty: 400 }
    ]);
    setOrderBookAsks([
      { id: 4, price: 836, qty: 150 },
      { id: 5, price: 837, qty: 300 },
      { id: 6, price: 838, qty: 500 }
    ]);
  };

  return (
    <div className="space-y-6" id="interactive-framework-widget">
      
      {/* Category Navigation (Tabs) */}
      <div className="flex border-b border-nyt-ink pb-3 justify-center text-xs font-sans md:space-x-4 flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("candle")}
          className={`px-3 py-1.5 border uppercase tracking-wider font-bold rounded-sm transition-colors duration-150 ${
            activeTab === "candle"
              ? "bg-nyt-ink text-nyt-cream border-nyt-ink"
              : "bg-transparent text-nyt-gray-light border-transparent hover:border-nyt-border hover:text-nyt-ink"
          }`}
        >
          🕯 K線力學實驗室 Candle Physics
        </button>
        <button
          onClick={() => setActiveTab("institutional")}
          className={`px-3 py-1.5 border uppercase tracking-wider font-bold rounded-sm transition-colors duration-150 ${
            activeTab === "institutional"
              ? "bg-nyt-ink text-nyt-cream border-nyt-ink"
              : "bg-transparent text-nyt-gray-light border-transparent hover:border-nyt-border hover:text-nyt-ink"
          }`}
        >
          ⚖ 三大法人籌碼秤 Institutional Balance
        </button>
        <button
          onClick={() => setActiveTab("pe")}
          className={`px-3 py-1.5 border uppercase tracking-wider font-bold rounded-sm transition-colors duration-150 ${
            activeTab === "pe"
              ? "bg-nyt-ink text-nyt-cream border-nyt-ink"
              : "bg-transparent text-nyt-gray-light border-transparent hover:border-nyt-border hover:text-nyt-ink"
          }`}
        >
          🫧 本益比泡泡比價估算 Bubble Valuation
        </button>
        <button
          onClick={() => setActiveTab("matching")}
          className={`px-3 py-1.5 border uppercase tracking-wider font-bold rounded-sm transition-colors duration-150 ${
            activeTab === "matching"
              ? "bg-nyt-ink text-nyt-cream border-nyt-ink"
              : "bg-transparent text-nyt-gray-light border-transparent hover:border-nyt-border hover:text-nyt-ink"
          }`}
        >
          ⚙ 訂單簿瞬時撮合 Order Book Gear
        </button>
      </div>

      {/* Tab: CANDLE */}
      {activeTab === "candle" && (
        <InteractiveCandlestick />
      )}

      {/* Tab: INSTITUTIONAL */}
      {activeTab === "institutional" && (
        <div className="bg-white border border-nyt-ink p-5 md:p-6 shadow-sm rounded-sm animate-fadeIn">
          <div className="border-b border-nyt-ink pb-3 mb-6">
            <span className="text-[10px] font-mono font-bold text-nyt-brick uppercase tracking-widest block">
              Simulation Lab &bull; Volume 02
            </span>
            <h3 className="font-serif-display font-extrabold text-xl text-nyt-ink">
              籌碼重力天平：三大法人買賣超籌碼面與指數關係
            </h3>
            <p className="font-serif-body text-xs text-nyt-gray-light mt-1">
              當外資 (Foreign Partners)、投信 (Local Funds)、自營商 (Local Dealers)
              共同偏向買超，市場推力增大，指數隨之升空；若其共識回吐賣出，總淨重天平傾斜，價格趨重。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Controls */}
            <div className="md:col-span-5 space-y-5 bg-[#FAF8F5] p-4 border border-nyt-border rounded-sm">
              <h4 className="font-serif-display font-bold text-xs text-nyt-brick mb-2 uppercase tracking-wide">
                注資買賣超撥軌 Leverage Lever
              </h4>

              {/* Slider 1: Foreign */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-sans">
                  <span className="font-semibold text-nyt-ink">外資籌碼 (Foreign Inst.)</span>
                  <span className={`font-mono font-bold ${foreignBuy >= 0 ? "text-nyt-forest" : "text-nyt-brick"}`}>
                    {foreignBuy > 0 ? "買超 +" : foreignBuy < 0 ? "賣超 " : "中立 "}{foreignBuy * 50} 億
                  </span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  value={foreignBuy}
                  onChange={(e) => setForeignBuy(parseInt(e.target.value))}
                  className="w-full accent-nyt-ink cursor-pointer"
                />
              </div>

              {/* Slider 2: Trust */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-sans">
                  <span className="font-semibold text-nyt-ink">投信籌碼 (Local Trust)</span>
                  <span className={`font-mono font-bold ${trustBuy >= 0 ? "text-nyt-forest" : "text-nyt-brick"}`}>
                    {trustBuy > 0 ? "買超 +" : trustBuy < 0 ? "賣超 " : "中立 "}{trustBuy * 20} 億
                  </span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  value={trustBuy}
                  onChange={(e) => setTrustBuy(parseInt(e.target.value))}
                  className="w-full accent-nyt-ink cursor-pointer"
                />
              </div>

              {/* Slider 3: Dealer */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-sans">
                  <span className="font-semibold text-nyt-ink">自營商籌碼 (Dealers)</span>
                  <span className={`font-mono font-bold ${dealerBuy >= 0 ? "text-nyt-forest" : "text-nyt-brick"}`}>
                    {dealerBuy > 0 ? "買超 +" : dealerBuy < 0 ? "賣超 " : "中立 "}{dealerBuy * 15} 億
                  </span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  value={dealerBuy}
                  onChange={(e) => setDealerBuy(parseInt(e.target.value))}
                  className="w-full accent-nyt-ink cursor-pointer"
                />
              </div>

              <div className="border-t border-nyt-border pt-3">
                <div className="flex justify-between text-xs font-sans">
                  <span className="font-bold text-nyt-ink">三大法人總買賣超合計</span>
                  <span className={`font-mono font-bold ${totalBalance >= 0 ? "text-nyt-forest" : "text-nyt-brick"}`}>
                    {totalBalance > 0 ? "淨買超 +" : totalBalance < 0 ? "淨賣超 " : "平盤量 "}
                    {Math.abs(foreignBuy * 50 + trustBuy * 20 + dealerBuy * 15)} 億元
                  </span>
                </div>
              </div>
            </div>

            {/* Right graphic visual animation */}
            <div className="md:col-span-7 flex flex-col items-center justify-center p-6 bg-nyt-cream border border-nyt-border rounded-sm min-h-[280px]">
              
              {/* Dynamic Balance Scales 天平 */}
              <div className="relative w-full max-w-[280px] mb-8">
                {/* Scale beam (rotates based on totalBalance) */}
                <div 
                  className="h-1 bg-nyt-ink w-full relative transition-transform duration-300 origin-center"
                  style={{ transform: `rotate(${totalBalance * 3}deg)` }}
                >
                  {/* Left scale basket (Buyer scale item) */}
                  <div className="absolute -left-1 -top-1 w-6 h-6 bg-nyt-forest border border-nyt-ink rounded-full flex items-center justify-center text-[10px] text-white font-mono font-bold">
                    買
                  </div>

                  {/* Right scale basket (Seller scale item) */}
                  <div className="absolute -right-1 -top-1 w-6 h-6 bg-nyt-brick border border-nyt-ink rounded-full flex items-center justify-center text-[10px] text-white font-mono font-bold">
                    賣
                  </div>
                </div>
                {/* Scale Fulcrum support stand */}
                <div className="w-1.5 h-16 bg-nyt-ink mx-auto mt-0"></div>
                <div className="w-12 h-2 bg-nyt-ink mx-auto"></div>
              </div>

              {/* Output Rocket/Trend reaction */}
              <div className="text-center font-sans space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-nyt-gray-light">
                  大盤加權指數預測估算 Index Metric Impact
                </span>
                <div className="flex items-center justify-center space-x-2">
                  <span className="font-serif-display font-bold text-2xl text-nyt-ink">
                    {indexValue.toFixed(1)} 點
                  </span>
                  {totalBalance > 0 ? (
                    <span className="text-nyt-forest font-bold text-sm bg-green-100 px-2 py-0.5 animate-bounce flex items-center gap-1 rounded-sm">
                      <Rocket className="w-3.5 h-3.5" /> 多頭火箭升空
                    </span>
                  ) : totalBalance < 0 ? (
                    <span className="text-nyt-brick font-bold text-sm bg-red-100 px-2 py-0.5 flex items-center gap-1 rounded-sm">
                      <ShieldAlert className="w-3.5 h-3.5" /> 空方地心引力
                    </span>
                  ) : (
                    <span className="text-nyt-gray-light font-bold text-sm bg-gray-100 px-2 py-0.5 rounded-sm">
                      量平盤整中
                    </span>
                  )}
                </div>

                <p className="font-serif-body text-[11px] text-nyt-gray-light italic max-w-sm">
                  {totalBalance > 1 
                    ? "三個法人的重力砝碼顯著壓向『買超』一端。此時代表買盤承接力道厚實，高機率在量能配合下推破上檔重力防線，指數呈噴射格局。"
                    : totalBalance < -1
                    ? "沽盤極化，籌碼籌措重力偏向『賣方』。若無實體大資本護盤，容易形成技術性的連續撤守，暗示空方把握支配權。"
                    : "籌碼此消彼消，買方與賣方的物理力矩基本平移。市場等待下一個代表大趨勢變化的邊際砝碼注入。"}
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Tab: PE */}
      {activeTab === "pe" && (
        <div className="bg-white border border-nyt-ink p-5 md:p-6 shadow-sm rounded-sm animate-fadeIn">
          <div className="border-b border-nyt-ink pb-3 mb-6">
            <span className="text-[10px] font-mono font-bold text-nyt-brick uppercase tracking-widest block">
              Simulation Lab &bull; Volume 03
            </span>
            <h3 className="font-serif-display font-extrabold text-xl text-nyt-ink">
              倍數泡泡學：本益比 (P/E Ratio) 在期待與泡沫間的折射
            </h3>
            <p className="font-serif-body text-xs text-nyt-gray-light mt-1">
              投資常說成長股享有更高本益比，這究竟是什麼概念？拖動預期成長率滑桿，視圖兩家在相同獲利基礎下，本益比泡泡如何因「樂觀預期」吹大或因「高風險」引人戒備。
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-nyt-cream border border-nyt-border p-4 rounded-sm max-w-xl mx-auto space-y-2">
              <div className="flex justify-between text-xs font-sans">
                <span className="font-bold text-nyt-ink">預期成長率 / 期待發酵指數</span>
                <span className="text-nyt-brick font-bold font-mono">+{growthRate}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={growthRate}
                onChange={(e) => setGrowthRate(parseInt(e.target.value))}
                className="w-full accent-nyt-ink cursor-pointer"
              />
              <p className="font-serif-body text-[10px] text-nyt-gray-light">
                * 註：當預期核心年增率從5%拉高到50%，市場會賦予半導體 AI 晶片巨擘高達 40x 到 60x 的估值配置；而傳統麵包店因利基飽和，估值不隨之劇變。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Bakery Card */}
              <div className="border border-nyt-border p-5 rounded-sm flex flex-col justify-between hover:border-nyt-ink transition-all">
                <div>
                  <div className="flex justify-between items-baseline border-b border-nyt-border pb-2 mb-3">
                    <span className="font-semibold text-nyt-ink uppercase text-xs">A 傳統穩健：香榭大麵包坊</span>
                    <span className="font-mono text-[9px] bg-gray-100 text-nyt-gray-dark px-1.5 py-0.5 rounded-sm">傳統製造</span>
                  </div>
                  <p className="font-serif-body text-xs text-nyt-gray-light leading-relaxed mb-4">
                    每年穩定出爐，EPS 為 $8 代表獲利紮實，但其成长上限由實體店面數量制約，故本益比錨定在固定的 12 倍。
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[10px] text-nyt-gray-light font-mono">本益比: 12X</div>
                    <div className="text-sm font-serif-display font-semibold text-nyt-ink">每股股價: $96.0</div>
                  </div>
                  {/* Bubble Visual representative size */}
                  <div 
                    className="w-12 h-12 bg-gray-200 border border-nyt-ink rounded-full flex items-center justify-center text-[10px] font-mono text-nyt-gray-dark transition-all duration-300"
                    style={{ transform: "scale(1.0)" }}
                  >
                    12x
                  </div>
                </div>
              </div>

              {/* Chipmaker (Tech Giant) Card */}
              <div className="border border-nyt-brick p-5 rounded-sm flex flex-col justify-between hover:shadow-sm bg-[#FAF8F5] transition-all">
                <div>
                  <div className="flex justify-between items-baseline border-b border-nyt-brick/30 pb-2 mb-3">
                    <span className="font-semibold text-nyt-brick uppercase text-xs">B 高科技革命：芯輝科技晶片社</span>
                    <span className="font-mono text-[9px] bg-red-100 text-nyt-brick px-1.5 py-0.5 rounded-sm font-bold">未來AI成長股</span>
                  </div>
                  <p className="font-serif-body text-xs text-nyt-gray-light leading-relaxed mb-4">
                    正在佈局具備高訂價護城河之 AI 新晶片。目前基礎 EPS 為 $12。當你拖大成長期待，本益比倍數泡泡將瘋狂吹拂，象徵「溢價」預先透支！
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[10px] text-nyt-brick font-mono font-bold">前瞻本益比: {chipmakerPE}X</div>
                    <div className="text-sm font-serif-display font-bold text-nyt-ink">預估股價: ${chipmakerPrice.toFixed(1)}</div>
                  </div>
                  {/* Dynamic Scaling expectations bubble */}
                  <div 
                    className="bg-red-50 border-2 border-nyt-brick rounded-full flex items-center justify-center text-[10px] font-mono text-nyt-brick font-bold transition-all duration-200 shadow-md"
                    style={{ 
                      width: `${40 + chipmakerPE * 1.6}px`, 
                      height: `${40 + chipmakerPE * 1.6}px`,
                      maxHeight: "130px",
                      maxWidth: "130px"
                    }}
                  >
                    {chipmakerPE}x
                  </div>
                </div>
              </div>

            </div>

            {/* General risk advice */}
            <div className="bg-[#FAF8F5] border-l-4 border-nyt-brick p-4 text-xs font-serif-body leading-relaxed text-nyt-gray-dark">
              <strong>主筆論評：高倍數的泡泡是祝福，也是枷鎖。</strong>
              <p className="mt-1">
                當本益比上調到 {chipmakerPE} 倍時，股價衝至 ${chipmakerPrice.toFixed(1)} 元，這代表買入的人必須承受較大的預支折現風險。倘若下半年企業未能開出百分百耀眼的盈餘財報，任何一點微小的增幅停滯，便會引誘泡泡瞬間漏氣（估值修正），這便是成長股波動率高居不下的數學原罪。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: MATCHING */}
      {activeTab === "matching" && (
        <div className="bg-white border border-nyt-ink p-5 md:p-6 shadow-sm rounded-sm animate-fadeIn">
          <div className="border-b border-nyt-ink pb-3 mb-6 flex justify-between items-baseline">
            <div>
              <span className="text-[10px] font-mono font-bold text-nyt-brick uppercase tracking-widest block">
                Simulation Lab &bull; Volume 04
              </span>
              <h3 className="font-serif-display font-extrabold text-xl text-nyt-ink">
                訂單簿與撮合平衡 Matching &amp; Order Book Simulator
              </h3>
              <p className="font-serif-body text-xs text-nyt-gray-light mt-1">
                證券交易的核心是限價買單（Bids）與限價賣單（Asks）的匯合。當買家發起「市價單買入（Market Buy）」，其訂單將與最低賣價瞬間撮合並消除。
              </p>
            </div>
            <button
              onClick={resetOrderBook}
              className="px-2 py-1 border border-nyt-border font-sans text-[10px] hover:border-nyt-ink rounded-sm transition-colors uppercase font-bold"
            >
              初始化訂單簿
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Order Book Grid (LG 7 column grid) */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="font-serif-display font-bold text-xs text-nyt-ink border-b pb-1">
                當前雙向限價清單 Limit Book Status
              </h4>

              <div className="grid grid-cols-2 gap-4">
                {/* Asks (Sell Orders) */}
                <div className="space-y-1.5 p-3.5 bg-red-50/40 border border-red-100 rounded-sm">
                  <div className="flex justify-between text-[10px] font-mono text-nyt-brick uppercase font-bold border-b border-red-200 pb-1">
                    <span>委賣價格 Ask</span>
                    <span>委賣量 Qty</span>
                  </div>
                  {orderBookAsks.length > 0 ? (
                    orderBookAsks.map(ask => (
                      <div key={ask.id} className="flex justify-between text-xs font-mono py-0.5">
                        <span className="text-nyt-brick font-semibold">${ask.price}</span>
                        <span className="text-nyt-gray-dark">{ask.qty} 股</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-[10px] text-nyt-gray-light py-4 italic">
                      賣單簿已被全數擊穿清除。
                    </div>
                  )}
                </div>

                {/* Bids (Buy Orders) */}
                <div className="space-y-1.5 p-3.5 bg-green-50/40 border border-green-100 rounded-sm">
                  <div className="flex justify-between text-[10px] font-mono text-nyt-forest uppercase font-bold border-b border-green-200 pb-1">
                    <span>委買價格 Bid</span>
                    <span>委買量 Qty</span>
                  </div>
                  {orderBookBids.length > 0 ? (
                    orderBookBids.map(bid => (
                      <div key={bid.id} className="flex justify-between text-xs font-mono py-0.5">
                        <span className="text-nyt-forest font-semibold">${bid.price}</span>
                        <span className="text-nyt-gray-dark">{bid.qty} 股</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-[10px] text-nyt-gray-light py-4 italic">
                      買單簿已被全數擊穿清除。
                    </div>
                  )}
                </div>
              </div>

              {/* Action commands */}
              <div className="bg-[#FAF8F5] p-4 border border-nyt-border rounded-sm flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  id="btn-interactive-matching-buy"
                  onClick={() => executeMarketOrder("buy")}
                  disabled={orderBookAsks.length === 0}
                  className="bg-nyt-forest hover:bg-green-850 disabled:bg-[#DFD9D0] text-white font-sans text-xs font-bold uppercase tracking-wider py-2 px-6 rounded-sm transition-colors duration-150"
                >
                  市價買進 100 股 (Market Buy 100)
                </button>
                <button
                  id="btn-interactive-matching-sell"
                  onClick={() => executeMarketOrder("sell")}
                  disabled={orderBookBids.length === 0}
                  className="bg-nyt-brick hover:bg-red-800 disabled:bg-[#DFD9D0] text-white font-sans text-xs font-bold uppercase tracking-wider py-2 px-6 rounded-sm transition-colors duration-150"
                >
                  市價賣出 100 股 (Market Sell 100)
                </button>
              </div>
            </div>

            {/* Execution ledger (LG 5 column grid) */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="font-serif-display font-bold text-xs text-nyt-ink border-b pb-1">
                秒盤成交追蹤 Ledger (1S Live)
              </h4>

              <div className="space-y-2">
                {recentTransactions.map((tx, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center p-2.5 border rounded-sm font-mono text-xs ${
                      tx.type === "buy" 
                        ? "bg-green-50/20 border-green-200/50 text-nyt-forest" 
                        : "bg-red-50/20 border-red-200/50 text-nyt-brick"
                    } ${idx === 0 ? "animate-pulse border-nyt-ink" : ""}`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] bg-white border px-1 py-0.5 rounded-sm uppercase tracking-wide">
                        {tx.type === "buy" ? "買盤成交" : "賣盤成交"}
                      </span>
                      <span>{tx.time}</span>
                    </div>
                    <span>
                      <strong>${tx.price}</strong> 
                      <span className="text-nyt-gray-light text-[11px] ml-1">({tx.size} 股)</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-[10px] font-serif-body text-nyt-gray-light leading-relaxed">
                說明：當您按下買進時，程式會挑選賣單列表（紅色 Ask）中價格最便宜的 100 股進行強制撮合消除，並在下方成交明細中躍現交易，完美擬作與證券所同軌之雙向競價機制。
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
