'use client';

import React, { useState } from 'react';
import { Sparkles, Sliders, Layers, Download, Check, RefreshCw, Zap } from 'lucide-react';
import { ArtStyle, EnginePreset, GenerationParams, Resolution } from '../types';

interface ControlPanelProps {
  params: GenerationParams;
  onChangeParams: (params: Partial<GenerationParams>) => void;
  onGenerate: () => void;
  onExport: (engine: EnginePreset) => void;
  isGenerating: boolean;
  credits: number;
  onOpenPricing: () => void;
}

const PRESETS = [
  { label: 'Medieval Dungeon Stone', prompt: 'Medieval dungeon stone cobblestone with moss in crevices', style: 'realistic' as ArtStyle },
  { label: 'Sci-Fi Hex Tech Hull', prompt: 'Cyberpunk hexagon metallic spaceship hull with glowing cyan circuit lines', style: 'scifi' as ArtStyle },
  { label: 'Stylized Pine Wood', prompt: 'Stylized hand-painted cartoon pine wood timber planks', style: 'stylized' as ArtStyle },
  { label: 'Volcanic Lava Cracks', prompt: 'Ancient dark volcanic rock with glowing fiery lava magma cracks', style: 'fantasy' as ArtStyle },
  { label: 'Royal Gold Marble', prompt: 'Polished white royal marble with elegant golden veins and glossy finish', style: 'realistic' as ArtStyle },
];

const STYLES: { id: ArtStyle; label: string }[] = [
  { id: 'realistic', label: 'Realistic PBR' },
  { id: 'stylized', label: 'Stylized' },
  { id: 'scifi', label: 'Sci-Fi' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'handpainted', label: 'Hand-Painted' },
];

export default function ControlPanel({
  params,
  onChangeParams,
  onGenerate,
  onExport,
  isGenerating,
  credits,
  onOpenPricing,
}: ControlPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<EnginePreset>('unity');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-5 text-sm">
      {/* Header & Credit Balance */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-white tracking-wide">AI Material Generator</span>
        </div>

        <button
          onClick={onOpenPricing}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-full text-xs transition"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-slate-300 font-medium">Credits:</span>
          <span className="text-emerald-400 font-bold font-mono">{credits} left</span>
        </button>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Material Description (Prompt)</span>
          <span className="text-[11px] text-slate-500 font-normal">English works best</span>
        </label>
        <div className="relative">
          <textarea
            rows={3}
            value={params.prompt}
            onChange={(e) => onChangeParams({ prompt: e.target.value })}
            placeholder="e.g. Weathered medieval cobblestone wall with green moss..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition resize-none shadow-inner"
          />
        </div>

        {/* Quick Presets Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] text-slate-500 font-medium">Presets:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onChangeParams({ prompt: p.prompt, style: p.style })}
              className="text-[11px] bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded-md border border-slate-700/50 transition truncate max-w-[170px]"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Art Style */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">Art Style</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => onChangeParams({ style: s.id })}
              className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition text-center ${
                params.style === s.id
                  ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-400'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resolution & Seamless Mode */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Seamless */}
        <div
          onClick={() => onChangeParams({ seamless: !params.seamless })}
          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition ${
            params.seamless
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Seamless Tiling</span>
            <span className="text-[10px] text-slate-500">No edge seams</span>
          </div>
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center border ${
              params.seamless ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
            }`}
          >
            {params.seamless && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </div>

        {/* Resolution */}
        <div className="flex flex-col justify-center bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
          <span className="text-xs font-semibold text-slate-300 mb-1">Resolution</span>
          <div className="flex items-center gap-1">
            {([512, 1024, 2048] as Resolution[]).map((res) => (
              <button
                key={res}
                onClick={() => onChangeParams({ resolution: res })}
                className={`flex-1 py-1 text-[11px] font-mono rounded font-medium transition ${
                  params.resolution === res
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {res === 2048 ? '2K' : res}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced PBR Fine-Tuning Collapsible */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-2.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" /> PBR Extraction Settings
          </span>
          <span className="text-[10px] text-slate-500">{showAdvanced ? 'Hide ▲' : 'Show ▼'}</span>
        </button>

        {showAdvanced && (
          <div className="p-3 border-t border-slate-800/80 space-y-3 text-xs bg-slate-950/80">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Normal Bump Strength</span>
                <span className="text-emerald-400 font-mono">{params.normalStrength.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={params.normalStrength}
                onChange={(e) => onChangeParams({ normalStrength: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Height Contrast</span>
                <span className="text-emerald-400 font-mono">{params.heightContrast.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={params.heightContrast}
                onChange={(e) => onChangeParams({ heightContrast: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Ambient Occlusion Cavity</span>
                <span className="text-emerald-400 font-mono">{params.aoIntensity.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={params.aoIntensity}
                onChange={(e) => onChangeParams({ aoIntensity: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Button: Generate Material */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || !params.prompt.trim()}
        className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all duration-300 ${
          isGenerating || !params.prompt.trim()
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 hover:brightness-110 active:scale-[0.99] shadow-emerald-500/20'
        }`}
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            <span>Generating PBR Maps...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Generate PBR Material (1 Credit)</span>
          </>
        )}
      </button>

      {/* Export Section */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-400" /> Export Engine Preset
        </label>
        <div className="flex gap-2">
          <select
            value={selectedEngine}
            onChange={(e) => setSelectedEngine(e.target.value as EnginePreset)}
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="unity">Unity (URP/HDRP)</option>
            <option value="ue5">Unreal Engine 5 (Packed ORM)</option>
            <option value="godot">Godot 4 Engine</option>
            <option value="blender">Blender (Principled BSDF)</option>
            <option value="raw">Raw Individual Maps ZIP</option>
          </select>

          <button
            onClick={() => onExport(selectedEngine)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-xl text-xs border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Export ZIP
          </button>
        </div>
      </div>
    </div>
  );
}
