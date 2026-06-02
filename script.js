const API = window.location.origin;

const contenedor = document.getElementById("contenedor-datos");
const busqueda = document.getElementById("busqueda");

/* CAMPOS */
const nombre = document.getElementById("nombre");
const artista = document.getElementById("artista");
const genero = document.getElementById("genero");
const album = document.getElementById("album");
const imagen = document.getElementById("imagen");
const url = document.getElementById("url");

/* GRÁFICA */
let grafica;

/* CARGAR */
async function cargar() {
  const res = await fetch(`${API}/datos`);
  const data = await res.json();

  render(data);
  actualizarGrafica(data);
}

/* GUARDAR */
document.getElementById("btn-guardar").onclick = async () => {
  await fetch(`${API}/guardar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: nombre.value,
      artista: artista.value,
      genero: genero.value,
      album: album.value,
      imagen: imagen.value,
      url: url.value
    })
  });

  cargar();
};

/* BUSCAR */
document.getElementById("btn-buscar").onclick = async () => {
  const termino = busqueda.value.trim();

  if (!termino) return cargar();

  const res = await fetch(`${API}/buscar/${encodeURIComponent(termino)}`);
  const data = await res.json();

  render(data);
  actualizarGrafica(data);
};

/* LIMPIAR */
document.getElementById("btn-limpiar").onclick = () => {
  busqueda.value = "";
  cargar();
};

/* RENDER */
function render(lista) {
  contenedor.innerHTML = "";

  lista.forEach(c => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${c.nombre || "Sin nombre"}</h3>
      <p>${c.artista || "Desconocido"}</p>

      ${c.imagen ? `<img src="${c.imagen}">` : ""}

      <button onclick="escuchar('${c._id}', '${c.url || ""}')">Escuchar</button>
      <button onclick="spotify('${c.url || ""}')">Spotify</button>

      <button onclick="favorito('${c._id}')">
        ${c.favorito ? "💖 Quitar" : "🤍 Favorito"}
      </button>

      <button onclick="eliminar('${c._id}')">Eliminar</button>

      <p>🎧 Reproducciones: ${c.reproducciones || 0}</p>
    `;

    contenedor.appendChild(card);
  });
}

/* ESCUCHAR */
async function escuchar(id, url) {
  await fetch(`${API}/reproducir/${id}`, { method: "PUT" });

  if (url) window.open(url, "_blank");

  cargar();
}

/* SPOTIFY */
function spotify(url) {
  if (!url) return;

  if (url.includes("spotify.com")) {
    window.open(url, "_blank");
  } else {
    alert("Este link no es Spotify");
  }
}

/* FAVORITO */
async function favorito(id) {
  await fetch(`${API}/favorito/${id}`, { method: "PUT" });
  cargar();
}

/* ELIMINAR */
async function eliminar(id) {
  await fetch(`${API}/eliminar/${id}`, { method: "DELETE" });
  cargar();
}

/* 📊 GRÁFICA */
function actualizarGrafica(lista) {
  const canvas = document.getElementById("grafica");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (!lista || lista.length === 0) return;

  const top = [...lista]
    .sort((a, b) => (b.reproducciones || 0) - (a.reproducciones || 0))
    .slice(0, 5);

  const labels = top.map(c => c.nombre || "Sin nombre");
  const data = top.map(c => c.reproducciones || 0);

  if (grafica) grafica.destroy();

  grafica = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          "#3b82f6",
          "#22c55e",
          "#f97316",
          "#ef4444",
          "#a855f7"
        ]
      }]
    }
  });
}

/* INICIO */
cargar();

/* 🌗 TEMA */
document.addEventListener("DOMContentLoaded", () => {
  const btnTema = document.getElementById("btn-tema");

  if (!btnTema) return;

  btnTema.onclick = () => {
    document.body.classList.toggle("light");

    btnTema.textContent = document.body.classList.contains("light")
      ? "🌙 Modo oscuro"
      : "☀️ Modo claro";
  };
});