import { type NextRequest, NextResponse } from "next/server"

// Simulamos una base de datos en memoria (en producción usarías una base de datos real)
let bookings: any[] = []

export async function GET() {
  return NextResponse.json(bookings)
}

export async function POST(request: NextRequest) {
  try {
    const booking = await request.json()
    const newBooking = {
      ...booking,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    bookings.push(newBooking)

    // Simular envío de WhatsApp (en producción integrarías con WhatsApp Business API)
    const whatsappMessage = `🌟 *Nuevo Turno Reservado* 🌟
    
👤 *Cliente:* ${booking.clientName}
📞 *Teléfono:* ${booking.clientPhone}
💅 *Servicio:* ${booking.service}
📅 *Fecha:* ${new Date(booking.date).toLocaleDateString("es-AR")}
⏰ *Hora:* ${booking.time}
${booking.notes ? `📝 *Notas:* ${booking.notes}` : ""}

¡Confirma el turno desde el panel de administración!`

    console.log("WhatsApp message would be sent:", whatsappMessage)

    return NextResponse.json({ success: true, booking: newBooking })
  } catch (error) {
    return NextResponse.json({ error: "Error creating booking" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json()

    const bookingIndex = bookings.findIndex((b) => b.id === id)
    if (bookingIndex === -1) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    bookings[bookingIndex].status = status

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error updating booking" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    bookings = bookings.filter((b) => b.id !== id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error deleting booking" }, { status: 500 })
  }
}
