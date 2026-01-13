
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, RotateCcw, Trophy, Settings, 
  Users, Sword, Shield, MessageSquare, Star, Crown, PlayCircle,
  Gift, RefreshCw, Book, Image as ImageIcon, CheckCircle2, Sparkles,
  PartyPopper, Globe
} from 'lucide-react';
import { Prize, Participant, WheelConfig, SpinRecord } from './types';
import { DEFAULT_PRIZES, PRESET_COLORS, COMMON_EMOJIS } from './constants';
import Wheel from './components/Wheel';

const STORAGE_KEYS = {
  PRIZES: 'luckyspin_v9_prizes',
  PARTICIPANTS: 'luckyspin_v9_participants',
  CONFIG: 'luckyspin_v9_config',
  HISTORY: 'luckyspin_v9_history',
  LANG: 'luckyspin_v9_lang'
};

const TRANSLATIONS = {
  zh: {
    inventory: '獎品欄',
    friends: '冒險者',
    system: '設定',
    addPrize: '獲得獎品',
    prizeName: '獎品名稱...',
    weight: '中獎權重',
    grandPrize: '特別大獎',
    invite: '邀請隊友 (批量輸入)',
    addFriends: '組隊完成',
    tickets: '抽獎券',
    titleLabel: '地圖標題',
    subtitleLabel: '地圖副標題',
    showProb: '轉盤顯示百分比 (%)',
    bgUpload: '中獎底圖上傳 (Modal)',
    fallingUpload: '特別大獎灑落圖片 (預設🍁)',
    removeBg: '移除底圖',
    removeFalling: '恢復預設🍁',
    duration: '旋轉秒數',
    rotations: '旋轉圈數',
    bounce: '回彈強度',
    direction: '旋轉方向',
    cw: '順時針',
    ccw: '逆時針',
    adventurer: '目前冒險者',
    draw: '開始抽獎',
    spinning: '正在旋轉命運...',
    history: '冒險日誌',
    noHistory: '目前沒有任何紀錄',
    missionComplete: '★ 任務完成 ★',
    grandTitle: '✧ 特別大獎 ✧',
    winner: '獲獎冒險者',
    close: '收回欄位',
    retry: '再次挑戰',
    remTickets: '剩餘機會'
  },
  en: {
    inventory: 'Prize',
    friends: 'Party',
    system: 'Setting',
    addPrize: 'Add New Prize',
    prizeName: 'Prize name...',
    weight: 'Probability Weight',
    grandPrize: 'Grand Prize',
    invite: 'Invite Party (Batch Input)',
    addFriends: 'Join Party',
    tickets: 'Tickets',
    titleLabel: 'Map Title',
    subtitleLabel: 'Map Subtitle',
    showProb: 'Show Prob. on Wheel (%)',
    bgUpload: 'Winner Background (Modal)',
    fallingUpload: 'Celebration Falling Item',
    removeBg: 'Remove Background',
    removeFalling: 'Reset to Maple Leaf',
    duration: 'Duration (s)',
    rotations: 'Rotations',
    bounce: 'Bounce Intensity',
    direction: 'Spin Direction',
    cw: 'CW',
    ccw: 'CCW',
    adventurer: 'Current Adventure',
    draw: 'Spin Now',
    spinning: 'Spinning Destiny...',
    history: 'Adventure Log',
    noHistory: 'No records found',
    missionComplete: '★ Mission Complete ★',
    grandTitle: '✧ GRAND PRIZE ✧',
    winner: 'Winner',
    close: 'Collect Prize',
    retry: 'Try Again',
    remTickets: 'Tickets Remaining'
  }
};

