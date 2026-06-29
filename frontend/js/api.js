const API_URL = "http://localhost:3001";

/* ===========================
   AUTH
=========================== */

async function registerUser(nome, cognome, username, email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      cognome,
      username,
      email,
      password
    })
  });
  return res.json();
}

async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

/* ===========================
   ARTICLES
=========================== */

async function getArticles() {
  const res = await fetch(`${API_URL}/articles`);
  return res.json();
}

async function publishArticle(title, content, author, token) {
  const res = await fetch(`${API_URL}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ title, content, author })
  });
  return { status: res.status, data: await res.json() };
}

async function updateArticle(id, title, content, token) {
  const res = await fetch(`${API_URL}/articles/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ title, content })
  });
  return { status: res.status, data: await res.json() };
}

async function deleteArticle(id, token) {
  const res = await fetch(`${API_URL}/articles/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return { status: res.status, data: await res.json() };
}

/* ===========================
   COMMENTS
=========================== */

// GET commenti di un articolo
async function getComments(articleId) {
  const res = await fetch(`${API_URL}/comments/${articleId}`);
  return res.json();
}

// POST nuovo commento
async function addComment(articleId, content, token) {
  const res = await fetch(`${API_URL}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ articleId, content })
  });
  return res.json();
}

// PATCH modifica commento
async function updateComment(id, content, token) {
  const res = await fetch(`${API_URL}/comments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });
  return res.json();
}

// DELETE commento
async function deleteComment(id, token) {
  const res = await fetch(`${API_URL}/comments/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
}
