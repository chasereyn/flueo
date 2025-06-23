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

interface TranslationPair {
  english: string
  spanish: string
}

interface TranslationResponse {
  translations: TranslationPair[]
  count: number
}

export default function AddPage() {
  const [phrase, setPhrase] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<TranslationResponse | null>(null)
  const [rawApiResponse, setRawApiResponse] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
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

  const handleSaveToSupabase = async (pair: TranslationPair) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error("No user logged in")
      return
    }

    try {
      const { error } = await supabase.from("cards").insert({
        user_id: user.id,
        english: pair.english,
        spanish: pair.spanish,
        proficiency: 0,
      })

      if (error) throw error
      
      // Show some kind of success indication but don't navigate away
      // so user can save other pairs if they want
      alert("Card saved successfully!")
    } catch (error) {
      console.error("Error saving to Supabase:", error)
    }
  }

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
                {response && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated Flashcards ({response.count})</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                      {response.translations.map((pair, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <h3 className="font-semibold mb-2">English</h3>
                              <p className="text-lg">{pair.english}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">Spanish</h3>
                              <p className="text-lg">{pair.spanish}</p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleSaveToSupabase(pair)}
                            className="w-full"
                          >
                            Save This Card
                          </Button>
                        </div>
                      ))}
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
