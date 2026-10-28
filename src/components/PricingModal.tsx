'use client';

import React from 'react';
import { Check, Sparkles, X, Zap, ShieldCheck } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: string) => void;
}

export default function PricingModal({ isOpen, onClose, onSelectPlan }: PricingModalProps) {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'Free Starter',
      price: '$0',
      period: 'forever',
      desc: 'Perfect for trying out PBR generation for indie prototypes.',
      credits: '5 free credits on signup',
      features: [
        '512x512 resolution maps',
        'Standard PBR extraction',
        'Real-time 3D Viewport preview',
        'Non-commercial license',
      ],
      popular: false,
      buttonText: 'Current Plan',
      disabled: true,
    },
    {
      name: 'Indie Creator',
      price: '$15',
      period: '/ month',
      desc: 'Designed for solo indie game devs & 3D freelance artists.',
      credits: '250 generations / month',
      features: [
        'Up to 2K (2048x2048) resolution',
        'Unity & Unreal Engine 5 packed ORM export',
        'Seamless Tiling algorithmic guarantee',
        'Commercial game license (Steam, Epic Store)',
        'Full ZIP asset packaging',
      ],
      popular: true,
      buttonText: 'Upgrade to Indie',
      disabled: false,
    },
    {
      name: 'Game Studio',
      price: '$39',
      period: '/ month',
      desc: 'For small game studios, mod teams & asset pack creators.',
      credits: '1,000 generations / month',
      features: [
        'Up to 4K Ultra resolution',
        'Custom Art Style fine-tuning',
        'Direct Blender & Godot workflow integration',
        'Commercial & Resell rights for Asset Stores',
        'Priority GPU server queues',
        'REST API key access',
      ],
      popular: false,
      buttonText: 'Upgrade to Studio',
      disabled: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col gap-6 animate-in fade-in zoom-in-95">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between relative">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Simple Transparent SaaS Pricing
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Supercharge Your Game Development</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Generate unlimited AAA-grade PBR game assets in seconds. Cancel anytime.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-5 flex flex-col justify-between border transition-all duration-300 relative ${
                p.popular
                  ? 'bg-slate-950 border-emerald-500/60 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{p.desc}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">{p.price}</span>
                  <span className="text-xs text-slate-400 font-medium">{p.period}</span>
                </div>

                <div className="mt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-emerald-400" /> {p.credits}
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-800/80 pt-4">
                  {p.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (!p.disabled) onSelectPlan(p.name);
                }}
                disabled={p.disabled}
                className={`w-full mt-6 py-2.5 px-4 rounded-xl font-bold text-xs transition shadow-md ${
                  p.popular
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    : p.disabled
                    ? 'bg-slate-800 text-slate-500 cursor-default'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {p.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Security badge & guarantee */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Instant access • 14-day money-back guarantee • Commercial game engine rights included</span>
        </div>
      </div>
    </div>
  );
}
