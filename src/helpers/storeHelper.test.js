import { describe, expect, it } from "vitest";
import { runAction } from "./storeHelper";

describe("runAction", () => {
  it("mengatur flag loading dan done ketika berhasil", async () => {
    const store = { isLoading: false, isDone: true };
    const promise = runAction(store, "isLoading", "isDone", async () => {
      expect(store.isLoading).toBe(true);
      expect(store.isDone).toBe(false);
      return "OK";
    });
    expect(await promise).toEqual({ success: true, message: "OK" });
    expect(store).toEqual({ isLoading: false, isDone: true });
  });

  it("mengembalikan pesan error ketika gagal", async () => {
    const store = { isLoading: false, isDone: false };
    const result = await runAction(store, "isLoading", "isDone", async () => {
      throw new Error("Boom");
    });
    expect(result).toEqual({ success: false, message: "Boom" });
    expect(store).toEqual({ isLoading: false, isDone: false });
  });

  it("dapat berjalan tanpa doneKey", async () => {
    const store = { isLoading: false };
    const result = await runAction(store, "isLoading", null, async () => "");
    expect(result.success).toBe(true);
    expect(store).toEqual({ isLoading: false });
  });
});
