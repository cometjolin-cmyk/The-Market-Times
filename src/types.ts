export interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  formattedPrice?: string;
}

export interface StockInfo {
  symbol: string;
  name: string;
  chineseName: string;
  data: StockDataPoint[];
  currency?: string;
  currencySymbol?: string;
  marketType?: string;
  unit?: string;
  formattedPrice?: string;
}

export interface IndexResponse {
  name: string;
  value: number;
  change: number;
  percent: number;
}

export interface EditorialResponse {
  headline: string;
  subHeadline: string;
  intro: string;
  paragraphs: string[];
  summaryBullet: string[];
  sources?: string[];
}

export interface Article {
  slug: string;
  title: string;
  chineseTitle: string;
  summary: string;
  author: string;
  category: string;
  readingTime: string;
  content: string;
}
