// Credenciales de administrador
const ADMIN_CREDENTIALS = {
  username: "U$3r",
  password: "@Dm1n1234",
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  initializeLogin()
  initializePasswordToggle()
})

function initializeLogin() {
  const form = document.getElementById("loginForm")
  form.addEventListener("submit", handleLogin)
}

function initializePasswordToggle() {
  const toggleBtn = document.getElementById("togglePassword")
  const passwordInput = document.getElementById("password")

  toggleBtn.addEventListener("click", function () {
    const type = passwordInput.type === "password" ? "text" : "password"
    passwordInput.type = type

    const icon = this.querySelector("i")
    icon.className = type === "password" ? "fas fa-eye" : "fas fa-eye-slash"
  })
}

async function handleLogin(e) {
  e.preventDefault()

  const username = document.getElementById("username").value
  const password = document.getElementById("password").value
  const loginBtn = document.getElementById("loginBtn")

  // Mostrar loading
  loginBtn.innerHTML = '<div class="loading"></div> Verificando...'
  loginBtn.disabled = true

  // Simular delay de autenticación
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    localStorage.setItem("admin_auth", "authenticated")
    showToast("¡Bienvenido! Has iniciado sesión correctamente", "success")

    setTimeout(() => {
      window.location.href = "admin.html"
    }, 1000)
  } else {
    showToast("Usuario o contraseña incorrectos", "error")
    loginBtn.innerHTML = "Iniciar Sesión"
    loginBtn.disabled = false
  }
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast")
  toast.textContent = message
  toast.className = `toast ${type} show`

  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}
