/* Add an article = add one object (newest first). href points to the article's page. */
const POSTS = [
  { title: "EDIT: article title", date: "EDIT: date", summary: "EDIT: one or two lines about the article.", href: "post-template.html" },
  { title: "EDIT: article title", date: "EDIT: date", summary: "EDIT: one or two lines about the article.", href: "post-template.html" },
];

const list = document.getElementById("posts");
list.innerHTML = POSTS.map((p) =>
  `<a class="post" href="${p.href}"><time>${p.date}</time><div><h3>${p.title}</h3><p>${p.summary}</p></div></a>`
).join("");
document.getElementById("no-posts").hidden = POSTS.length > 0;
document.getElementById("year").textContent = new Date().getFullYear();
