// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { mountApp } from "../src/main";

function submit(): void {
  const form = document.querySelector<HTMLFormElement>("#rig-form")!;
  form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
}

describe("app", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    mountApp();
  });

  it("shows a designed empty state before any submission", () => {
    expect(document.querySelector(".results-empty")).not.toBeNull();
    expect(document.querySelectorAll(".result-card").length).toBe(0);
  });

  it("renders at least 3 ranked result cards without a page reload after a valid submission", () => {
    (document.querySelector("#vram") as HTMLInputElement).value = "12";
    (document.querySelector("#ram") as HTMLInputElement).value = "32";
    submit();

    const cards = document.querySelectorAll(".result-card");
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });

  it("every result card shows a model name, quant, and a fit badge", () => {
    (document.querySelector("#vram") as HTMLInputElement).value = "12";
    (document.querySelector("#ram") as HTMLInputElement).value = "32";
    submit();

    document.querySelectorAll(".result-card").forEach((card) => {
      expect(card.querySelector(".result-card__name")?.textContent).toBeTruthy();
      expect(card.querySelector(".result-card__quant")?.textContent).toBeTruthy();
      expect(card.querySelector('[class*="badge--"]')).not.toBeNull();
    });
  });

  it("shows an inline validation message and does not touch the solver when VRAM is missing", () => {
    (document.querySelector("#vram") as HTMLInputElement).value = "";
    (document.querySelector("#ram") as HTMLInputElement).value = "32";
    submit();

    const error = document.querySelector<HTMLParagraphElement>("#form-error")!;
    expect(error.hidden).toBe(false);
    expect(error.textContent).toMatch(/VRAM/);
    expect(document.querySelectorAll(".result-card").length).toBe(0);
  });

  it("selecting a GPU preset auto-fills a usable VRAM value", () => {
    const gpuSelect = document.querySelector<HTMLSelectElement>("#gpu-preset")!;
    const vramInput = document.querySelector<HTMLInputElement>("#vram")!;

    gpuSelect.value = "rtx-4070-ti";
    gpuSelect.dispatchEvent(new Event("change", { bubbles: true }));

    expect(Number(vramInput.value)).toBeGreaterThan(0);
    expect(Number(vramInput.value)).toBeLessThan(12);
  });

  it("shows the honest empty-results message for a rig too small for the catalog", () => {
    (document.querySelector("#vram") as HTMLInputElement).value = "1";
    (document.querySelector("#ram") as HTMLInputElement).value = "1";
    submit();

    expect(document.querySelectorAll(".result-card").length).toBe(0);
    expect(document.querySelector(".results-empty")?.textContent).toMatch(/nothing/i);
  });
});
