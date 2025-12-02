"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"

export interface Settings {
  id: number
  minimum_deposit: string
  minimum_withdrawal: string
  bonus_percent: string
  reward_mini_withdrawal: string
  whatsapp_phone: string | null
  minimum_solde: string | null
  referral_bonus: boolean
  deposit_reward: boolean
  deposit_reward_percent: string
  min_version: string | null
  last_version: string | null
  dowload_apk_link: string | null
  wave_default_link: string | null
  orange_default_link: string | null
  mtn_default_link: string | null
  telegram: string | null
  moov_marchand_phone: string | null
  orange_marchand_phone: string | null
  bf_orange_marchand_phone: string | null
  bf_moov_marchand_phone: string | null
}

export type SettingsInput = Omit<Settings, "id">

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await api.get<Settings>("/mobcash/setting")
      return res.data
    },
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<SettingsInput>) => {
      const res = await api.put<Settings>("/mobcash/setting", data)
      return res.data
    },
    onSuccess: () => {
      toast.success("Settings updated successfully!")
      queryClient.invalidateQueries({ queryKey: ["settings"] })
    },
  })
}
