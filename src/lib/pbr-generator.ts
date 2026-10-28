import { GenerationParams, PBRMaps } from '../types';

/**
 * Procedural Noise & Texture Generators for TextureForge AI
 */
class PerlinNoise {
  private p: number[] = [];

  constructor() {
    const permutation = [
      151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,
      8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
      35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,
      134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
      55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,
      18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,
      250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,
      189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,
      172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,
      228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,
      107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
      138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
    ];
    for (let i = 0; i < 256; i++) {
      this.p[i] = permutation[i];
      this.p[256 + i] = permutation[i];
    }
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  public noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = this.fade(xf);
    const v = this.fade(yf);

    const A = this.p[X] + Y;
    const B = this.p[X + 1] + Y;

    return this.lerp(
      v,
      this.lerp(u, this.grad(this.p[A], xf, yf), this.grad(this.p[B], xf - 1, yf)),
      this.lerp(u, this.grad(this.p[A + 1], xf, yf - 1), this.grad(this.p[B + 1], xf - 1, yf - 1))
    );
  }

  public fbm(x: number, y: number, octaves = 5, persistence = 0.5): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    return (total / maxValue + 1) / 2; // normalize to 0..1
  }
}

const perlin = new PerlinNoise();

/**
 * Generate Albedo texture based on Prompt & Style
 */
export async function generateAlbedoTexture(params: GenerationParams): Promise<HTMLCanvasElement> {
  const size = Math.min(params.resolution, 1024); // Optimize client canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  const prompt = params.prompt.toLowerCase();
  const isStone = prompt.includes('stone') || prompt.includes('rock') || prompt.includes('cobble') || prompt.includes('brick');
  const isWood = prompt.includes('wood') || prompt.includes('plank') || prompt.includes('bark') || prompt.includes('timber');
  const isSciFi = prompt.includes('scifi') || prompt.includes('sci-fi') || prompt.includes('metal') || prompt.includes('cyber') || prompt.includes('hull') || prompt.includes('tech');
  const isLava = prompt.includes('lava') || prompt.includes('magma') || prompt.includes('fire');
  const isMarble = prompt.includes('marble') || prompt.includes('tile') || prompt.includes('gold');
  const isStylized = params.style === 'stylized' || prompt.includes('stylized') || prompt.includes('cartoon');

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = x / size;
      const ny = y / size;

      let r = 120, g = 120, b = 120;

      if (isLava) {
        const n = perlin.fbm(nx * 6, ny * 6, 6);
        const cracks = Math.pow(Math.abs(perlin.noise(nx * 12, ny * 12)), 0.6);
        if (cracks > 0.45) {
          // Glow magma
          r = Math.min(255, 230 + n * 40);
          g = Math.min(255, 60 + n * 120);
          b = 10;
        } else {
          // Crust rock
          const dark = n * 45;
          r = 25 + dark;
          g = 20 + dark;
          b = 20 + dark;
        }
      } else if (isWood) {
        // Wood grain
        const grain = perlin.fbm(nx * 20, ny * 2, 4);
        const ring = Math.sin((nx * 15 + grain * 4) * Math.PI * 2);
        const tone = (ring + 1) * 0.5;
        r = Math.floor(130 + tone * 45);
        g = Math.floor(75 + tone * 35);
        b = Math.floor(35 + tone * 20);
      } else if (isSciFi) {
        // Hexagonal / panel grid
        const cellX = Math.floor(nx * 8);
        const cellY = Math.floor(ny * 8);
        const isBorder = (x % (size / 8) < 3) || (y % (size / 8) < 3);
        const n = perlin.fbm(nx * 10, ny * 10, 3);
        if (isBorder) {
          r = 20; g = 25; b = 35;
        } else {
          const metallic = ((cellX + cellY) % 2 === 0 ? 110 : 85) + n * 30;
          r = metallic;
          g = metallic + 5;
          b = metallic + 15;
          if (prompt.includes('neon') || prompt.includes('glow')) {
            if (cellX % 3 === 0 && cellY % 3 === 0) {
              r = 20; g = 210; b = 255; // Neon cyan accent
            }
          }
        }
      } else if (isStone) {
        // Cobblestones / Bricks
        const brickW = size / 6;
        const brickH = size / 12;
        const row = Math.floor(y / brickH);
        const offsetX = (row % 2 === 1) ? brickW / 2 : 0;
        const col = Math.floor((x + offsetX) / brickW);

        const inBorder = ((x + offsetX) % brickW < 4) || (y % brickH < 4);
        const stoneNoise = perlin.fbm(nx * 8, ny * 8, 5);

        if (inBorder) {
          // Mortar / moss
          if (prompt.includes('moss')) {
            r = 45 + stoneNoise * 20;
            g = 75 + stoneNoise * 40;
            b = 35;
          } else {
            r = 50; g = 50; b = 50;
          }
        } else {
          const varTone = (perlin.noise(col * 2.5, row * 2.5) + 1) * 0.5;
          const base = 110 + varTone * 40 + stoneNoise * 30;
          r = base;
          g = prompt.includes('moss') ? base + 15 : base;
          b = base - 5;
        }
      } else if (isMarble) {
        // Marble veins
        const vein = Math.sin((nx * 4 + perlin.fbm(nx * 4, ny * 4, 5) * 5) * Math.PI);
        const v = Math.pow(Math.abs(vein), 4);
        r = Math.floor(220 - v * 120);
        g = Math.floor(215 - v * 120);
        b = Math.floor(210 - v * 110);
      } else {
        // General textured material / terrain / cloth
        const n = perlin.fbm(nx * 8, ny * 8, 5);
        if (isStylized) {
          // Quantized toon bands
          const bands = Math.floor(n * 5) / 5;
          r = Math.floor(50 + bands * 160);
          g = Math.floor(90 + bands * 140);
          b = Math.floor(40 + bands * 80);
        } else {
          r = Math.floor(n * 200);
          g = Math.floor(n * 190);
          b = Math.floor(n * 180);
        }
      }

      data[idx] = Math.max(0, Math.min(255, r));
      data[idx + 1] = Math.max(0, Math.min(255, g));
      data[idx + 2] = Math.max(0, Math.min(255, b));
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  if (params.seamless) {
    applySeamlessBlend(canvas);
  }

  return canvas;
}

