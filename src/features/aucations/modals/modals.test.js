import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import Editor from "@toast-ui/editor";
import AddModal from "./AddModal.vue";
import ChangeModal from "./ChangeModal.vue";
import ChangeCoverModal from "./ChangeCoverModal.vue";
import BidModal from "./BidModal.vue";
import * as aucationApi from "../api/aucationApi";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../api/aucationApi", () => ({
  postAucation: vi.fn(),
  putAucation: vi.fn(),
  postAucationCover: vi.fn(),
  postBid: vi.fn(),
}));

const aucation = {
  id: 5,
  user_id: 1,
  title: "Jam Tangan",
  description: "Original",
  cover: null,
  start_bid: 100000,
  closed_at: "2999-01-01 10:00:00",
  bids: [],
};

async function fillForm(wrapper) {
  await wrapper.find("#aucation-title").setValue("Jam Tangan Baru");
  // MarkdownEditor dimuat async; tunggu hingga ter-render.
  await vi.waitFor(() => expect(wrapper.find('[data-testid="markdown-editor"]').exists()).toBe(true));
  Editor.instances.at(-1).type("Deskripsi baru");
  await wrapper.find("#aucation-start-bid").setValue("150000");
  await wrapper.find("#aucation-closed-at").setValue("2999-02-01T09:30");
}

