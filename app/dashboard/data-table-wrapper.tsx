'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DataTable } from './data-table'

interface Card {
  id: string
  english: string
  spanish: string
  quality: number
  next_review: string | null
}

export function DataTableWrapper({ initialCards }: { initialCards: Card[] }) {
  const [cards, setCards] = useState(initialCards)
  const supabase = createClient()

  const fetchCards = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user.id)

    if (!error && data) {
      setCards(data)
    }
  }

  return (
    <DataTable 
      cards={cards} 
      onCardUpdate={fetchCards}
    />
  )
} 