import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  ThumbsUp,
  PlusCircle,
  ArrowUpRight,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ReportIssueModal from '../components/ReportIssueModal';
import { api } from '../lib/api';

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const total = stats?.overall.totalIssues || 0;
  const pct = (count) => (total ? Math.round((count / total) * 100) : 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <BarChart3 className="h-4 w-4" /> Civic Accountability Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Reports &amp; Insights
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Live transparency metrics across citizen-reported and government issues.
          </p>
        </div>

        <button type="button" onClick={() => setReportOpen(true)} className="btn-civic shrink-0">
          <PlusCircle className="h-4 w-4" />
          Submit New Report
        </button>
      </div>

      {loading || !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="surface-card p-5">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Tracked Issues</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {stats.overall.totalIssues}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {stats.currentIssues.total} Citizen · {stats.govtIssues.total} Government
              </p>
            </div>

            <div className="surface-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Solved Issues</p>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-2">
                {stats.overall.solved}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {stats.overall.resolutionRate}% overall resolution rate
              </p>
            </div>

            <div className="surface-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">In Progress</p>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
                {stats.overall.inProgress}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {pct(stats.overall.inProgress)}% actively being worked on
              </p>
            </div>

            <div className="surface-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unresolved</p>
                <AlertCircle className="h-4 w-4 text-rose-500" />
              </div>
              <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
                {stats.overall.notSolved}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {stats.overall.totalVotes.toLocaleString()} total citizen votes cast
              </p>
            </div>
          </div>

          {/* Breakdown Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="surface-card p-6 space-y-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Resolution Status Distribution
              </h2>

              {[
                { label: 'Solved', count: stats.overall.solved, bar: 'bg-emerald-600' },
                { label: 'In Progress', count: stats.overall.inProgress, bar: 'bg-amber-500' },
                { label: 'Not Solved', count: stats.overall.notSolved, bar: 'bg-rose-500' },
              ].map((row) => (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{row.label}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {row.count} ({pct(row.count)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.bar} transition-all duration-500`}
                      style={{ width: `${pct(row.count)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="surface-card p-6 space-y-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Channel Breakdown
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 dark:bg-[#0B1519] p-4 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Citizen Issues</p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stats.currentIssues.total}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Solved: {stats.currentIssues.solved} · Active: {stats.currentIssues.inProgress}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-[#0B1519] p-4 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Government Issues</p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stats.govtIssues.total}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Solved: {stats.govtIssues.solved} · Active: {stats.govtIssues.inProgress}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Community Volunteer Engagement
                  </p>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                    {stats.communityPrograms.total} active programs · {stats.communityPrograms.volunteers} citizen signups
                  </p>
                </div>
                <Link
                  to="/community-service"
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
                >
                  View
                </Link>
              </div>
            </div>
          </div>

          {/* Priority Table */}
          <div className="surface-card overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Highest-Priority Citizen Issues
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-[#0B1519] text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Issue</th>
                    <th className="px-6 py-3 font-semibold">Channel</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Upvotes</th>
                    <th className="px-6 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.topIssues.map((item) => (
                    <tr key={`${item.source}-${item.issue_id}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {item.issue_title}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {item.source === 'govt' ? 'Government' : 'Citizen'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.issue_status} />
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-700 dark:text-emerald-400">
                        <span className="inline-flex items-center gap-1 justify-end">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {item.issue_likes}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/issues/${item.source}/${item.issue_id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                          Inspect <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <ReportIssueModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onCreated={() => loadStats()}
      />
    </div>
  );
}
