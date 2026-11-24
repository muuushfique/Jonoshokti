import React, { useEffect, useMemo, useState } from 'react';
import {
  HeartHandshake,
  Search,
  Calendar,
  Clock,
  Globe,
  MapPin,
  ExternalLink,
  X,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { api } from '../lib/api';

export default function CommunityServicePage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [mode, setMode] = useState('all');

  const [selectedProgram, setSelectedProgram] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [submitErr, setSubmitErr] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get('/community-service')
      .then(({ data }) => {
        if (active) setPrograms(data);
      })
      .catch((err) => {
        console.error('Failed to fetch community programs:', err);
        if (active) setError('Could not load community service programs.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    programs.forEach((p) => {
      (p.activities || []).forEach((a) => {
        if (a.category) set.add(a.category);
      });
    });
    return ['all', ...Array.from(set).sort()];
  }, [programs]);

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      if (mode === 'remote' && !p.remote_or_online) return false;
      if (mode === 'in-person' && p.remote_or_online) return false;
      if (
        category !== 'all' &&
        !(p.activities || []).some((a) => a.category === category)
      ) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${p.title || ''} ${p.description || ''} ${p.organization?.name || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [programs, search, category, mode]);

  const openModal = (program) => {
    setSelectedProgram(program);
    setForm({ name: '', email: '', phone: '', message: '' });
    setSubmitMsg('');
    setSubmitErr('');
  };

  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProgram) return;
    setSubmitErr('');

    if (!form.name.trim() || !form.email.trim()) {
      setSubmitErr('Please provide your name and email address.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(
        `/community-service/${selectedProgram.id || selectedProgram._id}/volunteer`,
        {
          programTitle: selectedProgram.title,
          ...form,
        }
      );
      setSubmitMsg(data.message || 'Volunteer registration submitted!');
    } catch (err) {
      setSubmitErr(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      <div>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          <HeartHandshake className="h-4 w-4" /> Citizen Volunteering
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          Community Service Opportunities
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Turn civic awareness into hands-on action. Join local and online volunteer initiatives.
        </p>
      </div>

      {/* Filters */}
      <div className="surface-card p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search programs or organizations..."
            className="surface-input pl-10"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="surface-input md:w-48"
          aria-label="Filter by category"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="surface-input md:w-40"
          aria-label="Filter by mode"
        >
          <option value="all">All Modes</option>
          <option value="remote">Remote / Online</option>
          <option value="in-person">In-Person</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-slate-200/70 dark:bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="surface-card p-10 text-center text-sm text-rose-600 dark:text-rose-400">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-slate-500">
          No community service opportunities match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((program) => (
            <article
              key={program._id || program.id}
              className="surface-card p-6 flex flex-col justify-between gap-4 hover:border-emerald-400 dark:hover:border-emerald-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {program.organization?.name || 'Community Partner'}
                    </p>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {program.title}
                    </h2>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      program.remote_or_online
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {program.remote_or_online ? (
                      <>
                        <Globe className="h-3 w-3" /> Remote
                      </>
                    ) : (
                      <>
                        <MapPin className="h-3 w-3" /> In-Person
                      </>
                    )}
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {program.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {(program.activities || []).map((act, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {act.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  {program.dates && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                      {program.dates}
                    </span>
                  )}
                  {program.duration && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-emerald-600" />
                      {program.duration}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => openModal(program)}
                    className="btn-civic flex-1 py-2 text-xs"
                  >
                    Volunteer Now
                  </button>
                  {program.url && (
                    <a
                      href={program.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost-civic py-2 px-3 text-xs"
                    >
                      Details <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Volunteer Registration Modal */}
      {selectedProgram && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedProgram(null)}
        >
          <div
            className="surface-card w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Volunteer Sign-Up
                </p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedProgram.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitMsg ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{submitMsg}</p>
                <button
                  type="button"
                  onClick={() => setSelectedProgram(null)}
                  className="btn-civic mt-2"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleVolunteerSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="surface-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="surface-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+880..."
                    className="surface-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Why would you like to join?
                  </label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Share your availability or relevant skills..."
                    className="surface-input resize-none"
                  />
                </div>

                {submitErr && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{submitErr}</p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProgram(null)}
                    className="btn-ghost-civic"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn-civic">
                    <Send className="h-4 w-4" />
                    {submitting ? 'Submitting...' : 'Confirm'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
