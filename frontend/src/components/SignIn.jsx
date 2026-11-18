import React, { useState } from 'react';
import { api } from '../services/api';

export default function SignIn({ onLoginSuccess }) {
  const [tab, setTab] = useState('participant'); // 'participant' | 'new_account' | 'admin'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (tab === 'participant') {
        const user = await api.userLogin(email, password);
        localStorage.setItem('ems_user', JSON.stringify(user));
        onLoginSuccess(user);
      } else if (tab === 'admin') {
        const admin = await api.adminLogin(email, password);
        localStorage.setItem('ems_user', JSON.stringify(admin));
        onLoginSuccess(admin);
      } else if (tab === 'new_account') {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        const newUser = await api.userRegister(name, email, password);
        setSuccessMsg('Account created successfully! Logging you in...');
        localStorage.setItem('ems_user', JSON.stringify(newUser));
        setTimeout(() => {
          onLoginSuccess(newUser);
        }, 500);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (type) => {
    setError('');
    setSuccessMsg('');
    if (type === 'admin') {
      setTab('admin');
      setEmail('admin@uvce.edu');
      setPassword('admin123');
    } else if (type === 'manasa') {
      setTab('participant');
      setEmail('manasamanasa0630@gmail.com');
      setPassword('password123');
    } else if (type === 'chandramma') {
      setTab('participant');
      setEmail('Chandramma123@gmail.com');
      setPassword('password123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f7fc',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '38px 32px',
        width: '100%',
        maxWidth: '430px',
        boxShadow: '0 12px 36px rgba(109, 40, 217, 0.08), 0 2px 8px rgba(0, 0, 0, 0.02)',
        border: '1px solid #f1f0f5'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#1e1b4b',
          marginBottom: '24px',
          letterSpacing: '-0.5px'
        }}>
          Sign in
        </h1>

        {/* 3-way Segmented Toggle */}
        <div style={{
          display: 'flex',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e5e7eb',
          padding: '4px',
          marginBottom: '26px'
        }}>
          <button
            type="button"
            onClick={() => { setTab('participant'); setError(''); }}
            style={{
              flex: 1,
              padding: '9px 12px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: tab === 'participant' ? '700' : '600',
              cursor: 'pointer',
              color: tab === 'participant' ? '#ffffff' : '#4b5563',
              background: tab === 'participant' ? 'linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)' : 'transparent',
              transition: 'all 0.2s',
              boxShadow: tab === 'participant' ? '0 2px 8px rgba(109, 40, 217, 0.25)' : 'none'
            }}
          >
            Participant
          </button>

          <button
            type="button"
            onClick={() => { setTab('new_account'); setError(''); }}
            style={{
              flex: 1.1,
              padding: '9px 12px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: tab === 'new_account' ? '700' : '600',
              cursor: 'pointer',
              color: tab === 'new_account' ? '#ffffff' : '#4b5563',
              background: tab === 'new_account' ? 'linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)' : 'transparent',
              transition: 'all 0.2s',
              boxShadow: tab === 'new_account' ? '0 2px 8px rgba(109, 40, 217, 0.25)' : 'none'
            }}
          >
            New account
          </button>

          <button
            type="button"
            onClick={() => { setTab('admin'); setError(''); }}
            style={{
              flex: 0.9,
              padding: '9px 12px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: tab === 'admin' ? '700' : '600',
              cursor: 'pointer',
              color: tab === 'admin' ? '#ffffff' : '#4b5563',
              background: tab === 'admin' ? 'linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)' : 'transparent',
              transition: 'all 0.2s',
              boxShadow: tab === 'admin' ? '0 2px 8px rgba(109, 40, 217, 0.25)' : 'none'
            }}
          >
            Admin
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '20px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: '#dcfce7',
            color: '#15803d',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '20px',
            border: '1px solid #bbf7d0'
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab === 'new_account' && (
            <div style={{ marginBottom: '18px' }}>
              <label style={{
                display: 'block',
                fontSize: '13.5px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Manasa K"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14.5px',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '13.5px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@uvce.edu"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '14.5px',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          <div style={{ marginBottom: '26px' }}>
            <label style={{
              display: 'block',
              fontSize: '13.5px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '14.5px',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 6px 18px rgba(109, 40, 217, 0.28)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Please wait...' : tab === 'new_account' ? 'Create Account' : 'Sign in'}
          </button>
        </form>

        {/* Demo Fast Logins for project presentation */}
        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid #f1f0f5',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
            Project Demo Quick Logins:
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setDemoCredentials('admin')}
              style={{
                background: '#f5f3ff',
                color: '#6d28d9',
                border: '1px solid #e9d5ff',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('manasa')}
              style={{
                background: '#f8fafc',
                color: '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Manasa (User)
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('chandramma')}
              style={{
                background: '#f8fafc',
                color: '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Chandramma (User)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
