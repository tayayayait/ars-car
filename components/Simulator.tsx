import React, { useState } from 'react';
import { simulateIncomingCall } from '../services/api';
import { Phone, PhoneCall, Smartphone, RotateCcw, Battery, Wifi, Signal } from 'lucide-react';

export const Simulator: React.FC = () => {
  const [callerNumber, setCallerNumber] = useState('010-9999-8888');
  const [inputDigits, setInputDigits] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [simState, setSimState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [smsPreview, setSmsPreview] = useState<string | null>(null);

  const addLog = (msg: string) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDigits) return;

    setSimState('calling');
    setSmsPreview(null);
    addLog(`발신자(${callerNumber})가 ARS에 연결을 시도합니다...`);
    addLog(`입력된 DTMF: ${inputDigits}`);

    try {
      const result = await simulateIncomingCall(callerNumber, inputDigits);
      
      addLog(`ARS 응답: ${result.response.action.toUpperCase()}`);
      if (result.response.audioMessage) {
        addLog(`음성 안내 송출: "${result.response.audioMessage}"`);
      }

      if (result.response.action === 'connect') {
        setSimState('connected');
        addLog(`안심번호 브릿지 연결 성공: 대상 ${result.response.targetNumber}`);
        
        // Auto hangup after 3s to show viral loop
        setTimeout(() => {
          setSimState('ended');
          addLog('통화 종료.');
          // Feature F3
          if (result.log.smsSent) {
            setSmsPreview(`[SafeCall] 차주와 연결되셨나요? 귀하의 개인정보도 중요합니다. SafeCall 안심 스티커 무료 신청: https://safecall.app/start`);
            addLog('바이럴 마케팅 SMS 발송 트리거됨.');
          }
        }, 3000);
      } else {
        setSimState('ended');
      }

    } catch (err) {
      addLog('시뮬레이션 오류 발생.');
      setSimState('ended');
    }
  };

  const reset = () => {
    setSimState('idle');
    setInputDigits('');
    setLog([]);
    setSmsPreview(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-2 gap-12">
      {/* Left: Input Console */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-mono flex items-center gap-2 text-sm md:text-base">
            <TerminalIcon className="w-5 h-5 text-brand-400" />
            ARS_Simulator_v1.0 (개발자 모드)
          </h2>
          <button 
            onClick={reset} 
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
            title="초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-8 flex-grow flex flex-col justify-center">
          <form onSubmit={handleSimulate} className="space-y-8">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">가상 발신자 번호 (Caller ID)</label>
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                   <Smartphone className="w-5 h-5 text-slate-600" />
                </div>
                <input 
                  type="text" 
                  value={callerNumber}
                  onChange={e => setCallerNumber(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-slate-800 font-mono text-lg w-full font-bold p-0"
                />
              </div>
            </div>

            <div className="text-center py-2">
              <div className="inline-block relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-slate-800 text-brand-400 font-mono text-5xl py-6 px-10 rounded-xl tracking-[0.3em] shadow-2xl min-w-[200px]">
                  {inputDigits || <span className="text-slate-700">----</span>}
                </div>
                <p className="text-xs text-slate-500 mt-4 font-medium">차량 번호 4자리 입력 시뮬레이션</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
               {[1,2,3,4,5,6,7,8,9].map(n => (
                 <button 
                   key={n} 
                   type="button" 
                   onClick={() => setInputDigits(prev => (prev.length < 4 ? prev + n : prev))}
                   className="h-16 rounded-xl bg-slate-100 hover:bg-white hover:shadow-md border border-slate-200 font-bold text-2xl text-slate-700 active:scale-95 transition-all"
                   disabled={simState !== 'idle'}
                 >
                   {n}
                 </button>
               ))}
               <button 
                  type="button"
                  onClick={() => setInputDigits('')} 
                  className="h-16 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 font-bold text-sm text-red-600 active:scale-95 transition-all"
                  disabled={simState !== 'idle'}
                >정정</button>
               <button 
                  type="button"
                  onClick={() => setInputDigits(prev => (prev.length < 4 ? prev + 0 : prev))}
                  className="h-16 rounded-xl bg-slate-100 hover:bg-white hover:shadow-md border border-slate-200 font-bold text-2xl text-slate-700 active:scale-95 transition-all"
                  disabled={simState !== 'idle'}
                >0</button>
               <button 
                  type="submit" 
                  className={`h-16 rounded-xl font-bold text-white flex items-center justify-center transition-all shadow-lg active:scale-95 ${simState === 'idle' ? 'bg-green-600 hover:bg-green-500 shadow-green-200' : 'bg-slate-400 cursor-not-allowed shadow-none'}`}
                  disabled={simState !== 'idle' || inputDigits.length !== 4}
               >
                 <PhoneCall className="w-7 h-7" />
               </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right: Output/Result */}
      <div className="space-y-8">
        {/* Device Screen Simulation */}
        <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl flex flex-col">
           <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
           <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
           <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
           <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
           
           <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white flex flex-col relative">
              
              {/* Status Bar */}
              <div className="h-8 bg-slate-900 w-full flex justify-between px-6 items-center z-10">
                 <div className="text-[11px] font-medium text-white">12:30</div>
                 <div className="flex gap-1.5 text-white items-center">
                    <Signal className="w-3 h-3" />
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-4 h-4" />
                 </div>
              </div>

              {/* Dynamic Screen Content */}
              {simState === 'idle' && (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-6 text-center animate-fade-in">
                  <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                    <Phone className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium">ARS 전화를 걸어주세요</p>
                </div>
              )}

              {simState === 'calling' && (
                <div className="flex-1 bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center pt-24 text-white animate-fade-in relative">
                   <div className="absolute inset-0 bg-black/20" />
                   <div className="z-10 flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center mb-6 animate-pulse shadow-lg ring-1 ring-white/10">
                        <Phone className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold mb-1">SafeCall ARS</h3>
                      <p className="text-slate-400">연결 중...</p>
                   </div>
                   <div className="mt-auto w-full pb-12 flex justify-around px-8 z-10">
                      <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                        <PhoneCall className="w-8 h-8 text-white rotate-[135deg]" />
                      </div>
                   </div>
                </div>
              )}

              {simState === 'connected' && (
                <div className="flex-1 bg-gradient-to-b from-emerald-600 to-teal-700 flex flex-col items-center pt-24 text-white animate-fade-in">
                   <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8 animate-[bounce_2s_infinite]">
                     <Phone className="w-12 h-12" />
                   </div>
                   <h3 className="text-2xl font-bold mb-1">통화 중</h3>
                   <p className="font-mono text-emerald-100 mb-6">00:02</p>
                   
                   <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      안심번호 보호 적용됨
                   </div>
                </div>
              )}

              {simState === 'ended' && (
                 <div className="flex-1 flex flex-col bg-slate-100 animate-fade-in">
                    <div className="flex-1 flex flex-col items-center justify-center pb-20">
                      <div className="text-slate-900 font-bold text-lg mb-6">통화 종료</div>
                      
                      {smsPreview && (
                        <div className="mx-4 animate-slide-up">
                          <div className="bg-white p-4 rounded-2xl rounded-tl-none text-sm text-slate-800 shadow-md border border-slate-200 relative">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                              <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center text-[10px] text-white font-bold">M</div>
                              <span className="text-xs font-bold text-slate-500">문자 메시지 • 방금 전</span>
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap">{smsPreview}</p>
                          </div>
                        </div>
                      )}
                    </div>
                 </div>
              )}
           </div>
        </div>

        {/* System Logs */}
        <div className="bg-slate-900 rounded-xl p-5 font-mono text-xs text-brand-400 h-48 overflow-y-auto border border-slate-800 shadow-2xl relative">
           <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 pb-2 mb-2 text-slate-400 font-bold flex justify-between items-center">
             <span>시스템 로그 스트림</span>
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           </div>
           <div className="space-y-1.5">
            {log.map((line, i) => (
              <div key={i} className="break-all border-l-2 border-slate-700 pl-2 hover:bg-slate-800/50 transition-colors">
                {line}
              </div>
            ))}
            {log.length === 0 && <span className="text-slate-600 italic">이벤트 대기 중...</span>}
           </div>
        </div>
      </div>
    </div>
  );
};

// Helper for icon
const TerminalIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
);
