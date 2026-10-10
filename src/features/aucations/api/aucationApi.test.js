import { describe, expect, it, vi } from "vitest";
import { fetchApi } from "../../../helpers/apiHelper";
import aucationApi, {
  deleteAllAucations,
  deleteAucation,
  deleteBid,
  getAucationById,
  getAucations,
  postAucation,
  postAucationCover,
  postBid,
  putAucation,
} from "./aucationApi";

vi.mock("../../../helpers/apiHelper", () => ({ fetchApi: vi.fn() }));

const payload = { title: "Kamera", description: "Mulus", startBid: 1000, closedAt: "2026-12-31 23:59:00" };
const body = { title: "Kamera", description: "Mulus", start_bid: 1000, closed_at: "2026-12-31 23:59:00" };

describe("aucationApi", () => {
  it("getAucations tanpa filter", async () => {
    fetchApi.mockResolvedValue({ data: { aucations: [{ id: 1 }] } });
    expect(await getAucations()).toEqual([{ id: 1 }]);
    expect(fetchApi).toHaveBeenCalledWith("/aucations", { params: { is_me: undefined, is_closed: undefined } });
  });

  it("getAucations dengan filter is_me dan is_closed", async () => {
    fetchApi.mockResolvedValue({ data: { aucations: [] } });
    await getAucations({ isMe: true, isClosed: 0 });
    expect(fetchApi).toHaveBeenCalledWith("/aucations", { params: { is_me: 1, is_closed: 0 } });
  });

  it("getAucationById mengembalikan detail", async () => {
    fetchApi.mockResolvedValue({ data: { aucation: { id: 3 } } });
    expect(await getAucationById(3)).toEqual({ id: 3 });
    expect(fetchApi).toHaveBeenCalledWith("/aucations/3");
  });

  it("postAucation dan putAucation mengirim body snake_case", async () => {
    fetchApi.mockResolvedValue({ message: "OK" });
    expect(await postAucation(payload)).toBe("OK");
    expect(fetchApi).toHaveBeenCalledWith("/aucations", { method: "POST", body });
    expect(await putAucation(4, payload)).toBe("OK");
    expect(fetchApi).toHaveBeenCalledWith("/aucations/4", { method: "PUT", body });
  });

  it("postAucationCover mengirim FormData cover", async () => {
    fetchApi.mockResolvedValue({ message: "Cover" });
    const file = new File(["x"], "c.png", { type: "image/png" });
    expect(await postAucationCover(5, file)).toBe("Cover");
    const [path, options] = fetchApi.mock.calls[0];
    expect(path).toBe("/aucations/5/cover");
    expect(options.method).toBe("POST");
    expect(options.body.get("cover")).toBeInstanceOf(File);
  });

  it("deleteAucation, postBid, deleteBid, deleteAllAucations", async () => {
    fetchApi.mockResolvedValue({ message: "Done" });
    expect(await deleteAucation(6)).toBe("Done");
    expect(fetchApi).toHaveBeenCalledWith("/aucations/6", { method: "DELETE" });
    expect(await postBid(6, 9000)).toBe("Done");
    expect(fetchApi).toHaveBeenCalledWith("/aucations/6/bids", { method: "POST", body: { bid: 9000 } });
    expect(await deleteBid(6)).toBe("Done");
    expect(fetchApi).toHaveBeenCalledWith("/aucations/6/bids", { method: "DELETE" });
    expect(await deleteAllAucations()).toBe("Done");
    expect(fetchApi).toHaveBeenCalledWith("/aucations", { method: "DELETE" });
  });

  it("menyediakan default export", () => {
    expect(Object.keys(aucationApi)).toHaveLength(9);
  });
});
