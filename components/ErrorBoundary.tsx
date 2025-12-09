"use client"
import React from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface State {
  hasError: boolean
  message?: string
  lang: "en" | "fr"
}

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    const lang = typeof navigator !== "undefined" && navigator.language.startsWith("fr") ? "fr" : "en"
    this.state = { hasError: false, message: "", lang }
  }

  static getDerivedStateFromError(error: any) {
    let msg: string

    if (error?.response?.status >= 500) {
      msg = "Erreur interne du serveur. Veuillez réessayer plus tard."
    } else if (error?.response?.status === 404) {
      msg = "Ressource introuvable. Veuillez vérifier vos données."
    } else {
      msg = error?.response?.data?.detail || error?.message || "Une erreur inattendue s'est produite."
    }
    return { hasError: true, message: msg }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Unhandled Error:", error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    const { hasError, message, lang } = this.state
    if (hasError) {
      const backendLang = message && message.match(/[àâçéèêëîïôûùüÿœ]/i) ? "fr" : lang
      const title = backendLang === "fr" ? "Une erreur est survenue" : "Something went wrong"
      const helpText =
        backendLang === "fr"
          ? "Veuillez réessayer ou contacter le support si le problème persiste."
          : "Please try again or contact support if the issue persists."
      const reloadText = backendLang === "fr" ? "Recharger la page" : "Reload Page"

      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-muted-foreground mt-2 mb-4">{message}</p>
          <p className="text-muted-foreground mb-4">{helpText}</p>
          <Button onClick={this.handleReload}>{reloadText}</Button>
        </div>
      )
    }
    return this.props.children
  }
}
