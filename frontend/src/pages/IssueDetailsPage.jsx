import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  MapPin,
  Share2,
  Check,
  Send,
  Landmark,
  Users,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import {
  api,
  computeVoteTransition,
  FALLBACK_ISSUE_IMAGE,
  getSavedVotes,
  saveVoteState,
} from '../lib/api';

export default function IssueDetailsPage({ defaultSource }) {
  const params = useParams();
  const source = params.source || defaultSource || 'govt';
  const { id } = params;

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voting, setVoting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [author, setAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  const voteKey = `${source}:${id}`;
  const [userVote, setUserVote] = useState(() => getSavedVotes()[voteKey] || null);

  useEffect(() => {
    setUserVote(getSavedVotes()[`${source}:${id}`] || null);
    let active = true;
    setLoading(true);
    setError('');

    api
      .get(`/issues/${source}/${id}`)
      .then(({ data }) => {
        if (active) setIssue(data);
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.message || 'Issue not found.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [source, id]);

  const handleVote = async (clickedType) => {
    if (!issue || voting) return;
    const { nextVote, likesDelta, dislikesDelta } = computeVoteTransition(userVote, clickedType);
    const prevIssue = issue;

    setVoting(true);
    setUserVote(nextVote);
    saveVoteState(voteKey, nextVote);
    setIssue({
      ...issue,
      issue_likes: Math.max(0, issue.issue_likes + likesDelta),
      issue_dislikes: Math.max(0, issue.issue_dislikes + dislikesDelta),
    });

    try {
      const { data } = await api.patch(`/issues/${source}/${id}/vote`, {
        likesDelta,
        dislikesDelta,
      });
      setIssue(data);
    } catch {
      setUserVote(userVote);
      saveVoteState(voteKey, userVote);
      setIssue(prevIssue);
    } finally {
      setVoting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!issue || statusUpdating || newStatus === issue.issue_status) return;
    setStatusUpdating(true);
    try {
      const { data } = await api.patch(`/issues/${source}/${id}/status`, { status: newStatus });
      setIssue(data);
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError('');
    if (!commentText.trim()) {
      setCommentError('Please write a comment before posting.');
      return;
    }

    setCommentSubmitting(true);
    try {
      const { data } = await api.post(`/issues/${source}/${id}/comments`, {
        author: author.trim() || 'Concerned Citizen',
        text: commentText.trim(),
      });
      setIssue(data);
      setCommentText('');
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  const backLink = source === 'govt' ? '/govt-issues' : '/current-issues';

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-8 w-40 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {error || 'Issue not found'}
        </h2>
        <Link to={backLink} className="btn-civic">
          <ArrowLeft className="h-4 w-4" />
          Back to Issues
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          to={backLink}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {source === 'govt' ? 'Government Issues' : 'Current Issues'}
        </Link>

        <button type="button" onClick={handleShare} className="btn-ghost-civic py-2 px-3 text-xs">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
          {copied ? 'Link Copied' : 'Share'}
        </button>
      </div>

      {/* Main Issue Card */}
      <article className="surface-card overflow-hidden">
        <div className="h-64 sm:h-80 w-full bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
          <img
            src={issue.issue_image || FALLBACK_ISSUE_IMAGE}
            alt={issue.issue_title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_ISSUE_IMAGE;
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/75 text-white backdrop-blur-sm">
              {source === 'govt' ? (
                <>
                  <Landmark className="h-3.5 w-3.5 text-emerald-400" /> Government Channel
                </>
              ) : (
                <>
                  <Users className="h-3.5 w-3.5 text-emerald-400" /> Citizen Channel
                </>
              )}
            </span>
            <StatusBadge status={issue.issue_status} />
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                {issue.issue_location}
              </span>
              <span>·</span>
              <span>Issue #{issue.issue_id}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {issue.issue_title}
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {issue.issue_description}
            </p>
          </div>

          {/* Actions & Status Control */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleVote('upvote')}
                disabled={voting}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                  userVote === 'upvote'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                Upvote ({issue.issue_likes})
              </button>

              <button
                type="button"
                onClick={() => handleVote('downvote')}
                disabled={voting}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                  userVote === 'downvote'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
                Downvote ({issue.issue_dislikes})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="status-select" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Status:
              </label>
              <select
                id="status-select"
                value={issue.issue_status}
                disabled={statusUpdating}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="surface-input py-1.5 px-3 text-xs w-auto"
              >
                <option value="Not Solved">Not Solved</option>
                <option value="In Progress">In Progress</option>
                <option value="Solved">Solved</option>
              </select>
            </div>
          </div>
        </div>
      </article>

      {/* Citizen Discussion / Comments */}
      <section className="surface-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Citizen Discussion ({issue.comments?.length || 0})
          </h2>
        </div>

        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name (optional)"
              className="surface-input"
            />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share an update, evidence, or suggestion..."
              className="surface-input sm:col-span-2"
            />
          </div>
          {commentError && (
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{commentError}</p>
          )}
          <div className="flex justify-end">
            <button type="submit" disabled={commentSubmitting} className="btn-civic">
              <Send className="h-4 w-4" />
              {commentSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>

        {(!issue.comments || issue.comments.length === 0) ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6 border-t border-slate-100 dark:border-slate-800">
            No comments yet. Be the first to contribute to the discussion.
          </p>
        ) : (
          <ul className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {[...issue.comments].reverse().map((c, idx) => (
              <li
                key={c._id || idx}
                className="rounded-xl bg-slate-50 dark:bg-[#0B1519] border border-slate-100 dark:border-slate-800 p-4"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {c.author || 'Concerned Citizen'}
                  </span>
                  {c.date && (
                    <span className="text-[11px] text-slate-400">
                      {new Date(c.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {c.text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
