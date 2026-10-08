import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const { success } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    success('Message sent! Our Lagos concierge will get back to you within 24 hours.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
          Customer Service & Concierge
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-display uppercase tracking-tight text-slate-950">
          Get in Touch
        </h1>
        <p className="text-sm text-slate-600">
          Questions regarding your shoe sizing, order tracking, returns, or wholesale inquiries?
          We're here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact info list */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 space-y-6">
            <h3 className="text-sm font-black font-display uppercase tracking-wider text-slate-950">
              Direct Channels
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block uppercase">Customer Support</span>
                  <a href="mailto:support@kcitymews.com" className="text-slate-600 hover:text-black">
                    support@kcitymews.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block uppercase">Phone & WhatsApp</span>
                  <span className="text-slate-600">+234 (0) 801 234 5678</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block uppercase">Showroom & Vault</span>
                  <span className="text-slate-600">
                    Plot 12 Admiralty Way, Lekki Phase 1, Lagos, Nigeria
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ Box */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-900">
              Frequently Asked Questions
            </h4>
            <div className="space-y-2 text-slate-600">
              <p><strong>How fast is Lagos delivery?</strong> Orders before 12 PM are delivered same-day or within 24h.</p>
              <p><strong>What payment methods are supported?</strong> All Paystack channels: Cards, Bank Transfer, USSD.</p>
              <p><strong>Can I exchange sizes?</strong> Yes! We offer 7-day size exchanges on unworn footwear.</p>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs">
          {sent ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Message Received</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Thank you, {name}! We've logged your request and our team will reply shortly.
              </p>
              <button
                onClick={() => setSent(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold uppercase"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-black font-display uppercase tracking-tight text-slate-950 pb-2 border-b border-slate-100">
                Send Us a Message
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Demilade Adeleke"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Order Inquiry / Size Assistance / General"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you need help with..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
