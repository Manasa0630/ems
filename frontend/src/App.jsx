import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SignIn from './components/SignIn';
import ParticipantDashboard from './components/ParticipantDashboard';
import MyRegistrations from './components/MyRegistrations';
import AdminDashboard from './components/AdminDashboard';
import PaymentModal from './components/PaymentModal';
import FeedbackModal from './components/FeedbackModal';
import NotificationsModal from './components/NotificationsModal';
import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ems_user'));
    } catch {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState('events');
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modals state
  const [paymentModalData, setPaymentModalData] = useState(null);
  const [feedbackModalData, setFeedbackModalData] = useState(null);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showMessage = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const loadUserData = async () => {
    if (!user || user.actor_type !== 'user') return;
    try {
      const [regs, notifs, unread] = await Promise.all([
        api.getUserRegistrations(user.user_id),
        api.getNotifications(user.user_id),
        api.getUnreadNotifCount(user.user_id)
      ]);
      setUserRegistrations(regs);
      setNotifications(notifs);
      setUnreadCount(unread.unread_count);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  useEffect(() => {
    if (user && user.actor_type === 'user') {
      loadUserData();
    }
  }, [user]);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentTab(loggedInUser.actor_type === 'admin' ? 'manage' : 'events');
    showMessage(`Welcome back, ${loggedInUser.name}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('ems_user');
    setUser(null);
    setCurrentTab('events');
    setUserRegistrations([]);
    setNotifications([]);
    setUnreadCount(0);
    showMessage('Signed out successfully', 'info');
  };

  if (!user) {
    return <SignIn onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = user.actor_type === 'admin';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fcfbfe' }}>
      {/* Toast Notification Banner */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#10b981' : '#6d28d9',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '14px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          maxWidth: '420px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <span>{toast.msg}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: '700',
              marginLeft: '8px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        user={user}
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        unreadCount={unreadCount}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingBottom: '60px' }}>
        {isAdmin ? (
          currentTab === 'manage' ? (
            <AdminDashboard onShowMessage={showMessage} />
          ) : (
            <ParticipantDashboard
              user={{ user_id: 0, actor_type: 'admin' }}
              userRegistrations={[]}
              onOpenPayment={() => {}}
              onRefreshRegistrations={() => {}}
              onShowMessage={showMessage}
            />
          )
        ) : (
          currentTab === 'events' ? (
            <ParticipantDashboard
              user={user}
              userRegistrations={userRegistrations}
              onOpenPayment={(event) => setPaymentModalData(event)}
              onRefreshRegistrations={loadUserData}
              onShowMessage={showMessage}
            />
          ) : (
            <MyRegistrations
              user={user}
              registrations={userRegistrations}
              onRefresh={loadUserData}
              onOpenPayment={(reg) => setPaymentModalData(reg)}
              onOpenFeedback={(reg) => setFeedbackModalData(reg)}
              onShowMessage={showMessage}
            />
          )
        )}
      </main>

      {/* Modals */}
      {paymentModalData && (
        <PaymentModal
          event={paymentModalData.fee !== undefined ? paymentModalData : null}
          registration={paymentModalData.registration_id ? paymentModalData : null}
          user={user}
          onClose={() => setPaymentModalData(null)}
          onSuccess={loadUserData}
          onShowMessage={showMessage}
        />
      )}

      {feedbackModalData && (
        <FeedbackModal
          registration={feedbackModalData}
          onClose={() => setFeedbackModalData(null)}
          onSuccess={loadUserData}
          onShowMessage={showMessage}
        />
      )}

      {showNotificationsModal && (
        <NotificationsModal
          user={user}
          notifications={notifications}
          onClose={() => setShowNotificationsModal(false)}
          onRefresh={loadUserData}
          onShowMessage={showMessage}
        />
      )}
    </div>
  );
}
