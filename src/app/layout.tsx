import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TextureForge AI — Indie Game Asset & PBR Texture Studio",
  description: "Generate game-ready PBR textures (Albedo, Normal, Roughness, Height, AO) for Unity, Unreal Engine 5, Godot and Blender using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
