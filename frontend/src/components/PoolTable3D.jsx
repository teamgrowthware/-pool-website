import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCursor } from '@react-three/drei';

const PoolTable3D = (props) => {
  const mesh = useRef();
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  useCursor(hovered);

  useFrame((state, delta) => {
    // Subtle breathing animation for the table felt
    if (mesh.current) {
      mesh.current.material.emissiveIntensity = hovered ? 0.4 : 0.1;
    }
  });

  return (
    <group {...props}>
      {/* Table Top (Felt) */}
      <mesh
        ref={mesh}
        position={[0, 0.5, 0]}
        onClick={() => setActive(!active)}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}>
        <boxGeometry args={[4, 0.2, 8]} />
        <meshStandardMaterial
          color={active ? '#00cc88' : '#0a5c36'}
          roughness={0.8}
          emissive="#004422"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Pockets (Simple Spheres) */}
      {[[-1.8, 3.8], [1.8, 3.8], [-1.8, -3.8], [1.8, -3.8], [-1.8, 0], [1.8, 0]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.6, pos[1]]}>
          <cylinderGeometry args={[0.25, 0.25, 0.1, 32]} />
          <meshStandardMaterial color="black" />
        </mesh>
      ))}

      {/* Table Frame (Wood) */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[4.4, 0.2, 8.4]} />
        <meshStandardMaterial color="#3d1c02" roughness={0.5} />
      </mesh>

      {/* Rails (Bumpers) */}
      <mesh position={[-2.1, 0.6, 0]}>
        <boxGeometry args={[0.2, 0.2, 8]} />
        <meshStandardMaterial color="#0a5c36" />
      </mesh>
      <mesh position={[2.1, 0.6, 0]}>
        <boxGeometry args={[0.2, 0.2, 8]} />
        <meshStandardMaterial color="#0a5c36" />
      </mesh>
      <mesh position={[0, 0.6, -4.1]}>
        <boxGeometry args={[4, 0.2, 0.2]} />
        <meshStandardMaterial color="#0a5c36" />
      </mesh>
      <mesh position={[0, 0.6, 4.1]}>
        <boxGeometry args={[4, 0.2, 0.2]} />
        <meshStandardMaterial color="#0a5c36" />
      </mesh>

      {/* Legs */}
      <mesh position={[-1.8, -1.5, -3.8]}>
        <cylinderGeometry args={[0.15, 0.15, 3.5, 32]} />
        <meshStandardMaterial color="#3d1c02" />
      </mesh>
      <mesh position={[1.8, -1.5, -3.8]}>
        <cylinderGeometry args={[0.15, 0.15, 3.5, 32]} />
        <meshStandardMaterial color="#3d1c02" />
      </mesh>
      <mesh position={[-1.8, -1.5, 3.8]}>
        <cylinderGeometry args={[0.15, 0.15, 3.5, 32]} />
        <meshStandardMaterial color="#3d1c02" />
      </mesh>
      <mesh position={[1.8, -1.5, 3.8]}>
        <cylinderGeometry args={[0.15, 0.15, 3.5, 32]} />
        <meshStandardMaterial color="#3d1c02" />
      </mesh>

      {/* Balls (Simplified) */}
      <mesh position={[0, 0.7, 2]}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color="white" metalness={0.8} roughness={0.1} />
      </mesh>
      <mesh position={[-0.2, 0.7, -2]}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color="#ff0000" metalness={0.5} roughness={0.1} />
      </mesh>
      <mesh position={[0.2, 0.7, -2]}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color="#ffee00" metalness={0.5} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.7, -2.3]}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color="#111111" metalness={0.5} roughness={0.1} />
      </mesh>

    </group>
  );
};

export default PoolTable3D;
