"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Solo verificar autenticación si no estamos en la página de login
    if (pathname !== "/admin/login") {
      const authToken = localStorage.getItem("admin_auth")
      if (authToken !== "authenticated") {
        router.push("/admin/login")
      }
    }
  }, [pathname, router])

  return <>{children}</>
}
