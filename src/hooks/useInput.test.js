import { describe, expect, it } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import useInputDefault, { useInput } from "./useInput";

describe("useInput", () => {
  it("menggunakan nilai default", () => {
    const [value] = useInput("awal");
    expect(value.value).toBe("awal");
    const [empty] = useInput();
    expect(empty.value).toBe("");
  });

  it("onChange memperbarui nilai dari event input", () => {
    const [value, onChange] = useInput();
    onChange({ target: { value: "baru" } });
    expect(value.value).toBe("baru");
  });

  it("setValue mengubah nilai atau mengembalikan ke default", () => {
    const [value, , setValue] = useInputDefault("x");
    setValue("y");
    expect(value.value).toBe("y");
    setValue();
    expect(value.value).toBe("x");
  });

  it("mendukung two-way binding pada komponen", async () => {
    const Comp = defineComponent({
      setup() {
        const [text, onChange] = useInput("halo");
        return () => h("div", [h("input", { value: text.value, onInput: onChange }), h("span", text.value)]);
      },
    });
    const wrapper = mount(Comp);
    await wrapper.find("input").setValue("dunia");
    await nextTick();
    expect(wrapper.find("span").text()).toBe("dunia");
  });
});
