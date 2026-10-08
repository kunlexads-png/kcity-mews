import { useState } from 'react';
import { ShieldCheck, CreditCard, Lock, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface PaystackModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  reference: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  onPaymentSuccess: (verifiedOrder: any) => void;
}

export function PaystackPaymentModal({
  isOpen,
  onClose,
  orderNumber,
  reference,
  amount,
  customerEmail,
  customerName,
  onPaymentSuccess,
}: PaystackModalProps) {
  const [channel, setChannel] = useState<'card' | 'bank_transfer' | 'ussd'>('card');
  const [cardNumber, setCardNumber] = useState('4084 0841 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('408');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState('123456');

  const { error } = useToast();

  if (!isOpen) return null;

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpRequired) {
      // Simulate authentic bank 3D-Secure 2-factor OTP authorization
      setIsProcessing(true);
      setStatusMessage('Connecting to Paystack Secure Gateway...');
      setTimeout(() => {
        setIsProcessing(false);
        setOtpRequired(true);
        setStatusMessage('Bank OTP sent to your phone. Enter OTP to authenticate.');
      }, 1200);
      return;
    }

    // Step 2: Finalize and verify with backend
    setIsProcessing(true);
    setStatusMessage('Verifying payment server-side with Paystack...');

    try {
      const verifyRes = await api.get<{
        success: boolean;
        message: string;
        order: any;
      }>(`/payments/verify/${encodeURIComponent(reference)}`);

      if (verifyRes.success && verifyRes.order) {
        setIsProcessing(false);
        setStatusMessage('Payment verified successfully!');
        setTimeout(() => {
          onPaymentSuccess(verifyRes.order);
        }, 500);
      } else {
        throw new Error(verifyRes.message || 'Payment verification failed');
      }
    } catch (err: any) {
      setIsProcessing(false);
      error(err.message || 'Payment verification failed. Please try again.');
      setStatusMessage('Verification failed. ' + (err.message || ''));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 transition-all">
        {/* Paystack Header */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-extrabold tracking-tight text-lg">paystack</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest">
                Secured
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Paying KCity Mews Ltd</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total to Pay</span>
            <span className="text-xl font-black text-white font-display">
              ₦{amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Order Details Header */}
          <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 border border-slate-100">
            <div className="flex justify-between text-slate-500">
              <span>Order Number:</span>
              <span className="font-semibold text-slate-800">{orderNumber}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Reference:</span>
              <span className="font-mono text-slate-800">{reference}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Customer:</span>
              <span className="font-semibold text-slate-800">{customerName} ({customerEmail})</span>
            </div>
          </div>

          {/* Payment channels */}
          {!otpRequired && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('card')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    channel === 'card'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('bank_transfer')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    channel === 'bank_transfer'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Transfer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('ussd')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    channel === 'ussd'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>USSD</span>
                </button>
              </div>
            </div>
          )}

          {/* Channel Forms */}
          {channel === 'card' && !otpRequired && (
            <form onSubmit={handlePayNow} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4084 0841 0000 0000"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono tracking-wider focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Valid Thru
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="123"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md mt-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting Paystack...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₦{amount.toLocaleString()}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {otpRequired && (
            <form onSubmit={handlePayNow} className="space-y-4 animate-in fade-in">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950">
                <p className="font-bold">2-Factor Authentication (OTP)</p>
                <p className="text-emerald-800 mt-0.5">
                  A 6-digit one-time PIN was issued for this Paystack transaction. Use test code <strong>123456</strong>.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Enter One-Time PIN
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono text-xl tracking-widest font-black focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying with Paystack...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize Payment</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Alternative channel transfer info */}
          {channel === 'bank_transfer' && !otpRequired && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <p className="font-bold text-slate-800">Paystack Dedicated Virtual Account</p>
              <div className="space-y-1 font-mono">
                <p><span className="text-slate-500 font-sans">Bank:</span> Wema Bank / Paystack Titan</p>
                <p><span className="text-slate-500 font-sans">Account:</span> 9918274620</p>
                <p><span className="text-slate-500 font-sans">Amount:</span> ₦{amount.toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={handlePayNow}
                disabled={isProcessing}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>I Have Sent The Money</span>}
              </button>
            </div>
          )}

          {/* USSD Channel */}
          {channel === 'ussd' && !otpRequired && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-center">
              <p className="font-bold text-slate-800">Dial USSD Code on Registered Phone</p>
              <p className="font-mono text-base font-extrabold text-emerald-700 bg-white py-2 rounded-lg border border-slate-200">
                *737*50*{Math.round(amount)}*192#
              </p>
              <button
                type="button"
                onClick={handlePayNow}
                disabled={isProcessing}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm USSD Payment</span>}
              </button>
            </div>
          )}

          {/* Status feedback */}
          {statusMessage && (
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 p-2.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Safe cancel */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
            <span>256-bit SSL encrypted</span>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="text-slate-500 hover:text-slate-800 transition-colors font-medium"
            >
              Cancel Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
