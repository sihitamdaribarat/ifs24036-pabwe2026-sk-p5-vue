import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import * as aucationApi from "../api/aucationApi";
import { useAucationsStore } from "./aucationsStore";

vi.mock("../api/aucationApi", () => ({
  getAucations: vi.fn(),
  getAucationById: vi.fn(),
  postAucation: vi.fn(),
  putAucation: vi.fn(),
  postAucationCover: vi.fn(),
  deleteAucation: vi.fn(),
  postBid: vi.fn(),
  deleteBid: vi.fn(),
  deleteAllAucations: vi.fn(),
}));

const payload = { title: "A", description: "B", startBid: 1, closedAt: "2026-12-31 00:00:00" };

describe("useAucationsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("getAucations dengan dan tanpa filter", async () => {
    aucationApi.getAucations.mockResolvedValue([{ id: 1 }]);
    const store = useAucationsStore();
    await store.getAucations();
    expect(aucationApi.getAucations).toHaveBeenCalledWith({});
    await store.getAucations({ isMe: true });
    expect(aucationApi.getAucations).toHaveBeenLastCalledWith({ isMe: true });
    expect(store.aucations).toEqual([{ id: 1 }]);
    expect(store.isAucations).toBe(false);
  });

  it("getAucation mengisi lelang aktif", async () => {
    aucationApi.getAucationById.mockResolvedValue({ id: 2 });
    const store = useAucationsStore();
    await store.getAucation(2);
    expect(store.aucation).toEqual({ id: 2 });
    expect(store.isAucation).toBe(false);
  });

  it("getAucation gagal mengembalikan pesan", async () => {
    aucationApi.getAucationById.mockRejectedValue(new Error("Tidak ditemukan"));
    const store = useAucationsStore();
    expect(await store.getAucation(99)).toEqual({ success: false, message: "Tidak ditemukan" });
  });

  it("addAucation, changeAucation, changeCover", async () => {
    aucationApi.postAucation.mockResolvedValue("Dibuat");
    aucationApi.putAucation.mockResolvedValue("Diubah");
    aucationApi.postAucationCover.mockResolvedValue("Cover");
    const store = useAucationsStore();
    const file = new File(["x"], "c.png");

    expect((await store.addAucation(payload)).message).toBe("Dibuat");
    expect(aucationApi.postAucation).toHaveBeenCalledWith(payload);
    expect(store.isAucationAdded).toBe(true);

    expect((await store.changeAucation(1, payload)).message).toBe("Diubah");
    expect(aucationApi.putAucation).toHaveBeenCalledWith(1, payload);
    expect(store.isAucationChanged).toBe(true);

    expect((await store.changeCover(1, file)).message).toBe("Cover");
    expect(aucationApi.postAucationCover).toHaveBeenCalledWith(1, file);
    expect(store.isAucationChangedCover).toBe(true);
  });

  it("deleteAucation menghapus dari koleksi dan lelang aktif", async () => {
    aucationApi.deleteAucation.mockResolvedValue("Dihapus");
    const store = useAucationsStore();
    store.aucations = [{ id: 1 }, { id: 2 }];
    store.aucation = { id: 1 };

    await store.deleteAucation(1);
    expect(store.aucations).toEqual([{ id: 2 }]);
    expect(store.aucation).toBeNull();
    expect(store.isAucationDeleted).toBe(true);

    store.aucation = { id: 2 };
    await store.deleteAucation(3);
    expect(store.aucation).toEqual({ id: 2 });

    store.aucation = null;
    await store.deleteAucation(2);
    expect(store.aucations).toEqual([]);
  });

  it("addBid, deleteBid, deleteAllAucations", async () => {
    aucationApi.postBid.mockResolvedValue("Bid");
    aucationApi.deleteBid.mockResolvedValue("Batal");
    aucationApi.deleteAllAucations.mockResolvedValue("Semua");
    const store = useAucationsStore();

    expect((await store.addBid(1, 5000)).message).toBe("Bid");
    expect(aucationApi.postBid).toHaveBeenCalledWith(1, 5000);
    expect(store.isBidAdded).toBe(true);

    expect((await store.deleteBid(1)).message).toBe("Batal");
    expect(aucationApi.deleteBid).toHaveBeenCalledWith(1);
    expect(store.isBidDeleted).toBe(true);

    expect((await store.deleteAllAucations()).message).toBe("Semua");
    expect(store.isAucationDeletedAll).toBe(true);
  });
});
