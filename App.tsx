import React, { useState, Suspense } from 'react';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { TreeConfig } from './types';
import { DEFAULT_CONFIG } from './constants';
import { Loader } from '@react-three/drei';

function App() {
  const [config, setConfig] = useState<TreeConfig>(DEFAULT_CONFIG);

  return (
    <div className="relative w-full h-screen bg-black">
      <Suspense fallback={null}>
        <Experience config={config} />
      </Suspense>
      <Overlay config={config} setConfig={setConfig} />
      
      {/* Custom Loader styling to match theme */}
      <Loader 
        containerStyles={{ background: '#000502' }}
        innerStyles={{ width: '200px', height: '2px', background: '#043927' }}
        barStyles={{ height: '2px', background: '#C5A059' }}
        dataStyles={{ fontFamily: '"Cinzel", serif', color: '#C5A059', fontSize: '12px', letterSpacing: '0.2em' }}
      />
    </div>
  );
}

export default App;