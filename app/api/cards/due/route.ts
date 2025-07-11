import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const MAX_CARDS_PER_SESSION = 20; // Adjust this number as needed

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get cards that are due for review (next_review <= now)
    // Order by next_review to get the most overdue cards first
    const { data: cards, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', user.id)
      .lte('next_review', new Date().toISOString())
      .order('next_review')
      .limit(MAX_CARDS_PER_SESSION);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
    }

    return NextResponse.json({ cards });

  } catch (error: unknown) {
    console.error('Error fetching due cards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 