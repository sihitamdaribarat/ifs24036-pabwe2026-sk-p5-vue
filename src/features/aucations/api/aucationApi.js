import { fetchApi } from "../../../helpers/apiHelper";

/**
 * @param {{ isMe?: boolean, isClosed?: 0|1 }} filters
 *   isMe → is_me=1 (lelang milik saya), isClosed → is_closed (0 ditutup, 1 dibuka).
 */
export async function getAucations({ isMe, isClosed } = {}) {
  const json = await fetchApi("/aucations", {
    params: { is_me: isMe ? 1 : undefined, is_closed: isClosed },
  });
  return json.data.aucations;
}

export async function getAucationById(id) {
  const json = await fetchApi(`/aucations/${id}`);
  return json.data.aucation;
}

export async function postAucation({ title, description, startBid, closedAt }) {
  const json = await fetchApi("/aucations", {
    method: "POST",
    body: { title, description, start_bid: startBid, closed_at: closedAt },
  });
  return json.message;
}

export async function putAucation(id, { title, description, startBid, closedAt }) {
  const json = await fetchApi(`/aucations/${id}`, {
    method: "PUT",
    body: { title, description, start_bid: startBid, closed_at: closedAt },
  });
  return json.message;
}

export async function postAucationCover(id, cover) {
  const body = new FormData();
  body.append("cover", cover);
  const json = await fetchApi(`/aucations/${id}/cover`, { method: "POST", body });
  return json.message;
}

export async function deleteAucation(id) {
  const json = await fetchApi(`/aucations/${id}`, { method: "DELETE" });
  return json.message;
}

export async function postBid(id, bid) {
  const json = await fetchApi(`/aucations/${id}/bids`, {
    method: "POST",
    body: { bid },
  });
  return json.message;
}

export async function deleteBid(id) {
  const json = await fetchApi(`/aucations/${id}/bids`, { method: "DELETE" });
  return json.message;
}

export async function deleteAllAucations() {
  const json = await fetchApi("/aucations", { method: "DELETE" });
  return json.message;
}

export default {
  getAucations,
  getAucationById,
  postAucation,
  putAucation,
  postAucationCover,
  deleteAucation,
  postBid,
  deleteBid,
  deleteAllAucations,
};
