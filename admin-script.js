// Variables globales
let bookings = []
let currentFilter = "all"
let currentTheme = localStorage.getItem("theme") || "light"

// --- Supabase Configuration ---
// Reemplaza con tus propias claves de Supabase
const SUPABASE_URL = "https://bppjabvmrzlptgjlobuy.supabase.co" // Tu Project URL
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcGphYnZtcnpscHRnamxvYnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3OTg4NjcsImV4cCI6MjA2ODM3NDg2N30.ggPZAysMmeBC6GeoxfCa6oP-1N9EkQeK65fLjDDSBpM" // Tu anon public key

// Inicializa el cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
// --- End Supabase Configuration ---

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  checkAuthentication()
  initializeTheme()
  loadBookings() // Carga inicial de turnos
  initializeFilters()
  initializeLogout()
  updateStats()

  // Suscribirse a cambios en la base de datos de Supabase para actualizaciones en tiempo real
  supabase
    .channel("public:bookings") // Nombre del canal, debe coincidir con tu tabla
    .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, (payload) => {
      console.log("Cambio recibido de Supabase:", payload)
      loadBookings() // Recargar los turnos cuando haya un cambio en la base de datos
    })
    .subscribe()
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

// Cargar turnos desde Supabase
async function loadBookings() {
  const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error al cargar turnos desde Supabase:", error)
    showToast("Error al cargar los turnos.", "error")
    return
  }

  bookings = data
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
                <h3>${booking.client_name}</h3> <!-- Usar client_name de Supabase -->
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
                    <div><i class="fas fa-phone"></i> ${booking.client_phone}</div> <!-- Usar client_phone de Supabase -->
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
                <button class="btn-sm btn-outline" onclick="contactWhatsApp('${booking.client_phone}', '${booking.client_name}')">
                    WhatsApp
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Acciones de turnos en Supabase
async function updateBookingStatus(id, status) {
  const { data, error } = await supabase.from("bookings").update({ status: status }).eq("id", id)

  if (error) {
    console.error("Error al actualizar estado en Supabase:", error)
    showToast("No se pudo actualizar el estado del turno", "error")
    return
  }

  const statusText = status === "confirmed" ? "confirmado" : "cancelado"
  showToast(`Turno ${statusText} exitosamente`, "success")
  loadBookings() // Recargar para reflejar el cambio
}

async function deleteBooking(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este turno?")) {
    const { error } = await supabase.from("bookings").delete().eq("id", id)

    if (error) {
      console.error("Error al eliminar turno en Supabase:", error)
      showToast("No se pudo eliminar el turno", "error")
      return
    }

    showToast("Turno eliminado exitosamente", "success")
    loadBookings() // Recargar para reflejar el cambio
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
