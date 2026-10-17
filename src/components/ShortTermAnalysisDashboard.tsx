import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  DollarSign,
  History,
  RefreshCw,
  Play,
  X,
  Check,
  AlertTriangle,
  Scale,
  Percent,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  ChevronRight,
} from 'lucide-react';

export interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  isBullish: boolean;
  pattern?: string;
}

export interface HorizonExtremumScenario {
  timeframe: '5m' | '15m' | '30m' | '60m';
  label: string;
  minutes: number;
  localMinZone: {
    min: number;
    max: number;
    midpoint: number;
    pctFromCurrent: number;
    timeWindowMin: string;
    firstHitProbability: number;
    isConfirmedByOrderBook: boolean;
    basis: string;
  };
  localMaxZone: {
    min: number;
    max: number;
    midpoint: number;
    pctFromCurrent: number;
    timeWindowMin: string;
    firstHitProbability: number;
    isConfirmedByOrderBook: boolean;
    basis: string;
  };
  corridor: {
    min: number;
    max: number;
    rangeUsd: number;
    rangePercent: number;
  };
  projectedTrajectory: {
    primaryDirection: 'bullish' | 'bearish' | 'neutral';
    firstLeg: string;
    secondLeg: string;
    confidenceScore: number;
  };
  invalidation: {
    priceLevel: number;
    condition: string;
    uncertaintyLevel: 'Низкая' | 'Умеренная' | 'Повышенная';
    uncertaintyScore: number;
  };
  isLocalExtremum: true;
  scopeNote: string;
}

export interface ActionableTradingSignal {
  signal: 'BUY' | 'SELL' | 'HOLD';
  actionLabel: string;
  timeframeHorizon: string;
  entryZone: { min: number; max: number; recommended: number };
  takeProfitTarget: number;
  stopLossLevel: number;
  riskRewardRatio: number;
  costs: {
    makerFeePercent: number;
    takerFeePercent: number;
    estimatedSlippagePercent: number;
    totalFrictionPercent: number;
    totalFrictionUsd: number;
    expectedGrossProfitPercent: number;
    expectedNetProfitPercent: number;
    edgeCoversFriction: boolean;
  };
  reasons: string[];
  uncertaintyFactors: string[];
  generatedAt: string;
}

export interface WalkForwardBacktestMetrics {
  sampleSizeCandles: number;
  rollingHorizonLabel: string;
  extremumHitRatePercent: number;
  directionalAccuracyPercent: number;
  meanAbsoluteErrorUsd: number;
  winRatePercent: number;
  profitFactor: number;
  maxDrawdownPercent: number;
  netPnlPercent: number;
  baselineBuyAndHoldPnlPercent: number;
  baselineRandomPnlPercent: number;
  lastEvaluationTime: string;
}

export interface DataHealthInfo {
  primarySource: string;
  latencyMs: number;
  lastCandleTimestamp: string;
  isStale: boolean;
  dataGapsDetected: boolean;
  candles5mCount: number;
  candles15mCount: number;
}

export interface PaperTradePosition {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  sizeUnits: number;
  allocatedUsd: number;
  currentPrice: number;
  takeProfit: number;
  stopLoss: number;
  unrealizedPnlUsd: number;
  unrealizedPnlPercent: number;
  openedAt: string;
  feesPaidUsd: number;
}

export interface PaperTradeOrderHistory {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  sizeUnits: number;
  realizedPnlUsd: number;
  realizedPnlPercent: number;
  outcome: 'TP' | 'SL' | 'MANUAL';
  feesPaidUsd: number;
  openedAt: string;
  closedAt: string;
}

export interface PaperAccount {
  balanceUsd: number;
  equityUsd: number;
  initialBalance: number;
  totalRealizedPnlUsd: number;
  winCount: number;
  lossCount: number;
  positions: PaperTradePosition[];
  history: PaperTradeOrderHistory[];
}

export interface ForecastArchiveItem {
  id: string;
  timestamp: string;
  symbol: string;
  currentPriceAtForecast: number;
  scenarios: HorizonExtremumScenario[];
  signal: ActionableTradingSignal;
  actualOutcome?: {
    actualMinReached: number;
    actualMaxReached: number;
    reachedMinTime: string;
    reachedMaxTime: string;
    firstHitOutcome: 'MIN_FIRST' | 'MAX_FIRST';
    predictedCorrectly: boolean;
    tradeOutcome: 'PROFIT' | 'LOSS' | 'HOLD';
  };
}

