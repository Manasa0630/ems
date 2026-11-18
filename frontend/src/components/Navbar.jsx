import React from 'react';
import { BellIcon, LogOutIcon } from './Icons';

export default function Navbar({
  user,
  currentTab,
  onTabChange,
  unreadCount = 0,
  onOpenNotifications,
  onLogout
}) {
  const isAdmin = user?.actor_type === 'admin';

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #ede9fe',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '32px', height: '100%', alignItems: 'center' }}>
          <button
            onClick={() => onTabChange('events')}
            style={{
              background: 'none',
              border: 'none',
              height: '100%',
              fontSize: '15px',
              fontWeight: currentTab === 'events' ? '700' : '500',
              color: currentTab === 'events' ? '#18181b' : '#64748b',
              cursor: 'pointer',
              position: 'relative',
              padding: '0 4px',
              borderBottom: currentTab === 'events' ? '3px solid #6d28d9' : '3px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            Events
          </button>

          {!isAdmin ? (
            <button
              onClick={() => onTabChange('registrations')}
              style={{
                background: 'none',
                border: 'none',
                height: '100%',
                fontSize: '15px',
                fontWeight: currentTab === 'registrations' ? '700' : '500',
                color: currentTab === 'registrations' ? '#18181b' : '#64748b',
                cursor: 'pointer',
                position: 'relative',
                padding: '0 4px',
                borderBottom: currentTab === 'registrations' ? '3px solid #6d28d9' : '3px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              My registrations
            </button>
          ) : (
            <button
              onClick={() => onTabChange('manage')}
              style={{
                background: 'none',
                border: 'none',
                height: '100%',
                fontSize: '15px',
                fontWeight: currentTab === 'manage' ? '700' : '500',
                color: currentTab === 'manage' ? '#18181b' : '#64748b',
                cursor: 'pointer',
                position: 'relative',
                padding: '0 4px',
                borderBottom: currentTab === 'manage' ? '3px solid #6d28d9' : '3px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              Manage
            </button>
          )}
        </nav>

        {/* Right User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!isAdmin && (
            <button
              onClick={onOpenNotifications}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '9999px',
                padding: '6px 14px',
                fontSize: '13.5px',
                fontWeight: '600',
                color: '#374151',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <span>Notifications</span>
              <span style={{
                backgroundColor: '#6d28d9',
                color: '#ffffff',
                borderRadius: '9999px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: '700',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {unreadCount}
              </span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              {user?.name || (isAdmin ? 'Event Committee (admin)' : 'Participant')}
              {isAdmin && <span style={{ color: '#6d28d9', marginLeft: '4px' }}>(admin)</span>}
            </span>

            <button
              onClick={onLogout}
              title="Sign out"
              style={{
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#fee2e2'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = '#f3f4f6'; }}
            >
              <LogOutIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
