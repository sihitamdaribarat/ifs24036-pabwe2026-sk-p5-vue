import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { enableAutoUnmount } from "@vue/test-utils";

enableAutoUnmount(afterEach);

// SweetAlert2 tidak perlu dirender di jsdom; cukup dicatat pemanggilannya.
vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn(() => Promise.resolve({ isConfirmed: true })) },
}));

// @toast-ui/editor diganti implementasi ringan agar komponen markdown dapat diuji.
vi.mock("@toast-ui/editor", () => {
  class Editor {
    static instances = [];
    constructor(options) {
      this.options = options;
      this.markdown = options.initialValue ?? "";
      this.destroy = vi.fn();
      Editor.instances.push(this);
    }
    getMarkdown() {
      return this.markdown;
    }
    setMarkdown(value) {
      this.markdown = value;
    }
    // Helper khusus test: mensimulasikan pengguna mengetik.
    type(value) {
      this.markdown = value;
      this.options.events.change();
    }
  }
  return { default: Editor };
});

vi.mock("@toast-ui/editor/dist/toastui-editor-viewer", () => {
  class Viewer {
    static instances = [];
    constructor(options) {
      this.options = options;
      this.markdown = options.initialValue;
      this.setMarkdown = vi.fn((value) => {
        this.markdown = value;
      });
      this.destroy = vi.fn();
      Viewer.instances.push(this);
    }
  }
  return { default: Viewer };
});

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
