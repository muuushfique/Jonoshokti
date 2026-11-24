import React, { useCallback, useEffect, useState } from 'react';
import { Search, SlidersHorizontal, PlusCircle, Inbox } from 'lucide-react';
import IssueCard from '../components/IssueCard';
import ReportIssueModal from '../components/ReportIssueModal';
import { api } from '../lib/api';

const PAGE_META = {
  current: {
    title: 'Current Citizen Issues',
    subtitle: 'Community-raised problems actively seeking visibility, discussion, and action.',
    defaultSource: 'current',
    showStatusFilter: true,
  },
  govt: {
    title: 'Government Issues',
    subtitle: 'Public infrastructure, utility, and policy issues tracked for government accountability.',
    defaultSource: 'govt',
    showStatusFilter: true,
  },
  solved: {
    title: 'Solved Issues',
    subtitle: 'Civic and government issues that have been successfully addressed and resolved.',
    defaultSource: 'current',
    showStatusFilter: false,
  },
};

export default function IssuesPage({ category = 'current' }) {
  const meta = PAGE_META[category] || PAGE_META.current;

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('most-upvoted');
  const [reportOpen, setReportOpen] = useState(false);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/issues', {
        params: {
          category,
          status: meta.showStatusFilter ? statusFilter : 'Solved',
          search: search.trim() || undefined,
          sort: sortBy,
        },
      });
      setIssues(data);
    } catch (err) {
      console.error('Error loading issues:', err);
      setError('Unable to load issues right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [category, meta.showStatusFilter, search, sortBy, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchIssues, 180);
    return () => clearTimeout(timer);
  }, [fetchIssues]);

  const handleIssueUpdated = (updated) => {
    setIssues((prev) =>
      prev.map((item) =>
        item.source === updated.source && item.issue_id === updated.issue_id ? updated : item
      )
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {meta.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{meta.subtitle}</p>
        </div>

        {category !== 'solved' && (
          <button type="button" onClick={() => setReportOpen(true)} className="btn-civic shrink-0">
            <PlusCircle className="h-4 w-4" />
            Raise an Issue
          </button>
        )}
      </div>

      {/* Search, Filter & Sort Toolbar */}
      <div className="surface-card p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description, or location..."
            className="surface-input pl-10"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {meta.showStatusFilter && (
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="surface-input sm:w-40"
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="Not Solved">Not Solved</option>
                <option value="In Progress">In Progress</option>
                <option value="Solved">Solved</option>
              </select>
            </div>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="surface-input sm:w-44"
            aria-label="Sort issues"
          >
            <option value="most-upvoted">Most Upvoted</option>
            <option value="least-upvoted">Least Upvoted</option>
            <option value="most-discussed">Most Discussed</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-200/70 dark:bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="surface-card p-10 text-center space-y-3">
          <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>
          <button type="button" onClick={fetchIssues} className="btn-ghost-civic">
            Retry
          </button>
        </div>
      ) : issues.length === 0 ? (
        <div className="surface-card p-12 text-center space-y-3">
          <Inbox className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No matching issues</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Try adjusting your search or filter criteria, or raise a new issue.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
          </p>
          {issues.map((issue) => (
            <IssueCard
              key={`${issue.source}-${issue.issue_id}`}
              issue={issue}
              onUpdated={handleIssueUpdated}
            />
          ))}
        </div>
      )}

      <ReportIssueModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        defaultSource={meta.defaultSource}
        onCreated={() => fetchIssues()}
      />
    </div>
  );
}
