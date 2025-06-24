'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DataTable } from './data-table'

export function DataTableWrapper({ initialCards }: { initialCards: any[] }) {
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