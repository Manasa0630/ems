import React from 'react';
import { api } from '../services/api';
import { BellIcon, CheckIcon } from './Icons';

export default function NotificationsModal({
  user,
  notifications = [],
  onClose,
  onRefresh,
  onShowMessage
}) {
  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotifRead(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await api.markAllNotifsRead(user.user_id);
      onShowMessage('All notifications marked as read', 'success');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #f1f0f5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#f5f3ff',
              color: '#6d28d9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BellIcon size={18} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827' }}>
              Notifications
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {notifications.some((n) => !n.is_read) && (
              <button
                type="button"
                onClick={handleMarkAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6d28d9',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Mark all read
              </button>
            )}
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
        </div>

        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8' }}>
            <p style={{ fontSize: '15px', fontWeight: '600' }}>No notifications yet</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Updates regarding your registrations will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
            {notifications.map((n) => {
              const isUnread = !n.is_read;
              return (
                <div
                  key={n.notification_id}
                  onClick={() => isUnread && handleMarkAsRead(n.notification_id)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    backgroundColor: isUnread ? '#faf5ff' : '#ffffff',
                    border: isUnread ? '1.5px solid #d8b4fe' : '1px solid #f1f0f5',
                    cursor: isUnread ? 'pointer' : 'default',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: isUnread ? '700' : '500',
                        color: isUnread ? '#1e1b4b' : '#374151',
                        lineHeight: 1.45
                      }}>
                        {n.message}
                      </p>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
                        <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                          {new Date(n.sent_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {n.type && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#6d28d9',
                            backgroundColor: '#f3e8ff',
                            padding: '1px 8px',
                            borderRadius: '9999px'
                          }}>
                            {n.type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {isUnread && (
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#9333ea',
                        flexShrink: 0,
                        marginTop: '6px'
                      }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
