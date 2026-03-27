import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  User, 
  Calendar, 
  ShieldAlert, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Sparkles,
  ArrowRight,
  Clock,
  Headphones,
  Star
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { AGENT_CONFIGS, AgentType } from './constants';
import { AudioRecorder, AudioStreamer } from './audioUtils';

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function App() {
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [status, setStatus] = useState<string>("Ready to connect");
  
  const sessionRef = useRef<any>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);

  const startSession = async (type: AgentType) => {
    setActiveAgent(type);
    setStatus("Connecting...");
    
    try {
      audioStreamerRef.current = new AudioStreamer(24000);
      await audioStreamerRef.current.start();

      const config = AGENT_CONFIGS[type];
      
      const session = await genAI.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: config.systemInstruction,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName } }
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setStatus("Connected");
            startRecording();
          },
          onmessage: async (message) => {
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              audioStreamerRef.current?.addPCMChunk(message.serverContent.modelTurn.parts[0].inlineData.data);
            }
            
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              // Handle text if any
            }

            const transcriptionPart = message.serverContent?.modelTurn?.parts?.find(p => p.text);
            if (transcriptionPart) {
              setTranscription(prev => prev + " " + transcriptionPart.text);
            }
          },
          onclose: () => {
            handleDisconnect();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setStatus("Error occurred");
            handleDisconnect();
          }
        }
      });

      sessionRef.current = session;
    } catch (error) {
      console.error("Failed to connect:", error);
      setStatus("Connection failed");
    }
  };

  const startRecording = async () => {
    audioRecorderRef.current = new AudioRecorder((base64Data) => {
      if (sessionRef.current && !isMuted) {
        sessionRef.current.sendRealtimeInput({
          audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      }
    });
    await audioRecorderRef.current.start();
  };

  const handleDisconnect = () => {
    sessionRef.current?.close();
    sessionRef.current = null;
    audioRecorderRef.current?.stop();
    audioRecorderRef.current = null;
    audioStreamerRef.current?.stop();
    audioStreamerRef.current = null;
    setIsConnected(false);
    setActiveAgent(null);
    setTranscription("");
    setStatus("Ready to connect");
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">AstroVoice AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
          <a href="#demo" className="hover:text-white transition-colors">Live Demo</a>
          <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
          <button className="px-5 py-2 bg-white text-black rounded-full hover:bg-orange-500 hover:text-white transition-all duration-300 font-semibold">
            Get Started
          </button>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="px-8 pt-24 pb-16 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20">
              The Future of Astrology Consultations
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              VOICE AI FOR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-500 to-orange-400 animate-gradient-x">
                ASTROLOGY AGENCIES
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              Scale your practice with intelligent voice agents that handle everything from routine scheduling to urgent spiritual guidance. Never miss a celestial alignment.
            </p>
          </motion.div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="px-8 py-24 bg-white/5 border-y border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div className="max-w-xl">
                <h2 className="text-4xl font-bold mb-4 tracking-tight">Experience "India Astrology"</h2>
                <p className="text-white/50">Test our specialized agents built for India's leading astrology firm. See how they handle different caller needs with precision and empathy.</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/40 italic">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live Demo Environment
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Front Desk Agent Card */}
              <AgentCard 
                type="front-desk"
                config={AGENT_CONFIGS['front-desk']}
                isActive={activeAgent === 'front-desk'}
                isConnected={isConnected}
                onStart={() => startSession('front-desk')}
                onStop={handleDisconnect}
                icon={<User className="w-6 h-6" />}
                accentColor="from-blue-500 to-cyan-400"
              />

              {/* Senior Astrologer Agent Card */}
              <AgentCard 
                type="senior-astrologer"
                config={AGENT_CONFIGS['senior-astrologer']}
                isActive={activeAgent === 'senior-astrologer'}
                isConnected={isConnected}
                onStart={() => startSession('senior-astrologer')}
                onStop={handleDisconnect}
                icon={<ShieldAlert className="w-6 h-6" />}
                accentColor="from-orange-600 to-red-500"
              />
            </div>

            {/* Active Session Overlay */}
            <AnimatePresence>
              {activeAgent && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-12 p-8 rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/20 backdrop-blur-xl"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/40">
                          <Mic className={`w-10 h-10 ${isMuted ? 'text-white/20' : 'text-orange-500 animate-pulse'}`} />
                        </div>
                        {!isMuted && (
                          <div className="absolute inset-0 rounded-full border-2 border-orange-500 animate-ping opacity-20" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{AGENT_CONFIGS[activeAgent].name}</h3>
                        <p className="text-white/50 font-mono text-sm uppercase tracking-widest">{status}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button 
                        onClick={toggleMute}
                        className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                      </button>
                      <button 
                        onClick={handleDisconnect}
                        className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-all flex items-center gap-2"
                      >
                        <Phone className="w-5 h-5 rotate-[135deg]" />
                        End Call
                      </button>
                    </div>
                  </div>

                  {transcription && (
                    <div className="mt-8 p-6 rounded-2xl bg-black/40 border border-white/5">
                      <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Live Transcription</p>
                      <p className="text-lg text-white/80 italic leading-relaxed">"{transcription}"</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="px-8 py-24 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 tracking-tight">Why Voice AI?</h2>
            <p className="text-white/50 max-w-2xl mx-auto">Astrology is a 24/7 business. Your clients need guidance when the stars align, not just during business hours.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <BenefitCard 
              icon={<Clock className="w-8 h-8 text-orange-500" />}
              title="24/7 Availability"
              description="Handle midnight spiritual crises or early morning booking requests without hiring a night shift."
            />
            <BenefitCard 
              icon={<Headphones className="w-8 h-8 text-purple-500" />}
              title="Zero Missed Calls"
              description="Every call is answered instantly. No more busy signals or voicemail graveyards for potential clients."
            />
            <BenefitCard 
              icon={<Star className="w-8 h-8 text-blue-500" />}
              title="Expert Triage"
              description="Intelligently route urgent spiritual matters to senior agents while handling routine tasks automatically."
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="px-8 py-12 border-t border-white/10 text-center text-white/30 text-sm">
          <p>© 2026 AstroVoice AI Agency. Powering India Astrology and beyond.</p>
        </footer>
      </main>
    </div>
  );
}

function AgentCard({ type, config, isActive, isConnected, onStart, onStop, icon, accentColor }: any) {
  return (
    <div className={`group relative p-8 rounded-[2rem] border transition-all duration-500 ${isActive ? 'bg-white/10 border-white/30 ring-2 ring-white/20' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-10 blur-[60px] transition-opacity`} />
      
      <div className="flex items-start justify-between mb-8">
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${accentColor} shadow-lg`}>
          {icon}
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Agent Type</span>
          <p className="text-sm font-bold text-white/60">{type === 'front-desk' ? 'Administrative' : 'Specialist'}</p>
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-3 tracking-tight">{config.name}</h3>
      <p className="text-white/50 text-sm leading-relaxed mb-8">{config.description}</p>

      <button 
        disabled={isConnected && !isActive}
        onClick={isActive ? onStop : onStart}
        className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 ${
          isActive 
            ? 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30' 
            : isConnected 
              ? 'bg-white/5 text-white/20 cursor-not-allowed'
              : 'bg-white text-black hover:bg-orange-500 hover:text-white'
        }`}
      >
        {isActive ? (
          <>
            <VolumeX className="w-5 h-5" />
            Stop Testing
          </>
        ) : (
          <>
            <Volume2 className="w-5 h-5" />
            Test Agent
          </>
        )}
      </button>
    </div>
  );
}

function BenefitCard({ icon, title, description }: any) {
  return (
    <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all group">
      <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h4 className="text-xl font-bold mb-4 tracking-tight">{title}</h4>
      <p className="text-white/40 leading-relaxed">{description}</p>
    </div>
  );
}
