const API_URL = "http://localhost:3001";

function loadFeed() {
  fetch(`${API_URL}/articles`)
    .then(res => res.json())
    .then(articles => {
      const container = document.getElementById("feed");

      articles.forEach(a => {
        const card = document.createElement("div");
        card.className = "article";

        card.innerHTML = `
          <h2>${a.title}</h2>
          <p>${a.content}</p>
          <small>Autore: ${a.author}</small><br>
          <small>Data: ${new Date(a.createdAt).toLocaleString()}</small>
        `;

        container.appendChild(card);
      });
    });
}
