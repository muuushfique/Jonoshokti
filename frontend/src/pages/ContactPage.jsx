import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MapPin, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';

const REFERRAL_OPTIONS = [
  'Government Portal (DotGovtBD)',
  'Search Engine (Google)',
  'Social Media / YouTube',
  'Community / Word of Mouth',
  'News / Media',
  'Other',
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    if (!message.trim()) {
      setStatus({ type: 'error', text: 'Please type a message before submitting.' });
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/contact', {
        name,
        email,
        website: website || 'Direct',
        message,
      });
      setStatus({ type: 'success', text: data.message || 'Message sent successfully!' });
      setName('');
      setEmail('');
      setWebsite('');
      setMessage('');
    } catch (err) {
      setStatus({
        type: 'error',
        text: err.response?.data?.message || 'Could not send message. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Context Column */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Mail className="h-4 w-4" /> Get in Touch
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Contact Jonoshokti
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Have feedback, partnership inquiries, or need help escalating a civic issue? Send us a
              message and our team will review it promptly.
            </p>
          </div>

          <div className="surface-card p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Nationwide Coverage</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Serving all 64 districts across Bangladesh.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Direct Civic Channel</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Every submission is logged directly for follow-up and transparency.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 surface-card p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Your Name
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="surface-input"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address *
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="surface-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-source" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              How did you hear about Jonoshokti?
            </label>
            <select
              id="contact-source"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="surface-input"
            >
              <option value="">-- Select One --</option>
              {REFERRAL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Message *
            </label>
            <textarea
              id="contact-message"
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message, feedback, or civic inquiry..."
              className="surface-input resize-none"
            />
          </div>

          {status.text && (
            <div
              className={`rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2 ${
                status.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {status.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {status.text}
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-civic w-full py-3">
            <Send className="h-4 w-4" />
            {submitting ? 'Sending Message...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
