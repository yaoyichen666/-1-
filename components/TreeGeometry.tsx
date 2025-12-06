import React, { useRef, useMemo } from 'react';
import { Color, Vector3, Group, InstancedMesh, Euler, Shape, MathUtils, Object3D } from 'three';
import { useFrame } from '@react-three/fiber';
import { Float, Instance, Instances } from '@react-three/drei';

const GOLD_COLOR = new Color('#F4E4BC').multiplyScalar(1.2);
const EMERALD_COLOR = new Color('#043927');
const DARK_GOLD = new Color('#8A6E36');
const WHITE_GOLD = new Color('#FFF5E1');

interface TreeGeometryProps {
  isExploded: boolean;
  onToggle: () => void;
}

const randomVector = () => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = Math.pow(Math.random(), 1/3); 
  return new Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
};

export const TreeGeometry: React.FC<TreeGeometryProps> = ({ isExploded, onToggle }) => {
  const groupRef = useRef<Group>(null);
  const cubeRef = useRef<InstancedMesh>(null);
  const sphereRef = useRef<InstancedMesh>(null);
  const starRef = useRef<Group>(null);

  // Configuration
  const PARTICLE_COUNT = 2000; // Dense luxury pile
  const TREE_HEIGHT = 11;
  const BASE_RADIUS = 4.0;

  // Generate Data
  const { cubes, spheres } = useMemo(() => {
    const cubeData: any[] = [];
    const sphereData: any[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // 1. Tree Shape Logic (Cone)
      const y = (Math.random() * TREE_HEIGHT) - (TREE_HEIGHT / 2); 
      const normalizedY = 1 - ((y + (TREE_HEIGHT / 2)) / TREE_HEIGHT);
      const radiusAtY = Math.pow(normalizedY, 0.9) * BASE_RADIUS;
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radiusAtY;

      const treePos = new Vector3(
        Math.cos(angle) * r,
        y,
        Math.sin(angle) * r
      );

      // 2. Universe Shape Logic (Explosion)
      const universeDir = randomVector();
      // Wider spread for immersive "Universe" feel (15 to 45 units)
      const universePos = universeDir.multiplyScalar(Math.random() * 30 + 15); 

      // 3. Properties
      const scale = Math.random() * 0.25 + 0.08; 
      
      const rand = Math.random();
      let color;
      if (rand > 0.7) color = GOLD_COLOR;
      else if (rand > 0.4) color = EMERALD_COLOR;
      else if (rand > 0.15) color = DARK_GOLD;
      else color = WHITE_GOLD;

      const particle = { 
        treePos, 
        universePos, 
        scale, 
        color, 
        rotationSpeed: (Math.random() - 0.5) * 2,
        randomRotation: new Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      };

      if (Math.random() > 0.4) cubeData.push(particle);
      else sphereData.push(particle);
    }
    return { cubes: cubeData, spheres: sphereData };
  }, []);

  // Star Shape Geometry (5-Pointed)
  const starShape = useMemo(() => {
    const shape = new Shape();
    const sides = 5;
    const innerRadius = 0.5;
    const outerRadius = 1.2;

    shape.moveTo(0, outerRadius);
    for (let i = 1; i < sides * 2; i++) {
        const angle = (i / (sides * 2)) * Math.PI * 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.sin(angle) * radius;
        const y = Math.cos(angle) * radius;
        shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 2
  }), []);

  // Animation Loop
  useFrame((state, delta) => {
    if (!cubeRef.current || !sphereRef.current) return;
    
    const lerpSpeed = delta * 1.5;
    const currentExpansion = MathUtils.lerp(
        groupRef.current?.userData.expansion || 0,
        isExploded ? 1 : 0,
        lerpSpeed
    );
    if (groupRef.current) groupRef.current.userData.expansion = currentExpansion;

    const updateMesh = (ref: React.RefObject<InstancedMesh>, data: any[]) => {
      const dummy = new Object3D();
      
      data.forEach((particle, i) => {
        dummy.position.lerpVectors(particle.treePos, particle.universePos, currentExpansion);
        dummy.rotation.copy(particle.randomRotation);
        
        // Dynamic floating rotation when exploded
        if (currentExpansion > 0.1) {
             dummy.rotation.x += state.clock.getElapsedTime() * 0.1 * particle.rotationSpeed;
             dummy.rotation.y += state.clock.getElapsedTime() * 0.1 * particle.rotationSpeed;
        }

        // Shrink slightly when exploding
        const scaleFactor = 1 - (currentExpansion * 0.3); 
        dummy.scale.setScalar(particle.scale * scaleFactor);
        
        dummy.updateMatrix();
        ref.current!.setMatrixAt(i, dummy.matrix);
      });
      ref.current!.instanceMatrix.needsUpdate = true;
    };

    updateMesh(cubeRef, cubes);
    updateMesh(sphereRef, spheres);

    // Animate Star
    if (starRef.current) {
        starRef.current.rotation.y += delta * 0.5;
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        starRef.current.scale.setScalar(pulse);
    }
  });

  const handlePointerOver = () => { document.body.style.cursor = 'pointer'; };
  const handlePointerOut = () => { document.body.style.cursor = 'auto'; };
  const handleClick = (e: any) => { e.stopPropagation(); onToggle(); };

  return (
    <group ref={groupRef}>
      
      {/* Cubes Batch */}
      <Instances 
        range={cubes.length} 
        ref={cubeRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            roughness={0.15} 
            metalness={0.9} 
            envMapIntensity={2} 
        />
        {cubes.map((data, i) => (
            <Instance key={i} color={data.color} />
        ))}
      </Instances>

      {/* Spheres Batch */}
      <Instances 
        range={spheres.length} 
        ref={sphereRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial 
             roughness={0.1} 
             metalness={1} 
             envMapIntensity={3} 
        />
        {spheres.map((data, i) => (
            <Instance key={i} color={data.color} />
        ))}
      </Instances>

      {/* The 5-Pointed Star - Trigger */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        <group 
            ref={starRef} 
            position={[0, (TREE_HEIGHT/2) + 0.8, 0]} 
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            <mesh>
                <extrudeGeometry args={[starShape, extrudeSettings]} />
                <meshStandardMaterial
                    color={GOLD_COLOR}
                    roughness={0.1}
                    metalness={1}
                    emissive={GOLD_COLOR}
                    emissiveIntensity={2}
                />
            </mesh>
            <pointLight color="#fff" intensity={isExploded ? 8 : 4} distance={10} decay={2} />
        </group>
      </Float>

    </group>
  );
};