describe("AddModal", () => {
  it("tidak tampil ketika tertutup", async () => {
    const { wrapper } = await renderWithProviders(AddModal, { props: { open: false } });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it("membuat lelang baru lalu emit saved dan close", async () => {
    aucationApi.postAucation.mockResolvedValue("Berhasil menambahkan data");
    const { wrapper } = await renderWithProviders(AddModal, { props: { open: true } });
    await fillForm(wrapper);
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(aucationApi.postAucation).toHaveBeenCalledWith({
      title: "Jam Tangan Baru",
      description: "Deskripsi baru",
      startBid: 150000,
      closedAt: "2999-02-01 09:30:00",
    });
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Berhasil menambahkan data" }));
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("menggunakan pesan default dan menangani error", async () => {
    aucationApi.postAucation.mockResolvedValueOnce("").mockRejectedValueOnce(new Error("Gagal simpan"));
    const { wrapper } = await renderWithProviders(AddModal, { props: { open: true } });
    await fillForm(wrapper);
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Lelang berhasil dibuat" }));

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: "error", text: "Gagal simpan" }));
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("emit close dari tombol batal dan tombol tutup", async () => {
    const { wrapper } = await renderWithProviders(AddModal, { props: { open: true } });
    await wrapper.find("form button[type='button']").trigger("click");
    await wrapper.find('[data-testid="modal-close"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});

describe("ChangeModal", () => {
  it("terisi data lelang dan menyimpan perubahan", async () => {
    aucationApi.putAucation.mockResolvedValue("Berhasil mengubah data");
    const { wrapper } = await renderWithProviders(ChangeModal, { props: { open: true, aucation } });
    expect(wrapper.find("#aucation-title").element.value).toBe("Jam Tangan");
    expect(wrapper.find("#aucation-closed-at").element.value).toBe("2999-01-01T10:00");

    await wrapper.find("#aucation-title").setValue("Jam Tangan Edit");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(aucationApi.putAucation).toHaveBeenCalledWith(5, {
      title: "Jam Tangan Edit",
      description: "Original",
      startBid: 100000,
      closedAt: "2999-01-01 10:00:00",
    });
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("menggunakan pesan default, menangani error, dan dapat ditutup", async () => {
    aucationApi.putAucation.mockResolvedValueOnce("").mockRejectedValueOnce(new Error("Tidak boleh"));
    const { wrapper } = await renderWithProviders(ChangeModal, { props: { open: true, aucation } });
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Lelang berhasil diperbarui" }));

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: "error", text: "Tidak boleh" }));

    await wrapper.find("form button[type='button']").trigger("click");
    await wrapper.find('[data-testid="modal-close"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(3);
  });
});

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
  });

  async function selectFile(wrapper, file) {
    const input = wrapper.find("#cover-input");
    Object.defineProperty(input.element, "files", { value: file ? [file] : [], configurable: true });
    await input.trigger("change");
  }

  it("menampilkan placeholder atau cover lama", async () => {
    const { wrapper } = await renderWithProviders(ChangeCoverModal, { props: { open: true, aucation } });
    expect(wrapper.text()).toContain("Klik untuk memilih gambar");

    await wrapper.setProps({ aucation: { ...aucation, cover: "https://img/old.jpg" } });
    expect(wrapper.find('[data-testid="cover-preview"]').attributes("src")).toBe("https://img/old.jpg");
  });

  it("memvalidasi berkas kosong, bukan gambar, dan terlalu besar", async () => {
    const { wrapper } = await renderWithProviders(ChangeCoverModal, { props: { open: true, aucation } });

    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("Pilih gambar terlebih dahulu");

    await selectFile(wrapper, new File(["x"], "a.txt", { type: "text/plain" }));
    expect(wrapper.text()).toContain("Berkas harus berupa gambar");

    const big = new File(["x"], "big.png", { type: "image/png" });
    Object.defineProperty(big, "size", { value: 3 * 1024 * 1024 });
    await selectFile(wrapper, big);
    expect(wrapper.text()).toContain("Ukuran gambar maksimal 2 MB");

    await selectFile(wrapper, null);
    expect(wrapper.text()).not.toContain("Ukuran gambar maksimal 2 MB");
  });

  it("mengunggah cover dengan pratinjau live", async () => {
    aucationApi.postAucationCover.mockResolvedValue("Berhasil mengubah cover");
    const { wrapper } = await renderWithProviders(ChangeCoverModal, { props: { open: true, aucation } });
    const file = new File(["img"], "cover.png", { type: "image/png" });

    await selectFile(wrapper, file);
    expect(wrapper.find('[data-testid="cover-preview"]').attributes("src")).toBe("blob:preview");

    await selectFile(wrapper, file);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(aucationApi.postAucationCover).toHaveBeenCalledWith(5, file);
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("menangani error unggah, pesan default, reset saat ditutup", async () => {
    aucationApi.postAucationCover.mockRejectedValueOnce(new Error("Terlalu besar")).mockResolvedValueOnce("");
    const { wrapper } = await renderWithProviders(ChangeCoverModal, { props: { open: true, aucation } });
    await selectFile(wrapper, new File(["img"], "cover.png", { type: "image/png" }));

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Terlalu besar" }));

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Cover berhasil diperbarui" }));

    await wrapper.find("form button[type='button']").trigger("click");
    await wrapper.find('[data-testid="modal-close"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(3);

    await wrapper.setProps({ open: false });
    expect(URL.revokeObjectURL).toHaveBeenCalled();
    await wrapper.setProps({ open: true });
    expect(wrapper.text()).toContain("Klik untuk memilih gambar");
  });
});

describe("BidModal", () => {
  it("validasi minimal harga awal ketika belum ada tawaran", async () => {
    const { wrapper } = await renderWithProviders(BidModal, { props: { open: true, aucation } });
    expect(wrapper.find('[data-testid="bid-highest"]').text()).toBe("Belum ada");
    expect(wrapper.text()).toContain("(harga awal)");

    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("Nominal tawaran wajib diisi");

    await wrapper.find("#bid-amount").setValue("50000");
    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("Tawaran tidak boleh kurang dari harga awal");
    expect(aucationApi.postBid).not.toHaveBeenCalled();
  });

  it("validasi harus lebih tinggi dari tawaran tertinggi", async () => {
    const withBids = { ...aucation, bids: [{ id: 1, bid: 200000 }] };
    const { wrapper } = await renderWithProviders(BidModal, { props: { open: true, aucation: withBids } });
    expect(wrapper.find('[data-testid="bid-highest"]').text()).toMatch(/200\.000/);
    expect(wrapper.text()).toContain("(tawaran tertinggi)");

    await wrapper.find("#bid-amount").setValue("200000");
    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("Tawaran harus lebih tinggi dari tawaran tertinggi saat ini");
  });

  it("mengajukan tawaran yang valid", async () => {
    aucationApi.postBid.mockResolvedValue("Berhasil memberikan tawaran");
    const { wrapper } = await renderWithProviders(BidModal, { props: { open: true, aucation } });
    await wrapper.find("#bid-amount").setValue("120000");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(aucationApi.postBid).toHaveBeenCalledWith(5, 120000);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Berhasil memberikan tawaran" }));
    expect(wrapper.find("#bid-amount").element.value).toBe("");
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("menangani error, pesan default, dan tombol batal", async () => {
    aucationApi.postBid.mockRejectedValueOnce(new Error("Lelang ditutup")).mockResolvedValueOnce("");
    const { wrapper } = await renderWithProviders(BidModal, { props: { open: true, aucation } });
    await wrapper.find("#bid-amount").setValue("120000");

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Lelang ditutup" }));

    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Tawaran berhasil diajukan" }));

    await wrapper.find("form button[type='button']").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});