const EnhancedCelebration: React.FC<{ customImage?: string }> = ({ customImage }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
      
      {[...Array(30)].map((_, i) => (
        <div key={`cannon-${i}`} className="absolute"
          style={{
            left: i % 2 === 0 ? '5%' : '95%',
            bottom: '0%',
            width: '8px',
            height: '8px',
            backgroundColor: ['#FFD700', '#FF4081', '#00E676', '#2979FF'][Math.floor(Math.random() * 4)],
            borderRadius: '2px',
            animation: `cannon-shoot-${i % 2 === 0 ? 'left' : 'right'} ${1 + Math.random()}s ease-out forwards`,
          }}
        />
      ))}

      {[...Array(40)].map((_, i) => (
        <div key={`leaf-${i}`} className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10%`,
            animation: `falling-leaf ${3 + Math.random() * 4}s linear infinite`,
            animationDelay: `${Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            opacity: 0.9
          }}
        >
          {customImage ? (
            <img src={customImage} className="w-10 h-10 object-contain" alt="item" />
          ) : (
            <span className="text-3xl">🍁</span>
          )}
        </div>
      ))}
      
      <style>{`
        @keyframes cannon-shoot-left {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          50% { transform: translate(250px, -700px) scale(1.8); opacity: 1; }
          100% { transform: translate(500px, 300px) scale(0); opacity: 0; }
        }
        @keyframes cannon-shoot-right {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          50% { transform: translate(-250px, -700px) scale(1.8); opacity: 1; }
          100% { transform: translate(-500px, 300px) scale(0); opacity: 0; }
        }
        @keyframes falling-leaf {
          0% { transform: translateY(0) rotate(0deg) translateX(0); }
          50% { transform: translateY(50vh) rotate(180deg) translateX(-30px); }
          100% { transform: translateY(110vh) rotate(360deg) translateX(30px); }
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<'zh' | 'en'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return (saved as 'zh' | 'en') || 'zh';
  });
  const t = TRANSLATIONS[lang];

  const [prizes, setPrizes] = useState<Prize[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRIZES);
    return saved ? JSON.parse(saved) : DEFAULT_PRIZES;
  });

  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    return saved ? JSON.parse(saved) : [
      { id: 'p1', name: lang === 'zh' ? '冒險家' : 'Adventurer', entries: 1 },
      { id: 'p2', name: lang === 'zh' ? '新手小菇' : 'Junior Shroom', entries: 1 }
    ];
  });

  const [wheelConfig, setWheelConfig] = useState<WheelConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : { 
      duration: 5, rotations: 10, direction: 'cw', bounceIntensity: 3,
      title: '希恩大樂透', subtitle: 'Why u all win my money',
      showProbabilityOnWheel: true
    };
  });

  const [history, setHistory] = useState<SpinRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedParticipantId, setSelectedParticipantId] = useState<string>(participants[0]?.id || '');
  const [participantInput, setParticipantInput] = useState('');
  const [activeTab, setActiveTab] = useState<'prizes' | 'participants' | 'settings'>('prizes');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerResult, setWinnerResult] = useState<{ person: string | null; prize: Prize } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes)), [prizes]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants)), [participants]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(wheelConfig)), [wheelConfig]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.LANG, lang), [lang]);

  const activePrizes = useMemo(() => prizes.filter(p => p.enabled), [prizes]);
  const totalWeight = useMemo(() => activePrizes.reduce((s, p) => s + p.probability, 0), [activePrizes]);
  const currentParticipant = useMemo(() => participants.find(p => p.id === selectedParticipantId), [participants, selectedParticipantId]);

  const startSpin = () => {
    if(!isSpinning && currentParticipant && currentParticipant.entries > 0 && activePrizes.length > 0) {
      setWinnerResult(null);
      setShowCelebration(false);
      setIsSpinning(true);
    }
  };

  const handleSpinEnd = (resultPrize: Prize) => {
    setIsSpinning(false);
    setParticipants(prev => prev.map(p => p.id === selectedParticipantId ? { ...p, entries: Math.max(0, p.entries - 1) } : p));
    if (resultPrize.isGrandPrize) setShowCelebration(true);
    const newRecord: SpinRecord = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      person: currentParticipant?.name || 'Explorer',
      prizeLabel: resultPrize.label,
      prizeImage: resultPrize.image
    };
    setHistory(prev => [newRecord, ...prev].slice(0, 100));
    setWinnerResult({ person: currentParticipant?.name || 'Hero', prize: resultPrize });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-4 lg:p-6 gap-6 lg:gap-8 relative">
      {showCelebration && <EnhancedCelebration customImage={wheelConfig.customFallingImage} />}

      {/* Language Switcher */}
      <button 
        onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
        className="absolute top-4 right-4 z-[40] flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1.5 rounded-full border border-white/30 text-white font-black text-xs hover:bg-white/40 transition-all"
      >
        <Globe className="w-3.5 h-3.5" />
        {lang === 'zh' ? 'English' : '中文'}
      </button>

      {/* Side Panel (Settings & Prizes) - Order 2 on mobile */}
      <div className="order-2 lg:order-1 w-full lg:w-[420px] maple-window flex flex-col shrink-0 overflow-hidden shadow-2xl h-[500px] lg:h-full">
        <div className="maple-header px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sword className="w-4 h-4" />
            <span className="font-bold text-sm tracking-tighter uppercase">{lang === 'zh' ? '獎品與冒險者' : 'Prize & Party'}</span>
          </div>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-red-400 rounded-full border border-red-600"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full border border-yellow-600"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full border border-blue-600"></div>
          </div>
        </div>
        
        <div className="flex p-2 gap-1 bg-black/20">
          {[
            { id: 'prizes', label: t.inventory, icon: Star },
            { id: 'participants', label: t.friends, icon: Users },
            { id: 'settings', label: t.system, icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded transition-all border border-transparent ${
                activeTab === tab.id ? 'bg-[#FFD54F] text-[#5D4037] border-white/50' : 'text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/10">
          {activeTab === 'prizes' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {prizes.map(prize => (
                  <div key={prize.id} className={`bg-white/10 border p-4 rounded-xl flex flex-col gap-4 transition-all hover:bg-white/15 ${prize.enabled ? 'border-white/30' : 'border-white/5 opacity-40 grayscale'} ${prize.isGrandPrize ? 'ring-2 ring-yellow-400 bg-yellow-400/5' : ''}`}>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setPrizes(prizes.map(p => p.id === prize.id ? {...p, enabled: !p.enabled} : p))} className="text-yellow-300">
                        {prize.enabled ? <Shield className="w-6 h-6" /> : <PlayCircle className="w-6 h-6 opacity-30" />}
                      </button>
                      <div className="flex flex-col gap-2 shrink-0">
                        <label className="w-14 h-14 rounded-lg bg-black/40 border-2 border-white/20 flex items-center justify-center cursor-pointer overflow-hidden shadow-lg hover:border-yellow-400/50 transition-colors">
                          {prize.image ? <img src={prize.image} className="w-full h-full object-cover" /> : <span className="text-3xl">{prize.icon || '🎁'}</span>}
                          <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, (b) => setPrizes(prizes.map(p => p.id === prize.id ? {...p, image: b, icon: undefined} : p)))} />
                        </label>
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <input type="text" value={prize.label} onChange={e => setPrizes(prizes.map(p => p.id === prize.id ? {...p, label: e.target.value} : p))} className="flex-1 bg-transparent text-sm font-black text-white outline-none placeholder-white/20 truncate" placeholder={t.prizeName} />
                          <button 
                            onClick={() => setPrizes(prizes.map(p => p.id === prize.id ? {...p, isGrandPrize: !p.isGrandPrize} : p))}
                            className={`p-1 rounded transition-colors ${prize.isGrandPrize ? 'text-yellow-400 bg-yellow-400/20' : 'text-white/20 hover:text-white/40'}`}
                            title={t.grandPrize}
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button onClick={() => setPrizes(prizes.filter(p => p.id !== prize.id))} className="text-red-400/70 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="flex gap-1 overflow-x-auto py-1 custom-scrollbar scrollbar-hide">
                          {COMMON_EMOJIS.map(emoji => (
                            <button key={emoji} onClick={() => setPrizes(prizes.map(p => p.id === prize.id ? {...p, icon: emoji, image: undefined} : p))} className={`text-sm p-1 rounded hover:bg-white/20 shrink-0 ${prize.icon === emoji ? 'bg-yellow-400/30 ring-1 ring-yellow-400/50' : ''}`}>{emoji}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {prize.enabled && (
                      <div className="space-y-3 bg-black/20 p-3 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-black text-white/40 uppercase">{t.weight}</span>
                          <span className="text-xs font-black text-black bg-yellow-400 px-2 py-0.5 rounded shadow-sm">
                            {totalWeight > 0 ? ((prize.probability/totalWeight)*100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input type="color" value={prize.color} onChange={e => setPrizes(prizes.map(p => p.id === prize.id ? {...p, color: e.target.value} : p))} className="w-6 h-6 bg-transparent border-none rounded cursor-pointer shrink-0" />
                          <input type="range" min="0" max="500" step="1" value={prize.probability} 
                            onChange={e => setPrizes(prizes.map(p => p.id === prize.id ? {...p, probability: Math.max(0, parseInt(e.target.value)||0)} : p))}
                            className="flex-1 accent-yellow-400 h-2 cursor-pointer"
                          />
                          <input type="number" value={prize.probability} onChange={e => setPrizes(prizes.map(p => p.id === prize.id ? {...p, probability: Math.max(0, parseInt(e.target.value)||0)} : p))} className="w-14 bg-black/40 text-white text-[10px] font-black text-center rounded py-1 border border-white/10" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => setPrizes([...prizes, { id: Math.random().toString(36).substr(2,9), label: lang === 'zh' ? '新道具' : 'New Item', probability: 50, color: PRESET_COLORS[prizes.length % 10], enabled: true, icon: '🎁' }])} className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-white/40 hover:text-white hover:border-white/60 font-black text-xs flex items-center justify-center gap-2 transition-all bg-white/5 uppercase tracking-tighter shadow-inner"><Plus className="w-4 h-4" /> {t.addPrize}</button>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="space-y-4">
              <div className="bg-[#1e3c78]/50 p-4 rounded-xl border border-white/20 shadow-inner">
                 <p className="text-[10px] font-black text-yellow-200 uppercase mb-3 tracking-widest">{t.invite}</p>
                 <textarea value={participantInput} onChange={e => setParticipantInput(e.target.value)} placeholder="..." className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-xs text-white h-32 focus:ring-1 focus:ring-yellow-400 outline-none" />
                 <button onClick={() => {
                   const names = participantInput.split('\n').map(n => n.trim()).filter(n => n);
                   setParticipants([...participants, ...names.map(name => ({ id: Math.random().toString(36).substr(2,9), name, entries: 1 }))]);
                   setParticipantInput('');
                 }} className="w-full bg-[#FFD54F] text-[#5D4037] py-3 rounded-lg font-black text-xs mt-3 hover:bg-yellow-400 active:scale-95 transition-transform shadow-lg uppercase">{t.addFriends}</button>
              </div>
              <div className="space-y-2">
                 {participants.map(p => (
                   <div key={p.id} className="bg-white/10 border border-white/10 p-4 rounded-xl flex justify-between items-center hover:bg-white/15 transition-all">
                     <div className="flex items-center gap-3">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm font-black text-white">{p.name}</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="flex flex-col items-end">
                         <span className="text-[8px] text-white/40 font-black uppercase">{t.tickets}</span>
                         <input type="number" value={p.entries} onChange={e => setParticipants(participants.map(pt => pt.id === p.id ? {...pt, entries: parseInt(e.target.value)||0} : pt))} className="w-12 bg-black/40 text-yellow-400 text-center text-xs font-black py-1 rounded border border-white/10" />
                       </div>
                       <button onClick={() => setParticipants(participants.filter(pt => pt.id !== p.id))} className="text-red-400/40 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-yellow-200 uppercase tracking-widest">{t.titleLabel}</label>
                  <input type="text" value={wheelConfig.title} onChange={e => setWheelConfig({...wheelConfig, title: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-yellow-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-yellow-200 uppercase tracking-widest">{t.subtitleLabel}</label>
                  <input type="text" value={wheelConfig.subtitle} onChange={e => setWheelConfig({...wheelConfig, subtitle: e.target.value})} className="w-full bg-black/40 border border-white/20 rounded-xl p-4 text-xs text-white/70 focus:ring-1 focus:ring-yellow-400" />
                </div>
                <div className="space-y-3 p-3 bg-black/30 rounded-xl border border-white/5">
                   <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black text-yellow-200 uppercase tracking-widest">{t.showProb}</label>
                     <button onClick={() => setWheelConfig({...wheelConfig, showProbabilityOnWheel: !wheelConfig.showProbabilityOnWheel})}
                        className={`w-10 h-5 rounded-full relative transition-colors ${wheelConfig.showProbabilityOnWheel ? 'bg-yellow-400' : 'bg-gray-600'}`}>
                       <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${wheelConfig.showProbabilityOnWheel ? 'left-5.5' : 'left-0.5'}`} />
                     </button>
                   </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-yellow-200 uppercase tracking-widest flex items-center gap-2"><ImageIcon className="w-3 h-3"/> {t.bgUpload}</label>
                  <label className="w-full h-24 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-white/50 transition-all bg-black/20 overflow-hidden relative">
                    {wheelConfig.winnerEffect ? <img src={wheelConfig.winnerEffect} className="w-full h-full object-cover opacity-50" /> : <span className="text-[10px] font-black text-white/30 uppercase">Upload Modal Background</span>}
                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, (b) => setWheelConfig({...wheelConfig, winnerEffect: b}))} />
                  </label>
                  {wheelConfig.winnerEffect && <button onClick={() => setWheelConfig({...wheelConfig, winnerEffect: undefined})} className="w-full py-1 text-[8px] font-black text-red-400/50 uppercase hover:text-red-400">{t.removeBg}</button>}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-yellow-200 uppercase tracking-widest flex items-center gap-2"><PartyPopper className="w-3 h-3"/> {t.fallingUpload}</label>
                  <label className="w-full h-24 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-white/50 transition-all bg-black/20 overflow-hidden relative">
                    {wheelConfig.customFallingImage ? <img src={wheelConfig.customFallingImage} className="w-16 h-16 object-contain" /> : <span className="text-[10px] font-black text-white/30 uppercase text-center px-4">Upload Custom Falling Item<br/>(Default: 🍁)</span>}
                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, (b) => setWheelConfig({...wheelConfig, customFallingImage: b}))} />
                  </label>
                  {wheelConfig.customFallingImage && <button onClick={() => setWheelConfig({...wheelConfig, customFallingImage: undefined})} className="w-full py-1 text-[8px] font-black text-red-400/50 uppercase hover:text-red-400">{t.removeFalling}</button>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-yellow-200 uppercase tracking-widest">{t.duration} ({wheelConfig.duration}s)</label>
                    <input type="range" min="2" max="15" value={wheelConfig.duration} onChange={e => setWheelConfig({...wheelConfig, duration: parseInt(e.target.value)})} className="w-full accent-yellow-400 h-1.5" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-yellow-200 uppercase tracking-widest">{t.rotations} ({wheelConfig.rotations})</label>
                    <input type="range" min="3" max="30" value={wheelConfig.rotations} onChange={e => setWheelConfig({...wheelConfig, rotations: parseInt(e.target.value)})} className="w-full accent-yellow-400 h-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-yellow-200 uppercase tracking-widest">{t.bounce} ({wheelConfig.bounceIntensity})</label>
                    <input type="range" min="0" max="10" value={wheelConfig.bounceIntensity} onChange={e => setWheelConfig({...wheelConfig, bounceIntensity: parseInt(e.target.value)})} className="w-full accent-yellow-400 h-1.5" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-yellow-200 uppercase tracking-widest">{t.direction}</label>
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                      <button onClick={() => setWheelConfig({...wheelConfig, direction: 'cw'})} className={`flex-1 py-1 text-[10px] font-black rounded transition-all ${wheelConfig.direction === 'cw' ? 'bg-[#FFD54F] text-[#5D4037]' : 'text-white/40'}`}>{t.cw}</button>
                      <button onClick={() => setWheelConfig({...wheelConfig, direction: 'ccw'})} className={`flex-1 py-1 text-[10px] font-black rounded transition-all ${wheelConfig.direction === 'ccw' ? 'bg-[#FFD54F] text-[#5D4037]' : 'text-white/40'}`}>{t.ccw}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Wheel Area - Order 1 on mobile */}
      <div className="order-1 lg:order-2 flex-1 flex flex-col items-center justify-center py-4 sm:py-0 relative">
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] tracking-tighter mb-1 sm:mb-2">{wheelConfig.title}</h1>
          <p className="text-yellow-200/90 font-bold uppercase text-[10px] sm:text-xs lg:text-sm tracking-[0.3em] sm:tracking-[0.5em] drop-shadow-md">{wheelConfig.subtitle}</p>
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-white/20 px-6 sm:px-10 py-2 sm:py-3 rounded-full flex items-center gap-4 sm:gap-6 shadow-2xl mb-8 sm:mb-12">
          <span className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest border-r border-white/10 pr-4 sm:pr-6">{t.adventurer}</span>
          <select value={selectedParticipantId} onChange={(e) => setSelectedParticipantId(e.target.value)} disabled={isSpinning}
            className="bg-transparent text-lg sm:text-2xl font-black text-white focus:outline-none cursor-pointer pr-4">
            {participants.map(p => <option key={p.id} value={p.id} className="bg-[#1e3c78]">{p.name} ({p.entries})</option>)}
          </select>
        </div>

        <Wheel prizes={prizes} config={wheelConfig} isSpinning={isSpinning} onSpinEnd={handleSpinEnd} />

        <button onClick={startSpin} disabled={isSpinning || !currentParticipant || currentParticipant.entries <= 0 || activePrizes.length === 0}
          className={`mt-8 sm:mt-10 px-16 sm:px-28 py-5 sm:py-7 rounded-2xl sm:rounded-3xl text-xl sm:text-3xl font-black transition-all transform shadow-2xl active:scale-95 border-b-4 sm:border-b-8 border-black/40 ${isSpinning || !currentParticipant || currentParticipant.entries <= 0 || activePrizes.length === 0 ? 'bg-gray-600 text-gray-400 cursor-not-allowed shadow-none border-none' : 'bg-[#FFD54F] text-[#5D4037] hover:bg-yellow-400 hover:-translate-y-2'}`}>
          {isSpinning ? t.spinning : t.draw}
        </button>
      </div>

      {/* History Log - Order 3 on mobile */}
      <div className="order-3 w-full lg:w-[320px] maple-window flex flex-col shrink-0 h-[300px] lg:h-full">
        <div className="maple-header px-4 py-3 flex items-center justify-between">
           <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="font-bold text-sm tracking-tighter uppercase">{t.history}</span>
          </div>
          <button onClick={() => setHistory([])} className="text-[#5D4037]/60 hover:text-[#5D4037] active:rotate-180"><RotateCcw className="w-4 h-4" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/20">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/10 space-y-3">
              <Book className="w-12 h-12 opacity-5" />
              <p className="text-[10px] font-black uppercase tracking-widest">{t.noHistory}</p>
            </div>
          ) : (
            history.map(record => (
              <div key={record.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4 shadow-lg group hover:bg-white/10 transition-all animate-in slide-in-from-right duration-500">
                <div className="shrink-0">{record.prizeImage ? <img src={record.prizeImage} className="w-10 h-10 rounded-lg object-cover border border-white/20" /> : <div className="w-10 h-10 bg-black/40 rounded-lg flex items-center justify-center text-yellow-400 border border-white/10"><Trophy className="w-5 h-5" /></div>}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black text-white truncate">{record.person}</div>
                  <div className="text-[11px] font-bold text-yellow-200 truncate">{record.prizeLabel}</div>
                  <div className="text-[8px] text-white/30">{new Date(record.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Winner Modal */}
      {winnerResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className={`maple-window border-[3px] sm:border-[4px] border-white rounded-2xl p-6 sm:p-10 max-w-lg w-full text-center relative overflow-hidden animate-in zoom-in duration-500 shadow-2xl ${winnerResult.prize.isGrandPrize ? 'ring-8 ring-yellow-400/50' : ''}`}>
            <div className="maple-header absolute top-0 left-0 w-full py-2 font-black text-xs sm:text-sm uppercase tracking-widest">{winnerResult.prize.isGrandPrize ? t.grandTitle : t.missionComplete}</div>
            {wheelConfig.winnerEffect && <div className="absolute inset-0 pointer-events-none opacity-50 z-0"><img src={wheelConfig.winnerEffect} className="w-full h-full object-cover animate-pulse" /></div>}
            <div className="mt-8 mb-4 sm:mb-6 flex justify-center relative z-10">
              {winnerResult.prize.image ? <img src={winnerResult.prize.image} className="w-32 h-32 sm:w-48 sm:h-48 object-cover rounded-2xl border-4 border-white shadow-2xl" /> : <div className="w-24 h-24 sm:w-36 sm:h-36 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-2xl relative"><span className="text-5xl sm:text-8xl">{winnerResult.prize.icon || '🏆'}</span>{winnerResult.prize.isGrandPrize && <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[8px] sm:text-[10px] font-black px-2 py-1 rounded shadow-lg animate-bounce uppercase">Legendary!</div>}</div>}
            </div>
            <div className={`text-3xl sm:text-5xl font-black text-white mb-4 sm:mb-6 tracking-tighter drop-shadow-lg relative z-10 ${winnerResult.prize.isGrandPrize ? 'animate-pulse' : ''}`}>{winnerResult.prize.label}</div>
            <div className="bg-white/5 border border-white/10 rounded-2xl py-4 sm:py-6 mb-6 sm:mb-8 relative z-10 backdrop-blur-sm"><span className="text-[9px] sm:text-[10px] text-white/40 font-black block mb-1 sm:mb-2 uppercase tracking-widest">{t.winner}</span><span className="text-3xl sm:text-5xl font-black text-yellow-400 tracking-widest">{winnerResult.person}</span></div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 relative z-10">
              <button onClick={() => { setWinnerResult(null); setShowCelebration(false); }} className="bg-white/10 border border-white/20 py-3 sm:py-4 rounded-xl font-black text-xs sm:text-sm text-white hover:bg-white/20 transition-all uppercase">{t.close}</button>
              <button onClick={() => { setWinnerResult(null); setShowCelebration(false); setTimeout(startSpin, 300); }} className="bg-[#FFD54F] py-3 sm:py-4 rounded-xl font-black text-xs sm:text-sm text-[#5D4037] shadow-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 uppercase"><RefreshCw className="w-4 h-4" /> {t.retry}</button>
            </div>
            <p className="mt-4 sm:mt-6 text-[9px] sm:text-[10px] text-white/40 font-black italic relative z-10 uppercase">{t.remTickets}: {currentParticipant?.entries}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
