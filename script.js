/* ---------- SETTINGS ---------- */
const TOTAL_SECONDS = 300;   // time-code length in the nav (300 = 05:00)
const COVER_SAT = 40;        // colour of the placeholder covers (0 = grey, 70 = vivid)

/* ---------- YOUR PROJECTS: edit this list, the page builds itself ----------
   cover: "images/name.jpg" (square card image, optional)
   media: gallery items. The first one is your summary image. Kinds:
     { kind:"image", src:"images/a.jpg", alt:"..." }
     { kind:"video", src:"videos/a.mp4" }  or  { kind:"video", embed:"https://www.youtube.com/embed/ID" }
   link: optional. Leave it out and no button shows.                                      */
const PROJECTS = [
  { title:"Project A", where:"University name", hue:28,  type:["Type 1"], tools:["Tool X","Tool Y"], context:["Course"],
    details:{ Problem:"EDIT", Role:"EDIT", Methods:"EDIT", Outcome:"EDIT" }, link:"#",
    media:[{kind:"image",alt:"Summary image"},{kind:"image",alt:"Second image"},{kind:"video",alt:"Demo video"}] },
  { title:"Project B", where:"University name", hue:190, type:["Type 2"], tools:["Tool Y"], context:["Personal"],
    details:{ Problem:"EDIT", Role:"EDIT", Methods:"EDIT", Outcome:"EDIT" },
    media:[{kind:"image",alt:"Summary image"}] },
  { title:"Project C", where:"University name", hue:330, type:["Type 1","Type 3"], tools:["Tool Z"], context:["Team/Hackathon"],
    details:{ Problem:"EDIT", Role:"EDIT", Methods:"EDIT", Outcome:"EDIT" }, link:"#",
    media:[{kind:"image",alt:"Summary image"},{kind:"image",alt:"Second image"}] },
  { title:"Project D", where:"University name", hue:120, type:["Type 3"], tools:["Tool X","Tool Z"], context:["Course"],
    details:{ Problem:"EDIT", Role:"EDIT", Methods:"EDIT", Outcome:"EDIT" },
    media:[{kind:"image",alt:"Summary image"}] },
];
const GROUPS = { type:"Type", tools:"Tools", context:"Context" };

const $ = (id) => document.getElementById(id);
const selected = { type:new Set(), tools:new Set(), context:new Set() };
const coverOf = (p) => p.cover ? `url(${p.cover}) center/cover`
  : `linear-gradient(135deg, hsl(${p.hue} ${COVER_SAT}% 45%), hsl(${(p.hue+50)%360} ${COVER_SAT}% 20%))`;

/* ---------- Filters: ANY match inside a group, ALL groups must match ---------- */
function buildFilters(){
  for (const [key,label] of Object.entries(GROUPS)) {
    const row = document.createElement("div");
    row.className = "fgroup";
    row.innerHTML = `<span>${label}</span>`;
    [...new Set(PROJECTS.flatMap((p) => p[key]))].forEach((opt) => {
      const b = document.createElement("button");
      b.className = "chip"; b.textContent = opt; b.setAttribute("aria-pressed","false");
      b.onclick = () => {
        selected[key].has(opt) ? selected[key].delete(opt) : selected[key].add(opt);
        b.setAttribute("aria-pressed", selected[key].has(opt));
        renderGrid();
      };
      row.append(b);
    });
    $("filters").append(row);
  }
}
const matches = (p) => Object.keys(GROUPS).every((k) => !selected[k].size || p[k].some((t) => selected[k].has(t)));

function renderGrid(){
  const shown = PROJECTS.filter(matches);
  $("grid").innerHTML = "";
  shown.forEach((p) => {
    const card = document.createElement("button");
    card.className = "card";
    card.innerHTML = `<div class="sleeve"><div class="disc"></div><div class="cover" style="--cover:${coverOf(p)}"></div></div><h3>${p.title}</h3>`;
    card.onclick = () => openModal(p);
    $("grid").append(card);
  });
  $("empty").hidden = shown.length > 0;
}

