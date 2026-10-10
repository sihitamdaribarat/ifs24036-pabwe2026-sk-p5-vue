import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACCESS_TOKEN_KEY,
  BASE_URL,
  buildUrl,
  fetchApi,
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper";

function mockFetch(body, { ok = true, status = 200, invalidJson = false } = {}) {
  const json = invalidJson ? vi.fn().mockRejectedValue(new Error("bad json")) : vi.fn().mockResolvedValue(body);
  globalThis.fetch = vi.fn().mockResolvedValue({ ok, status, json });
  return globalThis.fetch;
}

describe("apiHelper", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("token storage", () => {
    it("menyimpan, mengambil, dan menghapus token di localStorage", () => {
      expect(getAccessToken()).toBeNull();
      putAccessToken("abc");
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe("abc");
      expect(getAccessToken()).toBe("abc");
      removeAccessToken();
      expect(getAccessToken()).toBeNull();
    });
  });

  describe("buildUrl", () => {
    it("menggabungkan base url dan path", () => {
      expect(buildUrl("/aucations")).toBe(`${BASE_URL}/aucations`);
    });

    it("menambahkan query params dan mengabaikan nilai kosong", () => {
      const url = buildUrl("/aucations", { is_me: 1, is_closed: 0, a: undefined, b: null, c: "" });
      expect(url).toBe(`${BASE_URL}/aucations?is_me=1&is_closed=0`);
    });
  });

  describe("fetchApi", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("melakukan GET tanpa token dan body", async () => {
      const fetchMock = mockFetch({ status: "success", data: { ok: true } });
      const result = await fetchApi("/users", { params: { q: "x" } });

      expect(result.data.ok).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/users?q=x`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
    });

    it("menggunakan opsi default ketika options tidak diberikan", async () => {
      const fetchMock = mockFetch({ status: "success" });
      await fetchApi("/users");
      expect(fetchMock.mock.calls[0][1].method).toBe("GET");
    });

    it("mengirim body JSON beserta Authorization header", async () => {
      putAccessToken("token-123");
      const fetchMock = mockFetch({ status: "success" });
      await fetchApi("/aucations", { method: "POST", body: { title: "A" } });

      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/aucations`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer token-123",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "A" }),
      });
    });

    it("mengirim FormData apa adanya tanpa Content-Type", async () => {
      const fetchMock = mockFetch({ status: "success" });
      const form = new FormData();
      form.append("cover", "file");
      await fetchApi("/aucations/1/cover", { method: "POST", body: form });

      const init = fetchMock.mock.calls[0][1];
      expect(init.body).toBe(form);
      expect(init.headers["Content-Type"]).toBeUndefined();
    });

    it("melempar error dengan pesan dan daftar field validasi", async () => {
      mockFetch({ status: "fail", message: "Data tidak valid", data: { field: ["Judul wajib"] } }, { ok: false, status: 422 });
      await expect(fetchApi("/aucations")).rejects.toMatchObject({
        message: "Data tidak valid: Judul wajib",
        status: 422,
      });
    });

    it("melempar error tanpa field ketika daftar field kosong", async () => {
      mockFetch({ status: "fail", message: "Gagal", data: { field: [] } });
      await expect(fetchApi("/aucations")).rejects.toThrow("Gagal");
    });

    it("menggunakan pesan default ketika response tidak dapat di-parse", async () => {
      mockFetch(null, { ok: false, status: 500, invalidJson: true });
      await expect(fetchApi("/aucations")).rejects.toThrow("Request gagal (500)");
    });
  });
});
