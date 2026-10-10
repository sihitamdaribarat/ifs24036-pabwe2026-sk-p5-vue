import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import HomePage from "./HomePage.vue";
import * as aucationApi from "../api/aucationApi";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../api/aucationApi", () => ({
  getAucations: vi.fn(),
  postAucation: vi.fn(),
  deleteAucation: vi.fn(),
  deleteAllAucations: vi.fn(),
}));

const profile = { id: 1, name: "Budi" };
const list = [
  { id: 1, user_id: 1, title: "Kamera Analog", description: "Kamera film klasik", start_bid: 500000, closed_at: "2999-01-01 00:00:00", author: { name: "Budi" }, bids: [] },
  { id: 2, user_id: 2, title: "Gitar Akustik", description: "Suara jernih", start_bid: 800000, closed_at: "2000-01-01 00:00:00", author: { name: "Siti" }, bids: [4] },
];

async function setup(route = "/") {
  aucationApi.getAucations.mockResolvedValue(list);
  return renderWithProviders(HomePage, { route, initialState: { users: { profile } } });
}

const titles = (wrapper) => wrapper.findAll('[data-testid="aucation-card"]').map((card) => card.find("a.line-clamp-1").text());

describe("HomePage", () => {
  it("memuat dan menampilkan semua lelang", async () => {
    const { wrapper } = await setup();
    expect(aucationApi.getAucations).toHaveBeenCalledWith({ isMe: false });
    expect(titles(wrapper)).toEqual(["Kamera Analog", "Gitar Akustik"]);
    expect(wrapper.find('[data-testid="tab-all"]').attributes("aria-selected")).toBe("true");
    expect(wrapper.text()).toContain("Milik Saya");
  });

  it("menampilkan indikator loading selama memuat", async () => {
    aucationApi.getAucations.mockReturnValue(new Promise(() => {}));
    const { wrapper } = await renderWithProviders(HomePage);
    expect(wrapper.find(".animate-spin").exists()).toBe(true);
  });

  it("menampilkan dialog error bila gagal memuat", async () => {
    aucationApi.getAucations.mockRejectedValue(new Error("Server error"));
    const { wrapper } = await renderWithProviders(HomePage);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Server error" }));
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
  });

  it("tab filter berlangsung, ditutup, dan lelang saya", async () => {
    const { wrapper, router } = await setup();

    await wrapper.find('[data-testid="tab-open"]').trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.query.tab).toBe("open");
    expect(titles(wrapper)).toEqual(["Kamera Analog"]);

    await wrapper.find('[data-testid="tab-closed"]').trigger("click");
    await flushPromises();
    expect(titles(wrapper)).toEqual(["Gitar Akustik"]);

    await wrapper.find('[data-testid="tab-mine"]').trigger("click");
    await flushPromises();
    expect(aucationApi.getAucations).toHaveBeenLastCalledWith({ isMe: true });

    await wrapper.find('[data-testid="tab-all"]').trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.query).toEqual({});
  });

  it("mengabaikan tab yang tidak dikenal", async () => {
    const { wrapper } = await setup("/?tab=acak");
    expect(wrapper.find('[data-testid="tab-all"]').attributes("aria-selected")).toBe("true");
  });

  it("live search berdasarkan judul dan deskripsi", async () => {
    const { wrapper } = await setup();
    await wrapper.find('[data-testid="search-input"]').setValue("jernih");
    expect(titles(wrapper)).toEqual(["Gitar Akustik"]);
    await wrapper.find('[data-testid="search-input"]').setValue("KAMERA");
    expect(titles(wrapper)).toEqual(["Kamera Analog"]);
    await wrapper.find('[data-testid="search-input"]').setValue("tidak ada");
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
  });

  it("membuka dan menutup modal tambah lelang lewat query", async () => {
    const { wrapper, router } = await setup();
    await wrapper.find('[data-testid="open-add"]').trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.query.add).toBe("1");
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);

    await wrapper.find('[data-testid="modal-close"]').trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.query.add).toBeUndefined();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it("memuat ulang data setelah lelang baru disimpan", async () => {
    aucationApi.postAucation.mockResolvedValue("OK");
    const { wrapper } = await setup("/?add=1");
    const modal = wrapper.findComponent({ name: "AddModal" });
    modal.vm.$emit("saved");
    await flushPromises();
    expect(aucationApi.getAucations).toHaveBeenCalledTimes(2);
  });

  it("menghapus lelang milik sendiri dari kartu", async () => {
    aucationApi.deleteAucation.mockResolvedValueOnce("Berhasil menghapus data");
    const { wrapper } = await setup();
    await wrapper.find('[data-testid="card-delete"]').trigger("click");
    await flushPromises();
    expect(aucationApi.deleteAucation).toHaveBeenCalledWith(1);
    expect(titles(wrapper)).toEqual(["Gitar Akustik"]);
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Berhasil menghapus data" }));
  });

  it("hapus lelang: batal, gagal, dan pesan default", async () => {
    const { wrapper } = await setup();
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await wrapper.find('[data-testid="card-delete"]').trigger("click");
    await flushPromises();
    expect(aucationApi.deleteAucation).not.toHaveBeenCalled();

    aucationApi.deleteAucation.mockRejectedValueOnce(new Error("Gagal hapus"));
    await wrapper.find('[data-testid="card-delete"]').trigger("click");
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: "error", text: "Gagal hapus" }));

    aucationApi.deleteAucation.mockResolvedValueOnce("");
    await wrapper.find('[data-testid="card-delete"]').trigger("click");
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Lelang berhasil dihapus" }));
  });

  it("hapus semua lelang saya", async () => {
    const { wrapper } = await setup("/?tab=mine");
    const button = () => wrapper.find('[data-testid="delete-all"]');
    expect(button().exists()).toBe(true);

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await button().trigger("click");
    await flushPromises();
    expect(aucationApi.deleteAllAucations).not.toHaveBeenCalled();

    aucationApi.deleteAllAucations.mockRejectedValueOnce(new Error("Unauthenticated."));
    await button().trigger("click");
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: "error", text: "Unauthenticated." }));

    aucationApi.deleteAllAucations.mockResolvedValueOnce("Berhasil menghapus semua data pelelangan");
    await button().trigger("click");
    await flushPromises();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Berhasil menghapus semua data pelelangan" }));

    aucationApi.deleteAllAucations.mockResolvedValueOnce("");
    await button().trigger("click");
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Semua lelang berhasil dihapus" }));
  });

  it("tidak menampilkan tombol hapus semua bila lelang saya kosong", async () => {
    aucationApi.getAucations.mockResolvedValue([]);
    const { wrapper } = await renderWithProviders(HomePage, { route: "/?tab=mine" });
    expect(wrapper.find('[data-testid="delete-all"]').exists()).toBe(false);
  });

  it("memperbarui waktu countdown secara berkala dan membersihkan timer", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    const { wrapper } = await setup();
    vi.advanceTimersByTime(30000);
    wrapper.unmount();
    vi.useRealTimers();
    expect(aucationApi.getAucations).toHaveBeenCalled();
  });
});
