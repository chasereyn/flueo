import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// PATCH - Update card
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = await params;
    const { english, spanish } = await request.json();

    // Update the card and reset its learning progress
    const { error } = await supabase
      .from('cards')
      .update({
        english,
        spanish,
        // Reset learning progress
        quality: 0,
        repetition_count: 0,
        easiness_factor: 2.5,
        interval_days: 0,
        next_review: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Card updated successfully' });
  } catch (error: unknown) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE - Delete card
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = await params;

    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Card deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting card:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 