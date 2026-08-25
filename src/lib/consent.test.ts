// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_STORAGE_KEY,
  readConsent,
  writeConsent,
} from "@/lib/consent";

/**
 * Çerez rızası okuma/yazma.
 *
 * Buradaki asıl risk sessiz bir "true": bozuk ya da eksik bir kayıt
 * yanlışlıkla rıza sayılırsa analytics onaysız yüklenir (brief 1.7 —
 * "çerez onayına bağlı çalışacak"). Bu yüzden testlerin çoğu, geçersiz
 * girdide fonksiyonun null dönmesini — yani bandın yeniden gösterilmesini
 * — koruyor.
 */

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("readConsent", () => {
  it("kayıt yokken null döner (bant gösterilir)", () => {
    expect(readConsent()).toBeNull();
  });

  it("geçerli kaydı okur", () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        necessary: true,
        analytics: true,
        decidedAt: "2026-01-01T00:00:00.000Z",
      }),
    );

    expect(readConsent()).toMatchObject({ analytics: true });
  });

  it.each([
    ["bozuk JSON", "{bu json degil"],
    ["analytics eksik", JSON.stringify({ necessary: true })],
    ["analytics string", JSON.stringify({ analytics: "true" })],
    ["analytics null", JSON.stringify({ analytics: null })],
    ["dizi", JSON.stringify([])],
  ])("geçersiz kaydı rıza saymaz: %s", (_ad, raw) => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, raw);
    expect(readConsent()).toBeNull();
  });

  it("localStorage erişimi hata fırlatırsa (gizli sekme) çökmez", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("erişim engellendi");
    });

    expect(readConsent()).toBeNull();
  });
});

describe("writeConsent", () => {
  it("kararı kalıcı yazar ve okunabilir hale getirir", () => {
    const state = writeConsent(true);

    expect(state).toMatchObject({ necessary: true, analytics: true });
    expect(readConsent()).toMatchObject({ analytics: true });
  });

  it("reddi de açıkça kaydeder — 'karar verilmedi' ile karışmamalı", () => {
    writeConsent(false);

    // null olsaydı bant her ziyarette yeniden çıkardı; reddeden kullanıcı
    // için bu yanlış davranış olur.
    expect(readConsent()).toMatchObject({ analytics: false });
  });

  it("decidedAt geçerli bir ISO tarihi olur", () => {
    const { decidedAt } = writeConsent(true);
    expect(Number.isNaN(Date.parse(decidedAt))).toBe(false);
  });

  it("dinleyicilerin haberdar olması için olay yayar", () => {
    const listener = vi.fn();
    window.addEventListener("hibrid360:consent", listener);

    writeConsent(true);

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toMatchObject({ analytics: true });

    window.removeEventListener("hibrid360:consent", listener);
  });

  it("localStorage yazılamıyorsa yine de olay yayar ve durum döner", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("kota dolu");
    });
    const listener = vi.fn();
    window.addEventListener("hibrid360:consent", listener);

    const state = writeConsent(false);

    expect(state).toMatchObject({ analytics: false });
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener("hibrid360:consent", listener);
  });
});
