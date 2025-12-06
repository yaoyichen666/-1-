import React, { useState } from 'react';
import { TreeConfig, LuxuryLevel } from '../types';
import { generateLuxuryWish } from '../services/geminiService';
import { Wand2, Loader2, Sparkles, Volume2, Share2 } from 'lucide-react';

interface OverlayProps {
  config: TreeConfig;
  setConfig: React.Dispatch<React.SetStateAction<TreeConfig>>;
}

export const Overlay: React.FC<OverlayProps> = ({ config, setConfig }) => {
  const [recipient, setRecipient] = useState('');
  const [wish, setWish] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const handleGenerateWish = async () => {
    if (!recipient) return;
    setLoading(true);
    const result = await generateLuxuryWish(recipient, 'elegant');
    setWish(result);
    setLoading(false);
  };

  const updateConfig = (key: keyof TreeConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-10 text-arix-goldLight">
      
      {/* Header */}
      <header className="flex justify-between items-start pointer-events-auto">
        <div className="space-y-1">
          <h1 className="font-display text-4xl md:text-5xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-arix-goldLight via-arix-gold to-arix-goldDark drop-shadow-lg">
            ARIX
          </h1>
          <p className="font-serif text-xs md:text-sm tracking-[0.3em] uppercase opacity-70 border-l-2 border-arix-gold pl-3">
            Signature Holiday Collection
          </p>
        </div>
        
        <button 
          onClick={() => setShowControls(!showControls)}
          className="bg-arix-dark/80 backdrop-blur-md border border-arix-gold/30 p-3 rounded-full hover:bg-arix-gold/10 transition-all duration-500 group"
        >
           <Sparkles className="w-5 h-5 text-arix-gold group-hover:rotate-180 transition-transform duration-700" />
        </button>
      </header>

      {/* Controls Drawer */}
      <div className={`absolute top-24 right-6 md:right-12 w-64 bg-arix-dark/90 backdrop-blur-xl border border-arix-gold/20 p-6 rounded-none shadow-2xl transition-all duration-500 transform origin-top-right pointer-events-auto ${showControls ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        <h3 className="font-display text-lg mb-4 text-arix-gold border-b border-arix-gold/20 pb-2">Ambience</h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest opacity-60">Glow Intensity</label>
            <input 
              type="range" min="0" max="3" step="0.1"
              value={config.bloomIntensity}
              onChange={(e) => updateConfig('bloomIntensity', parseFloat(e.target.value))}
              className="w-full h-1 bg-arix-green appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-arix-gold [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>
           <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest opacity-60">Rotation</label>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={config.rotationSpeed}
              onChange={(e) => updateConfig('rotationSpeed', parseFloat(e.target.value))}
              className="w-full h-1 bg-arix-green appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-arix-gold [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>
        </div>
      </div>

      {/* AI Wish Generator - Bottom Center */}
      <div className="self-center w-full max-w-lg pointer-events-auto">
        {wish ? (
           <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 bg-arix-dark/80 backdrop-blur-md border-y border-arix-gold/30 p-8 text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black px-2">
                 <Sparkles className="w-4 h-4 text-arix-gold animate-pulse" />
              </div>
              <p className="font-serif text-lg md:text-xl italic leading-relaxed text-arix-goldLight">
                "{wish}"
              </p>
              <button 
                onClick={() => setWish(null)} 
                className="mt-6 text-xs uppercase tracking-widest hover:text-arix-gold transition-colors"
              >
                Create Another
              </button>
           </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
             <div className="flex w-full bg-arix-dark/80 backdrop-blur-md border border-arix-gold/20 rounded-sm overflow-hidden group focus-within:border-arix-gold/60 transition-colors">
                <input 
                  type="text" 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter name for a bespoke wish..."
                  className="flex-1 bg-transparent border-none outline-none px-6 py-4 font-serif text-arix-goldLight placeholder-arix-goldLight/30"
                />
                <button 
                  onClick={handleGenerateWish}
                  disabled={loading || !recipient}
                  className="px-6 hover:bg-arix-gold/10 border-l border-arix-gold/10 text-arix-gold disabled:opacity-50 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
                </button>
             </div>
             <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-light">Powered by Arix AI Intelligence</p>
          </div>
        )}
      </div>

    </div>
  );
};