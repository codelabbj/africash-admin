"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"

interface BetAppInfo {
  id: string
  name: string
  image: string
  enable: boolean
  deposit_tuto_link: string | null
  withdrawal_tuto_link: string | null
  why_withdrawal_fail: string | null
  order: number | null
  city: string | null
  street: string | null
  minimun_deposit: number
  max_deposit: number
  minimun_with: number
  max_win: number
  active_for_deposit?: boolean
  active_for_with?: boolean
}

export interface DepositItem {
  id: number
  bet_app?: BetAppInfo | null
  bet_app_detail?: BetAppInfo | null
  amount: string
  created_at: string
}

export interface DepositsResponse {
  count: number
  next: string | null
  previous: string | null
  results: DepositItem[]
}

export interface Caisse {
  id: number
  bet_app: string // UUID
  bet_app_details?: BetAppInfo
  solde: string
  updated_at: string | null
}

export interface DepositFilters {
  page?: number
  page_size?: number
  bet_app?: string
  search?: string
}

export function useDeposits(filters: DepositFilters = {}) {
  return useQuery({
    queryKey: ["deposits", filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (filters.page) params.page = filters.page
      if (filters.page_size) params.page_size = filters.page_size
      if (filters.bet_app) params.bet_app = filters.bet_app
      if (filters.search) params.search = filters.search

      const res = await api.get<DepositsResponse>("/mobcash/list-deposit", { params })
      return res.data
    },
  })
}

export function useCaisses() {
  return useQuery({
    queryKey: ["caisses"],
    queryFn: async () => {
      const res = await api.get<Caisse[]>("/mobcash/caisses")
      return res.data
    },
  })
}

export interface CreateDepositInput {
  amount: number
  bet_app: string
}

export function useCreateDeposit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateDepositInput) => {
      const res = await api.post("/mobcash/deposit", data)
      return res.data
    },
    onSuccess: () => {
      toast.success("Dépôt créé avec succès!")
      queryClient.invalidateQueries({ queryKey: ["deposits"] })
      queryClient.invalidateQueries({ queryKey: ["caisses"] })
    },
    onError: (error: any) => {
      // Let the global axios interceptor handle the error message
    },
  })
}
