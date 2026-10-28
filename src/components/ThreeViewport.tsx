'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MaterialSettings, MeshShape, PBRMaps } from '../types';

interface ThreeViewportProps {
  maps: PBRMaps | null;
  settings: MaterialSettings;
  onSettingsChange: (settings: Partial<MaterialSettings>) => void;
}

export default function ThreeViewport({
  maps,
  settings,
  onSettingsChange,
}: ThreeViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const texturesRef = useRef<{ [key: string]: THREE.Texture }>({});

  // Orbit state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: 0, phi: Math.PI / 3, radius: 3.5 });

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c101d);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(5, 8, 5);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-5, -3, -5);
    scene.add(rimLight);

    // Initial Material
    const material = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.5,
      metalness: 0.1,
    });
    materialRef.current = material;

    // Initial Geometry (Sphere)
    const geometry = new THREE.SphereGeometry(1.2, 64, 64);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    meshRef.current = mesh;

    // Subtle Grid Floor
    const gridHelper = new THREE.GridHelper(10, 20, 0x334155, 0x1e293b);
    gridHelper.position.y = -1.4;
    scene.add(gridHelper);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (settings.autoRotate && meshRef.current && !isDraggingRef.current) {
        meshRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  function updateCameraPosition() {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0, 0);
  }

  // Update Geometry when meshShape changes
  useEffect(() => {
    if (!meshRef.current || !sceneRef.current) return;
    let newGeo: THREE.BufferGeometry;

    switch (settings.meshShape) {
      case 'cube':
        newGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8, 32, 32, 32);
        break;
      case 'plane':
        newGeo = new THREE.PlaneGeometry(2.5, 2.5, 64, 64);
        break;
      case 'cylinder':
        newGeo = new THREE.CylinderGeometry(1, 1, 2, 48, 32);
        break;
      case 'torus':
        newGeo = new THREE.TorusGeometry(1.0, 0.45, 32, 64);
        break;
      case 'sphere':
      default:
        newGeo = new THREE.SphereGeometry(1.2, 64, 64);
        break;
    }

    meshRef.current.geometry.dispose();
    meshRef.current.geometry = newGeo;
  }, [settings.meshShape]);

  // Load and apply Textures to Material
  useEffect(() => {
    if (!materialRef.current || !maps) return;

    const loader = new THREE.TextureLoader();
    const applyTexture = (url: string, key: string, setup: (tex: THREE.Texture) => void) => {
      loader.load(url, (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(settings.tiling, settings.tiling);
        texturesRef.current[key] = tex;
        setup(tex);
        if (materialRef.current) materialRef.current.needsUpdate = true;
      });
    };

    // Albedo
    applyTexture(maps.albedo, 'albedo', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      if (materialRef.current) {
        materialRef.current.map = tex;
        materialRef.current.color.set(0xffffff);
      }
    });

    // Normal
    applyTexture(maps.normal, 'normal', (tex) => {
      if (materialRef.current) {
        materialRef.current.normalMap = tex;
        materialRef.current.normalScale.set(settings.normalScale, settings.normalScale);
      }
    });

    // Roughness
    applyTexture(maps.roughness, 'roughness', (tex) => {
      if (materialRef.current) {
        materialRef.current.roughnessMap = tex;
      }
    });

    // Ambient Occlusion
    applyTexture(maps.ao, 'ao', (tex) => {
      if (materialRef.current && meshRef.current) {
        materialRef.current.aoMap = tex;
        materialRef.current.aoMapIntensity = 1.2;
        // Three.js standard material needs uv2 for AO
        const geometry = meshRef.current.geometry;
        if (!geometry.attributes.uv2 && geometry.attributes.uv) {
          geometry.setAttribute('uv2', geometry.attributes.uv);
        }
      }
    });

    // Height / Displacement
    applyTexture(maps.height, 'height', (tex) => {
      if (materialRef.current) {
        materialRef.current.displacementMap = tex;
        materialRef.current.displacementScale = settings.displacementScale;
      }
    });
  }, [maps]);

  // Update Material & Texture Parameters
  useEffect(() => {
    if (!materialRef.current) return;
    const mat = materialRef.current;
    mat.wireframe = settings.wireframe;
    mat.roughness = settings.roughnessMultiplier;
    mat.metalness = settings.metalness;
    mat.displacementScale = settings.displacementScale;
    if (mat.normalScale) {
      mat.normalScale.set(settings.normalScale, settings.normalScale);
    }

    // Tiling repeat update
    Object.values(texturesRef.current).forEach((tex) => {
      tex.repeat.set(settings.tiling, settings.tiling);
      tex.needsUpdate = true;
    });

    mat.needsUpdate = true;
  }, [settings]);

  // Mouse Interaction (Orbit Controls)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    cameraAngleRef.current.theta -= dx * 0.008;
    cameraAngleRef.current.phi = Math.max(
      0.1,
      Math.min(Math.PI - 0.1, cameraAngleRef.current.phi - dy * 0.008)
    );
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    cameraAngleRef.current.radius = Math.max(
      1.5,
      Math.min(7.0, cameraAngleRef.current.radius + e.deltaY * 0.003)
    );
    updateCameraPosition();
  };

  const shapes: { id: MeshShape; label: string }[] = [
    { id: 'sphere', label: 'Sphere' },
    { id: 'cube', label: 'Cube' },
    { id: 'plane', label: 'Plane' },
    { id: 'cylinder', label: 'Cylinder' },
    { id: 'torus', label: 'Torus' },
  ];

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* 3D Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full flex-1 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Mesh Shape Selector */}
        <div className="flex bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-1 rounded-xl shadow-lg pointer-events-auto">
          {shapes.map((s) => (
            <button
              key={s.id}
              onClick={() => onSettingsChange({ meshShape: s.id })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                settings.meshShape === s.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Viewport Toggles (Wireframe, Auto-rotate) */}
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-xl pointer-events-auto">
          <button
            onClick={() => onSettingsChange({ autoRotate: !settings.autoRotate })}
            title="Auto Rotate 3D Model"
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
              settings.autoRotate
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rotate {settings.autoRotate ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => onSettingsChange({ wireframe: !settings.wireframe })}
            title="Toggle Wireframe"
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
              settings.wireframe
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Wireframe
          </button>
        </div>
      </div>

      {/* Bottom Floating Material Tweaks */}
      <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 p-3 rounded-xl shadow-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* UV Tiling */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">UV Tiling:</span>
          <input
            type="range"
            min="1"
            max="6"
            step="1"
            value={settings.tiling}
            onChange={(e) => onSettingsChange({ tiling: parseInt(e.target.value) })}
            className="w-20 accent-emerald-500 cursor-pointer"
          />
          <span className="text-emerald-400 font-mono w-6">{settings.tiling}x</span>
        </div>

        {/* Normal Scale */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Normal Depth:</span>
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.1"
            value={settings.normalScale}
            onChange={(e) => onSettingsChange({ normalScale: parseFloat(e.target.value) })}
            className="w-20 accent-emerald-500 cursor-pointer"
          />
          <span className="text-emerald-400 font-mono w-7">{settings.normalScale.toFixed(1)}</span>
        </div>

        {/* Roughness Multiplier */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Roughness:</span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={settings.roughnessMultiplier}
            onChange={(e) => onSettingsChange({ roughnessMultiplier: parseFloat(e.target.value) })}
            className="w-20 accent-emerald-500 cursor-pointer"
          />
          <span className="text-emerald-400 font-mono w-7">{settings.roughnessMultiplier.toFixed(2)}</span>
        </div>

        {/* Displacement Scale */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Displacement:</span>
          <input
            type="range"
            min="0"
            max="0.4"
            step="0.02"
            value={settings.displacementScale}
            onChange={(e) => onSettingsChange({ displacementScale: parseFloat(e.target.value) })}
            className="w-20 accent-emerald-500 cursor-pointer"
          />
          <span className="text-emerald-400 font-mono w-7">{settings.displacementScale.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
