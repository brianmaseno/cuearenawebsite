import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';

const WalletCheckout = () => {
  const [params] = useSearchParams();
  const reference = params.get('reference');
  const callbackStatus = params.get('status');
  const [status, setStatus] = useState(reference ? 'verifying' : 'failed');
  const [message, setMessage] = useState(reference ? 'Verifying your Paystack payment...' : 'Missing payment reference.');
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    if (!reference) return;

    api.get(`/payments/paystack/verify/${reference}`)
      .then((res) => {
        setWallet(res.data.wallet);
        setStatus('success');
        setMessage('Payment verified. Your wallet has been updated.');
      })
      .catch((err) => {
        setStatus(callbackStatus === 'success' ? 'success' : 'failed');
        setMessage(err.response?.data?.message || params.get('message') || 'Unable to verify payment.');
      });
  }, [reference, callbackStatus, params]);

  const isSuccess = status === 'success';
  const isVerifying = status === 'verifying';

  return (
    <DashboardLayout title="Paystack Checkout">
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center p-4">
        <div className="card-premium w-full p-8 text-center">
          <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${isSuccess ? 'bg-green/10 text-green' : isVerifying ? 'bg-primary/10 text-primary' : 'bg-red/10 text-red'}`}>
            {isVerifying ? <Loader2 className="animate-spin" size={32} /> : isSuccess ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
          </div>
          <h1 className="text-2xl">{isVerifying ? 'Verifying Payment' : isSuccess ? 'Wallet Top-up Complete' : 'Payment Not Completed'}</h1>
          <p className="mt-3 text-text-muted">{message}</p>
          {reference && <p className="mt-4 rounded-lg bg-base2 px-3 py-2 font-mono text-xs text-text-muted">Reference: {reference}</p>}
          {wallet && (
            <p className="mt-4 text-lg font-black text-text-emphasis">
              New balance: KES {Number(wallet.balance || 0).toLocaleString()}
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/wallet" className="aura-btn flex-1 px-5 py-3 text-xs">Back to Wallet</Link>
            <Link to="/tournaments" className="btn-outline flex-1 px-5 py-3 text-xs">Find Tournaments</Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WalletCheckout;
