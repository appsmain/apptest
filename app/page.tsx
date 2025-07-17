"use client"

import { useState } from "react"
import { Calendar, Clock, Phone, MapPin, Moon, Sun, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTheme } from "next-themes"
import { toast } from "@/hooks/use-toast"

const services = [
  { id: "nails", name: "Esculpido de Uñas", duration: "90 min", price: "$25.000" },
  { id: "massage", name: "Masajes Relajantes", duration: "60 min", price: "$20.000" },
  { id: "facial", name: "Tratamientos Faciales", duration: "75 min", price: "$30.000" },
  { id: "nutrition", name: "Consulta Nutricional", duration: "45 min", price: "$15.000" },
]

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

export default function ClientBooking() {
  const { theme, setTheme } = useTheme()
  const [selectedService, setSelectedService] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [notes, setNotes] = useState("")

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    const booking = {
      service: services.find((s) => s.id === selectedService)?.name,
      date: selectedDate,
      time: selectedTime,
      clientName,
      clientPhone,
      notes,
      id: Date.now().toString(),
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      })

      if (response.ok) {
        toast({
          title: "¡Turno reservado!",
          description: "Te enviaremos una confirmación por WhatsApp",
        })

        // Reset form
        setSelectedService("")
        setSelectedDate("")
        setSelectedTime("")
        setClientName("")
        setClientPhone("")
        setNotes("")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo reservar el turno. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bella Estética</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Centro de Belleza y Bienestar</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-1">
              <Phone className="w-4 h-4" />
              <span>+54 11 1234-5678</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>Av. Corrientes 1234, CABA</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reserva tu Turno</h2>
            <p className="text-gray-600 dark:text-gray-300">Selecciona el servicio que deseas y agenda tu cita</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Services */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-pink-500" />
                    <span>Nuestros Servicios</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedService === service.id
                          ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-pink-300"
                      }`}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mt-1">
                            <Clock className="w-4 h-4 mr-1" />
                            {service.duration}
                          </p>
                        </div>
                        <span className="font-bold text-pink-600 dark:text-pink-400">{service.price}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <span>Datos de la Reserva</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Fecha</Label>
                      <Input
                        id="date"
                        type="date"
                        min={getTomorrowDate()}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Horario</Label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="name">Nombre completo *</Label>
                    <Input
                      id="name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+54 11 1234-5678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notas adicionales</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Alguna preferencia o comentario especial..."
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleBooking}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    size="lg"
                  >
                    Reservar Turno
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">¿Necesitas cancelar?</CardTitle>
                  <CardDescription>Si necesitas cancelar tu turno, contáctanos por WhatsApp</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() =>
                      window.open("https://wa.me/5491112345678?text=Hola, necesito cancelar mi turno", "_blank")
                    }
                  >
                    Cancelar por WhatsApp
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
