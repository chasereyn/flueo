'use client'

import { AppSidebar } from "@/app/app-sidebar"
import { SiteHeader } from "@/app/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

interface TranslationPair {
  english: string
  spanish: string
}

interface TranslationResponse {
  translations: TranslationPair[]
}

export default function AddPage() {
  const [phrase, setPhrase] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<TranslationResponse | null>(null)
  const [rawApiResponse, setRawApiResponse] = useState<string>("")
  const [savedCardIndices, setSavedCardIndices] = useState<Set<number>>(new Set())
  const [editedTranslations, setEditedTranslations] = useState<{ [key: number]: TranslationPair }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSavedCardIndices(new Set())
    setEditedTranslations({})
    try {
      const result = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phrase }),
      })
      const data = await result.json()
      if (data.error) {
        throw new Error(data.error)
      }
      // Store the raw response
      setRawApiResponse(JSON.stringify(data, null, 2))
      // Parse the JSON string from the translation field
      const parsedResponse = JSON.parse(data.translation) as TranslationResponse
      setResponse(parsedResponse)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (index: number, field: keyof TranslationPair, value: string) => {
    const original = response?.translations[index] || { english: "", spanish: "" }
    const current = editedTranslations[index] || original
    
    setEditedTranslations(prev => ({
      ...prev,
      [index]: {
        ...current,
        [field]: value
      }
    }))
  }

  const handleSaveToSupabase = async (pair: TranslationPair, index: number) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error("No user logged in")
      return
    }

    // Use edited version if it exists, otherwise use original
    const finalPair = editedTranslations[index] || pair

    try {
      const { error } = await supabase.from("cards").insert({
        user_id: user.id,
        english: finalPair.english,
        spanish: finalPair.spanish,
        quality: 0,
        repetition_count: 0,
        easiness_factor: 2.5,
        interval_days: 0,
        last_review_date: new Date().toISOString(),
        next_review: new Date().toISOString(),
      })

      if (error) throw error
      
      setSavedCardIndices(prev => new Set([...prev, index]))
      toast.success("Card saved successfully!")
    } catch (error) {
      console.error("Error saving to Supabase:", error)
      toast.error("Failed to save card")
    }
  }

  const handleSaveAll = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error("No user logged in")
      return
    }

    try {
      // Save all unsaved cards
      for (let index = 0; index < unsavedTranslations.length; index++) {
        const pair = editedTranslations[index] || unsavedTranslations[index]
        const { error } = await supabase.from("cards").insert({
          user_id: user.id,
          english: pair.english,
          spanish: pair.spanish,
          quality: 0,
          repetition_count: 0,
          easiness_factor: 2.5,
          interval_days: 0,
          last_review_date: new Date().toISOString(),
          next_review: new Date().toISOString(),
        })
        if (error) throw error
      }
      
      // Mark all cards as saved
      setSavedCardIndices(new Set(unsavedTranslations.map((_, i) => i)))
      toast.success("All cards saved successfully!")
    } catch (error) {
      console.error("Error saving cards:", error)
      toast.error("Failed to save all cards")
    }
  }

  // Filter out saved cards from display
  const unsavedTranslations = response?.translations.filter((_, index) => !savedCardIndices.has(index)) || []
  const unsavedCount = unsavedTranslations.length

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Translation</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter a word or phrase to create flashcards..."
                      value={phrase}
                      onChange={(e) => setPhrase(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Generating..." : "Generate Cards"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {(response || rawApiResponse) && (
              <>
                {response && unsavedCount > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated Flashcards ({unsavedCount})</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-4">
                        <Label className="font-medium">English</Label>
                        <Label className="font-medium">Spanish</Label>
                        <div className="w-[132px]" />
                      </div>
                      {unsavedTranslations.map((pair, index) => {
                        const currentPair = editedTranslations[index] || pair
                        return (
                          <div key={index} className="px-4 py-1">
                            <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center">
                              <Input
                                id={`english-${index}`}
                                value={currentPair.english}
                                onChange={(e) => handleEdit(index, 'english', e.target.value)}
                                className="text-base"
                              />
                              <Input
                                id={`spanish-${index}`}
                                value={currentPair.spanish}
                                onChange={(e) => handleEdit(index, 'spanish', e.target.value)}
                                className="text-base"
                              />
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => {
                                    setSavedCardIndices(prev => new Set([...prev, index]))
                                  }}
                                  variant="outline"
                                  className="h-9 w-9 rounded-lg p-0 flex items-center justify-center"
                                >
                                  <span className="sr-only">Delete</span>
                                  ✕
                                </Button>
                                <Button 
                                  onClick={() => handleSaveToSupabase(pair, index)}
                                  className="px-6 h-9"
                                  variant="default"
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div className="flex justify-end px-4 pt-2">
                        <Button
                          onClick={handleSaveAll}
                          className="px-6 h-9"
                          variant="default"
                        >
                          Add All ({unsavedCount})
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Collapsible className="w-full">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Debug: API Responses</CardTitle>
                        <CollapsibleTrigger className="text-sm text-muted-foreground hover:text-foreground">
                          Toggle Raw Responses
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        {rawApiResponse && (
                          <div>
                            <h3 className="font-semibold mb-2">Raw API Response:</h3>
                            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[500px] text-sm">
                              {rawApiResponse}
                            </pre>
                          </div>
                        )}
                        {response && (
                          <div>
                            <h3 className="font-semibold mb-2">Parsed Response:</h3>
                            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[500px] text-sm">
                              {JSON.stringify(response, null, 2)}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
