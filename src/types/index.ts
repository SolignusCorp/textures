export type ArtStyle = 'stylized' | 'realistic' | 'scifi' | 'pixel' | 'fantasy' | 'handpainted';

export type MeshShape = 'sphere' | 'cube' | 'plane' | 'cylinder' | 'torus';

export type Resolution = 512 | 1024 | 2048;

export type EnginePreset = 'unity' | 'ue5' | 'godot' | 'blender' | 'raw';

export interface PBRMaps {
  albedo: string;       // Data URL or Image URL
  normal: string;       // Normal map (tangent space)
  roughness: string;    // Roughness (0: smooth, 1: rough)
  height: string;       // Displacement / height map
  ao: string;           // Ambient occlusion
  orm?: string;         // Occlusion-Roughness-Metallic packed for UE5
}

export interface GenerationParams {
  prompt: string;
  style: ArtStyle;
  resolution: Resolution;
  seamless: boolean;
  roughnessBias: number; // -1 to 1
  normalStrength: number; // 0.5 to 5.0
  aoIntensity: number;   // 0.5 to 3.0
  heightContrast: number;// 0.5 to 2.5
}

export interface MaterialSettings {
  meshShape: MeshShape;
  tiling: number;        // UV scale (1x - 8x)
  displacementScale: number;
  roughnessMultiplier: number;
  metalness: number;
  normalScale: number;
  wireframe: boolean;
  autoRotate: boolean;
  lightIntensity: number;
}
