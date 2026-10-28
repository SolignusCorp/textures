'use client';

import React, { useState, useEffect } from 'react';
import { Box, Sparkles, Download, Layers, ShieldCheck, Gamepad2, Info } from 'lucide-react';
import ThreeViewport from '../components/ThreeViewport';
import ControlPanel from '../components/ControlPanel';
import TextureMapGallery from '../components/TextureMapGallery';
import PricingModal from '../components/PricingModal';
import { generateAlbedoTexture, generatePBRMaps } from '../lib/pbr-generator';
import { packageAndDownloadTextures } from '../lib/export-packager';
import { EnginePreset, GenerationParams, MaterialSettings, PBRMaps } from '../types';

export default function Home() {
  const [maps, setMaps] = useState<PBRMaps | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState(5);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [params, setParams] = useState<GenerationParams>({
    prompt: 'Medieval weathered dungeon stone cobblestone with green moss',
    style: 'realistic',
    resolution: 1024,
    seamless: true,
    roughnessBias: 0.1,
    normalStrength: 1.8,
    aoIntensity: 1.5,
    heightContrast: 1.2,
  });

  const [settings, setSettings] = useState<MaterialSettings>({
    meshShape: 'sphere',
    tiling: 2,
    displacementScale: 0.08,
    roughnessMultiplier: 0.8,
    metalness: 0.05,
    normalScale: 1.5,
    wireframe: false,
    autoRotate: true,
    lightIntensity: 1.2,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Generate Initial Material on Mount
  useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = async () => {
    if (credits <= 0) {
      setPricingOpen(true);
      return;
    }

    try {
      setIsGenerating(true);
      // 1. Generate Albedo
      const albedoCanvas = await generateAlbedoTexture(params);

      // 2. Extract PBR Maps (Normal, Roughness, Height, AO, ORM)
      const generatedMaps = await generatePBRMaps(albedoCanvas, params);
      setMaps(generatedMaps);

      setCredits((prev) => Math.max(0, prev - 1));
      showToast('✨ PBR Material generated successfully! 1 Credit used.');
    } catch (err) {
      console.error('Generation error:', err);
      showToast('❌ Failed to generate material. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (engine: EnginePreset) => {
    if (!maps) {
      showToast('⚠️ Generate a material first before exporting!');
      return;
    }

    try {
      showToast(`📦 Packaging ZIP bundle for ${engine.toUpperCase()}...`);
      const sanitizedName = params.prompt
        .slice(0, 24)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase() || 'Material';

      await packageAndDownloadTextures(maps, sanitizedName, engine);
      showToast(`✅ ${engine.toUpperCase()} ZIP downloaded successfully!`);
    } catch (err) {
      console.error('Export error:', err);
      showToast('❌ Error packaging files.');
    }
  };

  const handleSelectPlan = (planName: string) => {
    setCredits((prev) => prev + 250);
    setPricingOpen(false);
    showToast(`🎉 Upgraded to ${planName}! +250 Credits added.`);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-black">
              <Box className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">TextureForge</span>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase font-mono">
                  AI PBR
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">AI Game Asset & PBR Texture Studio for Indie Developers</p>
            </div>
          </div>

          {/* Supported Engine Badges */}
          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full font-mono">
            <span>Ready for:</span>
            <span className="text-slate-200 font-semibold">Unity</span>
            <span>•</span>
            <span className="text-slate-200 font-semibold">Unreal 5 (ORM)</span>
            <span>•</span>
            <span className="text-slate-200 font-semibold">Godot 4</span>
            <span>•</span>
            <span className="text-slate-200 font-semibold">Blender</span>
          </div>

          {/* Pricing & Credits Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPricingOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 rounded-xl text-xs font-semibold text-emerald-300 transition shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{credits} Credits</span>
              <span className="bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px]">
                Upgrade
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Viewport & Studio Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: 3D Viewport & Texture Maps Gallery (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* 3D Viewport */}
          <div className="h-[460px] sm:h-[520px] w-full">
            <ThreeViewport
              maps={maps}
              settings={settings}
              onSettingsChange={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
            />
          </div>

          {/* Individual Texture Map Channels Gallery */}
          <TextureMapGallery
            maps={maps}
            materialName={params.prompt.slice(0, 20).replace(/\s+/g, '_')}
          />
        </div>

        {/* Right Side: AI Material Control Panel (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <ControlPanel
            params={params}
            onChangeParams={(newParams) => setParams((prev) => ({ ...prev, ...newParams }))}
            onGenerate={handleGenerate}
            onExport={handleExport}
            isGenerating={isGenerating}
            credits={credits}
            onOpenPricing={() => setPricingOpen(true)}
          />

          {/* Indie Dev Workflow Guide Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>Why PBR Textures Matter for Games</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Unlike flat 2D images, PBR (Physically Based Rendering) materials accurately simulate how light bounces off physical surfaces in real time. TextureForge AI computes high-precision <span className="text-emerald-400 font-mono">Normal</span>, <span className="text-emerald-400 font-mono">Roughness</span>, <span className="text-emerald-400 font-mono">Height</span>, and <span className="text-emerald-400 font-mono">AO</span> channels so your assets instantly look AAA in your engine.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400">
              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-200 font-semibold block">⚡ 100% Seamless</span>
                Smooth edge wrap prevents tiling grid lines.
              </div>
              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-200 font-semibold block">🎮 UE5 Packed ORM</span>
                Memory optimized 3-in-1 texture format.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={pricingOpen}
        onClose={() => setPricingOpen(false)}
        onSelectPlan={handleSelectPlan}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-in slide-in-from-bottom-5">
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
