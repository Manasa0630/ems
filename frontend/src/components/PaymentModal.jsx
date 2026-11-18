import React, { useState } from 'react';
import { api } from '../services/api';

export default function PaymentModal({
  event,
  registration,
  user,
  onClose,
  onSuccess,
  onShowMessage
}) {
  const [method, setMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);

  const fee = event?.fee || registration?.fee || registration?.paid_amount || 0;
  const title = event?.title || registration?.title || 'Event Registration';

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      let regId = registration?.registration_id;

      // If we don't have registration yet, register first
      if (!regId) {
        const regRes = await api.registerForEvent(user.user_id, event.event_id);
        regId = regRes.registration_id;
      }

      // Process simulated payment
      const payRes = await api.makePayment(regId, `Simulated ${method}`);
      onShowMessage(`Payment of ₹${fee} successful! Ref: ${payRes.transaction_ref}`, 'success');
      onSuccess();
      onClose();
    } catch (err) {
      onShowMessage(err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827' }}>
            Complete Payment
          </h3>
          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          backgroundColor: '#f5f3ff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e9d5ff',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '13px', color: '#6b21a8', fontWeight: '600', marginBottom: '4px' }}>
            Event Registration Fee
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e1b4b', marginBottom: '8px' }}>
            {title}
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#6d28d9' }}>
            ₹{fee}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Simulated demonstration payment — no real money will be charged.
          </div>
        </div>

        <form onSubmit={handlePay}>
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
              Select Payment Method:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {['UPI', 'Card', 'NetBanking'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: method === m ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                    background: method === m ? '#f5f3ff' : '#ffffff',
                    color: method === m ? '#6d28d9' : '#374151',
                    fontWeight: '700',
                    fontSize: '13.5px',
                    cursor: 'pointer'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              borderRadius: '14px'
            }}
          >
            {processing ? 'Processing Payment...' : `Pay ₹${fee} (Simulated)`}
          </button>
        </form>
      </div>
    </div>
  );
}
