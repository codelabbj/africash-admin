"use client"

import { useState } from "react"
import { useTelephones, useDeleteTelephone, type Telephone, type TelephoneFilters } from "@/hooks/useTelephones"
import { useNetworks } from "@/hooks/useNetworks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2, Search, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TelephoneDialog } from "@/components/telephone-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function TelephonesPage() {
  const [filters, setFilters] = useState<TelephoneFilters>({
    page: 1,
    page_size: 10,
  })

  const { data: telephonesData, isLoading } = useTelephones(filters)
  const { data: networksData } = useNetworks()
  const deleteTelephone = useDeleteTelephone()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTelephone, setSelectedTelephone] = useState<Telephone | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [telephoneToDelete, setTelephoneToDelete] = useState<Telephone | null>(null)

  const handleEdit = (telephone: Telephone) => {
    setSelectedTelephone(telephone)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedTelephone(undefined)
    setDialogOpen(true)
  }

  const handleDelete = (telephone: Telephone) => {
    setTelephoneToDelete(telephone)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (telephoneToDelete) {
      deleteTelephone.mutate(telephoneToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setTelephoneToDelete(null)
        },
      })
    }
  }

  const getNetworkName = (networkId: number) => {
    const networks = networksData?.results || []
    return networks.find((n) => n.id === networkId)?.public_name || "Unknown"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Téléphones</h2>
          <p className="text-muted-foreground">Gérez les numéros de téléphone des utilisateurs</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un Téléphone
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Rechercher et filtrer les téléphones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Rechercher par numéro..."
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined, page: 1 })}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="network">Réseau</Label>
              <Select
                value={filters.network?.toString() || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    network: value === "all" ? undefined : Number.parseInt(value),
                    page: 1,
                  })
                }
              >
                <SelectTrigger id="network">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les Réseaux</SelectItem>
                  {(networksData?.results || []).map((network) => (
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
          <CardTitle>Liste des Téléphones</CardTitle>
          <CardDescription>Total : {telephonesData?.count || 0} téléphones</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : telephonesData && telephonesData.results && telephonesData.results.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Numéro de Téléphone</TableHead>
                    <TableHead>Réseau</TableHead>
                    <TableHead>Utilisateur Telegram</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {telephonesData.results.map((telephone) => (
                    <TableRow key={telephone.id}>
                      <TableCell className="font-medium">{telephone.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{telephone.phone}</Badge>
                      </TableCell>
                      <TableCell>{getNetworkName(telephone.network)}</TableCell>
                      <TableCell>{telephone.telegram_user || "-"}</TableCell>
                      <TableCell>{new Date(telephone.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Ouvrir le menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(telephone)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(telephone)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {filters.page} sur {Math.ceil((telephonesData?.count || 0) / (filters.page_size || 10))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                    disabled={!telephonesData?.previous}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                    disabled={!telephonesData?.next}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Aucun téléphone trouvé</div>
          )}
        </CardContent>
      </Card>

      <TelephoneDialog open={dialogOpen} onOpenChange={setDialogOpen} telephone={selectedTelephone} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ceci supprimera définitivement le téléphone "{telephoneToDelete?.phone}". Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              {deleteTelephone.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
