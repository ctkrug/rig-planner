/** Common GPUs, so picking one auto-fills a realistic usable-VRAM estimate. */
export interface GpuPreset {
  id: string;
  label: string;
  /** Manufacturer-rated VRAM in GB. */
  vramGb: number;
  /** GB reserved for OS/driver/display compositor before inference can use it. */
  reservedGb: number;
}

export const GPU_PRESETS: GpuPreset[] = [
  { id: "rtx-4090", label: "NVIDIA GeForce RTX 4090 (24GB)", vramGb: 24, reservedGb: 1 },
  { id: "rtx-4080", label: "NVIDIA GeForce RTX 4080 (16GB)", vramGb: 16, reservedGb: 1 },
  { id: "rtx-4070-ti", label: "NVIDIA GeForce RTX 4070 Ti (12GB)", vramGb: 12, reservedGb: 0.75 },
  { id: "rtx-4070", label: "NVIDIA GeForce RTX 4070 (12GB)", vramGb: 12, reservedGb: 0.75 },
  { id: "rtx-3090", label: "NVIDIA GeForce RTX 3090 (24GB)", vramGb: 24, reservedGb: 1 },
  { id: "rtx-3080", label: "NVIDIA GeForce RTX 3080 (10GB)", vramGb: 10, reservedGb: 0.75 },
  { id: "rtx-3060", label: "NVIDIA GeForce RTX 3060 (12GB)", vramGb: 12, reservedGb: 0.5 },
  { id: "a100-80", label: "NVIDIA A100 (80GB)", vramGb: 80, reservedGb: 1 },
  { id: "rx-7900-xtx", label: "AMD Radeon RX 7900 XTX (24GB)", vramGb: 24, reservedGb: 1 },
];

/** Usable VRAM after subtracting the driver/OS reservation, floored at zero. */
export function usableVramGb(preset: GpuPreset): number {
  return Math.max(0, preset.vramGb - preset.reservedGb);
}
