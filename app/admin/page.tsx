"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Phone, MapPin, Moon, Sun, Sparkles, Trash2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface Booking {
  id: string
  service: string
  date: string
  time: string
  clientName: string
  clientPhone: string
  notes?: string
  status: "pending" | "confirmed" | "cancelled"
}

export default function AdminPanel() {
  const { theme, setTheme } = useTheme()
  const [bookings, setBookings] = useState<Booking[]>([])

  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem("admin_auth")
      if (authToken === "authenticated") {
        setIsAuthenticated(true)
      } else {
        router.push("/admin/login")
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("admin_auth")
    router.push("/admin/login")
  }

  const [filter, setFilter] = useState<"all" | "today" | "pending">("all")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    }
  }

  const updateBookingStatus = async (id: string, status: "confirmed" | "cancelled") => {
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })

      if (response.ok) {
        setBookings(bookings.map((booking) => (booking.id === id ? { ...booking, status } : booking)))
        toast({
          title: "Estado actualizado",
          description: `Turno ${status === "confirmed" ? "confirmado" : "cancelado"} exitosamente`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del turno",
        variant: "destructive",
      })
    }
  }

  const deleteBooking = async (id: string) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        setBookings(bookings.filter((booking) => booking.id !== id))
        toast({
          title: "Turno eliminado",
          description: "El turno ha sido eliminado exitosamente",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el turno",
        variant: "destructive",
      })
    }
  }

  const getFilteredBookings = () => {
    const today = new Date().toISOString().split("T")[0]

    switch (filter) {
      case "today":
        return bookings.filter((booking) => booking.date === today)
      case "pending":
        return bookings.filter((booking) => booking.status === "pending")
      default:
        return bookings
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado"
      case "cancelled":
        return "Cancelado"
      default:
        return "Pendiente"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Gestión de Turnos - Bella Estética</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm">
                  Página Cliente
                </Button>
              </Link>
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
        <div className="max-w-6xl mx-auto">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Turnos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{bookings.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Turnos Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {bookings.filter((b) => b.date === new Date().toISOString().split("T")[0]).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {bookings.filter((b) => b.status === "pending").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex space-x-2 mb-6">
            <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} size="sm">
              Todos
            </Button>
            <Button variant={filter === "today" ? "default" : "outline"} onClick={() => setFilter("today")} size="sm">
              Hoy
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
              size="sm"
            >
              Pendientes
            </Button>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {getFilteredBookings().length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No hay turnos para mostrar</p>
                </CardContent>
              </Card>
            ) : (
              getFilteredBookings().map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{booking.clientName}</h3>
                          <Badge className={getStatusColor(booking.status)}>{getStatusText(booking.status)}</Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Sparkles className="w-4 h-4" />
                              <span>{booking.service}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(booking.date).toLocaleDateString("es-AR")}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>{booking.time}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4" />
                              <span>{booking.clientPhone}</span>
                            </div>
                            {booking.notes && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  <strong>Notas:</strong> {booking.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {booking.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, "confirmed")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBookingStatus(booking.id, "cancelled")}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => deleteBooking(booking.id)}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(
                              `https://wa.me/${booking.clientPhone.replace(/\D/g, "")}?text=Hola ${booking.clientName}, te contactamos desde Bella Estética`,
                              "_blank",
                            )
                          }
                        >
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
