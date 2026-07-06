let botonOscuro = document.getElementById("bot-oscuro");

// Al cargar la página, aplicar el modo guardado
if (localStorage.getItem("modoOscuro") === "true") {
  document.body.classList.add("dark-mode");
  if (botonOscuro) botonOscuro.textContent = "🌞";
}

if (botonOscuro) {
  botonOscuro.addEventListener("click", (e) => {
    document.body.classList.toggle("dark-mode");

    const estaOscuro = document.body.classList.contains("dark-mode");
    botonOscuro.textContent = estaOscuro ? "🌞" : "🌚";

    // Guardar preferencia
    localStorage.setItem("modoOscuro", estaOscuro);
  });
}

const btnLogin = document.getElementById("btnLogin");
const btnSalir = document.getElementById("btnSalir");
const inputUsuario = document.getElementById("usuario");
const inputPassword = document.getElementById("password");
const mensaje = document.getElementById("mensaje");
const togglePassword = document.getElementById("togglePassword");

if (togglePassword && inputPassword) {
  togglePassword.addEventListener("click", function () {

    if (inputPassword.type === "password") {
      inputPassword.type = "text";
      togglePassword.textContent = "🙈";
    } else {
      inputPassword.type = "password";
      togglePassword.textContent = "👁️";
    }

  });
}

const zonaLogin = document.getElementById("zonaLogin");
const zonaBienvenida = document.getElementById("zonaBienvenida");

const nombre = document.getElementById("nombre");
const email = document.getElementById("email");
const foto = document.getElementById("foto");

// Cuando arranca la página, ¿hay un token guardado?
const tokenGuardado = sessionStorage.getItem("token");

if (tokenGuardado) {
  obtenerDatosDelUsuario(tokenGuardado);
}

// Cuando el usuario hace click en "Ingresar"
if (btnLogin) {

  btnLogin.addEventListener("click", function () {

    const datos = {
      username: inputUsuario.value,
      password: inputPassword.value
    };

    fetch("https://dummyjson.com/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(datos)
})

  .then(function (respuesta) {

    if (!respuesta.ok) {
      mensaje.textContent = "Usuario o contraseña incorrectos";
      return;
    }

    return respuesta.json();
  })

  .then(function (data) {

    if (!data) return;

    console.log("Respuesta del login:", data);

    sessionStorage.setItem("token", data.accessToken);

    window.location.href = "admin.html";
  })

  .catch(function (error) {
    mensaje.textContent = "Ocurrió un error al iniciar sesión";
  });

  });

}

/*
 * Pedir datos del usuario logueado (endpoint protegido)
 * Mandamos el token en el header "Authorization"
 */
function obtenerDatosDelUsuario(token) {

  fetch("https://dummyjson.com/auth/me", {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + token
    }
  })

    .then(function (respuesta) {

      if (!respuesta.ok) {
        throw new Error("Token inválido o vencido");
      }

      return respuesta.json();
    })

    .then(function (data) {
      mostrarBienvenida(data);
    })

    .catch(function (error) {
      console.log("Error:", error.message);
      sessionStorage.removeItem("token");
    });
}

function mostrarBienvenida(data) {

  if (!zonaLogin || !zonaBienvenida) return;

  zonaLogin.hidden = true;
  zonaBienvenida.hidden = false;

  if (nombre) {
    nombre.textContent = data.firstName + " " + data.lastName;
  }

  if (email) {
    email.textContent = data.email;
  }

  if (foto) {
    foto.src = data.image;
  }
}

// cerrar sesión
if (btnSalir) {

  btnSalir.addEventListener("click", function () {

    sessionStorage.removeItem("token");

    if (zonaLogin) {
      zonaLogin.hidden = false;
    }

    if (zonaBienvenida) {
      zonaBienvenida.hidden = true;
    }

    if (mensaje) {
      mensaje.textContent = "";
    }

    window.location.href = "index.html";
  });

}
const btnLoguearse = document.getElementById("btnLoguearse");

if (btnLoguearse) {

  const tokenIndex = sessionStorage.getItem("token");

  if (tokenIndex) {
    // Ya está logueado
    btnLoguearse.textContent = "Cerrar sesión";

    btnLoguearse.addEventListener("click", function () {
      sessionStorage.removeItem("token");
      window.location.reload();
    });

  } else {
    // No está logueado
    btnLoguearse.textContent = "Iniciar sesión";

    btnLoguearse.addEventListener("click", function () {
      window.location.href = "login.html";
    });
  }

}
const cotizacionActual = document.getElementById("cotizacion-actual");
const cotizacionActual1 = document.getElementById("cotizacion-actual1");

obtenerCompraCotizacion();
obtenerVentaCotizacion();

