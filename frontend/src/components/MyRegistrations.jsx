import React, { useState } from 'react';
import { api } from '../services/api';
import { StarIcon, CheckIcon } from './Icons';

export default function MyRegistrations({
  user,
  registrations = [],
  onRefresh,
  onOpenPayment,
  onOpenFeedback,
  onShowMessage
}) {
  const [cancellingId, setCancellingId] = useState(null);

  const handleCancel = async (reg) => {
    if (!window.confirm(`Are you sure you want to cancel your registration for "${reg.title}"?`)) {
      return;
    }

    try {
      setCancellingId(reg.registration_id);
      const res = await api.cancelRegistration(reg.registration_id);
      onShowMessage('Registration cancelled. If anyone was on the waitlist, they were automatically promoted!', 'info');
      onRefresh();
    } catch (err) {
      onShowMessage(err.message, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="app-container">
      <div style={{
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>
          My Registrations
        </h2>
        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
          {registrations.length} {registrations.length === 1 ? 'event' : 'events'} registered
        </span>
      </div>

      {registrations.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '60px 20px',
          textAlign: 'center',
          border: '1px solid #f1f0f5',
          color: '#64748b'
        }}>
          <p style={{ fontSize: '16px', fontWeight: '600' }}>No registrations yet</p>
          <p style={{ fontSize: '13px', marginTop: '6px' }}>Browse available events to register!</p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #f1f0f5',
          boxShadow: '0 4px 20px -2px rgba(109, 40, 217, 0.04)',
          overflow: 'hidden'
        }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date & Venue</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Attendance</th>
                  <th>Feedback</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => {
                  const fee = Number(reg.fee) || 0;
                  const isPaid = reg.payment_status === 'success';
                  const needsPayment = fee > 0 && !isPaid && reg.status === 'confirmed';
                  const isPresent = Boolean(reg.attended);
                  const hasFeedback = Boolean(reg.has_feedback);

                  return (
                    <tr key={reg.registration_id}>
                      <td>
                        <strong style={{ fontSize: '15px', color: '#111827' }}>
                          {reg.title}
                        </strong>
                        {reg.category_name && (
                          <div style={{ fontSize: '12px', color: '#6b21a8', marginTop: '2px' }}>
                            {reg.category_name}
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontSize: '13.5px', color: '#374151' }}>
                          {new Date(reg.event_date).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {reg.venue_name || 'Campus'}
                        </div>
                      </td>

                      <td>
                        <span className={`badge-status ${reg.status}`}>
                          {reg.status === 'confirmed' && 'Confirmed'}
                          {reg.status === 'waitlisted' && 'Waitlisted'}
                          {reg.status === 'cancelled' && 'Cancelled'}
                        </span>
                      </td>

                      <td>
                        {fee === 0 ? (
                          <span style={{ fontSize: '13px', color: '#059669', fontWeight: '600' }}>
                            Free
                          </span>
                        ) : isPaid ? (
                          <span style={{
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            Paid (₹{fee})
                          </span>
                        ) : needsPayment ? (
                          <button
                            onClick={() => onOpenPayment(reg)}
                            className="btn-primary"
                            style={{
                              padding: '5px 12px',
                              fontSize: '12px',
                              borderRadius: '8px'
                            }}
                          >
                            Pay ₹{fee}
                          </button>
                        ) : (
                          <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                            {reg.status === 'waitlisted' ? 'Pending waitlist' : '-'}
                          </span>
                        )}
                      </td>

                      <td>
                        {isPresent ? (
                          <span style={{
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <CheckIcon size={13} /> Present
                          </span>
                        ) : reg.status === 'confirmed' ? (
                          <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                            Not checked in
                          </span>
                        ) : (
                          <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>-</span>
                        )}
                      </td>

                      <td>
                        {hasFeedback ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#f59e0b',
                            fontWeight: '700',
                            fontSize: '13px'
                          }}>
                            <StarIcon size={14} filled={true} />
                            {reg.feedback_rating} / 5
                          </span>
                        ) : isPresent ? (
                          <button
                            onClick={() => onOpenFeedback(reg)}
                            style={{
                              background: '#f5f3ff',
                              border: '1px solid #e9d5ff',
                              color: '#6d28d9',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Rate Event
                          </button>
                        ) : (
                          <span style={{ fontSize: '11.5px', color: '#94a3b8' }} title="Attend event first">
                            Locked
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {reg.status !== 'cancelled' ? (
                          <button
                            onClick={() => handleCancel(reg)}
                            disabled={cancellingId === reg.registration_id}
                            className="btn-danger"
                          >
                            {cancellingId === reg.registration_id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                            Cancelled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
