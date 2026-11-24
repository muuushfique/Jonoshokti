import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Flame,
  Landmark,
  CheckCircle2,
  HeartHandshake,
  BarChart3,
  ThumbsUp,
  MapPin,
  PlusCircle,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ReportIssueModal from '../components/ReportIssueModal';
import { api } from '../lib/api';

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);

  const loadStats = async () => {
    try {
      const { data } = await api.get('/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load homepage stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const cards = [
    {
      title: 'Current Issues',
      description: 'Ongoing citizen-reported issues that need immediate community and local attention.',
      to: '/current-issues',
      icon: Flame,
      accent: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
      metric: stats
        ? `${stats.currentIssues.total} Total · ${stats.currentIssues.inProgress} In Progress`
        : 'Loading...',
    },
    {
      title: 'Government Issues',
      description: 'Track public infrastructure, policy initiatives, and institutional accountability.',
      to: '/govt-issues',
      icon: Landmark,
      accent: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
      metric: stats
        ? `${stats.govtIssues.total} Total · ${stats.govtIssues.inProgress} In Progress`
        : 'Loading...',
    },
    {
      title: 'Solved Issues',
      description: 'Celebrate resolved civic challenges and verify progress made across Bangladesh.',
      to: '/solved-issues',
      icon: CheckCircle2,
      accent: 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60',
      metric: stats ? `${stats.solvedIssues.total} Resolved Successfully` : 'Loading...',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-[#06382C] text-white p-8 sm:p-12 shadow-xl">
        <div
          className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-red-600/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -left-16 -bottom-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-3xl space-y-5">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-emerald-100 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Civic Engagement Platform for Bangladesh
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Your voice shapes a stronger, more accountable Bangladesh.
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-2xl">
            Jonoshokti empowers citizens to raise local and national issues, prioritize what matters
            most through transparent voting, and track real progress from report to resolution.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/current-issues"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-semibold px-5 py-3 text-sm shadow-sm transition"
            >
              Explore Issues
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700/70 hover:bg-emerald-700 border border-white/20 text-white font-semibold px-5 py-3 text-sm transition"
            >
              <PlusCircle className="h-4 w-4" />
              Raise an Issue
            </button>
          </div>
        </div>

        {/* Live Metric Strip */}
        <div className="relative mt-10 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold">
              {loading ? '—' : stats?.overall.totalIssues ?? 0}
            </p>
            <p className="text-xs text-emerald-200/80 mt-0.5">Tracked Civic Issues</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold">
              {loading ? '—' : stats?.overall.totalVotes.toLocaleString() ?? 0}
            </p>
            <p className="text-xs text-emerald-200/80 mt-0.5">Citizen Votes Cast</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold">
              {loading ? '—' : `${stats?.overall.resolutionRate ?? 0}%`}
            </p>
            <p className="text-xs text-emerald-200/80 mt-0.5">Resolution Rate</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold">
              {loading ? '—' : stats?.communityPrograms.total ?? 0}
            </p>
            <p className="text-xs text-emerald-200/80 mt-0.5">Volunteer Programs</p>
          </div>
        </div>
      </section>

      {/* Primary Pillars */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Browse Civic Channels
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Jump straight into the issues that affect your neighborhood and country.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.to}
                to={card.to}
                className="surface-card p-6 hover:border-emerald-400 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${card.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>{card.metric}</span>
                  <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Top Prioritized Issues + Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 surface-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Top Prioritized Issues
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Most upvoted concerns across citizen and government channels
              </p>
            </div>
            <Link
              to="/reports"
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              Full Analytics
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {(stats?.topIssues || []).map((item) => (
                <li key={`${item.source}-${item.issue_id}`} className="py-3.5 first:pt-0 last:pb-0">
                  <Link
                    to={`/issues/${item.source}/${item.issue_id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate transition-colors">
                        {item.issue_title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.issue_location}
                        </span>
                        <span className="uppercase text-[10px] font-semibold tracking-wider">
                          {item.source === 'govt' ? 'Government' : 'Citizen'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={item.issue_status} />
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 min-w-[3.5rem] justify-end">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {item.issue_likes}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <Link
            to="/community-service"
            className="surface-card p-6 block hover:border-emerald-400 dark:hover:border-emerald-700 transition group"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-3">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
              Community Service
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              Join {stats?.communityPrograms.total || 10} active volunteer initiatives and contribute
              directly to grassroots impact.
            </p>
            <span className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Browse Opportunities <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            to="/reports"
            className="surface-card p-6 block hover:border-emerald-400 dark:hover:border-emerald-700 transition group"
          >
            <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
              Civic Reports &amp; Insights
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              Inspect live resolution rates, category breakdowns, and submit new civic reports.
            </p>
            <span className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Open Reports <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </section>

      <ReportIssueModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onCreated={() => loadStats()}
      />
    </div>
  );
}
