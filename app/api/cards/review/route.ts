import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface ReviewRequest {
  cardId: string;
  quality: number; // 0-5 quality rating
}

function calculateSM2(quality: number, repetitions: number, previousInterval: number, previousEaseFactor: number) {
  let interval: number;
  let easeFactor = previousEaseFactor;

  if (quality >= 3) {
    // Successful recall
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(previousInterval * previousEaseFactor);
    }
    
    repetitions++;
    
    // Update ease factor
    easeFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Ensure ease factor doesn't go below 1.3
    easeFactor = Math.max(1.3, easeFactor);
  } else {
    // Failed recall
    repetitions = 0;
    interval = 1;
    // Keep the same ease factor
  }

  return {
    interval,
    repetitions,
    easeFactor
  };
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body: ReviewRequest = await request.json();
    
    // Get the current card data
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', body.cardId)
      .single();
      
    if (cardError) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Calculate new SM2 values
    const sm2Result = calculateSM2(
      body.quality,
      card.repetition_count,
      card.interval_days,
      card.easiness_factor
    );

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + sm2Result.interval);

    // Update the card with new values
    const { error: updateError } = await supabase
      .from('cards')
      .update({
        quality: body.quality,
        repetition_count: sm2Result.repetitions,
        easiness_factor: sm2Result.easeFactor,
        interval_days: sm2Result.interval,
        last_review_date: new Date().toISOString(),
        next_review: nextReview.toISOString()
      })
      .eq('id', body.cardId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      nextReview: nextReview,
      ...sm2Result
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 