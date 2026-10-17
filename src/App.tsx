/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  ArrowUp,
  BarChart3,
  Brain,
  Check,
  Circle,
  CircleDot,
  Clock,
  ExternalLink,
  Globe,
  Layers,
  Loader2,
  Mic,
  PenLine,
  Scale,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ShortTermAnalysisDashboard } from './components/ShortTermAnalysisDashboard';

interface GroundingSource {
  title: string;
  uri: string;
}

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  isBullish: boolean;
  pattern?: string;
}

interface CryptoPriceInfo {
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
  recentCandles: CandleData[];
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
  orderBookImbalancePercent?: number;
  orderBookBidsQty?: number;
  orderBookAsksQty?: number;
  orderBookBidWall?: string;
  orderBookAskWall?: string;
  volumeDeltaPercent?: number;
  candlePatternSummary5m?: string;
  candlePatternSummary15m?: string;
  candlePatternSummary?: string;
  confluenceScore?: number;
  confluenceSignals?: string[];
  immediateSupport: number;
  immediateResistance: number;
  localPeak30d: number;
  localLow30d: number;
  ema9: number;
  ema20: number;
  ema50: number;
  ema100: number;
  sma20: number;
  trendStructure: string;
  macdLine: number;
  macdSignal: number;
  macdHistogram: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  bbPercentB: number;
  bbBandWidth: number;
  max30d: number;
  min30d: number;
  swingRange: number;
  fib382: number;
  fib500: number;
  fib618: number;
  fib1272: number;
  fib1618: number;
  fib2000: number;
  fib2618: number;
  openInterestContracts: number;
  openInterestUsd: number;
  fundingRate: string | null;
  fearAndGreed: string | null;
  shortSqueezeCluster: string;
  longFlushCluster: string;
  smc?: {
    fvg: string;
    liquiditySweep: string;
    marketStructure: string;
    wyckoffPhase: string;
    orderBlock: string;
  };
  rsiDivergence?: string;
  vwapDeviationBands?: {
    upperBand1Sigma: number;
    lowerBand1Sigma: number;
    status: string;
  };
  volumeTrend?: string;
  newsSentimentPercent?: number;
  newsCatalysts?: {
    title: string;
    uri: string;
    snippet: string;
    impact: string;
  }[];
  forecast: {
    targetHorizonForecast?: {
      timeframeLabel: string;
      targetPrice: number;
      corridorMin: number;
      corridorMax: number;
      bias: 'bullish' | 'bearish' | 'neutral';
      probability: number;
      expectedChangePercent: number;
      bullTrigger: number;
      bearInvalidation: number;
      formulaBreakdown?: {
        basePrice: number;
        volatilityBudget: number;
        candleBiasWeight: number;
        orderBookBias: number;
        rsiBias: number;
        newsSentimentBias: number;
        smcBias: number;
        netConfluenceBias: number;
        expectedShiftUsd: number;
        newsSentimentPercent: number;
        trajectoryPhases?: {
          phase: string;
          targetSubPrice: number;
          desc: string;
        }[];
      };
    };
    realistic24hRange: string;
    tacticalWeeklyCorridor: string;
    bullTargetFib: string;
    bearSupportRisk: string;
    target2027: string;
    formulaBasis: string;
  };
  multiHorizonScenarios?: any[];
  tradingSignal?: any;
  backtestMetrics?: any;
  dataHealth?: any;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Visual multi-timeframe interactive candlestick chart with volume bars and pattern detection
function CandlestickChart({
  item,
}: {
  item: CryptoPriceInfo;
}) {
  const [selectedTf, setSelectedTf] = useState<'5m' | '15m' | '1h' | '1d'>(() => {
    const lbl = item.forecast?.targetHorizonForecast?.timeframeLabel?.toLowerCase() || '';
    if (lbl.includes('5 мин') || lbl.includes('10 мин') || lbl.includes('15 мин')) return '5m';
    if (lbl.includes('30 мин') || lbl.includes('45 мин') || lbl.includes('час')) return '15m';
    if (lbl.includes('часа') || lbl.includes('часов') || lbl.includes('суток')) return '1h';
    return item.candles5m && item.candles5m.length > 0 ? '5m' : '1d';
  });

  const getCandles = (): CandleData[] => {
    if (selectedTf === '5m' && item.candles5m && item.candles5m.length > 0) return item.candles5m;
    if (selectedTf === '15m' && item.candles15m && item.candles15m.length > 0) return item.candles15m;
    if (selectedTf === '1h' && item.hourlyCandles && item.hourlyCandles.length > 0) return item.hourlyCandles;
    return item.recentCandles || [];
  };

  const candles = getCandles();
  if (!candles || candles.length === 0) return null;

  const allLows = candles.map((c) => c.low).filter((n) => n > 0);
  const allHighs = candles.map((c) => c.high).filter((n) => n > 0);
  const allVolumes = candles.map((c) => c.volume || 1);
  if (allLows.length === 0 || allHighs.length === 0) return null;

  const minPrice = Math.min(...allLows);
  const maxPrice = Math.max(...allHighs);
  const maxVol = Math.max(...allVolumes, 1);
  const range = maxPrice - minPrice || 1;

  const chartHeight = 84;
  const paddingY = 6;
  const plotHeight = chartHeight - paddingY * 2;

  const getY = (val: number) => {
    return paddingY + plotHeight - ((val - minPrice) / range) * plotHeight;
  };

  const currentPattern = selectedTf === '5m'
    ? item.candlePatternSummary5m
    : selectedTf === '15m'
    ? item.candlePatternSummary15m
    : selectedTf === '1h'
    ? item.candlePatternSummary
    : `${candles.length} свечей (Daily D1)`;

  return (
    <div className="p-3 rounded-xl bg-neutral-950/95 border border-neutral-800 mb-3 font-mono shadow-inner">
      {/* Top Bar: Title, Timeframe Switcher Tabs & Support/Resistance */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] mb-2 pb-2 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-neutral-200 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Свечной график (Live Exchange)
          </span>
          {/* Timeframe switcher tabs */}
          <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-md border border-neutral-800">
            {(
              [
                ['5m', '5M'],
                ['15m', '15M'],
                ['1h', '1H'],
                ['1d', '1D'],
              ] as const
            ).map(([tfKey, label]) => {
              const active = selectedTf === tfKey;
              return (
                <button
                  key={tfKey}
                  onClick={() => setSelectedTf(tfKey)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-emerald-400">
            Поддержка: ${Math.round(selectedTf === '1h' || selectedTf === '15m' ? item.hourlySupport || item.immediateSupport : item.immediateSupport).toLocaleString()}
          </span>
          <span className="text-neutral-600">•</span>
          <span className="text-rose-400">
            Сопротивление: ${Math.round(selectedTf === '1h' || selectedTf === '15m' ? item.hourlyResistance || item.immediateResistance : item.immediateResistance).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Pattern & Volume Delta status badge row */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] mb-2 px-1 text-neutral-400">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-neutral-500">Паттерн ({selectedTf.toUpperCase()}):</span>
          <span className="text-amber-300 font-medium truncate">{currentPattern}</span>
        </div>
        {typeof item.volumeDeltaPercent === 'number' && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-neutral-500">Дельта объемов (CVD):</span>
            <span className="text-emerald-400 font-semibold">{item.volumeDeltaPercent}% BUY</span>
            <span className="text-neutral-600">/</span>
            <span className="text-rose-400 font-semibold">{100 - item.volumeDeltaPercent}% SELL</span>
          </div>
        )}
      </div>

      {/* Candlestick & Volume Chart Area */}
      <div className="relative w-full h-[120px] flex items-end justify-between gap-1 pt-1 select-none">
        {candles.map((c, i) => {
          const yHigh = getY(c.high);
          const yLow = getY(c.low);
          const yOpen = getY(c.open);
          const yClose = getY(c.close);
          const topBody = Math.min(yOpen, yClose);
          const bodyHeight = Math.max(3, Math.abs(yClose - yOpen));
          const isCurrent = i === candles.length - 1;

          // Volume Bar height (max 22px)
          const volRatio = (c.volume || 1) / maxVol;
          const volHeight = Math.max(3, Math.round(volRatio * 20));

          return (
            <div key={i} className="flex-1 flex flex-col items-center h-full relative group cursor-pointer">
              {/* Candlestick SVG */}
              <div className="w-full h-[84px] relative">
                <svg className="w-full h-full overflow-visible">
                  {/* High-Low Wick */}
                  <line
                    x1="50%"
                    x2="50%"
                    y1={yHigh}
                    y2={yLow}
                    stroke={c.isBullish ? '#34d399' : '#f43f5e'}
                    strokeWidth={1.5}
                  />
                  {/* Open-Close Body */}
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

              {/* Volume Bar Underneath */}
              <div className="w-full h-[22px] flex items-end justify-center pt-0.5">
                <div
                  style={{ height: `${volHeight}px` }}
                  className={`w-[70%] rounded-t-sm transition-all ${
                    c.isBullish ? 'bg-emerald-500/50 group-hover:bg-emerald-400' : 'bg-rose-500/50 group-hover:bg-rose-400'
                  }`}
                />
              </div>

              {/* Time / Date label */}
              <span className={`text-[9px] mt-0.5 ${isCurrent ? 'text-emerald-300 font-bold' : 'text-neutral-500'}`}>
                {isCurrent && selectedTf === '1d' ? 'Сейчас' : c.date.split(' ')[0]}
              </span>

              {/* Interactive Tooltip on hover */}
              <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col bg-neutral-900 border border-neutral-700 text-[10px] text-neutral-200 px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap z-40 pointer-events-none font-mono">
                <div className="flex items-center justify-between gap-3 border-b border-neutral-800 pb-1 mb-1">
                  <span className="font-bold text-white">Интервал: {c.date}</span>
                  <span className={`text-[9px] px-1 rounded ${c.isBullish ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                    {c.isBullish ? 'Бычья' : 'Медвежья'}
                  </span>
                </div>
                {c.pattern && (
                  <div className="text-amber-300 font-semibold mb-1">
                    ⚡ {c.pattern}
                  </div>
                )}
                <span className="text-neutral-400">Открытие: <strong className="text-white">${c.open.toLocaleString()}</strong></span>
                <span className="text-emerald-400">High: <strong>${c.high.toLocaleString()}</strong></span>
                <span className="text-rose-400">Low: <strong>${c.low.toLocaleString()}</strong></span>
                <span className="text-neutral-300">Закрытие: <strong className="text-white">${c.close.toLocaleString()}</strong></span>
                {typeof c.volume === 'number' && (
                  <span className="text-neutral-400 pt-0.5 border-t border-neutral-800 mt-0.5">
                    Объем: <strong className="text-indigo-300">{c.volume.toLocaleString()}</strong>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [isEyes, setIsEyes] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeFinished, setWelcomeFinished] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // AI & Conversation State
  const [aiState, setAiState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [aiResponse, setAiResponse] = useState<{
    text: string;
    sources: GroundingSource[];
    searchQueries: string[];
    cryptoData?: CryptoPriceInfo[];
  } | null>(null);
  const [userQueryDisplay, setUserQueryDisplay] = useState<string | null>(null);

  // Professional AI Trading & Short-Term Analysis State
  const [isTradingDashboardOpen, setIsTradingDashboardOpen] = useState(false);
  const [selectedDashboardItem, setSelectedDashboardItem] = useState<any>(null);

  // Crypto Forecast & Neural Network Learning State
  const [isCryptoMenuOpen, setIsCryptoMenuOpen] = useState(false);
  const [activePrediction, setActivePrediction] = useState<{
    coin: string;
    coinName: string;
    initialTime: string;
    targetTime: string;
  } | null>(null);
  const [learningProgress, setLearningProgress] = useState<{
    totalPredictions: number;
    correctPredictions: number;
    incorrectPredictions: number;
    accuracyPercent: number;
    currentStreak: number;
    lastUpdated: string;
    feedbackHistory: any[];
  } | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<{
    isCorrect: boolean;
    analysis: string;
    message: string;
  } | null>(null);

  // Load persistent learning progress from backend
  useEffect(() => {
    fetch('/api/learning/progress')
      .then((res) => res.json())
      .then((data) => setLearningProgress(data))
      .catch(() => {});
  }, []);

  const welcomeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Responsive dimensions
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Web Speech API fallback setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ru-RU';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            setMessageText(transcript);
          }
        };

        recognition.onerror = () => {
          // Fallback to audio recorder
        };

        recognitionRef.current = recognition;
      } catch {
        // Restricted environment
      }
    }
  }, []);

  // Natural blink loop when in eyes mode
  useEffect(() => {
    if (!isEyes || aiState === 'thinking') {
      setIsBlinking(false);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setIsBlinking(true);
      timeoutId = setTimeout(() => {
        setIsBlinking(false);
      }, 480);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [isEyes, aiState]);

  // Morph toggle
  const toggle = () => {
    const nextIsEyes = !isEyes;
    setIsEyes(nextIsEyes);
    setIsBlinking(false);

    if (welcomeTimerRef.current) {
      clearTimeout(welcomeTimerRef.current);
      welcomeTimerRef.current = null;
    }

    if (nextIsEyes) {
      setWelcomeFinished(true);
      setShowWelcome(true);
      welcomeTimerRef.current = setTimeout(() => {
        setShowWelcome(false);
      }, 2400);
    } else {
      setShowWelcome(false);
      setWelcomeFinished(false);
      setIsInputOpen(false);
      setAiResponse(null);
      setUserQueryDisplay(null);
      setAiState('idle');
      stopAudioRecording();
    }
  };

  const stopAudioRecording = () => {
    setIsMicActive(false);
    setAudioVolume(0);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  // Trigger expressive double-blink on AI answer
  const triggerEyesReaction = () => {
    setIsBlinking(true);
    setTimeout(() => {
      setIsBlinking(false);
      setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 160);
      }, 140);
    }, 160);
  };

  // Handler for professional short-term crypto analysis trigger
  const handleCryptoForecastSelect = (symbol: string, name: string) => {
    setIsCryptoMenuOpen(false);
    const now = new Date();
    const initialTimeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const targetObj = new Date(now.getTime() + 15 * 60 * 1000);
    const targetTimeStr = targetObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setActivePrediction({
      coin: symbol,
      coinName: name,
      initialTime: initialTimeStr,
      targetTime: targetTimeStr,
    });
    setFeedbackSubmitted(false);
    setFeedbackResult(null);

    const prompt = `Сделай профессиональный краткосрочный анализ рынка ${symbol} (${name}) для AI-трейдинга. Проанализируй скользящие горизонты (5, 15, 30 и 60 минут), определи вероятные зоны локальных минимумов и максимумов, диапазон изменения цены, вероятности первого касания и сформируй торговый сигнал BUY/SELL/HOLD с учетом комиссий и проскальзывания.`;
    sendToAi(prompt);
  };

  // Handler for RLHF neural network self-learning feedback
  const handleSendFeedback = async (isCorrect: boolean) => {
    if (feedbackSubmitted || feedbackLoading) return;
    setFeedbackLoading(true);

    const primaryCoin = aiResponse?.cryptoData?.[0];
    const coinSymbol = activePrediction?.coin || primaryCoin?.symbol || 'BTC';
    const targetPrice = primaryCoin?.forecast?.targetHorizonForecast?.targetPrice || 0;
    const currentPrice = primaryCoin?.priceUsd || 0;

    try {
      const res = await fetch('/api/learning/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coin: coinSymbol,
          initialTime: activePrediction?.initialTime || new Date(Date.now() - 7 * 60000).toLocaleTimeString('ru-RU'),
          targetTime: activePrediction?.targetTime || new Date().toLocaleTimeString('ru-RU'),
          targetPrice,
          currentPrice,
          isCorrect,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setLearningProgress(data.progress);
        setFeedbackSubmitted(true);
        setFeedbackResult({
          isCorrect,
          analysis: data.feedbackEntry?.analysis || '',
          message: data.message || '',
        });
      }
    } catch (err) {
      console.error('Feedback submit error:', err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Send message to Gemini with search grounding
  const sendToAi = async (prompt: string, audioData?: string, mimeType?: string) => {
    setIsEyes(true);
    setWelcomeFinished(true);
    setAiState('thinking');
    setUserQueryDisplay(prompt || '🎙️ Голосовой запрос');
    setAiResponse(null);
    setFeedbackSubmitted(false);
    setFeedbackResult(null);

    const userMessageText = prompt || 'Голосовое сообщение';
    const newHistory: ChatMessage[] = [...history, { role: 'user', text: userMessageText }];
    setHistory(newHistory);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          audioData,
          mimeType,
          history: newHistory,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.details || data.error || 'Ошибка связи с ИИ');
      }

      setAiResponse({
        text: data.text,
        sources: data.sources || [],
        searchQueries: data.searchQueries || [],
        cryptoData: data.cryptoData || [],
      });

      // If response includes crypto data and no explicit activePrediction was set, configure default
      if (data.cryptoData && data.cryptoData.length > 0 && !activePrediction) {
        const c = data.cryptoData[0];
        const now = new Date();
        const initialTimeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const targetObj = new Date(now.getTime() + 7 * 60 * 1000);
        const targetTimeStr = targetObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setActivePrediction({
          coin: c.symbol,
          coinName: c.name,
          initialTime: initialTimeStr,
          targetTime: targetTimeStr,
        });
      }

      setHistory((prev) => [...prev, { role: 'model', text: data.text }]);
      setAiState('speaking');
      triggerEyesReaction();
      setTimeout(() => {
        setAiState((current) => (current === 'speaking' ? 'idle' : current));
      }, 3500);
    } catch (err: any) {
      console.warn('AI chat error:', err?.message || err);
      let userFriendlyMessage = 'Не удалось получить ответ. Пожалуйста, попробуйте снова через минуту.';
      const msg = err?.message || String(err);

      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        userFriendlyMessage = 'Лимит запросов к Gemini API временно исчерпан. Пожалуйста, подождите 1 минуту и повторите запрос.';
      } else if (!msg.startsWith('{')) {
        userFriendlyMessage = `Не удалось получить ответ: ${msg}`;
      }

      setAiResponse({
        text: userFriendlyMessage,
        sources: [],
        searchQueries: [],
      });
      setAiState('idle');
    }
  };

  // Handle Microphone toggle with robust getUserMedia & audio streaming
  const handleToggleMic = async () => {
    if (isMicActive) {
      // Stop recording and process
      setIsMicActive(false);

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorderRef.current?.mimeType || 'audio/webm',
          });

          stopAudioRecording();

          if (messageText.trim()) {
            sendToAi(messageText.trim());
            setMessageText('');
          } else if (audioBlob.size > 200) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              sendToAi('', base64, audioBlob.type || 'audio/webm');
            };
            reader.readAsDataURL(audioBlob);
          }
        };

        mediaRecorderRef.current.stop();
      } else {
        stopAudioRecording();
        if (messageText.trim()) {
          sendToAi(messageText.trim());
          setMessageText('');
        }
      }
      return;
    }

    setMicError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsMicActive(false);
      setAiState('idle');
      setMicError('Микрофон недоступен в этом контексте. Введите сообщение текстом:');
      setIsInputOpen(true);
      setTimeout(() => inputRef.current?.focus(), 150);
      setTimeout(() => setMicError(null), 5000);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaStreamRef.current = stream;

      // Setup audio analyzer for volume reactivity
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        try {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!mediaStreamRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioVolume(Math.min(1, avg / 45));
            requestAnimationFrame(checkVolume);
          };
          checkVolume();
        } catch {
          // ignore visualizer error
        }
      }

      // MediaRecorder initialization
      audioChunksRef.current = [];
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      let selectedMime = '';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const recorder = selectedMime ? new MediaRecorder(stream, { mimeType: selectedMime }) : new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start(200);

      // Start speech recognition in parallel if supported
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // ignore
        }
      }

      setIsMicActive(true);
      setAiState('listening');
      setMessageText('');
    } catch (err: any) {
      console.warn('Microphone permission not granted in current context:', err?.message || err);
      setIsMicActive(false);
      setAiState('idle');
      setMicError('Доступ к микрофону не предоставлен. Напишите ваш вопрос:');
      setIsInputOpen(true);
      setTimeout(() => inputRef.current?.focus(), 150);
      setTimeout(() => setMicError(null), 5000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const query = messageText.trim();
    setMessageText('');
    setIsInputOpen(false);
    sendToAi(query);
  };

  useEffect(() => {
    return () => {
      stopAudioRecording();
      if (welcomeTimerRef.current) {
        clearTimeout(welcomeTimerRef.current);
      }
    };
  }, []);

  const circleSize = isMobile ? 240 : 320;
  const eyeWidth = isMobile ? 86 : 104;
  const eyeHeight = isMobile ? 150 : 180;
  const currentEyeHeight = isBlinking ? Math.round(eyeHeight * 0.82) : eyeHeight;
  const eyeOffset = isMobile ? 49 : 59;
  const currentRadius = isEyes ? eyeWidth / 2 : circleSize / 2;

  // Reactivity of eyes based on AI state
  const thinkingOffset = aiState === 'thinking' ? 6 : 0;
  const listeningScale = isMicActive ? 1 + audioVolume * 0.12 : 1;

  return (
    <main
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black select-none font-sf"
      tabIndex={0}
      aria-label="Интерактивный белый круг и глаза ИИ на черном фоне"
    >
      {/* Floating Top Navigation Bar */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-mono text-neutral-300 font-semibold tracking-wider">
            White Circle AI
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsTradingDashboardOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 hover:border-indigo-500 shadow-xl text-xs font-mono font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>AI-трейдинг и анализ</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </button>
      </div>

      {/* Standalone Short-Term Analysis & AI Trading Dashboard Modal */}
      <AnimatePresence>
        {isTradingDashboardOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-2 sm:inset-8 z-50 overflow-y-auto rounded-2xl shadow-2xl bg-black/95 backdrop-blur-2xl border border-neutral-800 p-2 sm:p-4 flex flex-col justify-start"
          >
            <ShortTermAnalysisDashboard
              initialItem={selectedDashboardItem}
              onClose={() => {
                setIsTradingDashboardOpen(false);
                setSelectedDashboardItem(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clickable AI Presence / Shape */}
      <button
        type="button"
        onClick={toggle}
        aria-label={
          isEyes
            ? 'Глаза искусственного интеллекта. Нажмите для возврата к кругу'
            : 'Белый круг. Нажмите для пробуждения искусственного интеллекта'
        }
        className="group relative cursor-pointer p-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-full"
      >
        <div className="grid place-items-center">
          {aiState !== 'thinking' ? (
            <>
              {/* Left Eye */}
              <motion.div
                key="left-eye"
                className="col-start-1 row-start-1 bg-white select-none pointer-events-none"
                initial={false}
                animate={{
                  width: isEyes ? eyeWidth * listeningScale : circleSize,
                  height: isEyes ? currentEyeHeight * listeningScale : circleSize,
                  borderRadius: currentRadius,
                  x: isEyes ? -eyeOffset : 0,
                  y: 0,
                  opacity: 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 190,
                  damping: 22,
                  mass: 0.85,
                }}
              />

              {/* Right Eye */}
              <motion.div
                key="right-eye"
                className="col-start-1 row-start-1 bg-white select-none pointer-events-none"
                initial={false}
                animate={{
                  width: isEyes ? eyeWidth * listeningScale : circleSize,
                  height: isEyes ? currentEyeHeight * listeningScale : circleSize,
                  borderRadius: currentRadius,
                  x: isEyes ? eyeOffset : 0,
                  y: 0,
                  opacity: 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 190,
                  damping: 22,
                  mass: 0.85,
                }}
              />
            </>
          ) : (
            /* Classic loading spinner: extra bold, smooth rounded stroke, seamlessly morphed from the eyes */
            <motion.div
              key="loading-spinner"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="col-start-1 row-start-1 relative flex items-center justify-center pointer-events-none"
            >
              {/* Soft atmospheric ambient glow */}
              <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white/10 blur-2xl" />

              {/* Thick, bold, smooth rounded circular loader */}
              <div
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-[10px] sm:border-[12px] border-white/20 border-t-white animate-spin shadow-[0_0_45px_rgba(255,255,255,0.25)]"
                style={{
                  borderRadius: '50%',
                }}
              />

              {/* Center subtle core */}
              <div className="absolute w-4 h-4 rounded-full bg-white/70 animate-ping opacity-40" />
            </motion.div>
          )}
        </div>
      </button>

      {/* Tap hint when in circle mode */}
      {!isEyes && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.65, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="pointer-events-none absolute top-[calc(50%+160px)] sm:top-[calc(50%+180px)] left-1/2 -translate-x-1/2 text-xs sm:text-sm text-neutral-400 tracking-wide whitespace-nowrap select-none"
        >
          Нажмите на круг, чтобы начать диалог с ИИ
        </motion.p>
      )}

      {/* Shimmer Welcome Text */}
      <AnimatePresence
        onExitComplete={() => {
          if (isEyes) {
            setWelcomeFinished(true);
          }
        }}
      >
        {showWelcome && (
          <motion.div
            key="welcome-text"
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            }}
            exit={{
              opacity: 0,
              y: -8,
              filter: 'blur(8px)',
              transition: { duration: 1.4, ease: [0.25, 0.1, 0.25, 1] },
            }}
            className="pointer-events-none absolute top-[calc(50%+105px)] sm:top-[calc(50%+122px)] left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
          >
            <span className="font-sf animate-shimmer text-xl sm:text-2xl font-normal tracking-[-0.02em]">
              Welcome, innorks!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Response Display Card with Google Search Grounding */}
      <AnimatePresence>
        {isEyes && aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[calc(50%+100px)] sm:top-[calc(50%+115px)] left-1/2 -translate-x-1/2 w-[92vw] max-w-xl max-h-[46vh] sm:max-h-[50vh] overflow-y-auto z-30 p-5 rounded-2xl bg-neutral-950/90 border border-neutral-800/90 backdrop-blur-2xl shadow-2xl text-white"
          >
            {/* Header with status and close button */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 mb-3">
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 flex-wrap">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-white font-medium">Оракул Будущего</span>
                {aiResponse.sources.length > 0 && (
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <Globe className="w-3 h-3" />
                    Поиск в сети ({aiResponse.sources.length})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setAiResponse(null)}
                className="w-7 h-7 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors"
                aria-label="Закрыть ответ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User query quote */}
            {userQueryDisplay && (
              <p className="text-xs text-neutral-400 mb-3 italic bg-neutral-900/60 px-3 py-1.5 rounded-lg border border-neutral-800/60">
                &ldquo;{userQueryDisplay}&rdquo;
              </p>
            )}

            {/* Top 7-Minute Forecast & Neural Network Learning Hero Card */}
            {aiResponse.cryptoData && aiResponse.cryptoData.length > 0 && (() => {
              const cryptoItem = aiResponse.cryptoData[0];
              const f = cryptoItem.forecast?.targetHorizonForecast;
              const targetPrice = f?.targetPrice || cryptoItem.priceUsd;
              const expectedChange = f?.expectedChangePercent ?? 0;
              const isTargetPositive = expectedChange >= 0;
              const formatNum = (n: number) =>
                n < 1 ? n.toFixed(4) : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              const targetTimeDisplay = activePrediction?.targetTime || cryptoItem.timestamp;
              const initialTimeDisplay = activePrediction?.initialTime || '';

              return (
                <div className="mb-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-neutral-900/95 via-neutral-950/95 to-neutral-900/90 border border-neutral-700/80 shadow-2xl backdrop-blur-xl">
                  {/* 1. Маленький подтекст сверху: объяснение на что отвечает цена или время ниже */}
                  <div className="text-center mb-2">
                    <span className="text-[11px] sm:text-xs text-neutral-400 font-medium tracking-wide inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800/90 border border-neutral-700/70">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      {activePrediction
                        ? `Прогноз цены ${activePrediction.coin} (${activePrediction.coinName}) ровно через 7 минут от отправки (${initialTimeDisplay} ➔ ${targetTimeDisplay})`
                        : `Прогноз цены ${cryptoItem.name} (${cryptoItem.symbol}) к ${targetTimeDisplay} (${f?.timeframeLabel || 'краткосрочный'})`}
                    </span>
                  </div>

                  {/* 2. Ниже: Цена / Время */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 my-2 text-center">
                    <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white flex items-center gap-2">
                      <span>${formatNum(targetPrice)}</span>
                      <span className="text-neutral-500 font-normal text-xl sm:text-2xl">/</span>
                      <span className="text-indigo-300 font-mono text-xl sm:text-2xl">
                        {targetTimeDisplay}
                      </span>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full font-mono text-xs sm:text-sm font-bold flex items-center gap-1 ${
                        isTargetPositive
                          ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-700/80'
                          : 'bg-rose-950/90 text-rose-300 border border-rose-700/80'
                      }`}
                    >
                      <span>{isTargetPositive ? '▲ +' : '▼ '}{expectedChange}%</span>
                    </div>
                  </div>

                  {/* Spot baseline info */}
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] font-mono text-neutral-400 mb-3.5">
                    <span>Текущий спот: ${formatNum(cryptoItem.priceUsd)}</span>
                    <span>•</span>
                    <span>Коридор: ${Math.round(f?.corridorMin || cryptoItem.priceUsd * 0.98).toLocaleString()} – ${Math.round(f?.corridorMax || cryptoItem.priceUsd * 1.02).toLocaleString()}</span>
                  </div>

                  {/* 3. Чуть ниже: Две скругленные (50px) кнопки (Красный крестик слева, Зеленая галочка справа) */}
                  <div className="flex items-center justify-center gap-4 sm:gap-6 pt-2 pb-1 border-t border-neutral-800/80">
                    {/* Кнопка Крестика (Красная слева, скругленная 50px) */}
                    <button
                      type="button"
                      disabled={feedbackLoading || feedbackSubmitted}
                      onClick={() => handleSendFeedback(false)}
                      aria-label="Нейросеть предсказала не правильно — начать разбор ошибки и обучение"
                      title="Неверно: разобрать ошибку и адаптировать веса"
                      className={`group relative flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 rounded-[50px] font-medium text-xs sm:text-sm transition-all duration-300 ${
                        feedbackSubmitted && !feedbackResult?.isCorrect
                          ? 'bg-red-600 text-white ring-4 ring-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.6)]'
                          : feedbackSubmitted
                          ? 'opacity-35 cursor-not-allowed bg-neutral-800 text-neutral-400'
                          : 'bg-red-600 hover:bg-red-500 active:scale-95 text-white shadow-lg shadow-red-950/60 hover:shadow-red-600/30'
                      }`}
                    >
                      <X className="w-5 h-5 stroke-[2.5] group-hover:scale-110 transition-transform" />
                      <span className="tracking-wide">Неверно</span>
                    </button>

                    {/* Кнопка Галочки (Зеленая справа, скругленная 50px) */}
                    <button
                      type="button"
                      disabled={feedbackLoading || feedbackSubmitted}
                      onClick={() => handleSendFeedback(true)}
                      aria-label="Нейросеть предсказала правильно — разобрать правильный ответ и закрепить обучение"
                      title="Верно: разобрать правильный ответ и повысить точность"
                      className={`group relative flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 rounded-[50px] font-medium text-xs sm:text-sm transition-all duration-300 ${
                        feedbackSubmitted && feedbackResult?.isCorrect
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.6)]'
                          : feedbackSubmitted
                          ? 'opacity-35 cursor-not-allowed bg-neutral-800 text-neutral-400'
                          : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-lg shadow-emerald-950/60 hover:shadow-emerald-600/30'
                      }`}
                    >
                      <Check className="w-5 h-5 stroke-[2.5] group-hover:scale-110 transition-transform" />
                      <span className="tracking-wide">Верно</span>
                    </button>
                  </div>

                  {/* Micro subtext under buttons */}
                  <p className="text-[10px] text-center text-neutral-500 mt-2 font-mono">
                    {feedbackSubmitted
                      ? '✓ Обучение завершено и сохранено в проект (data/learning_progress.json)'
                      : 'Оцените прогноз для обучения нейросети (сохранение прогресса в проект)'}
                  </p>

                  {/* 4. Разбор нейросети (Обучение) при нажатии на кнопку */}
                  <AnimatePresence>
                    {feedbackResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35 }}
                        className={`mt-3.5 p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed backdrop-blur-md ${
                          feedbackResult.isCorrect
                            ? 'bg-emerald-950/70 border-emerald-700/70 text-emerald-100'
                            : 'bg-red-950/70 border-red-700/70 text-red-100'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-current/20 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Brain className="w-4 h-4" />
                            {feedbackResult.isCorrect
                              ? 'Нейросеть: Закрепление успешного ответа'
                              : 'Нейросеть: Тщательный разбор допущенной ошибки'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 font-mono">
                            Сохранено в проекте
                          </span>
                        </div>

                        <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                          {feedbackResult.analysis}
                        </div>

                        {learningProgress && (
                          <div className="mt-2.5 pt-2 border-t border-current/20 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                            <span>Точность модели: {learningProgress.accuracyPercent}%</span>
                            <span>Всего прогнозов: {learningProgress.totalPredictions}</span>
                            <span>Серия верных: {learningProgress.currentStreak}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })()}

            {/* AI Text Content */}
            <div className="text-sm sm:text-base leading-relaxed text-neutral-100 whitespace-pre-wrap select-text mb-4 font-normal">
              {aiResponse.text}
            </div>

            {/* Live Crypto & Quantitative Predictive Terminal Card */}
            {aiResponse.cryptoData && aiResponse.cryptoData.length > 0 && (
              <div className="mb-4 space-y-3">
                {aiResponse.cryptoData.map((item, idx) => {
                  const isPositive = item.change24h >= 0;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-3.5 backdrop-blur-md shadow-xl"
                    >
                      {/* Top row: Symbol, Name, Live dot, Time & Open Terminal Button */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white tracking-wide">{item.name}</span>
                          <span className="text-[11px] text-neutral-400 font-mono bg-neutral-800/80 px-2 py-0.5 rounded">
                            {item.symbol}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDashboardItem(item);
                              setIsTradingDashboardOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/50 text-[11px] font-mono font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Открыть профессиональный анализ скользящих горизонтов, экстремумов и Paper Trading"
                          >
                            <Activity className="w-3 h-3 text-indigo-400" />
                            <span>Терминал экстремумов</span>
                          </button>
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{item.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      {/* Big Spot Price & 24h Change */}
                      <div className="flex items-baseline justify-between mb-3">
                        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                          ${item.priceUsd < 1
                            ? item.priceUsd.toFixed(4)
                            : item.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full font-mono flex items-center gap-1 ${
                            isPositive
                              ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-800/60'
                              : 'text-rose-300 bg-rose-950/80 border border-rose-800/60'
                          }`}
                        >
                          <span>{isPositive ? '▲ +' : '▼ '}{item.change24h.toFixed(2)}%</span>
                          <span className="opacity-80">
                            ({isPositive ? '+$' : '-$'}{Math.abs(item.change24hUsd).toFixed(item.priceUsd < 1 ? 4 : 2)})
                          </span>
                        </div>
                      </div>

                      {/* Real Multi-Timeframe Candlestick Chart with Volume & Patterns */}
                      <CandlestickChart item={item} />

                      {/* Technical Indicators & Order Book Microstructure Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mb-3 p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800/60 font-mono">
                        <div>
                          <span className="text-neutral-500 block">RSI & MACD</span>
                          <span className={`font-semibold ${item.rsi14 >= 70 ? 'text-rose-400' : item.rsi14 <= 30 ? 'text-emerald-400' : 'text-neutral-200'}`}>
                            {item.rsi14} <span className="text-[10px] font-normal text-neutral-400">({item.macdHistogram >= 0 ? '+' : ''}{item.macdHistogram.toFixed(1)})</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">EMA 9 / 20 / 50</span>
                          <span className="text-neutral-200 font-medium text-[10px]">
                            ${Math.round(item.ema9).toLocaleString()} / ${Math.round(item.ema20).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Боллинджер (%B {item.bbPercentB}%)</span>
                          <span className="text-neutral-200 font-medium text-[10px]">
                            ${Math.round(item.bbLower).toLocaleString()} – ${Math.round(item.bbUpper).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">ОИ Деривативов / F&G</span>
                          <span className="text-neutral-200 font-medium text-[10px]">
                            ${(item.openInterestUsd / 1e9).toFixed(2)}B • {item.fearAndGreed?.split('/')[0] || '65'}
                          </span>
                        </div>
                      </div>

                      {/* Order Book Microstructure & Walls */}
                      {(item.orderBookBidWall || item.orderBookAskWall) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] mb-3 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800 font-mono">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-neutral-500 shrink-0">Стена покупателей (Bid Wall):</span>
                            <span className="text-emerald-300 font-semibold truncate">{item.orderBookBidWall || 'В расчете'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-neutral-500 shrink-0">Стена продавцов (Ask Wall):</span>
                            <span className="text-rose-300 font-semibold truncate">{item.orderBookAskWall || 'В расчете'}</span>
                          </div>
                        </div>
                      )}

                      {/* Short-Term Extremum Scenarios & Trade Signal Strip */}
                      {item.multiHorizonScenarios && item.multiHorizonScenarios.length > 0 && (
                        <div className="mb-3 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 font-mono shadow-md">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
                              <Clock className="w-3.5 h-3.5 text-indigo-400" />
                              <span>СКОЛЬЗЯЩИЕ ГОРИЗОНТЫ (ЛОКАЛЬНЫЕ ЭКСТРЕМУМЫ):</span>
                            </div>
                            {item.tradingSignal && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDashboardItem(item);
                                  setIsTradingDashboardOpen(true);
                                }}
                                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 transition-transform hover:scale-105 cursor-pointer ${
                                  item.tradingSignal.signal === 'BUY'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                    : item.tradingSignal.signal === 'SELL'
                                    ? 'bg-rose-950 text-rose-300 border border-rose-700'
                                    : 'bg-amber-950 text-amber-300 border border-amber-700'
                                }`}
                              >
                                <span>Сигнал: {item.tradingSignal.signal}</span>
                                <span className="opacity-75">({item.tradingSignal.timeframeHorizon})</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                            {item.multiHorizonScenarios.map((scen: any) => (
                              <div
                                key={scen.timeframe}
                                onClick={() => {
                                  setSelectedDashboardItem(item);
                                  setIsTradingDashboardOpen(true);
                                }}
                                className="p-2 rounded-lg bg-neutral-900/80 border border-neutral-800/80 hover:border-indigo-500/50 cursor-pointer transition-all hover:bg-neutral-800/60"
                              >
                                <div className="text-white font-bold flex items-center justify-between mb-1">
                                  <span>{scen.label}</span>
                                  <span className="text-[9px] text-neutral-400">±{scen.corridor.rangePercent}%</span>
                                </div>
                                <div className="text-emerald-400 truncate">
                                  Min: ${scen.localMinZone.min < 1 ? scen.localMinZone.min.toFixed(4) : Math.round(scen.localMinZone.min).toLocaleString()}
                                </div>
                                <div className="text-rose-400 truncate">
                                  Max: ${scen.localMaxZone.max < 1 ? scen.localMaxZone.max.toFixed(4) : Math.round(scen.localMaxZone.max).toLocaleString()}
                                </div>
                                <div className="text-neutral-400 text-[9px] mt-1 pt-1 border-t border-neutral-800/60 flex items-center justify-between">
                                  <span>1st hit:</span>
                                  <span className="text-indigo-300 font-bold">{scen.localMaxZone.firstHitProbability}% Max</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Laser-Focused Target Horizon Forecast Hero Card */}
                      {item.forecast?.targetHorizonForecast && (
                        <div className="mb-3 p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/80 via-neutral-900/95 to-purple-950/60 border border-indigo-500/60 shadow-2xl">
                          <div className="flex items-center justify-between text-xs font-semibold text-indigo-300 mb-2.5">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-indigo-400" />
                              <span className="tracking-wide">
                                ТОЧНЫЙ ПРОГНОЗ: {item.forecast.targetHorizonForecast.timeframeLabel.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/25 text-indigo-200 border border-indigo-400/40">
                              Вероятность {item.forecast.targetHorizonForecast.probability}%
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between mb-3">
                            <div>
                              <span className="text-[10px] text-neutral-400 block font-mono">РАСЧЕТНАЯ ЦЕЛЕВАЯ ЦЕНА (TARGET):</span>
                              <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                                ${item.forecast.targetHorizonForecast.targetPrice < 1
                                  ? item.forecast.targetHorizonForecast.targetPrice.toFixed(4)
                                  : item.forecast.targetHorizonForecast.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div
                              className={`text-xs font-bold px-2.5 py-1 rounded-md font-mono ${
                                item.forecast.targetHorizonForecast.expectedChangePercent >= 0
                                  ? 'text-emerald-300 bg-emerald-950/90 border border-emerald-700/60'
                                  : 'text-rose-300 bg-rose-950/90 border border-rose-700/60'
                              }`}
                            >
                              {item.forecast.targetHorizonForecast.expectedChangePercent >= 0 ? '▲ +' : '▼ '}
                              {item.forecast.targetHorizonForecast.expectedChangePercent}%
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] font-mono bg-neutral-950/90 p-2.5 rounded-lg border border-neutral-800/80 mb-3">
                            <div>
                              <span className="text-neutral-500 block text-[10px]">Коридор волатильности:</span>
                              <span className="text-neutral-200 font-semibold text-[10px]">
                                ${Math.round(item.forecast.targetHorizonForecast.corridorMin).toLocaleString()} – ${Math.round(item.forecast.targetHorizonForecast.corridorMax).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[10px]">Триггер пробоя вверх:</span>
                              <span className="text-emerald-400 font-semibold text-[10px]">
                                ${Math.round(item.forecast.targetHorizonForecast.bullTrigger).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[10px]">Отмена сценария (стоп):</span>
                              <span className="text-rose-400 font-semibold text-[10px]">
                                ${Math.round(item.forecast.targetHorizonForecast.bearInvalidation).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Mathematical Formula Breakdown Card */}
                          {item.forecast.targetHorizonForecast.formulaBreakdown && (
                            <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-[10px] font-mono mb-3">
                              <div className="flex items-center justify-between text-neutral-300 font-semibold pb-1.5 mb-1.5 border-b border-neutral-800">
                                <span className="flex items-center gap-1.5 text-indigo-300">
                                  <Scale className="w-3.5 h-3.5" />
                                  Математический расчет дрифта цены:
                                </span>
                                <span className="text-emerald-400">
                                  Дрифт: {item.forecast.targetHorizonForecast.formulaBreakdown.expectedShiftUsd >= 0 ? '+' : ''}
                                  ${Math.round(item.forecast.targetHorizonForecast.formulaBreakdown.expectedShiftUsd).toLocaleString()}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-neutral-400">
                                <div>
                                  <span className="text-neutral-500 block">Базовый спот:</span>
                                  <span className="text-neutral-200 font-bold">${Math.round(item.forecast.targetHorizonForecast.formulaBreakdown.basePrice).toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-neutral-500 block">Бюджет волатильности:</span>
                                  <span className="text-neutral-200 font-bold">±${Math.round(item.forecast.targetHorizonForecast.formulaBreakdown.volatilityBudget).toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-neutral-500 block">Вектор свечей / стакана:</span>
                                  <span className="text-amber-300 font-bold">
                                    {(item.forecast.targetHorizonForecast.formulaBreakdown.candleBiasWeight || 0).toFixed(2)} / {(item.forecast.targetHorizonForecast.formulaBreakdown.orderBookBias || 0).toFixed(2)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-neutral-500 block">Итоговый конфлюэнс:</span>
                                  <span className="text-indigo-300 font-bold">
                                    {item.forecast.targetHorizonForecast.formulaBreakdown.netConfluenceBias >= 0 ? '+' : ''}
                                    {item.forecast.targetHorizonForecast.formulaBreakdown.netConfluenceBias.toFixed(3)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step-by-step Movement Trajectory Timeline */}
                          {item.forecast.targetHorizonForecast.formulaBreakdown?.trajectoryPhases && (
                            <div className="space-y-1.5 pt-1 border-t border-neutral-800/80">
                              <span className="text-[10px] text-neutral-400 font-semibold block uppercase tracking-wider">
                                Пошаговая траектория движения:
                              </span>
                              {item.forecast.targetHorizonForecast.formulaBreakdown.trajectoryPhases.map((phase, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="flex items-start gap-2 text-[10px] font-mono bg-neutral-950/60 px-2 py-1.5 rounded border border-neutral-800/70"
                                >
                                  <span className="text-indigo-400 font-bold shrink-0">{phase.phase}:</span>
                                  <span className="text-white font-bold shrink-0">${Math.round(phase.targetSubPrice).toLocaleString()}</span>
                                  <span className="text-neutral-400 truncate">{phase.desc}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Institutional Smart Money Concepts (SMC), Wyckoff & Divergences Block */}
                      {item.smc && (
                        <div className="mb-3 p-3 rounded-lg bg-neutral-950/90 border border-neutral-800 text-[11px] font-mono shadow-md">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800/80">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                              <span>ИНСТИТУЦИОНАЛЬНЫЙ АНАЛИЗ (SMC & ВАЙКОФФ & ДИВЕРГЕНЦИИ)</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 font-sans">
                              Thinking Level: HIGH
                            </span>
                          </div>

                          <div className="space-y-1.5 text-[11px] text-neutral-300">
                            <div className="flex items-start gap-1.5">
                              <span className="text-neutral-500 shrink-0">Цикл Вайкоффа:</span>
                              <span className="text-purple-200 font-medium">{item.smc.wyckoffPhase}</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-neutral-500 shrink-0">SMC Дисбаланс:</span>
                              <span className="text-emerald-300">{item.smc.fvg}</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-neutral-500 shrink-0">Ликвидность:</span>
                              <span className="text-indigo-300">{item.smc.liquiditySweep}</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-neutral-500 shrink-0">Дивергенции:</span>
                              <span className="text-amber-300">{item.rsiDivergence}</span>
                            </div>
                            {item.vwapDeviationBands && (
                              <div className="flex items-start gap-1.5">
                                <span className="text-neutral-500 shrink-0">VWAP Коридор (±1σ):</span>
                                <span className="text-neutral-200 font-medium">
                                  ${item.vwapDeviationBands.lowerBand1Sigma.toLocaleString()} – ${item.vwapDeviationBands.upperBand1Sigma.toLocaleString()}{' '}
                                  <span className="text-neutral-400">({item.vwapDeviationBands.status})</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Live News Catalysts Impact Card */}
                      {item.newsCatalysts && item.newsCatalysts.length > 0 && (
                        <div className="mb-3 p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 text-[11px] font-mono shadow-sm">
                          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-neutral-800 text-xs font-semibold text-neutral-300">
                            <span className="flex items-center gap-1.5 text-emerald-400">
                              <Globe className="w-3.5 h-3.5" />
                              Ключевые катализаторы из интернета (2026):
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              Индекс новостей: {item.newsSentimentPercent || 64}%
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {item.newsCatalysts.slice(0, 3).map((cat, cIdx) => (
                              <div key={cIdx} className="bg-neutral-900/60 p-2 rounded border border-neutral-800/60">
                                <span className="text-white font-medium block truncate">{cat.title}</span>
                                <span className="text-emerald-400 text-[10px] block mt-0.5">{cat.impact}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mathematical Fibonacci & Volatility Forecast Box */}
                      {item.forecast && (
                        <div className="pt-2.5 border-t border-neutral-800/70">
                          <div className="flex items-center justify-between text-xs font-medium text-neutral-300 mb-2">
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Глубокая математическая модель и прогноз (Фибоначчи + Ончейн):</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] font-mono mb-2">
                            <div className="bg-neutral-950/60 p-2 rounded border border-neutral-800/60">
                              <span className="text-neutral-500 block text-[10px]">Суточный (24–48ч):</span>
                              <span className="text-neutral-200 font-semibold">{item.forecast.realistic24hRange?.split('(')[0] || 'В расчете'}</span>
                            </div>
                            <div className="bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
                              <span className="text-emerald-400/90 block text-[10px]">Тактический (1–2 нед.):</span>
                              <span className="text-emerald-300 font-semibold">{item.forecast.tacticalWeeklyCorridor?.split('(')[0] || 'В расчете'}</span>
                            </div>
                            <div className="bg-indigo-950/30 p-2 rounded border border-indigo-900/50">
                              <span className="text-indigo-400/90 block text-[10px]">Бычий таргет (1–3 мес.):</span>
                              <span className="text-indigo-300 font-semibold">{item.forecast.bullTargetFib || 'В расчете'}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono bg-neutral-950/40 p-2 rounded border border-neutral-800/40">
                            <div><span className="text-neutral-500 font-sans">Свечные экстремумы (30д):</span> Мин ${Math.round(item.localLow30d || 0).toLocaleString()} — Макс ${Math.round(item.localPeak30d || 0).toLocaleString()}</div>
                            <div><span className="text-neutral-500 font-sans">Кластер ликвидаций:</span> Шорт-сквиз: {item.shortSqueezeCluster || '—'} | Стопы: {item.longFlushCluster || '—'}</div>
                            <div><span className="text-neutral-500 font-sans">База расчета:</span> {item.forecast.formulaBasis || 'Свечной график (7д)'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Grounding Sources (Search Results) */}
            {aiResponse.sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-neutral-800/80">
                <p className="text-xs text-neutral-400 mb-2 font-medium flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  Актуальные первоисточники из интернета:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {aiResponse.sources.slice(0, 6).map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2.5 py-1 rounded-lg transition-colors max-w-xs truncate group"
                    >
                      <span className="truncate">{source.title || 'Источник'}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thinking / Searching Indicator */}
      <AnimatePresence>
        {isEyes && aiState === 'thinking' && !aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-[calc(50%+115px)] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-4 py-2 rounded-full bg-neutral-900/95 border border-neutral-800 text-neutral-200 text-xs sm:text-sm backdrop-blur-md shadow-2xl"
          >
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Сканирую сеть в реальном времени и моделирую будущее...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic Error Notification */}
      <AnimatePresence>
        {micError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-red-950/90 border border-red-800/80 text-red-200 text-xs shadow-xl"
          >
            {micError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls: Mic and Write Buttons / Input Field */}
      <AnimatePresence>
        {isEyes && welcomeFinished && (
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-full px-4"
          >
            <AnimatePresence mode="wait">
              {!isInputOpen ? (
                /* Three circular buttons: Microphone, Write, and Dot (7-min Crypto Forecast) */
                <motion.div
                  key="action-buttons"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-5 relative"
                >
                  {/* Microphone Button */}
                  <div className="relative flex flex-col items-center">
                    <button
                      type="button"
                      onClick={handleToggleMic}
                      aria-label={isMicActive ? 'Остановить запись и отправить' : 'Включить микрофон'}
                      className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
                        isMicActive
                          ? 'bg-red-500 text-white shadow-[0_0_35px_rgba(239,68,68,0.7)] scale-110'
                          : 'bg-neutral-900 text-neutral-200 border border-neutral-700/70 hover:bg-neutral-800 hover:text-white hover:border-neutral-500 hover:scale-105 active:scale-95'
                      }`}
                    >
                      {isMicActive ? (
                        <>
                          <Mic className="w-6 h-6 animate-pulse" />
                          <span
                            className="absolute -inset-2 rounded-full border border-red-400/60 pointer-events-none transition-transform"
                            style={{
                              transform: `scale(${1 + audioVolume * 0.4})`,
                              opacity: 0.5 + audioVolume * 0.5,
                            }}
                          />
                        </>
                      ) : (
                        <Mic className="w-6 h-6" />
                      )}
                    </button>
                    {isMicActive && (
                      <span className="absolute -top-7 text-xs font-medium text-red-400 whitespace-nowrap animate-pulse">
                        {messageText ? messageText.slice(-25) : 'Говорите...'}
                      </span>
                    )}
                  </div>

                  {/* Write ("Написать") Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsInputOpen(true);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    aria-label="Написать сообщение"
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-neutral-900 text-neutral-200 border border-neutral-700/70 hover:bg-neutral-800 hover:text-white hover:border-neutral-500 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <PenLine className="w-6 h-6" />
                  </button>

                  {/* 3rd Circular Button with Simple Dot Icon: 7-min Crypto Future Prediction */}
                  <div className="relative flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setIsCryptoMenuOpen((prev) => !prev)}
                      aria-label="Выбрать криптовалюту для 7-минутного прогноза"
                      title="Краткосрочный прогноз будущей цены через 7 минут"
                      className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
                        isCryptoMenuOpen
                          ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.45)] scale-105 ring-2 ring-white/50'
                          : 'bg-neutral-900 text-neutral-200 border border-neutral-700/70 hover:bg-neutral-800 hover:text-white hover:border-neutral-500 hover:scale-105 active:scale-95'
                      }`}
                    >
                      {/* Simple Dot Icon */}
                      <span className="w-2.5 h-2.5 rounded-full bg-current transition-transform duration-200" />
                    </button>

                    {/* Three Mini Buttons Popover: SOL, BTC, ETH */}
                    <AnimatePresence>
                      {isCryptoMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.85 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.85 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-full bg-neutral-900/95 border border-neutral-700/80 backdrop-blur-2xl shadow-2xl z-40 whitespace-nowrap"
                        >
                          <button
                            type="button"
                            onClick={() => handleCryptoForecastSelect('SOL', 'Solana')}
                            className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-neutral-800 text-purple-300 hover:bg-purple-950/80 hover:text-purple-200 border border-neutral-700 hover:border-purple-600/70 active:scale-95 transition-all shadow-md"
                          >
                            SOL
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCryptoForecastSelect('BTC', 'Bitcoin')}
                            className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-neutral-800 text-amber-300 hover:bg-amber-950/80 hover:text-amber-200 border border-neutral-700 hover:border-amber-600/70 active:scale-95 transition-all shadow-md"
                          >
                            BTC
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCryptoForecastSelect('ETH', 'Ethereum')}
                            className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-neutral-800 text-cyan-300 hover:bg-cyan-950/80 hover:text-cyan-200 border border-neutral-700 hover:border-cyan-600/70 active:scale-95 transition-all shadow-md"
                          >
                            ETH
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                /* Input field that expands upon clicking "Написать" */
                <motion.form
                  key="input-form"
                  initial={{ opacity: 0, scale: 0.94, width: '120px' }}
                  animate={{ opacity: 1, scale: 1, width: '100%' }}
                  exit={{ opacity: 0, scale: 0.94, width: '120px' }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2.5 bg-neutral-900/95 border border-neutral-700/80 backdrop-blur-xl px-4 py-2.5 rounded-full w-full max-w-md shadow-2xl"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Спросите о будущем, технологиях, событиях или трендах..."
                    className="flex-1 bg-transparent text-white text-sm sm:text-base placeholder-neutral-500 outline-none font-sf"
                    autoFocus
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    aria-label="Отправить запрос"
                    className="w-9 h-9 rounded-full bg-white text-black disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsInputOpen(false);
                      setMessageText('');
                    }}
                    aria-label="Закрыть ввод"
                    className="w-8 h-8 rounded-full text-neutral-400 hover:text-white flex items-center justify-center hover:bg-neutral-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
