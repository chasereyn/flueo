'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface FlashCard {
  id: string;
  english: string;
  spanish: string;
}

const QUALITY_MAPPINGS = {
  '1': { quality: 0, label: "Forgot" },
  '2': { quality: 3, label: "Hard" },
  '3': { quality: 4, label: "Good" },
  '4': { quality: 5, label: "Easy" },
} as const;

export default function ReviewPage() {
  const router = useRouter();
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    fetchDueCards();
  }, []);

  // Handle keyboard shortcuts
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Only handle shortcuts if there are cards
    if (!cards.length) return;

    // Escape or Enter to show exit dialog
    if (event.code === 'Escape') {
      event.preventDefault();
      setShowExitDialog(true);
      return;
    }

    // Space bar to flip card
    if (event.code === 'Space') {
      event.preventDefault(); // Prevent page scroll
      setIsFlipped(prev => !prev);
      return;
    }

    // Only handle number keys if card is flipped
    if (!isFlipped) return;

    const key = event.key;
    if (key in QUALITY_MAPPINGS) {
      const { quality } = QUALITY_MAPPINGS[key as keyof typeof QUALITY_MAPPINGS];
      handleQualityRating(quality);
    }
  }, [cards.length, isFlipped]);

  useEffect(() => {
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyPress);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  async function fetchDueCards() {
    try {
      const response = await fetch('/api/cards/due');
      const data = await response.json();
      if (data.cards) {
        setCards(data.cards);
      }
      setLoading(false);
    } catch (error: unknown) {
      console.error('Error fetching due cards:', error);
      toast.error("Failed to fetch cards");
      setLoading(false);
    }
  }

  async function handleQualityRating(quality: number) {
    if (!cards.length) return;
    
    const currentCard = cards[currentCardIndex];
    
    try {
      const response = await fetch('/api/cards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: currentCard.id,
          quality,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      // Move to next card
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        // Session complete
        toast.success("Review Complete! 🎉", {
          description: "You've reviewed all your due cards."
        });
        // Optionally fetch new cards or redirect
        setCards([]);
      }
    } catch (error: unknown) {
      console.error('Error submitting review:', error);
      toast.error("Failed to submit review");
    }
  }

  const handleExit = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading cards...</div>
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Card className="w-full max-w-lg p-6 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">No Cards Due</h2>
            <p className="text-muted-foreground mb-6">
              Great job! You&apos;ve completed all your due cards.
              Come back later for more reviews.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex) / cards.length) * 100;

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 hover:bg-muted"
          onClick={() => setShowExitDialog(true)}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Progress bar */}
        <div className="w-full max-w-lg">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground text-center mt-2">
            {currentCardIndex + 1} of {cards.length} cards
          </p>
        </div>

        {/* Card */}
        <Card 
          className="w-full max-w-lg min-h-[200px] cursor-pointer transition-all duration-200 transform hover:scale-[1.02]"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <CardContent className="flex items-center justify-center p-6 min-h-[200px]">
            <div className="text-2xl font-medium text-center">
              {isFlipped ? currentCard.spanish : currentCard.english}
            </div>
          </CardContent>
        </Card>

        {/* Quality buttons with keyboard shortcuts */}
        <div className="flex flex-wrap gap-2 justify-center w-full max-w-lg">
          {isFlipped && [
            { quality: 0, label: "Forgot (1)", variant: "destructive" as const },
            { quality: 3, label: "Hard (2)", variant: "outline" as const },
            { quality: 4, label: "Good (3)", variant: "default" as const },
            { quality: 5, label: "Easy (4)", variant: "secondary" as const },
          ].map(({ quality, label, variant }) => (
            <Button
              key={quality}
              variant={variant}
              className="flex-1 min-w-[100px] cursor-pointer"
              onClick={() => handleQualityRating(quality)}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Keyboard shortcuts help */}
        <div className="text-sm text-muted-foreground text-center">
          Press <kbd className="px-2 py-1 bg-muted rounded">Space</kbd> to flip card, 
          <kbd className="px-2 py-1 bg-muted rounded ml-2">1</kbd>-<kbd className="px-2 py-1 bg-muted rounded">4</kbd> to rate,
          <kbd className="px-2 py-1 bg-muted rounded ml-2">Esc</kbd> to exit
        </div>
      </div>

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Review Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end your review session early? Your progress for completed cards will be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Continue Reviewing</AlertDialogCancel>
            <AlertDialogAction onClick={handleExit} className="cursor-pointer">End Session</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
