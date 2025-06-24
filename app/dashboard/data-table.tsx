'use client'

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { toast } from "sonner"

interface Card {
  id: string
  english: string
  spanish: string
  quality: number
  next_review: string | null
}

interface DataTableProps {
  cards: Card[]
  onCardUpdate: () => void // Callback to refresh the cards list
}

function getQualityColor(quality: number): "default" | "secondary" | "destructive" {
  if (quality >= 4) return "default" // Good/Easy
  if (quality >= 3) return "secondary" // Hard
  return "destructive" // Forgot/New
}

function getDaysUntilReview(nextReview: string | null): string {
  if (!nextReview) return "Not reviewed"
  
  const now = new Date()
  const reviewDate = new Date(nextReview)
  const diffTime = reviewDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return "Due now"
  if (diffDays === 0) return "Due today"
  if (diffDays === 1) return "Tomorrow"
  return `${diffDays} days`
}

export function DataTable({ cards, onCardUpdate }: DataTableProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [editedEnglish, setEditedEnglish] = useState("")
  const [editedSpanish, setEditedSpanish] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleRowClick = (card: Card) => {
    setSelectedCard(card)
    setEditedEnglish(card.english)
    setEditedSpanish(card.spanish)
  }

  const handleSave = async () => {
    if (!selectedCard) return

    try {
      const response = await fetch(`/api/cards/${selectedCard.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          english: editedEnglish,
          spanish: editedSpanish,
        }),
      })

      if (!response.ok) throw new Error('Failed to update card')

      toast.success('Card updated successfully')
      setSelectedCard(null)
      onCardUpdate() // Refresh the cards list
    } catch (error: unknown) {
      console.error('Error updating card:', error);
      toast.error('Failed to update card')
    }
  }

  const handleDelete = async () => {
    if (!selectedCard) return

    try {
      const response = await fetch(`/api/cards/${selectedCard.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete card')

      toast.success('Card deleted successfully')
      setShowDeleteDialog(false)
      setSelectedCard(null)
      onCardUpdate() // Refresh the cards list
    } catch (error: unknown) {
      console.error('Error deleting card:', error);
      toast.error('Failed to delete card')
    }
  }

  return (
    <>
      <div className="rounded-md border mx-4 lg:mx-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">English</TableHead>
              <TableHead className="w-[40%]">Spanish</TableHead>
              <TableHead className="w-[10%] text-center">Quality</TableHead>
              <TableHead className="w-[10%] text-center">Next Review</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.map((card) => (
              <TableRow 
                key={card.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(card)}
              >
                <TableCell className="font-medium">{card.english}</TableCell>
                <TableCell>{card.spanish}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={getQualityColor(card.quality)}>
                    {card.quality || 'New'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {getDaysUntilReview(card.next_review)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Card Details Dialog */}
      <Dialog open={selectedCard !== null} onOpenChange={(open) => !open && setSelectedCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Make changes to your flashcard. This will reset the card&apos;s learning progress.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="english">English</Label>
              <Input
                id="english"
                value={editedEnglish}
                onChange={(e) => setEditedEnglish(e.target.value)}
                placeholder="Enter English text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spanish">Spanish</Label>
              <Input
                id="spanish"
                value={editedSpanish}
                onChange={(e) => setEditedSpanish(e.target.value)}
                placeholder="Enter Spanish text"
              />
            </div>

            <div className="space-y-2">
              <Label>Next Review</Label>
              <div className="text-sm text-muted-foreground">
                {selectedCard?.next_review ? getDaysUntilReview(selectedCard.next_review) : 'Not reviewed'}
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedCard(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground active:bg-destructive/90 active:text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 