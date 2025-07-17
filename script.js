// Variables globales
let selectedService = ""
let currentTheme = localStorage.getItem("theme") || "light"

// Servicios disponibles
const services = {
  nails: { name: "Esculpido de Uñas", duration: "90 min", price: "$25.000" },
  massage: { name: "Masajes Relajantes", duration: "60 min", price: "$20.000" },
  facial: { name: "Tratamientos Faciales", duration: "75 min", price: "$30.000" },
  nutrition: { name: "Consulta Nutricional", duration: "45 min", price: "$15.000" },
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  initializeTheme()
  initializeServiceSelection()
  initializeForm()
  setMinDate()
})

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

// Selección de servicios
function initializeServiceSelection() {
  const serviceItems = document.querySelectorAll(".service-item")

  serviceItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remover selección anterior
      serviceItems.forEach((si) => si.classList.remove("selected"))

      // Agregar selección actual
      this.classList.add("selected")
      selectedService = this.dataset.service
    })
  })
}

// Formulario
function initializeForm() {
  const form = document.getElementById("bookingForm")
  form.addEventListener("submit", handleBookingSubmit)
}

function setMinDate() {
  const dateInput = document.getElementById("date")
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  dateInput.min = tomorrow.toISOString().split("T")[0]
}

async function handleBookingSubmit(e) {
  e.preventDefault()

  if (!selectedService) {
    showToast("Por favor selecciona un servicio", "error")
    return
  }

  const formData = {
    id: Date.now().toString(),
    service: services[selectedService].name,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    clientName: document.getElementById("clientName").value,
    clientPhone: document.getElementById("clientPhone").value,
    notes: document.getElementById("notes").value,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  // Guardar en localStorage
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]")
  bookings.push(formData)
  localStorage.setItem("bookings", JSON.stringify(bookings))

  // NUEVO: También guardar en sessionStorage para compatibilidad entre pestañas
  sessionStorage.setItem("newBooking", JSON.stringify(formData))

  // Simular envío de WhatsApp
  sendWhatsAppNotification(formData)

  showToast("¡Turno reservado! Te enviaremos una confirmación por WhatsApp", "success")

  // Limpiar formulario
  resetForm()
}

function resetForm() {
  document.getElementById("bookingForm").reset()
  document.querySelectorAll(".service-item").forEach((item) => {
    item.classList.remove("selected")
  })
  selectedService = ""
}

function sendWhatsAppNotification(booking) {
  const message = `🌟 *Nuevo Turno Reservado* 🌟

👤 *Cliente:* ${booking.clientName}
📞 *Teléfono:* ${booking.clientPhone}
💅 *Servicio:* ${booking.service}
📅 *Fecha:* ${new Date(booking.date).toLocaleDateString("es-AR")}
⏰ *Hora:* ${booking.time}
${booking.notes ? `📝 *Notas:* ${booking.notes}` : ""}

¡Confirma el turno desde el panel de administración!`

  console.log("WhatsApp message would be sent:", message)
}

function openWhatsApp() {
  window.open("https://wa.me/5491112345678?text=Hola, necesito cancelar mi turno", "_blank")
}

// Toast notifications
function showToast(message, type = "success") {
  const toast = document.getElementById("toast")
  toast.textContent = message
  toast.className = `toast ${type} show`

  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}
