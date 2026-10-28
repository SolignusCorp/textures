'use client';

import React, { useState } from 'react';
import { Download, Maximize2, X } from 'lucide-react';
import { PBRMaps } from '../types';

interface TextureMapGalleryProps {
  maps: PBRMaps | null;
  materialName: string;
}

export default function TextureMapGallery({ maps, materialName }: TextureMapGalleryProps) {
  const [modalImage, setModalImage] = useState<{ title: string; url: string } | null>(null);

  if (!maps) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm">
        Generate or select a material to view individual PBR texture channels.
      </div>
    );
  }

  const mapList = [
    { key: 'albedo', title: 'Albedo / Base Color', url: maps.albedo, badge: 'Color', desc: 'Diffuse RGB without lighting' },
    { key: 'normal', title: 'Normal Map', url: maps.normal, badge: 'Tangent', desc: 'RGB vector surface bump' },
    { key: 'roughness', title: 'Roughness Map', url: maps.roughness, badge: 'Grayscale', desc: 'Micro-surface scattering' },
    { key: 'height', title: 'Height / Displacement', url: maps.height, badge: 'Depth', desc: 'Tessellation geometry elevation' },
    { key: 'ao', title: 'Ambient Occlusion', url: maps.ao, badge: 'Shadows', desc: 'Crevice & contact micro-shadows' },
    ...(maps.orm ? [{ key: 'orm', title: 'UE5 Packed ORM', url: maps.orm, badge: 'R:AO G:R B:M', desc: 'Unreal Engine 5 packed texture' }] : []),
  ];

  const handleDownloadSingle = (url: string, suffix: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${materialName || 'Texture'}_${suffix}.png`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
          Generated PBR Channels ({mapList.length})
        </h3>
        <span className="text-xs text-slate-400">Click to expand or download individual maps</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {mapList.map((m) => (
          <div
            key={m.key}
            className="group relative bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl overflow-hidden transition-all duration-200 shadow-md flex flex-col"
          >
            {/* Thumbnail */}
            <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
              <img
                src={m.url}
                alt={m.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setModalImage({ title: m.title, url: m.url })}
                  title="Expand preview"
                  className="p-1.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg shadow"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDownloadSingle(m.url, m.key)}
                  title="Download map"
                  className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Info footer */}
            <div className="p-2 flex flex-col justify-between flex-1 bg-slate-900/95">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-xs font-semibold text-slate-200 truncate">{m.title}</span>
              </div>
              <span className="text-[10px] text-emerald-400/90 font-mono">{m.badge}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Full-view Modal */}
      {modalImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white">{modalImage.title}</h4>
              <button
                onClick={() => setModalImage(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <img
                src={modalImage.url}
                alt={modalImage.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleDownloadSingle(modalImage.url, modalImage.title.toLowerCase().replace(/\s+/g, '_'))}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
