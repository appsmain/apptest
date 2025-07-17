// Variables globales
let bookings = []
let currentFilter = "all"
let currentTheme = localStorage.getItem("theme") || "light"

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  checkAuthentication()
  initializeTheme()
  loadBookings()
  initializeFilters()
  initializeLogout()
  updateStats()
})

// Autenticación
function checkAuthentication() {
  const isAuthenticated = localStorage.getItem("admin_auth") === "authenticated"
  if (!isAuthenticated) {
    window.location.href = "login.html"
    return
  }
}

function initializeLogout() {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("admin_auth")
    window.location.href = "login.html"
  })
}

// Tema
function initializeTheme() {
  document.documentElement.setAttribute("data-theme", currentTheme)
  updateThemeIcon()

  document.getElementById("themeToggle").addEventListener("click", toggleTheme)
}

function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light"
  document.documentElement.setAttribute("data-theme", currentTheme)
  localStorage.setItem("theme", currentTheme)
  updateThemeIcon()
}

function updateThemeIcon() {
  const icon = document.querySelector("#themeToggle i")
  icon.className = currentTheme === "dark" ? "fas fa-sun" : "fas fa-moon"
}

// Cargar turnos
function loadBookings() {
  // Verificar si hay una nueva reserva desde otra pestaña
  const newBooking = sessionStorage.getItem("newBooking")
  if (newBooking) {
    const booking = JSON.parse(newBooking)
    const existingBookings = JSON.parse(localStorage.getItem("bookings") || "[]")

    // Verificar si la reserva ya existe
    const exists = existingBookings.some((b) => b.id === booking.id)
    if (!exists) {
      existingBookings.push(booking)
      localStorage.setItem("bookings", JSON.stringify(existingBookings))
    }

    // Limpiar sessionStorage
    sessionStorage.removeItem("newBooking")
  }

  bookings = JSON.parse(localStorage.getItem("bookings") || "[]")
  renderBookings()
  updateStats()
}

// Filtros
function initializeFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn")

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      filterBtns.forEach((b) => b.classList.remove("active"))
      this.classList.add("active")
      currentFilter = this.dataset.filter
      renderBookings()
    })
  })
}

function getFilteredBookings() {
  const today = new Date().toISOString().split("T")[0]

  switch (currentFilter) {
    case "today":
      return bookings.filter((booking) => booking.date === today)
    case "pending":
      return bookings.filter((booking) => booking.status === "pending")
    default:
      return bookings
  }
}

// Renderizar turnos
function renderBookings() {
  const container = document.getElementById("bookingsList")
  const filteredBookings = getFilteredBookings()

  if (filteredBookings.length === 0) {
    container.innerHTML = '<div class="no-bookings"><p>No hay turnos para mostrar</p></div>'
    return
  }

  container.innerHTML = filteredBookings
    .map(
      (booking) => `
        <div class="booking-card">
            <div class="booking-header">
                <h3>${booking.clientName}</h3>
                <span class="status-badge status-${booking.status}">
                    ${getStatusText(booking.status)}
                </span>
            </div>
            
            <div class="booking-details">
                <div>
                    <div><i class="fas fa-sparkles"></i> ${booking.service}</div>
                    <div><i class="fas fa-calendar"></i> ${new Date(booking.date).toLocaleDateString("es-AR")}</div>
                    <div><i class="fas fa-clock"></i> ${booking.time}</div>
                </div>
                <div>
                    <div><i class="fas fa-phone"></i> ${booking.clientPhone}</div>
                    ${booking.notes ? `<div style="margin-top: 0.5rem;"><strong>Notas:</strong> ${booking.notes}</div>` : ""}
                </div>
            </div>
            
            <div class="booking-actions">
                ${
                  booking.status === "pending"
                    ? `
                    <button class="btn-sm btn-success" onclick="updateBookingStatus('${booking.id}', 'confirmed')">
                        <i class="fas fa-check-circle"></i> Confirmar
                    </button>
                    <button class="btn-sm btn-outline" onclick="updateBookingStatus('${booking.id}', 'cancelled')">
                        <i class="fas fa-times-circle"></i> Cancelar
                    </button>
                `
                    : ""
                }
                <button class="btn-sm btn-danger" onclick="deleteBooking('${booking.id}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
                <button class="btn-sm btn-outline" onclick="contactWhatsApp('${booking.clientPhone}', '${booking.clientName}')">
                    WhatsApp
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Acciones de turnos
function updateBookingStatus(id, status) {
  bookings = bookings.map((booking) => (booking.id === id ? { ...booking, status } : booking))

  localStorage.setItem("bookings", JSON.stringify(bookings))
  renderBookings()
  updateStats()

  const statusText = status === "confirmed" ? "confirmado" : "cancelado"
  showToast(`Turno ${statusText} exitosamente`, "success")
}

function deleteBooking(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este turno?")) {
    bookings = bookings.filter((booking) => booking.id !== id)
    localStorage.setItem("bookings", JSON.stringify(bookings))
    renderBookings()
    updateStats()
    showToast("Turno eliminado exitosamente", "success")
  }
}

function contactWhatsApp(phone, name) {
  const cleanPhone = phone.replace(/\D/g, "")
  const message = `Hola ${name}, te contactamos desde Bella Estética`
  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank")
}

// Estadísticas
function updateStats() {
  const today = new Date().toISOString().split("T")[0]
  const todayBookings = bookings.filter((b) => b.date === today).length
  const pendingBookings = bookings.filter((b) => b.status === "pending").length

  document.getElementById("totalBookings").textContent = bookings.length
  document.getElementById("todayBookings").textContent = todayBookings
  document.getElementById("pendingBookings").textContent = pendingBookings
}

// Utilidades
function getStatusText(status) {
  switch (status) {
    case "confirmed":
      return "Confirmado"
    case "cancelled":
      return "Cancelado"
    default:
      return "Pendiente"
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

// Agregar listener para cambios en localStorage
window.addEventListener("storage", (e) => {
  if (e.key === "bookings") {
    loadBookings()
  }
})

// Agregar función para refrescar datos cada 5 segundos
setInterval(() => {
  const currentBookingsCount = bookings.length
  const storedBookings = JSON.parse(localStorage.getItem("bookings") || "[]")

  if (storedBookings.length !== currentBookingsCount) {
    loadBookings()
  }
}, 5000)
