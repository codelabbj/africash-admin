"use client"

import type React from "react"

import { useChangeTransactionStatus, type Transaction } from "@/hooks/useTransactions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ChangeStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
}

export function ChangeStatusDialog({ open, onOpenChange, transaction }: ChangeStatusDialogProps) {
  const changeStatus = useChangeTransactionStatus()

  const handleConfirm = () => {
    if (!transaction) return

    changeStatus.mutate(
      {
        reference: transaction.reference,
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer le Statut de Transaction</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir changer le statut de la transaction : <span className="font-mono font-semibold">{transaction?.reference}</span> ?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={changeStatus.isPending}
          >
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={changeStatus.isPending}>
            {changeStatus.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              "Confirmer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface TransactionStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  statusData: any
  isLoading: boolean
}

export function TransactionStatusDialog({ open, onOpenChange, statusData, isLoading }: TransactionStatusDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "accept":
      case "success":
        return "text-green-600 bg-green-50"
      case "reject":
      case "fail":
      case "failed":
        return "text-red-600 bg-red-50"
      case "pending":
        return "text-yellow-600 bg-yellow-50"
      case "init_payment":
        return "text-blue-600 bg-blue-50"
      case "timeout":
        return "text-gray-600 bg-gray-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "accept":
      case "accepted":
      case "success":
      case "successful":
      case "completed":
        return "Accepté"
      case "reject":
      case "rejected":
      case "fail":
      case "failed":
      case "failure":
        return "Rejeté"
      case "pending":
      case "waiting":
      case "processing":
        return "En attente"
      case "init_payment":
      case "initiated":
      case "started":
        return "En traitement"
      case "timeout":
      case "expired":
      case "timed_out":
        return "Expiré"
      case "cancelled":
      case "canceled":
        return "Annulé"
      default:
        return status || "Inconnu"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Statut de la Transaction</DialogTitle>
          <DialogDescription>Résultat de la vérification du statut</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : statusData ? (
            <div className="space-y-3">
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Statut actuel :</span>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(statusData.status)}`}>
                    {getStatusLabel(statusData.status)}
                  </span>
                </div>

                {statusData.reference && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Référence :</span>
                    <span className="text-sm font-mono">{statusData.reference}</span>
                  </div>
                )}

                {statusData.amount && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Montant :</span>
                    <span className="text-sm">{statusData.amount} FCFA</span>
                  </div>
                )}

                {statusData.created_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Créé le :</span>
                    <span className="text-sm">{new Date(statusData.created_at).toLocaleString()}</span>
                  </div>
                )}

                {statusData.error_message && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-red-600">Message d'erreur :</span>
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{statusData.error_message}</p>
                  </div>
                )}

                {statusData.transaction_link && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Lien de transaction :</span>
                    <a
                      href={statusData.transaction_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {statusData.transaction_link}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Aucune donnée disponible
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
