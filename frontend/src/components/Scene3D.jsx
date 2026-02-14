import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Stars, MeshReflectorMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import PoolTable3D from './PoolTable3D';
import './Scene3D.css';

const CameraRig = () => {
  const { camera } = useThree();
  const targetPos = new THREE.Vector3(8, 6, 8);
  const startPos = new THREE.Vector3(20, 15, 20);

  useEffect(() => {
    // Immediate set for initial frame
    camera.position.copy(startPos);
  }, [camera]);

  useFrame((state, delta) => {
    // Smooth Fly-in
    state.camera.position.lerp(targetPos, 0.02);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

const Scene3D = () => {
  return (
    <div className="scene-container">
      <Canvas shadows camera={{ position: [20, 15, 20], fov: 45 }}>
        <fog attach="fog" args={['#050505', 10, 50]} />
        <Suspense fallback={null}>
          <CameraRig />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={2} castShadow />
          <pointLight position={[-10, 5, -10]} intensity={2} color="#00f3ff" />
          <pointLight position={[10, 5, 10]} intensity={2} color="#bc13fe" />

          <PoolTable3D position={[0, -0.5, 0]} />

          {/* Reflective Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[50, 50]} />
            <MeshReflectorMaterial
              blur={[300, 100]}
              resolution={2048}
              mixBlur={1}
              mixStrength={50}
              roughness={1}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#050505"
              metalness={0.5}
            />
          </mesh>

          <Environment preset="city" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          <OrbitControls
            enablePan={false}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.5}
            makeDefault
          />

          {/* Post Processing */}
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} radius={0.6} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>

        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