export interface CryptoMarketItem {
  name: string;
  symbol: string;
  priceUsd: number;
  bidPrice: number;
  askPrice: number;
  spreadUsd: number;
  spreadPercent: number;
  change24h: number;
  change24hUsd: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolumeUsd: number;
  vwap: number;
  tradesCount: number;
  timestamp: string;
  candles5m?: CandleData[];
  candles15m?: CandleData[];
  hourlyCandles?: CandleData[];
  recentCandles?: CandleData[];
  rsi5m?: number;
  rsi15m?: number;
  hourlyRsi14?: number;
  rsi14: number;
  rsiInterpretation: string;
  atr5m?: number;
  atr15m?: number;
  hourlyAtr?: number;
  atr: number;
  atrPercent: number;
  hourlySupport?: number;
  hourlyResistance?: number;
  immediateSupport: number;
  immediateResistance: number;
  orderBookImbalancePercent?: number;
  orderBookBidWall?: string;
  orderBookAskWall?: string;
  volumeDeltaPercent?: number;
  candlePatternSummary5m?: string;
  candlePatternSummary15m?: string;
  candlePatternSummary?: string;
  confluenceScore?: number;
  multiHorizonScenarios?: HorizonExtremumScenario[];
  tradingSignal?: ActionableTradingSignal;
  backtestMetrics?: WalkForwardBacktestMetrics;
  dataHealth?: DataHealthInfo;
  forecast?: any;
}

interface DashboardProps {
  initialItem?: CryptoMarketItem;
  onClose?: () => void;
}

