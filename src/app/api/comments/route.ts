import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketId = searchParams.get('marketId');

    if (!marketId) {
      return NextResponse.json(
        { error: 'Market ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('market_id', parseInt(marketId))
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error in GET /api/comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { marketId, walletAddress, content } = await request.json();

    // Validate required fields
    if (!marketId || !walletAddress || !content) {
      return NextResponse.json(
        { error: 'Market ID, wallet address, and content are required' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Content must be 1000 characters or less' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        market_id: parseInt(marketId),
        wallet_address: walletAddress.toLowerCase(),
        content: content.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
