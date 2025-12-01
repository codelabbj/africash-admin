"use client"

import { useState } from "react"
import { useTransactions, useCheckTransactionStatus, type Transaction, type TransactionFilters } from "@/hooks/useTransactions"
import { useNetworks } from "@/hooks/useNetworks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Search, RefreshCw, Copy, CheckCircle } from "lucide-react"
import { toast } from "react-hot-toast"
import { CreateTransactionDialog } from "@/components/create-transaction-dialog"
import { ChangeStatusDialog, TransactionStatusDialog } from "@/components/change-status-dialog"

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    page_size: 10,
  })

  const { data: transactionsData, isLoading } = useTransactions(filters)
  const { data: networks } = useNetworks()
  const checkStatusMutation = useCheckTransactionStatus()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [transactionStatusDialogOpen, setTransactionStatusDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [checkingStatus, setCheckingStatus] = useState<number | null>(null)
  const [statusData, setStatusData] = useState<any>(null)

  const handleChangeStatus = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setStatusDialogOpen(true)
  }

  const handleCheckStatus = async (transaction: Transaction) => {
    setCheckingStatus(transaction.id)
    setTransactionStatusDialogOpen(true)
    try {
      const data = await checkStatusMutation.mutateAsync(transaction.reference)
      setStatusData(data)
    } catch (error) {
      setStatusData(null)
    } finally {
      setCheckingStatus(null)
    }
  }

  const shouldShowCheckStatus = (status: string) => {
    const statusLower = status.toLowerCase()
    return statusLower === "pending" || statusLower === "error" || statusLower === "fail" || statusLower === "failed"
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accept":
      case "success":
        return "default" // Green (success)
      case "reject":
      case "fail":
      case "failed":
        return "destructive" // Red (error)
      case "pending":
        return "secondary" // Gray/neutral
      case "init_payment":
        return "outline" // Processing
      case "timeout":
        return "outline" // Border only
      default:
        return "secondary" // Default fallback
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status.toLowerCase()) {
      case "accept":
      case "success":
        return "Accepté"
      case "reject":
      case "fail":
      case "failed":
        return "Rejeté"
      case "pending":
        return "En attente"
      case "init_payment":
        return "En traitement"
      case "timeout":
        return "Expiré"
      default:
        return status
    }
  }

  const getTypeTransLabel = (type: string): string => {
    switch (type.toLowerCase()) {
      case "deposit":
        return "Dépôt"
      case "withdrawal":
        return "Retrait"
      case "reward":
        return "Récompense"
      default:
        return type
    }
  }

  const getTypeTransColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "deposit":
        return "default" // Green/primary
      case "withdrawal":
        return "secondary" // Gray
      case "reward":
        return "outline" // Border
      default:
        return "secondary"
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copié dans le presse-papiers")
    } catch (error) {
      toast.error("Erreur lors de la copie")
    }
  }

  const getNetworkName = (networkId: number | null) => {
    if (!networkId) return "-"
    const networksList = networks?.results || []
    return networksList.find((n) => n.id === networkId)?.public_name || "-"
  }

  const displayValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined || value === "") return "-"
    return String(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">Gérez les dépôts et retraits</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Créer Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Rechercher et filtrer les transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Rechercher Référence</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Rechercher par référence..."
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de Transaction</Label>
              <Select
                value={filters.type_trans || "all"}
                onValueChange={(value) => setFilters({ ...filters, type_trans: value === "all" ? undefined : value })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les Types</SelectItem>
                  <SelectItem value="deposit">Dépôt</SelectItem>
                  <SelectItem value="withdrawal">Retrait</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? undefined : value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les Statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="accept">Accepté</SelectItem>
                  <SelectItem value="reject">Rejeté</SelectItem>
                  <SelectItem value="timeout">Expiré</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select
                value={filters.source || "all"}
                onValueChange={(value) => setFilters({ ...filters, source: value === "all" ? undefined : value })}
              >
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les Sources</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="network">Réseau</Label>
              <Select
                value={filters.network?.toString() || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, network: value === "all" ? undefined : Number.parseInt(value) })
                }
              >
                <SelectTrigger id="network">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les Réseaux</SelectItem>
                  {(networks?.results || []).map((network) => (
                    <SelectItem key={network.id} value={network.id.toString()}>
                      {network.public_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Transactions</CardTitle>
          <CardDescription>Total : {transactionsData?.count || 0} transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : transactionsData && transactionsData.results.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>ID Pari</TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Réseau</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Créé</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsData.results.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{displayValue(transaction.reference)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopy(transaction.reference)}
                            title="Copier la référence"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{displayValue(transaction.user_app_id)}</Badge>
                          {transaction.user_app_id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopy(transaction.user_app_id!)}
                              title="Copier l'ID pari"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{displayValue(transaction.app_details?.name)}</TableCell>
                      <TableCell>
                        <Badge variant={getTypeTransColor(transaction.type_trans)}>
                          {getTypeTransLabel(transaction.type_trans)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{displayValue(transaction.amount)} FCFA</TableCell>
                      <TableCell>{displayValue(transaction.phone_number)}</TableCell>
                      <TableCell>{getNetworkName(transaction.network)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(transaction.status)}>
                          {getStatusLabel(transaction.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.source ? (
                          <Badge variant="outline">{displayValue(transaction.source)}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {shouldShowCheckStatus(transaction.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCheckStatus(transaction)}
                              disabled={checkingStatus === transaction.id}
                            >
                              {checkingStatus === transaction.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Vérifier Statut
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleChangeStatus(transaction)}>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Changer Statut
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {filters.page} sur {Math.ceil((transactionsData?.count || 0) / (filters.page_size || 10))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                    disabled={!transactionsData?.previous}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                    disabled={!transactionsData?.next}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Aucune transaction trouvée</div>
          )}
        </CardContent>
      </Card>

      <CreateTransactionDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ChangeStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        transaction={selectedTransaction}
      />
      <TransactionStatusDialog
        open={transactionStatusDialogOpen}
        onOpenChange={setTransactionStatusDialogOpen}
        statusData={statusData}
        isLoading={checkingStatus !== null}
      />
    </div>
  )
}
