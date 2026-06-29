async function handlePublish(event) {
  event.preventDefault();

  const title = document.getElementById("pub-title").value;
  const content = document.getElementById("pub-content").value;
  const token = localStorage.getItem("token");
  const author = localStorage.getItem("email");

  if (!token || !author) {
    showToast("Devi essere loggato per pubblicare un articolo.");
    return;
  }

  const res = await fetch(`${API_URL}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      title,
      content,
      author
    })
  });

  const data = await res.json();

  if (!res.ok) {
    showToast(data.msg || "Errore durante la pubblicazione");
    return;
  }

  showToast("Articolo pubblicato!");
  window.location.href = "index.html";
}
