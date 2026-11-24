import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

const INITIAL_FORM = {
  source: 'current',
  issue_title: '',
  issue_description: '',
  issue_location: 'Dhaka',
  issue_image: '',
};

export default function ReportIssueModal({ isOpen, onClose, defaultSource = 'current', onCreated }) {
  const [form, setForm] = useState({ ...INITIAL_FORM, source: defaultSource });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.issue_title.trim()) {
      setError('Please provide a clear title for the issue.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/issues', form);
      setSuccess(true);
      onCreated?.(data);
      setTimeout(() => {
        setSuccess(false);
        setForm({ ...INITIAL_FORM, source: defaultSource });
        onClose();
      }, 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="surface-card w-full max-w-lg p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Raise a Civic Issue
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Submit an issue so citizens can upvote and prioritize it.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="py-10 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              Issue published successfully!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category
                </label>
                <select
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  className="surface-input"
                >
                  <option value="current">Citizen / Current Issue</option>
                  <option value="govt">Government Issue</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  name="issue_location"
                  value={form.issue_location}
                  onChange={handleChange}
                  placeholder="e.g., Dhaka, Chattogram"
                  className="surface-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Issue Title *
              </label>
              <input
                type="text"
                name="issue_title"
                value={form.issue_title}
                onChange={handleChange}
                placeholder="e.g., Broken Drainage System on Mirpur Road"
                required
                className="surface-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                name="issue_description"
                rows={3}
                value={form.issue_description}
                onChange={handleChange}
                placeholder="Describe the impact, affected community, and suggested action..."
                className="surface-input resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Image URL (optional)
              </label>
              <input
                type="url"
                name="issue_image"
                value={form.issue_image}
                onChange={handleChange}
                placeholder="https://..."
                className="surface-input"
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost-civic">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-civic">
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit Issue'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
