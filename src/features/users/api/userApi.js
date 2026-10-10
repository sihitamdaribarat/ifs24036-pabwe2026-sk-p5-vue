import { fetchApi } from "../../../helpers/apiHelper";

export async function getUsers() {
  const json = await fetchApi("/users");
  return json.data.users;
}

export async function getUserById(id) {
  const json = await fetchApi(`/users/${id}`);
  return json.data.user;
}

export async function getMe() {
  const json = await fetchApi("/users/me");
  return json.data.user;
}

export async function putMe({ name, email }) {
  const json = await fetchApi("/users/me", {
    method: "PUT",
    body: { name, email },
  });
  return json.message;
}

export async function postMePhoto(photo) {
  const body = new FormData();
  body.append("photo", photo);
  const json = await fetchApi("/users/me/photo", { method: "POST", body });
  return json.message;
}

export async function putMePassword({
  password,
  newPassword,
  newPasswordConfirmation,
}) {
  const json = await fetchApi("/users/me/password", {
    method: "PUT",
    body: {
      password,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    },
  });
  return json.message;
}

export default {
  getUsers,
  getUserById,
  getMe,
  putMe,
  postMePhoto,
  putMePassword,
};
