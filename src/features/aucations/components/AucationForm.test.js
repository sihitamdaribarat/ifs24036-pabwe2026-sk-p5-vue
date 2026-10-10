import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Editor from "@toast-ui/editor";
import AucationForm from "./AucationForm.vue";
import { toAucationPayload, validateAucationForm } from "../utils/aucationForm";

describe("validateAucationForm", () => {
  const now = new Date("2026-01-01T00:00:00").getTime();
  const valid = { title: "Kamera", description: "Mulus", startBid: "1000", closedAt: "2026-02-01T10:00" };

  it("valid tanpa error", () => {
    expect(validateAucationForm(valid, { now })).toEqual({});
  });

  it("mengembalikan error untuk semua field", () => {
    expect(validateAucationForm({ title: " a ", description: " ", startBid: "0", closedAt: "" }, { now })).toEqual({
      title: "Judul minimal 3 karakter",
      description: "Deskripsi wajib diisi",
      startBid: "Harga awal harus lebih dari 0",
      closedAt: "Batas waktu wajib diisi",
    });
  });

  it("memeriksa batas waktu di masa depan bila diminta", () => {
    const past = { ...valid, closedAt: "2025-01-01T10:00" };
    expect(validateAucationForm(past, { now }).closedAt).toBe("Batas waktu harus di masa depan");
    expect(validateAucationForm(past, { now, requireFuture: false })).toEqual({});
    expect(validateAucationForm({ ...valid, closedAt: "2999-01-01T10:00" })).toEqual({});
  });

  it("toAucationPayload mengonversi nilai form", () => {
    expect(toAucationPayload({ ...valid, title: " Kamera " })).toEqual({
      title: "Kamera",
      description: "Mulus",
      startBid: 1000,
      closedAt: "2026-02-01 10:00:00",
    });
  });
});

describe("AucationForm", () => {
  it("menampilkan error validasi dan tidak emit submit", async () => {
    const wrapper = mount(AucationForm);
    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("Judul minimal 3 karakter");
    expect(wrapper.text()).toContain("Deskripsi wajib diisi");
    expect(wrapper.text()).toContain("Harga awal harus lebih dari 0");
    expect(wrapper.text()).toContain("Batas waktu wajib diisi");
    expect(wrapper.emitted("submit")).toBeUndefined();
  });

  it("emit submit dengan nilai form yang valid", async () => {
    const wrapper = mount(AucationForm, { props: { submitLabel: "Buat" } });
    await wrapper.find("#aucation-title").setValue("Kamera Analog");
    Editor.instances.at(-1).type("Deskripsi **lengkap**");
    await wrapper.find("#aucation-start-bid").setValue("250000");
    await wrapper.find("#aucation-closed-at").setValue("2999-01-01T12:00");
    await wrapper.find("form").trigger("submit");

    expect(wrapper.emitted("submit")[0][0]).toEqual({
      title: "Kamera Analog",
      description: "Deskripsi **lengkap**",
      startBid: 250000,
      closedAt: "2999-01-01T12:00",
    });
    expect(wrapper.find('button[type="submit"]').text()).toBe("Buat");
  });

  it("menggunakan nilai awal, status submitting, dan emit cancel", async () => {
    const initial = { title: "Lama", description: "Desk", startBid: 100, closedAt: "2000-01-01T00:00" };
    const wrapper = mount(AucationForm, { props: { initial, submitting: true, requireFuture: false } });
    expect(wrapper.find("#aucation-title").element.value).toBe("Lama");
    expect(wrapper.find('button[type="submit"]').attributes("disabled")).toBeDefined();
    expect(wrapper.find(".animate-spin").exists()).toBe(true);

    await wrapper.find("form").trigger("submit");
    expect(wrapper.emitted("submit")).toHaveLength(1);

    await wrapper.find('button[type="button"]').trigger("click");
    expect(wrapper.emitted("cancel")).toHaveLength(1);
  });
});
