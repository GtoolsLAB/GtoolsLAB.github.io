// BenchmarkGPU.jsx
// Página React que ejecuta un test de GPU en tiempo real usando react-three-fiber y three.js
// Requisitos (instalar):
// npm install react react-dom three @react-three/fiber @react-three/drei

import React, { useRef, useMemo, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stats, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// -----------------------------
// Helper: FPS counter (overlay)
// -----------------------------
function FPSOverlay({ samples = 60 }) {
  const [fps, setFps] = useState(0)
  const lastTimes = useRef([])
  useEffect(() => {
    let raf = null
    let last = performance.now()
    function loop() {
      const now = performance.now()
      const dt = now - last
      last = now
      const instantFps = 1000 / dt
      lastTimes.current.push(instantFps)
      if (lastTimes.current.length > samples) lastTimes.current.shift()
      const avg = lastTimes.current.reduce((a,b) => a+b, 0) / lastTimes.current.length
      setFps(Math.round(avg))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [samples])
  return (
    <div style={{position:'fixed', top:12, left:12, zIndex:9999, fontFamily:'monospace', color:'#fff'}}>
      <div style={{background:'rgba(0,0,0,0.5)', padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{fontSize:12}}>FPS: <b style={{fontSize:16}}>{fps}</b></div>
      </div>
    </div>
  )
}

// ---------------------------------
// Heavy Instanced Field (stress test)
// Many instanced meshes to stress transform updates
// ---------------------------------
function InstancedField({ count = 4000, timeMul = 1.0, scale = 1.0 }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i*3+0] = Math.random()
      arr[i*3+1] = Math.random()
      arr[i*3+2] = Math.random()
    }
    return arr
  }, [count])

  const offsets = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const radius = 40 * scale
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2*Math.random()-1)
      const theta = 2*Math.PI*Math.random()
      const r = radius * (0.3 + Math.random()*0.9)
      arr[i*3+0] = Math.cos(theta)*Math.sin(phi)*r
      arr[i*3+1] = (Math.random()-0.5) * 20 * scale
      arr[i*3+2] = Math.sin(theta)*Math.sin(phi)*r
    }
    return arr
  }, [count, scale])

  useEffect(() => {
    if (!meshRef.current) return
    // Set color attribute
    meshRef.current.geometry.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3))
  }, [colors])

  useFrame((state) => {
    const t = state.clock.elapsedTime * timeMul
    const mesh = meshRef.current
    if (!mesh) return
    for (let i = 0; i < count; i++) {
      const ox = offsets[i*3+0]
      const oy = offsets[i*3+1]
      const oz = offsets[i*3+2]
      const sx = 0.3 + Math.abs(Math.sin(t*0.5 + i)) * 1.5
      const sy = 0.3 + Math.abs(Math.cos(t*0.3 + i*0.7)) * 1.5
      const sz = 0.3 + Math.abs(Math.sin(t*0.7 + i*0.3)) * 1.5
      dummy.position.set(ox, oy + Math.sin(t*0.8 + i)*2.5, oz)
      dummy.rotation.set(t*0.5 + i*0.01, t*0.3 + i*0.02, t*0.2 + i*0.015)
      dummy.scale.set(sx, sy, sz)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  // Custom shader material that reads aColor attribute
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
      attribute vec3 aColor;
      varying vec3 vColor;
      void main(){
        vColor = aColor;
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main(){
        vec3 c = pow(vColor, vec3(0.7));
        float rim = 1.0 - dot(normalize(vec3(0.0,1.0,0.5)), normalize(normalMatrix * normal));
        gl_FragColor = vec4(c * (0.6 + 0.4*rim), 1.0);
      }
    `
  }), [])

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} castShadow receiveShadow>
      <boxBufferGeometry args={[0.6*scale, 0.6*scale, 0.6*scale]} />
      <primitive object={material} attach="material" />
    </instancedMesh>
  )
}

// ---------------------------------
// High-resolution procedural ground using a custom shader
// Generates detailed normal/displacement on the GPU
// ---------------------------------
function ProceduralGround({ size = 400 }) {
  const geomRef = useRef()
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: size }
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vHeight;
      uniform float uTime;
      float noise(vec2 p){
        return fract(sin(dot(p ,vec2(127.1,311.7))) * 43758.5453123);
      }
      void main(){
        vUv = uv * 10.0;
        float h = 0.0;
        // layered pseudo-noise
        h += 0.5 * sin((position.x + uTime*2.0)*0.02) * cos((position.z+uTime)*0.02);
        h += 0.3 * sin((position.x+position.z)*0.01 + uTime*0.5);
        vHeight = h;
        vec3 pos = position + normal * h * 8.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying float vHeight;
      void main(){
        // High-frequency detail via uv
        float grain = fract(sin(dot(vUv ,vec2(12.9898,78.233))) * 43758.5453);
        vec3 col = mix(vec3(0.08,0.05,0.12), vec3(0.25,0.18,0.12), smoothstep(-0.5,1.0, vHeight));
        col += grain * 0.03;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    side: THREE.DoubleSide
  }), [size])

  useFrame((state) => (material.uniforms.uTime.value = state.clock.elapsedTime))

  return (
    <mesh rotation={[-Math.PI/2,0,0]} receiveShadow geometry={new THREE.PlaneGeometry(size, size, 512, 512)}>
      <primitive object={material} attach="material" />
    </mesh>
  )
}

// ---------------------------------
// Volumetric particle field (points) — heavy if many points
// ---------------------------------
function ParticleField({ count = 200000 }) {
  const pointsRef = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i*3 + 0] = (Math.random()-0.5) * 200
      arr[i*3 + 1] = (Math.random()-0.5) * 60
      arr[i*3 + 2] = (Math.random()-0.5) * 200
    }
    return arr
  }, [count])

  useEffect(() => {
    if (!pointsRef.current) return
    pointsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  }, [positions])

  useFrame((state) => {
    // slight movement to stress vertex shader
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial size={0.6} sizeAttenuation={true} transparent={true} opacity={0.6} depthWrite={false} />
    </points>
  )
}

// ---------------------------------
// Main Scene component
// ---------------------------------
function Scene({ heavyMode = true, instCount = 4000, particleCount = 200000 }) {
  const { gl } = useThree()
  useEffect(() => {
    gl.physicallyCorrectLights = true
    gl.toneMappingExposure = 1
  }, [gl])

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[30, 80, 50]} intensity={1.4} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[-40, 30, -40]} intensity={1.0} />

      <InstancedField count={instCount} timeMul={1.0} scale={1.0} />
      <ProceduralGround size={600} />
      {heavyMode && <ParticleField count={particleCount} />}
    </>
  )
}

// ---------------------------------
// App wrapper — controls and UI
// ---------------------------------
export default function BenchmarkApp(){
  const [heavy, setHeavy] = useState(true)
  const [instCount, setInstCount] = useState(4000)
  const [particleCount, setParticleCount] = useState(100000)
  const [resolutionScale, setResolutionScale] = useState(1.0)

  return (
    <div style={{height:'100vh', width:'100vw', background:'#0b0b0b'}}>
      <FPSOverlay />
      <div style={{position:'fixed', right:12, top:12, zIndex:9999, color:'#fff', fontFamily:'sans-serif'}}>
        <div style={{background:'rgba(0,0,0,0.45)', padding:10, borderRadius:8}}>
          <div style={{marginBottom:8}}><b>Benchmark GPU — Controles</b></div>
          <div style={{fontSize:13}}>Modo pesado: <button onClick={() => setHeavy(!heavy)} style={{marginLeft:8}}>{heavy ? 'ON' : 'OFF'}</button></div>
          <div style={{fontSize:13, marginTop:8}}>Instancias: <input type="range" min={0} max={12000} value={instCount} onChange={(e)=>setInstCount(parseInt(e.target.value))} /></div>
          <div style={{fontSize:13}}>Partículas: <input type="range" min={0} max={400000} value={particleCount} onChange={(e)=>setParticleCount(parseInt(e.target.value))} /></div>
          <div style={{fontSize:13, marginTop:8}}>Escala resolución: <input type="range" min={0.25} max={1.5} step={0.05} value={resolutionScale} onChange={(e)=>setResolutionScale(parseFloat(e.target.value))} /></div>
        </div>
      </div>

      <Canvas shadows dpr={Math.min(2, window.devicePixelRatio * resolutionScale)} camera={{ position: [0, 30, 80], fov: 60 }}>
        <React.Suspense fallback={null}>
          <Scene heavyMode={heavy} instCount={instCount} particleCount={particleCount} />
          <OrbitControls enablePan={true} enableZoom={true} />
          <Stats />
        </React.Suspense>
      </Canvas>

      <div style={{position:'fixed', left:12, bottom:12, zIndex:9999, color:'#fff', fontFamily:'sans-serif'}}>
        <div style={{background:'rgba(0,0,0,0.45)', padding:8, borderRadius:6}}>
          <div style={{fontSize:12}}>Instrucciones: Mueve la cámara y sube instancias/partículas para probar la GPU. Activa el modo pesado para máximas cargas.</div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------
// Si quieres usar este archivo como "index.jsx" en un proyecto Vite/CRA:
// createRoot(document.getElementById('root')).render(<BenchmarkApp />)
// ---------------------------------

// Nota: este proyecto está diseñado para ser intensivo. Ajusta instCount y particleCount para adaptarlo a tu hardware.
// Para un benchmark "verdadero" y reproducible puedes medir FPS durante N segundos en diferentes configuraciones y exportar los resultados.
