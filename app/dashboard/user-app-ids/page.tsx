"use client"

import { useState } from "react"
import { useUserAppIds, useDeleteUserAppId, type UserAppId, type UserAppIdFilters } from "@/hooks/useUserAppIds"
import { usePlatforms } from "@/hooks/usePlatforms"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2, Copy, Search, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "react-hot-toast"
import { UserAppIdDialog } from "@/components/user-app-id-dialog"
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

export default function UserAppIdsPage() {
  const [filters, setFilters] = useState<UserAppIdFilters>({
    page: 1,
    page_size: 10,
  })

  const { data: userAppIdsData, isLoading } = useUserAppIds(filters)
  const { data: platformsData } = usePlatforms()
  const deleteUserAppId = useDeleteUserAppId()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUserAppId, setSelectedUserAppId] = useState<UserAppId | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userAppIdToDelete, setUserAppIdToDelete] = useState<UserAppId | null>(null)

  const handleEdit = (userAppId: UserAppId) => {
    setSelectedUserAppId(userAppId)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedUserAppId(undefined)
    setDialogOpen(true)
  }

  const handleDelete = (userAppId: UserAppId) => {
    setUserAppIdToDelete(userAppId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (userAppIdToDelete) {
      deleteUserAppId.mutate(userAppIdToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setUserAppIdToDelete(null)
        },
      })
    }
  }

  const handleCopy = async (betId: string) => {
    try {
      await navigator.clipboard.writeText(betId)
      toast.success("ID copié dans le presse-papiers")
    } catch (error) {
      toast.error("Erreur lors de la copie")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">IDs Utilisateur App</h2>
          <p className="text-muted-foreground">Gérez les identifiants d'application utilisateur</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter ID Utilisateur App
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Rechercher et filtrer les IDs utilisateur app</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Rechercher par ID utilisateur app..."
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined, page: 1 })}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="app_name">Plateforme</Label>
              <Select
                value={filters.app_name || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    app_name: value === "all" ? undefined : value,
                    page: 1,
                  })
                }
              >
                <SelectTrigger id="app_name">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les Plateformes</SelectItem>
                  {(platformsData?.results || []).map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.name}
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
          <CardTitle>Liste des IDs Utilisateur App</CardTitle>
          <CardDescription>Total : {userAppIdsData?.count || 0} IDs utilisateur app</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : userAppIdsData && userAppIdsData.results && userAppIdsData.results.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>ID Utilisateur App</TableHead>
                    <TableHead>Nom de l'App</TableHead>
                    <TableHead>Utilisateur Telegram</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userAppIdsData.results.map((userAppId) => (
                    <TableRow key={userAppId.id}>
                      <TableCell className="font-medium">{userAppId.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{userAppId.user_app_id}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopy(userAppId.user_app_id)}
                            title="Copier l'ID"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{userAppId.app_details?.name || userAppId.app_name}</TableCell>
                      <TableCell>{userAppId.telegram_user || "-"}</TableCell>
                      <TableCell>{new Date(userAppId.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Ouvrir le menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(userAppId)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(userAppId)}
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
                  Page {filters.page} sur {Math.ceil((userAppIdsData?.count || 0) / (filters.page_size || 10))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                    disabled={!userAppIdsData?.previous}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                    disabled={!userAppIdsData?.next}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Aucun ID utilisateur app trouvé</div>
          )}
        </CardContent>
      </Card>

      <UserAppIdDialog open={dialogOpen} onOpenChange={setDialogOpen} userAppId={selectedUserAppId} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ceci supprimera définitivement l'ID utilisateur app "{userAppIdToDelete?.user_app_id}". Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              {deleteUserAppId.isPending ? (
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
