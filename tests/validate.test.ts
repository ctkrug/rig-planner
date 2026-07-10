import { describe, expect, it } from "vitest";
import { validateRigInput } from "../src/ui/validate";

describe("validateRigInput", () => {
  it("accepts valid VRAM and RAM values", () => {
    const result = validateRigInput({ vramGb: "12", ramGb: "32" });
    expect(result).toEqual({ ok: true, spec: { vramGb: 12, ramGb: 32 } });
  });

  it("includes gpuModel when provided", () => {
    const result = validateRigInput({ vramGb: "12", ramGb: "32", gpuModel: "RTX 4070" });
    expect(result).toEqual({ ok: true, spec: { vramGb: 12, ramGb: 32, gpuModel: "RTX 4070" } });
  });

  it("omits gpuModel when blank", () => {
    const result = validateRigInput({ vramGb: "12", ramGb: "32", gpuModel: "  " });
    expect(result).toEqual({ ok: true, spec: { vramGb: 12, ramGb: 32 } });
  });

  it("rejects an empty VRAM value without calling into the solver", () => {
    const result = validateRigInput({ vramGb: "", ramGb: "32" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/VRAM/);
  });

  it("rejects zero and negative VRAM", () => {
    expect(validateRigInput({ vramGb: "0", ramGb: "32" }).ok).toBe(false);
    expect(validateRigInput({ vramGb: "-5", ramGb: "32" }).ok).toBe(false);
  });

  it("rejects non-numeric VRAM", () => {
    expect(validateRigInput({ vramGb: "abc", ramGb: "32" }).ok).toBe(false);
  });

  it("rejects an implausibly large VRAM value", () => {
    const result = validateRigInput({ vramGb: "9999", ramGb: "32" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/plausible/);
  });

  it("rejects a missing RAM value even when VRAM is valid", () => {
    const result = validateRigInput({ vramGb: "12", ramGb: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/RAM/);
  });

  it("rejects an implausibly large RAM value", () => {
    const result = validateRigInput({ vramGb: "12", ramGb: "9999" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/plausible/);
  });

  it("rejects whitespace-only VRAM and RAM", () => {
    expect(validateRigInput({ vramGb: "   ", ramGb: "32" }).ok).toBe(false);
    expect(validateRigInput({ vramGb: "12", ramGb: "\t\n" }).ok).toBe(false);
  });

  it("rejects NaN and Infinity literals", () => {
    expect(validateRigInput({ vramGb: "NaN", ramGb: "32" }).ok).toBe(false);
    expect(validateRigInput({ vramGb: "Infinity", ramGb: "32" }).ok).toBe(false);
    expect(validateRigInput({ vramGb: "12", ramGb: "-Infinity" }).ok).toBe(false);
  });

  it("rejects unicode and emoji input rather than coercing it", () => {
    expect(validateRigInput({ vramGb: "12", ramGb: "😀" }).ok).toBe(false);
    expect(validateRigInput({ vramGb: "１２", ramGb: "32" }).ok).toBe(false);
  });

  it("accepts VRAM exactly at the plausibility boundary and rejects just over it", () => {
    expect(validateRigInput({ vramGb: "512", ramGb: "32" }).ok).toBe(true);
    expect(validateRigInput({ vramGb: "512.01", ramGb: "32" }).ok).toBe(false);
  });

  it("trims surrounding whitespace from a valid gpuModel", () => {
    const result = validateRigInput({ vramGb: "12", ramGb: "32", gpuModel: "  RTX 4090  " });
    expect(result).toEqual({ ok: true, spec: { vramGb: 12, ramGb: 32, gpuModel: "RTX 4090" } });
  });
});
