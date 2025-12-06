import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { ReinhardToneMapping } from 'three';
import { TreeGeometry } from './TreeGeometry';
import { TreeConfig } from '../types';

interface ExperienceProps {
  config: TreeConfig;
}

const SceneContent: React.FC<ExperienceProps & { isExploded: boolean, setIsExploded: (v: boolean) => void }> = ({ config, isExploded, setIsExploded }) => {
    return (
        <>
            {/* Dramatic Lighting */}
            <ambientLight intensity={0.2} />
            <spotLight
                position={[10, 20, 10]}
                angle={0.15}
                penumbra={1}
                intensity={500}
                color={config.lightColor}
                castShadow
            />
            <pointLight position={[-10, 5, -10]} intensity={200} color="#043927" />
            
            {/* Core light for Universe effect */}
            {isExploded && <pointLight position={[0, 0, 0]} intensity={15} color={config.lightColor} distance={30} />}

            <Environment preset="city" background={false} />

            <group position={[0, -2, 0]}>
                <TreeGeometry isExploded={isExploded} onToggle={() => setIsExploded(!isExploded)} />
            </group>

            <ContactShadows 
                opacity={isExploded ? 0 : 0.6} 
                scale={30} 
                blur={2.5} 
                far={10} 
                resolution={512} 
                color="#000000" 
                smooth={true}
            />

            <EffectComposer disableNormalPass>
                <Bloom 
                    luminanceThreshold={0.9} 
                    mipmapBlur 
                    intensity={config.bloomIntensity + (isExploded ? 1.5 : 0)} 
                    radius={0.6}
                />
                <Noise opacity={0.03} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
        </>
    );
};

export const Experience: React.FC<ExperienceProps> = ({ config }) => {
  const [isExploded, setIsExploded] = useState(false);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      // Z=18 ensures full tree visibility
      camera={{ position: [0, 1, 18], fov: 45 }}
      gl={{ 
        toneMapping: ReinhardToneMapping, 
        toneMappingExposure: 1.5,
        antialias: false 
      }}
    >
        <color attach="background" args={['#010502']} />
        {/* Dynamic fog pushes back when exploded to see more "stars" */}
        <fog attach="fog" args={['#010502', 10, isExploded ? 100 : 50]} />
        
        {/* 
            Controls Logic: 
            - Tree Mode: AutoRotate enabled, nice showcase.
            - Universe Mode: AutoRotate OFF. User can Drag to Rotate 360, Scroll to Zoom.
        */}
        <OrbitControls 
            makeDefault
            enablePan={false}
            enableZoom={true}
            minDistance={isExploded ? 1 : 5} // Allow getting closer to stars
            maxDistance={isExploded ? 100 : 40}
            autoRotate={!isExploded}
            autoRotateSpeed={config.rotationSpeed * 5}
            target={[0, 2, 0]}
        />

        <SceneContent config={config} isExploded={isExploded} setIsExploded={setIsExploded} />
    </Canvas>
  );
};