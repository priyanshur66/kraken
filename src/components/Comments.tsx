'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/lib/Web3Context';
import { useToast } from '@/lib/ToastContext';

interface Comment {
  id: string;
  market_id: number;
  wallet_address: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface CommentsProps {
  marketId: number;
}

export default function Comments({ marketId }: CommentsProps) {
  const { account, isConnected, connectWallet } = useWeb3();
  const { showSuccess, showError } = useToast();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (marketId) {
      loadComments();
    }
  }, [marketId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments?marketId=${marketId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      showError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!isConnected || !account) {
      showError('Please connect your wallet to comment');
      return;
    }

    if (!newComment.trim()) {
      showError('Please enter a comment');
      return;
    }

    if (newComment.length > 1000) {
      showError('Comment must be 1000 characters or less');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketId,
          walletAddress: account,
          content: newComment.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit comment');
      }

      const data = await response.json();
      
      // Add the new comment to the top of the list
      setComments([data.comment, ...comments]);
      setNewComment('');
      showSuccess('Comment posted successfully!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      showError(error instanceof Error ? error.message : 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isOwnComment = (walletAddress: string) => {
    return account && walletAddress.toLowerCase() === account.toLowerCase();
  };

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-xl font-bold text-white mb-6">
        Market Discussion ({comments.length})
      </h3>

      {/* Comment submission form */}
      <div className="mb-8">
        {isConnected ? (
          <div className="space-y-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this market... What factors might influence the outcome?"
              className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              maxLength={1000}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {newComment.length}/1000 characters
              </span>
              <button
                onClick={submitComment}
                disabled={submitting || !newComment.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Posting...' : 'Send'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-800 rounded-lg">
            <p className="text-gray-400 mb-4">Connect your wallet to join the discussion</p>
            <button
              onClick={connectWallet}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-lg border ${
                isOwnComment(comment.wallet_address)
                  ? 'bg-blue-900/20 border-blue-700'
                  : 'bg-gray-800 border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className={`text-sm font-medium ${
                      isOwnComment(comment.wallet_address) ? 'text-blue-300' : 'text-gray-300'
                    }`}>
                      {formatWalletAddress(comment.wallet_address)}
                      {isOwnComment(comment.wallet_address) && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          You
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {formatDate(comment.created_at)}
                </p>
              </div>
              <p className="text-gray-200 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Load more comments button (if needed in the future) */}
      {comments.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Showing {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
