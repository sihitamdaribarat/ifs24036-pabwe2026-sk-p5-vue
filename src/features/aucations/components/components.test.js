import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Editor from "@toast-ui/editor";
import Viewer from "@toast-ui/editor/dist/toastui-editor-viewer";
import BaseModal from "./BaseModal.vue";
import MarkdownEditor from "./MarkdownEditor.vue";
import MarkdownViewer from "./MarkdownViewer.vue";
import AucationCard from "./AucationCard.vue";
import { renderWithProviders } from "../../../test-utils";

const lastEditor = () => Editor.instances.at(-1);
const lastViewer = () => Viewer.instances.at(-1);

describe("BaseModal", () => {
  it("tidak dirender ketika tertutup", () => {
    const wrapper = mount(BaseModal, { props: { open: false, title: "Judul" } });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it("menampilkan judul, deskripsi, slot dan emit close", async () => {
    const wrapper = mount(BaseModal, {
      props: { open: true, title: "Judul", description: "Deskripsi" },
      slots: { default: "<p>Isi modal</p>" },
    });
    expect(wrapper.text()).toContain("Judul");
    expect(wrapper.text()).toContain("Deskripsi");
    expect(wrapper.text()).toContain("Isi modal");

    await wrapper.find('[data-testid="modal-close"]').trigger("click");
    await wrapper.find('[data-testid="modal-backdrop"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });

  it("tidak menampilkan deskripsi bila kosong", () => {
    const wrapper = mount(BaseModal, { props: { open: true, title: "Judul" } });
    expect(wrapper.findAll("p")).toHaveLength(0);
  });
});

describe("MarkdownEditor", () => {
  it("membuat editor dengan nilai awal dan emit perubahan", async () => {
    const wrapper = mount(MarkdownEditor, { props: { modelValue: "# Halo" } });
    const editor = lastEditor();
    expect(editor.options.el).toBe(wrapper.find('[data-testid="markdown-editor"]').element);
    expect(editor.options.initialValue).toBe("# Halo");
    expect(editor.options.height).toBe("260px");

    editor.type("**tebal**");
    expect(wrapper.emitted("update:modelValue")[0]).toEqual(["**tebal**"]);
  });

  it("sinkron ketika modelValue berubah dari luar dan dihancurkan saat unmount", async () => {
    const wrapper = mount(MarkdownEditor, { props: { modelValue: "a" } });
    const editor = lastEditor();

    await wrapper.setProps({ modelValue: "b" });
    expect(editor.getMarkdown()).toBe("b");

    editor.type("c");
    await wrapper.setProps({ modelValue: "c" });
    expect(editor.getMarkdown()).toBe("c");

    wrapper.unmount();
    expect(editor.destroy).toHaveBeenCalled();
  });
});

describe("MarkdownViewer", () => {
  it("merender konten, memperbarui, dan dihancurkan saat unmount", async () => {
    const wrapper = mount(MarkdownViewer, { props: { content: "Isi" } });
    const viewer = lastViewer();
    expect(viewer.options.initialValue).toBe("Isi");

    await wrapper.setProps({ content: "Baru" });
    expect(viewer.setMarkdown).toHaveBeenCalledWith("Baru");

    wrapper.unmount();
    expect(viewer.destroy).toHaveBeenCalled();
  });

  it("menggunakan konten kosong secara default", () => {
    mount(MarkdownViewer);
    expect(lastViewer().options.initialValue).toBe("");
  });
});

describe("AucationCard", () => {
  const now = new Date("2026-06-01T00:00:00").getTime();
  const base = {
    id: 7,
    user_id: 1,
    title: "Sepeda Lipat",
    description: "Bagus",
    cover: "https://img/cover.jpg",
    start_bid: 1000000,
    closed_at: "2026-06-03 00:00:00",
    author: { name: "Andi" },
    bids: [{ id: 1, bid: 1500000 }],
  };

  async function renderCard(props) {
    return renderWithProviders(AucationCard, { props: { aucation: base, now, ...props } });
  }

  it("menampilkan informasi lelang yang sedang berlangsung", async () => {
    const { wrapper } = await renderCard();
    expect(wrapper.find("img").attributes("src")).toBe(base.cover);
    expect(wrapper.text()).toContain("Sepeda Lipat");
    expect(wrapper.text()).toContain("oleh Andi");
    expect(wrapper.text()).toContain("2h 0j lagi");
    expect(wrapper.text()).toMatch(/1\.500\.000/);
    expect(wrapper.text()).toContain("1 penawaran");
    expect(wrapper.text()).toContain("Tawar");
    expect(wrapper.find('[data-testid="card-delete"]').exists()).toBe(false);
  });

  it("menampilkan placeholder, status ditutup, dan fallback data", async () => {
    const { wrapper } = await renderCard({
      aucation: { ...base, cover: null, closed_at: "2026-05-01 00:00:00", author: null, bids: undefined },
    });
    expect(wrapper.text()).toContain("Belum ada cover");
    expect(wrapper.text()).toContain("Ditutup");
    expect(wrapper.text()).toContain("oleh Pengguna");
    expect(wrapper.text()).toContain("0 penawaran");
    expect(wrapper.text()).toContain("Lihat Detail");
  });

  it("pemilik dapat menghapus lelang", async () => {
    const { wrapper } = await renderCard({ isOwner: true, aucation: { ...base, bids: [3] } });
    expect(wrapper.text()).toContain("Milik Saya");
    expect(wrapper.text()).toContain("Lihat Detail");
    await wrapper.find('[data-testid="card-delete"]').trigger("click");
    expect(wrapper.emitted("delete")[0][0].id).toBe(7);
  });
});
