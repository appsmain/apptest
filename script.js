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
    // Supabase generará el ID automáticamente si la columna 'id' es UUID con default gen_random_uuid()
    service: services[selectedService].name,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    client_name: document.getElementById("clientName").value, // Cambiado a client_name para Supabase
    client_phone: document.getElementById("clientPhone").value, // Cambiado a client_phone para Supabase
    notes: document.getElementById("notes").value,
    status: "pending",
    created_at: new Date().toISOString(), // Cambiado a created_at para Supabase
  }

  // Guardar en Supabase
  const { data, error } = await supabase.from("bookings").insert([formData]).select()

  if (error) {
    console.error("Error al guardar en Supabase:", error)
    showToast("Error al reservar el turno. Intenta nuevamente.", "error")
    return
  }

  // Simular envío de WhatsApp (puedes integrar con una API real de WhatsApp aquí)
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

👤 *Cliente:* ${booking.client_name}
📞 *Teléfono:* ${booking.client_phone}
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