/* ---------- Pop-up with image/video gallery ---------- */
const modal = $("modal");
let gm = [], gi = 0;
function showMedia(){
  const m = gm[gi], alt = m.alt || "";
  $("viewer").innerHTML =
    m.embed ? `<iframe src="${m.embed}" title="${alt || "Video"}" allowfullscreen loading="lazy"></iframe>`
    : m.kind === "video" && m.src ? `<video src="${m.src}" controls></video>`
    : m.src ? `<img src="${m.src}" alt="${alt}">`
    : `<div class="ph-media">${m.kind === "video" ? "Video" : "Image"} placeholder${alt ? ": " + alt : ""}</div>`;
  $("count").textContent = `${gi+1} / ${gm.length}`;
  $("prev").hidden = $("next").hidden = gm.length < 2;
}
function step(d){ gi = (gi + d + gm.length) % gm.length; showMedia(); }
$("prev").onclick = () => step(-1);
$("next").onclick = () => step(1);

function openModal(p){
  $("m-title").textContent = p.title;
  $("m-where").textContent = p.where;
  $("m-tags").innerHTML = [...p.type, ...p.tools, ...p.context].map((t) => `<li>${t}</li>`).join("");
  $("m-details").innerHTML = Object.entries(p.details).map(([k,v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
  $("m-link").hidden = !p.link;
  if (p.link) $("m-link").href = p.link;
  gm = p.media && p.media.length ? p.media : [{ kind:"image" }];
  gi = 0; showMedia();
  modal.showModal();
}
$("close").onclick = () => modal.close();
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
modal.addEventListener("close", () => { $("viewer").innerHTML = ""; });

/* ---------- Nav timeline: 16-step grid, playhead, time-code, current block ---------- */
$("g16").innerHTML = Array.from({ length:16 }, (_, k) => `<i style="--d:${k*45}ms"></i>`).join("");
const secs = ["top","education","projects","skills","experience","contact","bsides"].map($);
const blks = [...document.querySelectorAll(".blk")];
const pad = (n) => String(n).padStart(2, "0");
const mmss = (s) => `${pad(Math.floor(s/60))}:${pad(s%60)}`;
document.querySelectorAll(".t").forEach((t) => { t.textContent = mmss(Math.round(t.dataset.i * TOTAL_SECONDS / secs.length)); });
function updateNav(){
  const ref = scrollY + innerHeight * 0.35;
  let i = 0;
  secs.forEach((s, k) => { if (s.offsetTop <= ref) i = k; });
  let f = Math.min(Math.max((ref - secs[i].offsetTop) / secs[i].offsetHeight, 0), 1);
  let pos = (i + f) / secs.length;
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) { pos = 1; i = secs.length - 1; }
  $("ph").style.left = `calc(${pos * 100}% - ${pos * 2}px)`;
  $("tc").textContent = `${mmss(Math.round(pos * TOTAL_SECONDS))} / ${mmss(TOTAL_SECONDS)}`;
  blks.forEach((b, k) => k === i ? b.setAttribute("aria-current","true") : b.removeAttribute("aria-current"));
}
function measureNav(){ document.documentElement.style.setProperty("--nav-h", $("nav").offsetHeight + "px"); updateNav(); }
addEventListener("scroll", updateNav, { passive:true });
addEventListener("resize", measureNav);

/* ---------- Contact form (until a form service is connected) ---------- */
$("form").addEventListener("submit", (e) => {
  if ($("form").getAttribute("action") === "FORM_ENDPOINT") {
    e.preventDefault();
    $("form-note").textContent = "The form is not connected yet. Add your form service link to the form's action in index.html.";
  }
});

$("year").textContent = new Date().getFullYear();
buildFilters(); renderGrid(); measureNav();