/**
 * Make texture seamless by blending opposing borders
 */
function applySeamlessBlend(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const blendWidth = Math.floor(w * 0.15); // 15% overlap

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < blendWidth; x++) {
      const alpha = x / blendWidth;
      const leftIdx = (y * w + x) * 4;
      const rightIdx = (y * w + (w - 1 - (blendWidth - 1 - x))) * 4;

      for (let c = 0; c < 3; c++) {
        const blended = data[leftIdx + c] * alpha + data[rightIdx + c] * (1 - alpha);
        data[leftIdx + c] = blended;
        data[rightIdx + c] = blended;
      }
    }
  }

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < blendWidth; y++) {
      const alpha = y / blendWidth;
      const topIdx = (y * w + x) * 4;
      const bottomIdx = ((h - 1 - (blendWidth - 1 - y)) * w + x) * 4;

      for (let c = 0; c < 3; c++) {
        const blended = data[topIdx + c] * alpha + data[bottomIdx + c] * (1 - alpha);
        data[topIdx + c] = blended;
        data[bottomIdx + c] = blended;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Generates all 5 PBR Maps from Albedo Canvas
 */
export async function generatePBRMaps(albedoCanvas: HTMLCanvasElement, params: GenerationParams): Promise<PBRMaps> {
  const w = albedoCanvas.width;
  const h = albedoCanvas.height;
  const albedoCtx = albedoCanvas.getContext('2d')!;
  const albedoImg = albedoCtx.getImageData(0, 0, w, h);
  const aData = albedoImg.data;

  // 1. Calculate Grayscale / Height
  const heightData = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    // Luminance formula
    const lum = (aData[idx] * 0.299 + aData[idx + 1] * 0.587 + aData[idx + 2] * 0.114) / 255.0;
    // Contrast adjustment
    const adjusted = Math.pow(lum, params.heightContrast);
    heightData[i] = Math.max(0, Math.min(1, adjusted));
  }

  // 2. Normal Map (Sobel operator)
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = w;
  normalCanvas.height = h;
  const normalCtx = normalCanvas.getContext('2d')!;
  const normalImg = normalCtx.createImageData(w, h);
  const nData = normalImg.data;

  const strength = params.normalStrength;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x);
      const pixelIdx = idx * 4;

      // Sample neighbors with wrap around
      const x0 = (x - 1 + w) % w;
      const x1 = (x + 1) % w;
      const y0 = (y - 1 + h) % h;
      const y1 = (y + 1) % h;

      const tl = heightData[y0 * w + x0];
      const t  = heightData[y0 * w + x];
      const tr = heightData[y0 * w + x1];
      const l  = heightData[y * w + x0];
      const r  = heightData[y * w + x1];
      const bl = heightData[y1 * w + x0];
      const b  = heightData[y1 * w + x];
      const br = heightData[y1 * w + x1];

      // Sobel Kernels
      const dx = (tr + 2 * r + br) - (tl + 2 * l + bl);
      const dy = (bl + 2 * b + br) - (tl + 2 * t + tr);

      // Tangent space normal vector: (-dx * strength, -dy * strength, 1.0)
      let nx = -dx * strength;
      let ny = -dy * strength;
      let nz = 1.0;

      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx /= len;
      ny /= len;
      nz /= len;

      // Convert from [-1, 1] to [0, 255] RGB
      nData[pixelIdx]     = Math.floor((nx * 0.5 + 0.5) * 255);
      nData[pixelIdx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      nData[pixelIdx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      nData[pixelIdx + 3] = 255;
    }
  }
  normalCtx.putImageData(normalImg, 0, 0);

  // 3. Roughness Map
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = w;
  roughCanvas.height = h;
  const roughCtx = roughCanvas.getContext('2d')!;
  const roughImg = roughCtx.createImageData(w, h);
  const rData = roughImg.data;

  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    // Invert height slightly or combine with micro-detail
    let rVal = (1.0 - heightData[i] * 0.7) + (params.roughnessBias * 0.3);
    rVal = Math.max(0.05, Math.min(0.95, rVal)) * 255;

    rData[idx]     = rVal;
    rData[idx + 1] = rVal;
    rData[idx + 2] = rVal;
    rData[idx + 3] = 255;
  }
  roughCtx.putImageData(roughImg, 0, 0);

  // 4. Height / Displacement Map
  const hCanvas = document.createElement('canvas');
  hCanvas.width = w;
  hCanvas.height = h;
  const hCtx = hCanvas.getContext('2d')!;
  const hImg = hCtx.createImageData(w, h);
  const hImgData = hImg.data;

  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    const val = Math.floor(heightData[i] * 255);
    hImgData[idx]     = val;
    hImgData[idx + 1] = val;
    hImgData[idx + 2] = val;
    hImgData[idx + 3] = 255;
  }
  hCtx.putImageData(hImg, 0, 0);

  // 5. Ambient Occlusion (Cavity / Crevice darkening)
  const aoCanvas = document.createElement('canvas');
  aoCanvas.width = w;
  aoCanvas.height = h;
  const aoCtx = aoCanvas.getContext('2d')!;
  const aoImg = aoCtx.createImageData(w, h);
  const aoData = aoImg.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const pixelIdx = idx * 4;

      // Local valley detection: compare center with average of neighbors
      let sum = 0;
      const radius = 2;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const sx = (x + dx + w) % w;
          const sy = (y + dy + h) % h;
          sum += heightData[sy * w + sx];
          count++;
        }
      }
      const avg = sum / count;
      const diff = heightData[idx] - avg;
      // If lower than surroundings, it's a crevice (darker AO)
      let ao = 1.0 + diff * params.aoIntensity;
      ao = Math.max(0.15, Math.min(1.0, ao));

      const aoByte = Math.floor(ao * 255);
      aoData[pixelIdx]     = aoByte;
      aoData[pixelIdx + 1] = aoByte;
      aoData[pixelIdx + 2] = aoByte;
      aoData[pixelIdx + 3] = 255;
    }
  }
  aoCtx.putImageData(aoImg, 0, 0);

  // 6. Unreal Engine Packed ORM (R: AO, G: Roughness, B: Metallic)
  const ormCanvas = document.createElement('canvas');
  ormCanvas.width = w;
  ormCanvas.height = h;
  const ormCtx = ormCanvas.getContext('2d')!;
  const ormImg = ormCtx.createImageData(w, h);
  const ormData = ormImg.data;

  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    ormData[idx]     = aoData[idx];       // Red = Ambient Occlusion
    ormData[idx + 1] = rData[idx];        // Green = Roughness
    ormData[idx + 2] = 0;                 // Blue = Metallic (non-metal default)
    ormData[idx + 3] = 255;
  }
  ormCtx.putImageData(ormImg, 0, 0);

  return {
    albedo: albedoCanvas.toDataURL('image/png'),
    normal: normalCanvas.toDataURL('image/png'),
    roughness: roughCanvas.toDataURL('image/png'),
    height: hCanvas.toDataURL('image/png'),
    ao: aoCanvas.toDataURL('image/png'),
    orm: ormCanvas.toDataURL('image/png'),
  };
}
