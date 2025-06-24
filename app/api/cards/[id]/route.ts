import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// PATCH - Update card
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
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
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error updating card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete card
export async function DELETE(
  _request: Request,
  context: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', context.params.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 