import { fetchApi } from "../../../helpers/apiHelper";

export async function login({ email, password }) {
  const json = await fetchApi("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return json.data;
}

export async function register({ name, email, password }) {
  const json = await fetchApi("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
  return json.message;
}

export async function logout() {
  const json = await fetchApi("/auth/logout", { method: "POST" });
  return json.message;
}

export default { login, register, logout };
