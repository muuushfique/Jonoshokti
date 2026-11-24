import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  MapPin,
  ArrowUpRight,
  Landmark,
  Users,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import {
  api,
  computeVoteTransition,
  FALLBACK_ISSUE_IMAGE,
  getSavedVotes,
  saveVoteState,
} from '../lib/api';

export default function IssueCard({ issue, onUpdated }) {
  const voteKey = `${issue.source}:${issue.issue_id}`;
  const [userVote, setUserVote] = useState(() => getSavedVotes()[voteKey] || null);
  const [voting, setVoting] = useState(false);

  const handleVote = async (clickedType) => {
    if (voting) return;
    const { nextVote, likesDelta, dislikesDelta } = computeVoteTransition(userVote, clickedType);

    const optimistic = {
      ...issue,
      issue_likes: Math.max(0, issue.issue_likes + likesDelta),
      issue_dislikes: Math.max(0, issue.issue_dislikes + dislikesDelta),
    };

    setVoting(true);
    setUserVote(nextVote);
    saveVoteState(voteKey, nextVote);
    onUpdated?.(optimistic);

    try {
      const { data } = await api.patch(`/issues/${issue.source}/${issue.issue_id}/vote`, {
        likesDelta,
        dislikesDelta,
      });
      onUpdated?.(data);
    } catch (err) {
      console.error('Vote failed:', err);
      // Rollback
      setUserVote(userVote);
      saveVoteState(voteKey, userVote);
      onUpdated?.(issue);
    } finally {
      setVoting(false);
    }
  };

  const detailPath = `/issues/${issue.source}/${issue.issue_id}`;

  return (
    <article className="surface-card overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row">
      <Link
        to={detailPath}
        className="sm:w-52 md:w-56 h-48 sm:h-auto shrink-0 bg-slate-100 dark:bg-slate-900 overflow-hidden block relative group"
      >
        <img
          src={issue.issue_image || FALLBACK_ISSUE_IMAGE}
          alt={issue.issue_title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_ISSUE_IMAGE;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-950/75 text-white backdrop-blur-sm">
          {issue.source === 'govt' ? (
            <>
              <Landmark className="h-3 w-3 text-emerald-400" /> Govt
            </>
          ) : (
            <>
              <Users className="h-3 w-3 text-emerald-400" /> Citizen
            </>
          )}
        </span>
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <StatusBadge status={issue.issue_status} />
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              {issue.issue_location || 'Bangladesh'}
            </span>
          </div>

          <Link to={detailPath} className="group inline-block">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug">
              {issue.issue_title}
            </h3>
          </Link>

          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
            {issue.issue_description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleVote('upvote')}
              disabled={voting}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                userVote === 'upvote'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
              }`}
              aria-label="Upvote issue"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{issue.issue_likes}</span>
            </button>

            <button
              type="button"
              onClick={() => handleVote('downvote')}
              disabled={voting}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                userVote === 'downvote'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/50'
              }`}
              aria-label="Downvote issue"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span>{issue.issue_dislikes}</span>
            </button>

            <Link
              to={detailPath}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{issue.comments?.length || 0}</span>
            </Link>
          </div>

          <Link
            to={detailPath}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            View Details
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