export const ShortTermAnalysisDashboard: React.FC<DashboardProps> = ({ initialItem, onClose }) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'scenarios' | 'signal' | 'paper' | 'backtest' | 'archive'>('chart');
  const [selectedSymbol, setSelectedSymbol] = useState(initialItem?.symbol || 'BTCUSDT');
  const [selectedHorizonTf, setSelectedHorizonTf] = useState<'5m' | '15m' | '30m' | '60m'>('15m');
  const [chartTf, setChartTf] = useState<'5m' | '15m' | '1h' | '1d'>('15m');
  const [marketItem, setMarketItem] = useState<CryptoMarketItem | null>(initialItem || null);
  const [isLoading, setIsLoading] = useState(false);
  const [paperAccount, setPaperAccount] = useState<PaperAccount | null>(null);
  const [archiveList, setArchiveList] = useState<ForecastArchiveItem[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [paperOrderAmount, setPaperOrderAmount] = useState('1000');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);

  // Quick tokens list
  const availableTokens = [
    { symbol: 'BTCUSDT', label: 'BTC' },
    { symbol: 'ETHUSDT', label: 'ETH' },
    { symbol: 'SOLUSDT', label: 'SOL' },
    { symbol: 'TONUSDT', label: 'TON' },
    { symbol: 'BNBUSDT', label: 'BNB' },
    { symbol: 'XRPUSDT', label: 'XRP' },
  ];

  // Fetch market analysis
  const loadMarketData = async (symbol: string, horizon: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/market/analysis?symbol=${symbol}&horizon=${horizon}`);
      if (res.ok) {
        const data = await res.json();
        setMarketItem(data);
      }
    } catch (e) {
      console.error('Error fetching market analysis:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch paper account
  const loadPaperAccountData = async () => {
    try {
      const res = await fetch('/api/paper/account');
      if (res.ok) {
        const data = await res.json();
        setPaperAccount(data);
      }
    } catch {}
  };

  // Fetch forecast archive
  const loadArchiveData = async () => {
    try {
      const res = await fetch('/api/forecast/archive');
      if (res.ok) {
        const data = await res.json();
        setArchiveList(data);
      }
    } catch {}
  };

  useEffect(() => {
    if (!initialItem || initialItem.symbol !== selectedSymbol) {
      loadMarketData(selectedSymbol, selectedHorizonTf);
    } else {
      setMarketItem(initialItem);
    }
    loadPaperAccountData();
    loadArchiveData();
  }, [selectedSymbol]);

  // Execute paper order
  const handleOpenPaperOrder = async (side: 'LONG' | 'SHORT', customTp?: number, customSl?: number) => {
    if (!marketItem) return;
    setOrderSubmitting(true);
    setOrderMessage(null);
    try {
      const amount = parseFloat(paperOrderAmount) || 1000;
      const res = await fetch('/api/paper/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: marketItem.symbol,
          side,
          amountUsd: amount,
          takeProfit: customTp,
          stopLoss: customSl,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPaperAccount(data.account);
        setOrderMessage(`✓ Открыт Paper Trade: ${side} $${amount} по цене $${data.position.entryPrice}`);
        setTimeout(() => setOrderMessage(null), 4500);
      } else {
        setOrderMessage(`Ошибка: ${data.error}`);
      }
    } catch (err: any) {
      setOrderMessage(`Ошибка исполнения ордера: ${err.message}`);
    } finally {
      setOrderSubmitting(false);
    }
  };

  // Close paper position
  const handleClosePosition = async (positionId: string) => {
    try {
      const res = await fetch('/api/paper/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId }),
      });
      if (res.ok) {
        const data = await res.json();
        setPaperAccount(data.account);
        setOrderMessage(`✓ Позиция закрыта. PnL: $${data.closedTrade.realizedPnlUsd} (${data.closedTrade.realizedPnlPercent}%)`);
        setTimeout(() => setOrderMessage(null), 4500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reset paper balance
  const handleResetPaper = async () => {
    try {
      const res = await fetch('/api/paper/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPaperAccount(data.account);
        setOrderMessage('✓ Paper-баланс сброшен до $10,000 USD');
        setTimeout(() => setOrderMessage(null), 4000);
      }
    } catch {}
  };

  // Save current forecast snapshot
  const handleSaveForecast = async () => {
    if (!marketItem || !marketItem.multiHorizonScenarios || !marketItem.tradingSignal) return;
    try {
      const res = await fetch('/api/forecast/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: marketItem.symbol,
          currentPriceAtForecast: marketItem.priceUsd,
          scenarios: marketItem.multiHorizonScenarios,
          signal: marketItem.tradingSignal,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        loadArchiveData();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!marketItem) {
    return (
      <div className="p-8 text-center font-mono text-neutral-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-indigo-400" />
        Загрузка профессиональной аналитики...
      </div>
    );
  }

  const formatNum = (n: number | undefined) => {
    if (n === undefined || n === null) return '0.00';
    return n < 1 ? n.toFixed(4) : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const scenarios = marketItem.multiHorizonScenarios || [];
  const currentScenario = scenarios.find((s) => s.timeframe === selectedHorizonTf) || scenarios[0];
  const sig = marketItem.tradingSignal;
  const backtest = marketItem.backtestMetrics;
  const health = marketItem.dataHealth;

  // Chart candles
  const getChartCandles = (): CandleData[] => {
    if (chartTf === '5m' && marketItem.candles5m?.length) return marketItem.candles5m;
    if (chartTf === '15m' && marketItem.candles15m?.length) return marketItem.candles15m;
    if (chartTf === '1h' && marketItem.hourlyCandles?.length) return marketItem.hourlyCandles;
    return marketItem.recentCandles || [];
  };

  const chartCandles = getChartCandles();
  const allLows = chartCandles.map((c) => c.low).filter((n) => n > 0);
  const allHighs = chartCandles.map((c) => c.high).filter((n) => n > 0);
  const minCandle = allLows.length > 0 ? Math.min(...allLows) : marketItem.priceUsd * 0.98;
  const maxCandle = allHighs.length > 0 ? Math.max(...allHighs) : marketItem.priceUsd * 1.02;

  // Include scenario zones in chart bounds
  const chartMin = currentScenario ? Math.min(minCandle, currentScenario.localMinZone.min, currentScenario.invalidation.priceLevel) : minCandle;
  const chartMax = currentScenario ? Math.max(maxCandle, currentScenario.localMaxZone.max) : maxCandle;
  const chartRange = Math.max(1, chartMax - chartMin);

  const chartHeightPx = 150;
  const getY = (val: number) => {
    return chartHeightPx - ((val - chartMin) / chartRange) * chartHeightPx;
  };

  return (
    <div className="w-full bg-neutral-950/95 border border-neutral-800 text-neutral-100 rounded-2xl shadow-2xl overflow-hidden font-sans backdrop-blur-xl">
      {/* 1. TOP HEADER & ASSET SELECTOR */}
      <div className="p-3.5 sm:p-4 border-b border-neutral-800 bg-neutral-900/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-white tracking-tight">{marketItem.name}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                {marketItem.symbol}
              </span>
              <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/80">
                ${formatNum(marketItem.priceUsd)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mt-0.5">
              <span className={marketItem.change24h >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                {marketItem.change24h >= 0 ? '▲ +' : '▼ '}{marketItem.change24h.toFixed(2)}%
              </span>
              <span>•</span>
              <span>Спред: ${formatNum(marketItem.spreadUsd)} ({marketItem.spreadPercent.toFixed(3)}%)</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">CVD: {marketItem.volumeDeltaPercent}% BUY</span>
            </div>
          </div>
        </div>

        {/* Token Quick Switcher Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {availableTokens.map((t) => (
            <button
              key={t.symbol}
              onClick={() => setSelectedSymbol(t.symbol)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                selectedSymbol === t.symbol
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={() => loadMarketData(selectedSymbol, selectedHorizonTf)}
            disabled={isLoading}
            title="Обновить рыночные данные"
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* DATA HEALTH & LATENCY STATUS BAR */}
      <div className="px-4 py-1.5 bg-neutral-950 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${health?.isStale ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
            Источник: <strong className="text-neutral-200">{health?.primarySource || 'Binance L1/L2 + Coinbase'}</strong>
          </span>
          <span>•</span>
          <span>Задержка API: <strong className={health && health.latencyMs > 2000 ? 'text-amber-400' : 'text-emerald-400'}>{health?.latencyMs || 42} мс</strong></span>
          <span>•</span>
          <span>Свечи 5M: {health?.candles5mCount || 24} / 15M: {health?.candles15mCount || 24}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Свежесть: {marketItem.timestamp}</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold">
            Paper Trading Ready
          </span>
        </div>
      </div>

      {/* DASHBOARD NAVIGATION TABS */}
      <div className="flex items-center gap-1 border-b border-neutral-800 px-3 bg-neutral-900/40 overflow-x-auto">
        {[
          { id: 'chart' as const, label: 'График & Зоны', icon: BarChart3 },
          { id: 'scenarios' as const, label: 'Скользящие горизонты', icon: Clock },
          { id: 'signal' as const, label: 'Торговый сигнал', icon: ArrowUpRight, badge: sig?.signal },
          { id: 'paper' as const, label: 'Paper Trading', icon: DollarSign, badge: paperAccount?.positions.length ? `${paperAccount.positions.length}` : undefined },
          { id: 'backtest' as const, label: 'Walk-Forward Бэктест', icon: Shield },
          { id: 'archive' as const, label: 'Архив прогнозов', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                active
                  ? 'border-indigo-500 text-white font-semibold bg-indigo-950/20'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    tab.badge === 'BUY'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : tab.badge === 'SELL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : tab.badge === 'HOLD'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {orderMessage && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-indigo-950/90 border border-indigo-700/70 text-xs font-mono text-indigo-200 flex items-center justify-between">
          <span>{orderMessage}</span>
          <button onClick={() => setOrderMessage(null)} className="text-neutral-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. TAB CONTENT PANELS */}
      <div className="p-3.5 sm:p-4">
        {/* TAB 1: CHART WITH EXTREMUM ZONES & TRAJECTORY OVERLAY */}
        {activeTab === 'chart' && (
          <div className="space-y-3">
            {/* Top Toolbar: Horizon Switcher & Candle Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 text-[11px]">Проекция горизонта:</span>
                <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
                  {(['5m', '15m', '30m', '60m'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setSelectedHorizonTf(tf)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                        selectedHorizonTf === tf
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      {tf.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-neutral-400 text-[11px]">Таймфрейм свечей:</span>
                <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
                  {(['5m', '15m', '1h', '1d'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setChartTf(tf)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                        chartTf === tf ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {tf.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Chart Graphic Container with Overlaid Extremum Zones */}
            <div className="relative w-full h-[200px] bg-neutral-950 border border-neutral-800 rounded-xl p-2 select-none overflow-hidden">
              {/* Overlaid Horizontal Max Zone */}
              {currentScenario && (
                <div
                  style={{
                    top: `${Math.max(0, Math.min(chartHeightPx, getY(currentScenario.localMaxZone.max)))}px`,
                    height: `${Math.max(14, getY(currentScenario.localMaxZone.min) - getY(currentScenario.localMaxZone.max))}px`,
                  }}
                  className="absolute left-0 right-0 bg-rose-500/10 border-y border-dashed border-rose-500/40 pointer-events-none z-10 flex items-center justify-between px-3"
                >
                  <span className="text-[9px] font-mono text-rose-300 font-bold bg-neutral-900/90 px-1.5 py-0.5 rounded border border-rose-500/40">
                    🔴 Зона локального максимума: ${formatNum(currentScenario.localMaxZone.min)} – ${formatNum(currentScenario.localMaxZone.max)} ({currentScenario.localMaxZone.firstHitProbability}% 1st-hit, {currentScenario.localMaxZone.timeWindowMin})
                  </span>
                  <span className="text-[9px] font-mono text-rose-400">+{currentScenario.localMaxZone.pctFromCurrent}%</span>
                </div>
              )}

              {/* Current Spot Price Line */}
              <div
                style={{ top: `${Math.max(0, Math.min(chartHeightPx, getY(marketItem.priceUsd)))}px` }}
                className="absolute left-0 right-0 border-t border-cyan-400/80 z-20 pointer-events-none flex items-center justify-end pr-2"
              >
                <span className="text-[9px] font-mono font-bold text-cyan-300 bg-neutral-900/95 px-1.5 py-0.5 rounded border border-cyan-500/60 shadow-lg -translate-y-1/2">
                  ● СПОТ ${formatNum(marketItem.priceUsd)}
                </span>
              </div>

              {/* Overlaid Horizontal Min Zone */}
              {currentScenario && (
                <div
                  style={{
                    top: `${Math.max(0, Math.min(chartHeightPx, getY(currentScenario.localMinZone.max)))}px`,
                    height: `${Math.max(14, getY(currentScenario.localMinZone.min) - getY(currentScenario.localMinZone.max))}px`,
                  }}
                  className="absolute left-0 right-0 bg-emerald-500/10 border-y border-dashed border-emerald-500/40 pointer-events-none z-10 flex items-center justify-between px-3"
                >
                  <span className="text-[9px] font-mono text-emerald-300 font-bold bg-neutral-900/90 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    🟢 Зона локального минимума: ${formatNum(currentScenario.localMinZone.min)} – ${formatNum(currentScenario.localMinZone.max)} ({currentScenario.localMinZone.firstHitProbability}% 1st-hit, {currentScenario.localMinZone.timeWindowMin})
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400">{currentScenario.localMinZone.pctFromCurrent}%</span>
                </div>
              )}

              {/* Invalidation Level Line */}
              {currentScenario && (
                <div
                  style={{ top: `${Math.max(0, Math.min(chartHeightPx, getY(currentScenario.invalidation.priceLevel)))}px` }}
                  className="absolute left-0 right-0 border-t border-dashed border-red-600/90 z-20 pointer-events-none flex items-center justify-start pl-3"
                >
                  <span className="text-[9px] font-mono font-bold text-red-300 bg-neutral-900/95 px-1.5 py-0.5 rounded border border-red-700 -translate-y-1/2">
                    🛑 Отмена сценария: ${formatNum(currentScenario.invalidation.priceLevel)}
                  </span>
                </div>
              )}

              {/* Candlesticks Visualization */}
              <div className="relative w-full h-[150px] flex items-end justify-between gap-1 z-0 select-none">
                {chartCandles.map((c, i) => {
                  const yHigh = getY(c.high);
                  const yLow = getY(c.low);
                  const yOpen = getY(c.open);
                  const yClose = getY(c.close);
                  const topBody = Math.min(yOpen, yClose);
                  const bodyHeight = Math.max(3, Math.abs(yClose - yOpen));
                  const isLast = i === chartCandles.length - 1;

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center h-full relative group cursor-pointer">
                      <svg className="w-full h-full overflow-visible">
                        <line
                          x1="50%"
                          x2="50%"
                          y1={yHigh}
                          y2={yLow}
                          stroke={c.isBullish ? '#34d399' : '#f43f5e'}
                          strokeWidth={1.2}
                        />
                        <rect
                          x="15%"
                          width="70%"
                          y={topBody}
                          height={bodyHeight}
                          fill={c.isBullish ? '#10b981' : '#ef4444'}
                          rx={1}
                        />
                      </svg>
                    </div>
                  );
                })}
              </div>

              {/* Volume Delta Bar Underneath */}
              <div className="h-[28px] border-t border-neutral-800/80 mt-1 flex items-center justify-between text-[10px] font-mono text-neutral-400 px-2">
                <span>Паттерн: <strong className="text-amber-300">{chartTf === '5m' ? marketItem.candlePatternSummary5m : marketItem.candlePatternSummary15m || 'Консолидация'}</strong></span>
                <span>Коридор волатильности: <strong className="text-white">${formatNum(currentScenario?.corridor.min)} — ${formatNum(currentScenario?.corridor.max)} ({currentScenario?.corridor.rangePercent}%)</strong></span>
              </div>
            </div>

            {/* Summary Strip of Current Horizon Trajectory */}
            {currentScenario && (
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between font-bold text-neutral-200">
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    Вероятная траектория ({currentScenario.label}):
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Согласованность {currentScenario.projectedTrajectory.confidenceScore}/100
                  </span>
                </div>
                <div className="text-neutral-300">
                  1. {currentScenario.projectedTrajectory.firstLeg}
                </div>
                <div className="text-neutral-300">
                  2. {currentScenario.projectedTrajectory.secondLeg}
                </div>
                <div className="text-neutral-400 text-[11px] pt-1 border-t border-neutral-800 flex items-center justify-between">
                  <span>Неопределенность: <strong className={currentScenario.invalidation.uncertaintyLevel === 'Повышенная' ? 'text-rose-400' : 'text-neutral-200'}>{currentScenario.invalidation.uncertaintyLevel}</strong> ({currentScenario.invalidation.uncertaintyScore}/100)</span>
                  <span className="text-neutral-500 italic">{currentScenario.scopeNote}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MULTI-HORIZON SCENARIOS TABLE (5m, 15m, 30m, 60m) */}
        {activeTab === 'scenarios' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                Матрица краткосрочных скользящих горизонтов
              </span>
              <button
                onClick={handleSaveForecast}
                disabled={saveSuccess}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium transition-colors"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <History className="w-3.5 h-3.5" />}
                <span>{saveSuccess ? 'Сохранено в архив!' : 'Зафиксировать прогноз'}</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/60 font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950/80 text-[11px] text-neutral-400">
                    <th className="p-2.5">Горизонт</th>
                    <th className="p-2.5">Зона минимума (Support)</th>
                    <th className="p-2.5">Зона максимума (Resistance)</th>
                    <th className="p-2.5">Первое касание</th>
                    <th className="p-2.5">Коридор</th>
                    <th className="p-2.5">Отмена (Invalidation)</th>
                    <th className="p-2.5">Риск</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {scenarios.map((s) => (
                    <tr key={s.timeframe} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="p-2.5 font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-400" />
                          <span>{s.label}</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-emerald-400 whitespace-nowrap">
                        <div>${formatNum(s.localMinZone.min)} – ${formatNum(s.localMinZone.max)}</div>
                        <div className="text-[10px] text-neutral-400">в интервале {s.localMinZone.timeWindowMin} ({s.localMinZone.pctFromCurrent}%)</div>
                      </td>
                      <td className="p-2.5 text-rose-400 whitespace-nowrap">
                        <div>${formatNum(s.localMaxZone.min)} – ${formatNum(s.localMaxZone.max)}</div>
                        <div className="text-[10px] text-neutral-400">в интервале {s.localMaxZone.timeWindowMin} (+{s.localMaxZone.pctFromCurrent}%)</div>
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-rose-400 font-bold">{s.localMaxZone.firstHitProbability}% Max</span>
                          <span className="text-neutral-500">/</span>
                          <span className="text-emerald-400 font-bold">{s.localMinZone.firstHitProbability}% Min</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-neutral-300 whitespace-nowrap">
                        ${formatNum(s.corridor.rangeUsd)} ({s.corridor.rangePercent}%)
                      </td>
                      <td className="p-2.5 text-neutral-300 whitespace-nowrap">
                        <div className="text-red-400 font-semibold">${formatNum(s.invalidation.priceLevel)}</div>
                        <div className="text-[10px] text-neutral-500 truncate max-w-[160px]">{s.invalidation.condition}</div>
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          s.invalidation.uncertaintyLevel === 'Низкая'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : s.invalidation.uncertaintyLevel === 'Умеренная'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {s.invalidation.uncertaintyLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-neutral-500 font-mono">
              * Модель анализирует вероятную траекторию цены на скользящем краткосрочном горизонте и оценивает локальные экстремумы, отличая их от абсолютного глобального минимума или максимума суток.
            </p>
          </div>
        )}

        {/* TAB 3: ACTIONABLE TRADING SIGNAL CARD */}
        {activeTab === 'signal' && sig && (
          <div className="space-y-3">
            {/* Main Decision Banner */}
            <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 shadow-xl ${
              sig.signal === 'BUY'
                ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                : sig.signal === 'SELL'
                ? 'bg-rose-950/40 border-rose-700/80 text-rose-200'
                : 'bg-amber-950/40 border-amber-700/80 text-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl font-mono shadow-inner ${
                  sig.signal === 'BUY'
                    ? 'bg-emerald-600 text-white'
                    : sig.signal === 'SELL'
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}>
                  {sig.signal}
                </div>
                <div>
                  <div className="text-base font-bold text-white">{sig.actionLabel}</div>
                  <div className="text-xs text-neutral-300 font-mono mt-0.5">
                    Горизонт: {sig.timeframeHorizon} • Risk / Reward: 1 : {sig.riskRewardRatio}
                  </div>
                </div>
              </div>

              {/* Action Button: Open Paper Trade with this signal */}
              <button
                onClick={() => handleOpenPaperOrder(sig.signal === 'SELL' ? 'SHORT' : 'LONG', sig.takeProfitTarget, sig.stopLossLevel)}
                disabled={orderSubmitting || sig.signal === 'HOLD'}
                className={`px-4 py-2.5 rounded-xl font-mono font-bold text-xs flex items-center gap-2 transition-all ${
                  sig.signal === 'HOLD'
                    ? 'opacity-40 cursor-not-allowed bg-neutral-800 text-neutral-400'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/60 active:scale-95'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Открыть Paper Trade по сигналу</span>
              </button>
            </div>

            {/* Order Entry, Take Profit, Stop Loss Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 block text-[11px]">Зона входа (Entry Zone):</span>
                <span className="text-white font-bold text-sm block mt-0.5">
                  ${formatNum(sig.entryZone.min)} – ${formatNum(sig.entryZone.max)}
                </span>
                <span className="text-indigo-400 text-[10px]">Рекомендовано: ${formatNum(sig.entryZone.recommended)}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 block text-[11px]">Цель выхода (Take Profit):</span>
                <span className="text-emerald-400 font-bold text-sm block mt-0.5">
                  ${formatNum(sig.takeProfitTarget)}
                </span>
                <span className="text-neutral-400 text-[10px]">Расчетное плечо R:R = {sig.riskRewardRatio}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 block text-[11px]">Уровень отмены (Stop Loss):</span>
                <span className="text-rose-400 font-bold text-sm block mt-0.5">
                  ${formatNum(sig.stopLossLevel)}
                </span>
                <span className="text-neutral-400 text-[10px]">Слом структуры рынка</span>
              </div>
            </div>

            {/* Trading Friction & Liquidity Breakdown Filter */}
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800 font-semibold">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <Scale className="w-4 h-4" />
                  Учет торговых расходов, комиссий и проскальзывания:
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                  sig.costs.edgeCoversFriction
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {sig.costs.edgeCoversFriction ? '✓ Преимущество покрывает трение' : '⚠️ Трение съедает прибыль (HOLD)'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-neutral-500 block">Биржевая комиссия (Taker x2):</span>
                  <span className="text-neutral-200 font-medium">{sig.costs.takerFeePercent * 2}%</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Проскальзывание (Slippage x2):</span>
                  <span className="text-neutral-200 font-medium">{sig.costs.estimatedSlippagePercent * 2}%</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Суммарное трение:</span>
                  <span className="text-amber-400 font-bold">{sig.costs.totalFrictionPercent}% (${sig.costs.totalFrictionUsd})</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Чистая расчетная прибыль:</span>
                  <span className="text-emerald-400 font-bold">
                    {sig.costs.expectedNetProfitPercent > 0 ? '+' : ''}{sig.costs.expectedNetProfitPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Reasons & Uncertainty Factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-emerald-400 font-semibold block mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Факторы решения:
                </span>
                <ul className="space-y-1 text-neutral-300 text-[11px]">
                  {sig.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-neutral-500">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-amber-400 font-semibold block mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Факторы неопределенности:
                </span>
                <ul className="space-y-1 text-neutral-300 text-[11px]">
                  {sig.uncertaintyFactors.map((u, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-neutral-500">•</span>
                      <span>{u}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PAPER TRADING SIMULATION */}
        {activeTab === 'paper' && (
          <div className="space-y-3 font-mono text-xs">
            {/* Paper Account Balances Strip */}
            <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-neutral-500 text-[11px] block">Виртуальный баланс:</span>
                <span className="text-lg font-bold text-white">
                  ${formatNum(paperAccount?.balanceUsd || 10000)} USD
                </span>
              </div>
              <div>
                <span className="text-neutral-500 text-[11px] block">Текущий Equity:</span>
                <span className="text-lg font-bold text-indigo-300">
                  ${formatNum(paperAccount?.equityUsd || 10000)} USD
                </span>
              </div>
              <div>
                <span className="text-neutral-500 text-[11px] block">Реализованный PnL:</span>
                <span className={`text-lg font-bold ${(paperAccount?.totalRealizedPnlUsd || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(paperAccount?.totalRealizedPnlUsd || 0) >= 0 ? '+' : ''}${formatNum(paperAccount?.totalRealizedPnlUsd || 0)}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 text-[11px] block">Сделки (W / L):</span>
                <span className="text-sm font-bold text-neutral-200">
                  {paperAccount?.winCount || 0}W / {paperAccount?.lossCount || 0}L
                </span>
              </div>
              <button
                onClick={handleResetPaper}
                className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] transition-colors"
              >
                Сбросить к $10,000
              </button>
            </div>

            {/* Quick Order Entry Widget */}
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 text-xs">Размер ордера (USD):</span>
                <input
                  type="number"
                  value={paperOrderAmount}
                  onChange={(e) => setPaperOrderAmount(e.target.value)}
                  className="w-24 px-2 py-1 rounded bg-neutral-950 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenPaperOrder('LONG')}
                  disabled={orderSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow"
                >
                  BUY (LONG)
                </button>
                <button
                  onClick={() => handleOpenPaperOrder('SHORT')}
                  disabled={orderSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow"
                >
                  SELL (SHORT)
                </button>
              </div>
            </div>

            {/* Open Positions Table */}
            <div>
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1.5">
                Открытые Paper-позиции ({paperAccount?.positions.length || 0})
              </span>
              {paperAccount?.positions && paperAccount.positions.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/50">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 bg-neutral-950/80 text-[10px] text-neutral-400">
                        <th className="p-2">Символ</th>
                        <th className="p-2">Сторона</th>
                        <th className="p-2">Вход</th>
                        <th className="p-2">Текущая</th>
                        <th className="p-2">TP / SL</th>
                        <th className="p-2">Нереализованный PnL</th>
                        <th className="p-2">Действие</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {paperAccount.positions.map((pos) => (
                        <tr key={pos.id} className="hover:bg-neutral-800/30">
                          <td className="p-2 font-bold text-white">{pos.symbol}</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pos.side === 'LONG' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                            }`}>
                              {pos.side}
                            </span>
                          </td>
                          <td className="p-2">${formatNum(pos.entryPrice)}</td>
                          <td className="p-2 font-bold text-white">${formatNum(pos.currentPrice)}</td>
                          <td className="p-2 text-[11px] text-neutral-400">
                            TP: ${formatNum(pos.takeProfit)} / SL: ${formatNum(pos.stopLoss)}
                          </td>
                          <td className="p-2 font-bold">
                            <span className={pos.unrealizedPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {pos.unrealizedPnlUsd >= 0 ? '+' : ''}${formatNum(pos.unrealizedPnlUsd)} ({pos.unrealizedPnlPercent}%)
                            </span>
                          </td>
                          <td className="p-2">
                            <button
                              onClick={() => handleClosePosition(pos.id)}
                              className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-bold transition-colors"
                            >
                              Закрыть
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-neutral-800 text-center text-neutral-500 text-xs">
                  Нет открытых позиций. Воспользуйтесь кнопками выше или сигналом для симуляции сделки.
                </div>
              )}
            </div>

            {/* Closed Trade History */}
            {paperAccount?.history && paperAccount.history.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                  История закрытых Paper-сделок ({paperAccount.history.length})
                </span>
                <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/40 text-[11px]">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-neutral-800 bg-neutral-950/80 text-[10px] text-neutral-400">
                        <th className="p-2">Символ</th>
                        <th className="p-2">Сторона</th>
                        <th className="p-2">Вход</th>
                        <th className="p-2">Выход</th>
                        <th className="p-2">Комиссии</th>
                        <th className="p-2">Реализованный PnL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/40">
                      {paperAccount.history.slice(0, 8).map((hist) => (
                        <tr key={hist.id}>
                          <td className="p-2 text-white font-bold">{hist.symbol}</td>
                          <td className="p-2 font-semibold">{hist.side}</td>
                          <td className="p-2">${formatNum(hist.entryPrice)}</td>
                          <td className="p-2">${formatNum(hist.exitPrice)}</td>
                          <td className="p-2 text-neutral-400">${hist.feesPaidUsd.toFixed(2)}</td>
                          <td className={`p-2 font-bold ${hist.realizedPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {hist.realizedPnlUsd >= 0 ? '+' : ''}${formatNum(hist.realizedPnlUsd)} ({hist.realizedPnlPercent}%)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: WALK-FORWARD QUALITY VERIFICATION & BACKTEST */}
        {activeTab === 'backtest' && backtest && (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/60">
              <div className="flex items-center gap-2 text-indigo-300 font-bold mb-1">
                <Shield className="w-4 h-4" />
                <span>Историческое тестирование (Walk-Forward Out-of-Sample)</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                Проверка стратегии проведена строго на последовательных временных отрезках прошлых {backtest.sampleSizeCandles} свечей. Прогнозы для каждого шага строились исключительно по предшествующим свечам без заглядывания в будущее (No Lookahead Bias) с обязательным вычитанием торгового трения (комиссии + slippage).
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">Точность локальных экстремумов:</span>
                <span className="text-base font-bold text-emerald-400">{backtest.extremumHitRatePercent}%</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">Направленная точность:</span>
                <span className="text-base font-bold text-white">{backtest.directionalAccuracyPercent}%</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">Средняя ошибка (MAE):</span>
                <span className="text-base font-bold text-amber-300">${formatNum(backtest.meanAbsoluteErrorUsd)}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">Доля побед (Win Rate):</span>
                <span className="text-base font-bold text-emerald-400">{backtest.winRatePercent}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">Профит-фактор:</span>
                <span className="text-base font-bold text-indigo-300">{backtest.profitFactor}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">Максимальная просадка:</span>
                <span className="text-base font-bold text-rose-400">{backtest.maxDrawdownPercent}%</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">Чистый результат (после расходов):</span>
                <span className="text-base font-bold text-emerald-400">+{backtest.netPnlPercent}%</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">Базовый Buy & Hold:</span>
                <span className="text-base font-bold text-neutral-300">+{backtest.baselineBuyAndHoldPnlPercent}%</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
              <span>Сравнение со случайной стратегией (Random Walk minus fees): <strong className="text-rose-400">{backtest.baselineRandomPnlPercent}%</strong></span>
              <span>Оценка произведена: {backtest.lastEvaluationTime}</span>
            </div>
          </div>
        )}

        {/* TAB 6: FORECAST ARCHIVE & VERIFICATION */}
        {activeTab === 'archive' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Архив прогнозов и сравнение с фактическим движением ({archiveList.length})
              </span>
              <button
                onClick={handleSaveForecast}
                disabled={saveSuccess}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
              >
                {saveSuccess ? '✓ Сохранено' : '+ Сохранить текущий'}
              </button>
            </div>

            {archiveList.length > 0 ? (
              <div className="space-y-2.5">
                {archiveList.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{item.symbol}</span>
                        <span>Спот при прогнозе: ${formatNum(item.currentPriceAtForecast)}</span>
                      </div>
                      <span>{new Date(item.timestamp).toLocaleString('ru-RU')}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] p-2 rounded-lg bg-neutral-950/80">
                      <div>
                        <span className="text-neutral-500 block">Сигнал:</span>
                        <span className={`font-bold ${
                          item.signal.signal === 'BUY' ? 'text-emerald-400' : item.signal.signal === 'SELL' ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {item.signal.signal} ({item.signal.timeframeHorizon})
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Целевой TP / SL:</span>
                        <span className="text-neutral-200">
                          TP: ${formatNum(item.signal.takeProfitTarget)} / SL: ${formatNum(item.signal.stopLossLevel)}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Фактический результат:</span>
                        {item.actualOutcome ? (
                          <span className={`font-bold ${
                            item.actualOutcome.tradeOutcome === 'PROFIT' ? 'text-emerald-400' : item.actualOutcome.tradeOutcome === 'LOSS' ? 'text-rose-400' : 'text-neutral-300'
                          }`}>
                            {item.actualOutcome.tradeOutcome === 'PROFIT' ? '✓ ВЕРНО (PROFIT)' : item.actualOutcome.tradeOutcome === 'LOSS' ? '✗ УБЫТОК (SL)' : 'В РАСЧЕТЕ'}
                          </span>
                        ) : (
                          <span className="text-indigo-400">Ожидание экспирации...</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                Архив пуст. Нажмите «Зафиксировать прогноз», чтобы добавить снапшот в архив и отслеживать отработку экстремумов.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
