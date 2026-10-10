import { describe, expect, it } from "vitest";
import Swal from "sweetalert2";
import {
  formatCountdown,
  formatDate,
  formatRupiah,
  getHighestBid,
  isClosed,
  parseDate,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  toApiDateTime,
  toDateTimeLocal,
} from "./toolsHelper";

describe("toolsHelper", () => {
  describe("dialog", () => {
    it("showSuccessDialog memanggil Swal dengan icon success", async () => {
      await showSuccessDialog("Tersimpan");
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", title: "Berhasil", text: "Tersimpan" }));
    });

    it("showSuccessDialog menerima judul kustom", async () => {
      await showSuccessDialog("Ok", "Mantap");
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: "Mantap" }));
    });

    it("showErrorDialog memanggil Swal dengan icon error", async () => {
      await showErrorDialog("Oops");
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", title: "Gagal", text: "Oops" }));
      await showErrorDialog("Oops", "Error");
      expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ title: "Error" }));
    });

    it("showConfirmDialog mengembalikan status konfirmasi", async () => {
      expect(await showConfirmDialog("Yakin?")).toBe(true);
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "warning", showCancelButton: true, title: "Apakah kamu yakin?", confirmButtonText: "Ya, lanjutkan" }),
      );

      Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
      expect(await showConfirmDialog("Yakin?", "Hapus?", "Hapus")).toBe(false);
      expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ title: "Hapus?", confirmButtonText: "Hapus" }));
    });
  });

  describe("formatRupiah", () => {
    it("memformat angka ke rupiah", () => {
      expect(formatRupiah(150000).replace(/\s/g, " ")).toMatch(/Rp\s?150\.000/);
    });

    it("menganggap nilai tidak valid sebagai 0", () => {
      expect(formatRupiah("abc")).toMatch(/Rp\s?0/);
    });
  });

  describe("tanggal", () => {
    it("parseDate menerima format API dan ISO", () => {
      expect(parseDate("2026-01-02 03:04:05").getFullYear()).toBe(2026);
      expect(parseDate("2026-01-02T03:04:05.000000Z")).toBeInstanceOf(Date);
    });

    it("parseDate mengembalikan null untuk nilai kosong atau tidak valid", () => {
      expect(parseDate("")).toBeNull();
      expect(parseDate(null)).toBeNull();
      expect(parseDate("bukan tanggal")).toBeNull();
    });

    it("formatDate memformat tanggal valid dan '-' untuk tidak valid", () => {
      expect(formatDate("2026-01-02 03:04:05")).toContain("2026");
      expect(formatDate(undefined)).toBe("-");
    });

    it("toDateTimeLocal dan toApiDateTime", () => {
      expect(toDateTimeLocal("2026-01-02 03:04:05")).toBe("2026-01-02T03:04");
      expect(toDateTimeLocal("")).toBe("");
      expect(toApiDateTime("2026-01-02T03:04")).toBe("2026-01-02 03:04:00");
      expect(toApiDateTime("x")).toBe("");
    });

    it("isClosed membandingkan dengan waktu sekarang", () => {
      const now = new Date("2026-01-01T00:00:00").getTime();
      expect(isClosed("2025-12-31 23:00:00", now)).toBe(true);
      expect(isClosed("2026-01-02 00:00:00", now)).toBe(false);
      expect(isClosed(null, now)).toBe(true);
      expect(isClosed("2999-01-01 00:00:00")).toBe(false);
    });

    it("formatCountdown menampilkan sisa waktu", () => {
      const now = new Date("2026-01-01T00:00:00").getTime();
      expect(formatCountdown("2026-01-03 05:00:00", now)).toBe("2h 5j lagi");
      expect(formatCountdown("2026-01-01 03:20:00", now)).toBe("3j 20m lagi");
      expect(formatCountdown("2026-01-01 00:15:00", now)).toBe("15m lagi");
      expect(formatCountdown("2025-01-01 00:00:00", now)).toBe("Ditutup");
      expect(formatCountdown(null, now)).toBe("Ditutup");
      expect(formatCountdown("2000-01-01 00:00:00")).toBe("Ditutup");
    });
  });

  describe("getHighestBid", () => {
    it("mengembalikan tawaran tertinggi dari objek bid", () => {
      expect(getHighestBid([{ bid: 1000 }, { bid: 5000 }, { bid: "3000" }])).toBe(5000);
    });

    it("mengembalikan null bila tidak ada bid objek", () => {
      expect(getHighestBid([1, 2])).toBeNull();
      expect(getHighestBid([])).toBeNull();
      expect(getHighestBid(undefined)).toBeNull();
      expect(getHighestBid([null])).toBeNull();
    });
  });
});