function obtenerCompraCotizacion() {
    fetch("https://api.bluelytics.com.ar/v2/latest")
        .then(respuesta => respuesta.json())
        .then(datos => {
            cotizacionActual.textContent =
                `El valor de compra del dólar blue hoy es de $${datos.blue.value_buy}`;
        })
        .catch(() => {
            cotizacionActual.textContent =
                "No se pudo obtener la cotización.";
        });
}

function obtenerVentaCotizacion() {
    fetch("https://api.bluelytics.com.ar/v2/latest")
        .then(respuesta => respuesta.json())
        .then(datos => {
            cotizacionActual1.textContent =
                `El valor de venta del dólar blue hoy es de $${datos.blue.value_sell}`;
        })
        .catch(() => {
            cotizacionActual1.textContent =
                "No se pudo obtener la cotización.";
        });
}

obtenerVentaCotizacion();
// FORMULARIO DEL ADMIN

function editarNoticia(index) {

    let noticias = JSON.parse(localStorage.getItem("noticias")) || [];

    let noticia = noticias[index];

    document.getElementById("titulo").value = noticia.titulo;
    document.getElementById("descripcion").value = noticia.descripcion;
    document.getElementById("imagen").value = noticia.imagen;

    noticiaEnEdicion = index;
}
function mostrarNoticiasAdmin() {

    const lista = document.getElementById("listaNoticias");

    if (!lista) return;

    lista.innerHTML = "";

    let noticias = JSON.parse(localStorage.getItem("noticias")) || [];

    // Filtrar noticias vacías o inválidas
    noticias = noticias.filter(noticia => noticia && noticia.titulo && noticia.titulo.trim() !== "");

    noticias.forEach(function (noticia, index) {

        lista.innerHTML += `
        <article>
            <h3>${noticia.titulo}</h3>
            <p>${noticia.descripcion}</p>
            <img src="${noticia.imagen}" width="200">

            <br><br>

            <button id="btnEditar${index}" type="button" onclick="editarNoticia(${index})">
                Editar
            </button>

            <button id="btnEliminar${index}" type="button" onclick="eliminarNoticia(${index})">
                Eliminar
            </button>

            <hr>
        </article>
        `;
    });
}

function mostrarNoticiasIndex() {

    const contenedor = document.getElementById("noticiasNuevas");

    if (!contenedor) return;

    let noticias = JSON.parse(localStorage.getItem("noticias")) || [];

    noticias.forEach(function(noticia) {

        contenedor.innerHTML += `
            <article>
                <h2>${noticia.titulo}</h2>
                <img src="${noticia.imagen}">
                <p>${noticia.descripcion}</p>
            </article>
        `;
    });
}

mostrarNoticiasIndex();

function eliminarNoticia(index) {

    let noticias = JSON.parse(localStorage.getItem("noticias")) || [];

    noticias.splice(index, 1);

    localStorage.setItem("noticias", JSON.stringify(noticias));

    mostrarNoticiasAdmin();
}

let noticiaEnEdicion = null;

window.editarNoticia = editarNoticia;
window.eliminarNoticia = eliminarNoticia;

  const formNoticia = document.getElementById("formNoticia");

    if (formNoticia) 

    formNoticia.addEventListener("submit", function(e) {
    e.preventDefault();
    
    let titulo = document.getElementById("titulo").value.trim();
    let descripcion = document.getElementById("descripcion").value.trim();
    let imagen = document.getElementById("imagen").value.trim();

    // Validar que no esté vacío
    if (!titulo || !imagen) {
        alert("Título e Imagen son requeridos");
        return;
    }

    let noticias = JSON.parse(localStorage.getItem("noticias")) || [];
    
    let noticia = {
        titulo: titulo,
        descripcion: descripcion,
        imagen: imagen
    };
    
    if (noticiaEnEdicion !== null) {
        noticias[noticiaEnEdicion] = noticia;
        noticiaEnEdicion = null;
    } else {
        noticias.push(noticia);
    }
    
    localStorage.setItem("noticias", JSON.stringify(noticias));
    
    document.getElementById("formNoticia").reset();
    mostrarNoticiasAdmin();
});

const btnCerrarSesion = document.getElementById("btnCerrarSesion");

if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", function() {
        sessionStorage.removeItem("token");
        window.location.href = "index.html";
    });
}

mostrarNoticiasAdmin();
const linkAdmin = document.getElementById("linkAdmin");

if (linkAdmin) {

  linkAdmin.addEventListener("click", function(e) {

    e.preventDefault();

    const token = localStorage.getItem("token");

    if (token) {
      window.location.href = "admin.html";
    } else {
      window.location.href = "login.html";
    }

  });

}
const btnIrAdmin = document.getElementById("btnIrAdmin");

if (btnIrAdmin) {
  btnIrAdmin.addEventListener("click", function() {
    window.location.href = "admin.html";
  });
}