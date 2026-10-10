import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import DetailPage from "./DetailPage.vue";
import * as aucationApi from "../api/aucationApi";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../api/aucationApi", () => ({
  getAucationById: vi.fn(),
  putAucation: vi.fn(),
  postAucationCover: vi.fn(),
  deleteAucation: vi.fn(),
  postBid: vi.fn(),
  deleteBid: vi.fn(),
}));

const profile = { id: 1, name: "Budi" };
const base = {
  id: 9,
  user_id: 2,
  title: "Laptop Gaming",
  description: "**Spesifikasi** tinggi",
  cover: "https://img/laptop.jpg",
  start_bid: 5000000,
  closed_at: "2999-01-01 00:00:00",
  author: { name: "Siti", photo: "https://img/siti.png" },
  bids: [
    { id: 1, bid: 5500000, created_at: "2026-01-01T00:00:00Z" },
    { id: 2, bid: 6000000, created_at: "2026-01-02T00:00:00Z" },
  ],
  my_bid: { id: 1, bid: 5500000 },
};

async function setup(aucation = base, route = "/aucations/9") {
  aucationApi.getAucationById.mockResolvedValue(aucation);
  return renderWithProviders(DetailPage, { route, initialState: { users: { profile } } });
}

describe("DetailPage", () => {
  it("menampilkan loading sebelum data tersedia", async () => {
    aucationApi.getAucationById.mockReturnValue(new Promise(() => {}));
    const { wrapper } = await renderWithProviders(DetailPage, { route: "/aucations/9" });
    expect(wrapper.find(".animate-spin").exists()).toBe(true);
  });

  it("menampilkan pesan error bila gagal memuat", async () => {
    aucationApi.getAucationById.mockRejectedValue(new Error("Data tidak ditemukan"));
    const { wrapper } = await renderWithProviders(DetailPage, { route: "/aucations/9" });
    expect(wrapper.find('[data-testid="detail-error"]').text()).toContain("Data tidak ditemukan");
  });

  it("menampilkan detail lelang untuk peserta", async () => {
    const { wrapper } = await setup();
    expect(aucationApi.getAucationById).toHaveBeenCalledWith(9);
    expect(wrapper.find('[data-testid="detail-cover"]').attributes("src")).toBe(base.cover);
    expect(wrapper.text()).toContain("Laptop Gaming");
    expect(wrapper.text()).toContain("Lelang Berlangsung");
    expect(wrapper.text()).toContain("oleh Siti");
    expect(wrapper.find('[data-testid="detail-highest"]').text()).toMatch(/6\.000\.000/);
    expect(wrapper.find('[data-testid="my-bid"]').text()).toMatch(/5\.500\.000/);

    const bids = wrapper.findAll('[data-testid="bid-item"]');
    expect(bids).toHaveLength(2);
    expect(bids[0].text()).toMatch(/6\.000\.000/);
    expect(bids[1].text()).toContain("Tawaran Anda");
    expect(wrapper.find('[data-testid="bidder-actions"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="owner-actions"]').exists()).toBe(false);
  });

  it("menampilkan fallback ketika data opsional kosong dan lelang ditutup", async () => {
    const { wrapper } = await setup({
      ...base,
      cover: null,
      author: null,
      bids: undefined,
      my_bid: undefined,
      closed_at: "2000-01-01 00:00:00",
    });
    expect(wrapper.text()).toContain("Belum ada cover");
    expect(wrapper.text()).toContain("oleh Pengguna");
    expect(wrapper.text()).toContain("Lelang Ditutup");
    expect(wrapper.find('[data-testid="detail-highest"]').text()).toBe("Belum ada");
    expect(wrapper.find('[data-testid="no-bids"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="my-bid"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="bidder-actions"]').exists()).toBe(false);
  });

  it("peserta tanpa tawaran tidak melihat tombol batalkan", async () => {
    const { wrapper } = await setup({ ...base, my_bid: null });
    expect(wrapper.find('[data-testid="open-bid"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="cancel-bid"]').exists()).toBe(false);
  });

  it("membuka modal bid dan memuat ulang setelah tersimpan", async () => {
    const { wrapper } = await setup();
    await wrapper.find('[data-testid="open-bid"]').trigger("click");
    expect(wrapper.find('[role="dialog"]').attributes("aria-label")).toBe("Ajukan Tawaran");

    wrapper.findComponent({ name: "BidModal" }).vm.$emit("saved");
    await flushPromises();
    expect(aucationApi.getAucationById).toHaveBeenCalledTimes(2);

    await wrapper.find('[data-testid="modal-close"]').trigger("click");
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it("membatalkan tawaran: batal, gagal, berhasil, pesan default", async () => {
    const { wrapper } = await setup();
    const cancel = () => wrapper.find('[data-testid="cancel-bid"]').trigger("click");

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await cancel();
    await flushPromises();
    expect(aucationApi.deleteBid).not.toHaveBeenCalled();

    aucationApi.deleteBid.mockRejectedValueOnce(new Error("Tidak bisa"));
    await cancel();
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: "error", text: "Tidak bisa" }));

    aucationApi.deleteBid.mockResolvedValueOnce("Berhasil menghapus tawaran pada lelang");
    await cancel();
    await flushPromises();
    expect(aucationApi.deleteBid).toHaveBeenCalledWith(9);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Berhasil menghapus tawaran pada lelang" }));

    aucationApi.deleteBid.mockResolvedValueOnce("");
    await cancel();
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Tawaran berhasil dibatalkan" }));
  });

  describe("sebagai pemilik", () => {
    const own = { ...base, user_id: 1, my_bid: null };

    it("menampilkan aksi pemilik dan membuka modal ubah & cover", async () => {
      const { wrapper } = await setup(own);
      expect(wrapper.find('[data-testid="owner-actions"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="bidder-actions"]').exists()).toBe(false);

      await wrapper.find('[data-testid="open-change"]').trigger("click");
      expect(wrapper.find('[role="dialog"]').attributes("aria-label")).toBe("Ubah Lelang");
      wrapper.findComponent({ name: "ChangeModal" }).vm.$emit("close");
      await flushPromises();

      await wrapper.find('[data-testid="open-cover"]').trigger("click");
      expect(wrapper.find('[role="dialog"]').attributes("aria-label")).toBe("Ganti Cover");
      wrapper.findComponent({ name: "ChangeCoverModal" }).vm.$emit("saved");
      wrapper.findComponent({ name: "ChangeCoverModal" }).vm.$emit("close");
      wrapper.findComponent({ name: "ChangeModal" }).vm.$emit("saved");
      await flushPromises();
      expect(aucationApi.getAucationById).toHaveBeenCalledTimes(3);
    });

    it("menghapus lelang lalu kembali ke beranda", async () => {
      const { wrapper, router } = await setup(own);
      const remove = () => wrapper.find('[data-testid="delete-aucation"]').trigger("click");

      Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
      await remove();
      await flushPromises();
      expect(aucationApi.deleteAucation).not.toHaveBeenCalled();

      aucationApi.deleteAucation.mockRejectedValueOnce(new Error("Gagal"));
      await remove();
      await flushPromises();
      expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: "error", text: "Gagal" }));

      aucationApi.deleteAucation.mockResolvedValueOnce("Berhasil menghapus data");
      await remove();
      await flushPromises();
      expect(aucationApi.deleteAucation).toHaveBeenCalledWith(9);
      expect(router.currentRoute.value.name).toBe("home");
    });

    it("menggunakan pesan default ketika hapus berhasil tanpa pesan", async () => {
      aucationApi.deleteAucation.mockResolvedValueOnce("");
      const { wrapper } = await setup(own);
      await wrapper.find('[data-testid="delete-aucation"]').trigger("click");
      await flushPromises();
      expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Lelang berhasil dihapus" }));
    });
  });

  it("memuat ulang ketika parameter rute berubah dan memperbarui countdown", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const { wrapper, router } = await setup();
    aucationApi.getAucationById.mockResolvedValue({ ...base, id: 10 });
    await router.push("/aucations/10");
    await flushPromises();
    expect(aucationApi.getAucationById).toHaveBeenLastCalledWith(10);
    vi.advanceTimersByTime(30000);
    wrapper.unmount();
    vi.useRealTimers();
  });
});
