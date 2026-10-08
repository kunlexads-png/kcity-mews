import { useState, useEffect } from 'react';
import { Mail, RefreshCw, X, CheckCircle, ExternalLink } from 'lucide-react';
import { api } from '../../services/api.ts';
import { Link } from 'react-router-dom';

interface SentEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  token?: string;
  type: string;
  sentAt: string;
}

export function DevEmailDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; emails: SentEmail[] }>('/dev/recent-emails');
      if (res.success) {
        setEmails(res.emails);
      }
    } catch {
      // Dev mode endpoint
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 6000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-3 left-3 z-40 select-none">
      {/* Expanded Popover */}
      {isOpen ? (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 text-slate-200 border border-slate-700/80 rounded-2xl shadow-2xl w-80 max-h-96 flex flex-col overflow-hidden backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-slate-800/80 flex items-center justify-between border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-100">
                Dev Mailbox
              </span>
              {emails.length > 0 && (
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                  {emails.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <button
                onClick={fetchEmails}
                disabled={loading}
                title="Refresh mailbox"
                className="p-1 hover:text-white rounded transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-white rounded transition-colors"
                title="Minimize"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="p-3 overflow-y-auto space-y-2 text-xs divide-y divide-slate-800">
            {emails.length === 0 ? (
              <p className="py-4 text-center text-slate-400 text-[11px]">
                No transactional emails yet. Sign up or place an order to test!
              </p>
            ) : (
              emails.map((email) => (
                <div key={email.id} className="pt-2 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100 text-[11px] truncate max-w-[180px]">
                      {email.subject}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">To: {email.to}</p>

                  {email.token && email.type === 'verification' && (
                    <div className="pt-0.5">
                      <Link
                        to={`/verify-email?token=${email.token}`}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Verify Email Now
                      </Link>
                    </div>
                  )}

                  {email.token && email.type === 'reset-password' && (
                    <div className="pt-0.5">
                      <Link
                        to={`/reset-password?token=${email.token}`}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Reset Password
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Mini footer */}
          <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-[9px] text-slate-400 flex items-center justify-between">
            <span>Dev Simulator Mode</span>
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-slate-200 underline"
            >
              Hide
            </button>
          </div>
        </div>
      ) : (
        /* Reduced Size Pill / Button */
        <button
          onClick={() => setIsOpen(true)}
          title="Open Dev Mailbox"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 dark:bg-slate-800/90 text-white border border-slate-700/80 shadow-lg text-[11px] font-bold tracking-wider uppercase backdrop-blur-md transition-all hover:scale-105"
        >
          <Mail className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline text-[10px]">Dev Mail</span>
          {emails.length > 0 && (
            <span className="bg-emerald-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {emails.length}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
