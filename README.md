# TextureForge AI — Indie Game Asset & PBR Texture Studio

**TextureForge AI** is an AI-powered Physically Based Rendering (PBR) texture synthesis platform built for indie game developers, 3D artists, and modders. Generate game-ready materials (Albedo, Normal, Roughness, Height, Ambient Occlusion, and UE5 packed ORM) from text prompts or reference images in seconds.

---

## 🚀 Features

- **Text-to-PBR Synthesis:** Generate materials for Medieval, Sci-Fi, Stylized, Fantasy, and Realistic game environments.
- **6 Synchronized PBR Channels:**
  - **Albedo / Diffuse:** Clean base color without lighting baked in.
  - **Normal Map:** Tangent-space bump vectors computed via Sobel gradients.
  - **Roughness Map:** Micro-surface reflectivity and scattering.
  - **Height / Displacement:** Elevation and tessellation geometry.
  - **Ambient Occlusion (AO):** Crevice cavity self-shadowing.
  - **Packed ORM (UE5):** Memory-optimized 3-in-1 texture format (Red: AO, Green: Roughness, Blue: Metallic).
- **Interactive Three.js 3D Viewport:**
  - OrbitControls (360° mouse/touch rotation, zoom, pan).
  - Multiple test geometries: Sphere, Cube, Plane, Cylinder, Torus.
  - Live adjustment sliders: UV Tiling, Normal Depth, Roughness Multiplier, Displacement Scale, Wireframe, Auto-rotate.
- **Image-to-PBR:** Upload any custom photo or texture sketch to auto-extract complete PBR map sets.
- **Seamless Tiling:** Algorithmic edge cross-fade wrap to eliminate tiling seams.
- **1-Click Game Engine Export:** Download packaged `.zip` archives pre-configured for:
  - **Unity (URP/HDRP)**
  - **Unreal Engine 5 (Packed ORM)**
  - **Godot 4 Engine**
  - **Blender (Principled BSDF)**
- **SaaS Ready:** Built-in credit balance tracking and tier pricing modal.

---

## 🛠️ Tech Stack

- **Frontend / 3D Engine:** Three.js, WebGL, Tailwind CSS, Lucide Icons
- **Image & PBR Processing:** HTML5 Canvas, Sobel convolution filters, Perlin noise synthesis
- **Archiving:** JSZip, FileSaver.js
- **Framework:** Next.js / TypeScript structure included

---

## 💻 Quick Start

### Standalone (Zero dependencies):
Simply open `index.html` in any modern web browser or serve via Python:
```bash
python -m http.server 3000
```
Then visit `http://localhost:3000`.

---

## 📄 License
MIT License. Created for SolignusCorp.
