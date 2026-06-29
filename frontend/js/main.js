/* ===========================
   TOAST
=========================== */
function showToast(msg) {
  let toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ===========================
   TOGGLE PASSWORD (SVG MINIMAL STABILE)
=========================== */
function togglePassword(id, el) {
  const input = document.getElementById(id);
  const svg = el.querySelector(".eye-icon");

  if (input.type === "password") {
    input.type = "text";

    // Occhio barrato minimal
    svg.innerHTML = `
      <path d="M12 4.5C7 4.5 2.7 7.4 1 12c1.7 4.6 6 7.5 11 7.5s9.3-2.9 11-7.5c-1.7-4.6-6-7.5-11-7.5zm0 12a4.5 4.5 0 110-9 4.5 4.5 0 010 9z"/>
      <line x1="4" y1="4" x2="20" y2="20" stroke="#555" stroke-width="2"/>
    `;
  } else {
    input.type = "password";

    // Occhio normale minimal
    svg.innerHTML = `
      <path d="M12 4.5C7 4.5 2.7 7.4 1 12c1.7 4.6 6 7.5 11 7.5s9.3-2.9 11-7.5c-1.7-4.6-6-7.5-11-7.5zm0 12a4.5 4.5 0 110-9 4.5 4.5 0 010 9z"/>
    `;
  }
}

/* ===========================
   TOKEN
=========================== */

function saveToken(token) {
  localStorage.setItem("token", token);
}

function getToken() {
  return localStorage.getItem("token");
}

function getTokenPayload() {
  const token = getToken();
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function isAdmin() {
  const payload = getTokenPayload();
  return payload && payload.role === "admin";
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  window.location.href = "index.html";
}

/* ===========================
   NAVBAR
=========================== */

function updateNavbar() {
  const loginLink = document.getElementById("login-link");
  const logoutBtn = document.getElementById("logout-btn");
  const publishLink = document.getElementById("publish-link");

  const token = getToken();

  if (!token) {
    loginLink.style.display = "inline-block";
    logoutBtn.style.display = "none";
    publishLink.style.display = "none";
    return;
  }

  loginLink.style.display = "none";
  logoutBtn.style.display = "inline-block";

  if (isAdmin()) {
    publishLink.style.display = "inline-block";
  } else {
    publishLink.style.display = "none";
  }
}

/* ===========================
   REGISTRAZIONE
=========================== */

async function handleRegister(event) {
  event.preventDefault();

  const nome = document.getElementById("reg-nome").value;
  const cognome = document.getElementById("reg-cognome").value;
  const username = document.getElementById("reg-username").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  const errorBox = document.getElementById("register-error");
  errorBox.textContent = "";

  const result = await registerUser(nome, cognome, username, email, password);

  if (result.msg === "Email già registrata") {
    errorBox.textContent = "Email già in uso";
    return;
  }

  if (result.msg === "Username già registrato") {
    errorBox.textContent = "Username già in uso";
    return;
  }

  showToast("Registrazione completata");
}

/* ===========================
   LOGIN
=========================== */

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("log-email").value;
  const password = document.getElementById("log-password").value;
  const errorBox = document.getElementById("login-error");

  errorBox.textContent = "";

  const result = await loginUser(email, password);

  if (result.msg === "Email non trovata") {
    errorBox.textContent = "Email non trovata.";
    return;
  }

  if (result.msg === "Password errata") {
    errorBox.textContent = "Password non corretta.";
    return;
  }

  if (result.token) {
    saveToken(result.token);
    localStorage.setItem("email", email);
    showToast("Login effettuato");
    window.location.href = "index.html";
    return;
  }

  errorBox.textContent = result.msg || "Errore durante il login";
}

/* ===========================
   FEED
=========================== */

async function loadFeed() {
  const container = document.getElementById("feed");
  const articles = await getArticles();
  const admin = isAdmin();

  container.innerHTML = "";

  articles.forEach(article => {
    const card = document.createElement("div");
    card.className = "article-card";
    card.setAttribute("data-id", article.id);

    const preview = article.content.length > 150
      ? `${article.content.substring(0, 150)}...`
      : article.content;

    card.innerHTML = `
      <h2>${article.title}</h2>
      <p>${preview}</p>
    `;

    if (admin) {
      const actions = document.createElement("div");
      actions.className = "article-actions";

      const editBtn = document.createElement("button");
      editBtn.textContent = "Modifica";
      editBtn.className = "edit-btn";
      editBtn.onclick = () => handleEditArticle(article);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Elimina";
      deleteBtn.className = "delete-btn";
      deleteBtn.onclick = () => handleDeleteArticle(article.id);

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      card.appendChild(actions);
    }

    const commentsBox = document.createElement("div");
    commentsBox.className = "comments-box";
    card.appendChild(commentsBox);

    loadComments(article.id, commentsBox);

    container.appendChild(card);
  });
}

/* ===========================
   COMMENTI
=========================== */

async function loadComments(articleId, container) {
  const comments = await getComments(articleId);
  const token = getToken();
  const user = getTokenPayload();

  container.innerHTML = `
    <h3>Commenti</h3>
    <div class="comment-list"></div>
    <textarea class="new-comment" placeholder="Scrivi un commento..."></textarea>
    <button class="add-comment-btn">Pubblica</button>
  `;

  const list = container.querySelector(".comment-list");

  comments.forEach(c => {
    const div = document.createElement("div");
    div.className = "comment-item";

    div.innerHTML = `
      <p><strong>${c.author}</strong>: ${c.content}</p>
    `;

    if (user && user.username === c.author) {
      const editBtn = document.createElement("button");
      editBtn.textContent = "Modifica";
      editBtn.onclick = () => editComment(c, div);

      const delBtn = document.createElement("button");
      delBtn.textContent = "Elimina";
      delBtn.onclick = async () => {
        await deleteComment(c.id, token);
        loadComments(articleId, container);
      };

      div.appendChild(editBtn);
      div.appendChild(delBtn);
    }

    list.appendChild(div);
  });

  container.querySelector(".add-comment-btn").onclick = async () => {
    const content = container.querySelector(".new-comment").value;
    if (!content.trim()) return;

    await addComment(articleId, content, token);
    loadComments(articleId, container);
  };
}

function editComment(comment, div) {
  div.innerHTML = `
    <textarea class="edit-comment">${comment.content}</textarea>
    <button class="save-edit">Salva</button>
    <button class="cancel-edit">Annulla</button>
  `;

  div.querySelector(".save-edit").onclick = async () => {
    const newContent = div.querySelector(".edit-comment").value;
    await updateComment(comment.id, newContent, getToken());
    const container = div.closest(".comments-box");
    loadComments(comment.articleId, container);
  };

  div.querySelector(".cancel-edit").onclick = () => {
    const container = div.closest(".comments-box");
    loadComments(comment.articleId, container);
  };
}

/* ===========================
   DELETE ARTICOLO
=========================== */

async function handleDeleteArticle(id) {
  if (!confirm("Vuoi eliminare questo articolo?")) return;

  const token = getToken();
  const result = await deleteArticle(id, token);

  if (result.status !== 200) {
    showToast(result.data.msg);
    return;
  }

  showToast("Articolo eliminato!");
  loadFeed();
}

/* ===========================
   HAMBURGER MENU
=========================== */

document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();

  const hamburger = document.getElementById("hamburger-btn");
  const navMenu = document.getElementById("nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      navMenu.classList.toggle("open");
    });

    navMenu.querySelectorAll("a, button").forEach(el => {
      el.addEventListener("click", () => {
        hamburger.classList.remove("open");
        navMenu.classList.remove("open");
      });
    });
  }
});
