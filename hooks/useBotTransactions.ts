"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"

export interface BotTransactionUser {
  id: string
  first_name: string
  last_name: string
  email: string
}

export interface BotTransaction {
  id: number
  user: BotTransactionUser
  amount: number
  deposit_reward_amount: number | null
  reference: string
  type_trans: "deposit" | "withdrawal" | "disbursements" | "reward"
  status: "init_payment" | "accept" | "error" | "pending"
  created_at: string
  validated_at: string | null
  webhook_data: any
  wehook_receive_at: string | null
  phone_number: string | null
  user_app_id: string | null
  withdriwal_code: string | null
  error_message: string | null
  transaction_link: string | null
  net_payable_amout: number | null
  otp_code: string | null
  public_id: string | null
  already_process: boolean
  source: "mobile" | "web" | "bot" | null
  old_status: string
  old_public_id: string
  success_webhook_send: boolean
  fail_webhook_send: boolean
  pending_webhook_send: boolean
  timeout_webhook_send: boolean
  telegram_user: number | null
  app: string
  network: number | null
}

export interface BotTransactionsResponse {
  count: number
  next: string | null
  previous: string | null
  results: BotTransaction[]
}

export interface BotTransactionFilters {
  page?: number
  page_size?: number
  user?: string
  type_trans?: string
  status?: string
  source?: string
  network?: number
  search?: string
}

export interface CreateBotDepositInput {
  amount: number
  phone_number: string
  app: string
  user_app_id: string
  network: number
  source: "web" | "mobile" | "bot"
}

export interface CreateBotWithdrawalInput {
  amount: number
  phone_number: string
  app: string
  user_app_id: string
  network: number
  withdriwal_code: string
  source: "web" | "mobile" | "bot"
}

export interface ChangeBotStatusInput {
  reference: string
}

export function useBotTransactions(filters: BotTransactionFilters = {}) {
  return useQuery({
    queryKey: ["bot-transactions", filters],
    queryFn: async () => {
      const res = await api.get<BotTransactionsResponse>("/mobcash/transaction-history?source=bot", { params: filters })
      return res.data
    },
  })
}

export function useCreateBotDeposit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateBotDepositInput) => {
      const res = await api.post<BotTransaction>("/mobcash/bot-transaction-deposit", data)
      return res.data
    },
    onSuccess: () => {
      toast.success("Bot deposit transaction created successfully!")
      queryClient.invalidateQueries({ queryKey: ["bot-transactions"] })
    },
  })
}

export function useCreateBotWithdrawal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateBotWithdrawalInput) => {
      const res = await api.post<BotTransaction>("/mobcash/bot-transaction-withdrawal", data)
      return res.data
    },
    onSuccess: () => {
      toast.success("Bot withdrawal transaction created successfully!")
      queryClient.invalidateQueries({ queryKey: ["bot-transactions"] })
    },
  })
}

export function useChangeBotTransactionStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ChangeBotStatusInput) => {
      const res = await api.post("/mobcash/change-bot-transaction", data)
      return res.data
    },
    onSuccess: () => {
      toast.success("Bot transaction status updated successfully!")
      queryClient.invalidateQueries({ queryKey: ["bot-transactions"] })
    },
  })
}

export function useCheckBotTransactionStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reference: string) => {
      const res = await api.get(`/mobcash/show-transaction-status?reference=${reference}`)
      return res.data
    },
    onSuccess: (data, reference) => {
      queryClient.invalidateQueries({ queryKey: ["bot-transactions"] })
      return data
    },
  })
}
