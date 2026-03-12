import API from "./api";

export function handleLogout(navigate) {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  navigate("/login");
}

export async function loadChats() {
  const res = await API.get("/chats");
  return res.data;
}

export async function createChat() {
  const res = await API.post("/chats", {
    title: "New Chat",
  });

  return res.data;  
}

export async function onDeleteChat(chatId) {
  await API.delete(`/chats/${chatId}`);
}

export async function renameChat(chatId, title) {
    const res = API.put(`/chats/${chatId}`,{
        title:title
    });
    return res.data;
}