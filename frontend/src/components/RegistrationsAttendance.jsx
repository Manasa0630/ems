import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ChevronDownIcon, CheckIcon } from './Icons';

export default function RegistrationsAttendance({ events = [], onShowMessage }) {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.event_id || '');
  const [showNoShows, setShowNoShows] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].event_id);
    }
  }, [events]);

  const loadAttendance = async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      const data = await api.getAttendanceForEvent(selectedEventId, showNoShows);
      setRegistrations(data);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [selectedEventId, showNoShows]);

  const handleMarkPresent = async (regId) => {
    try {
      setMarkingId(regId);
      await api.markAttendance(regId);
      onShowMessage('Participant marked present! Feedback is now unlocked for them.', 'success');
      loadAttendance();
    } catch (err) {
      onShowMessage(err.message, 'error');
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div>
      {/* Top Filter Bar (Slide 10) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {/* Event selection dropdown */}
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            style={{
              appearance: 'none',
              backgroundColor: '#ffffff',
              border: '1px solid #c4b5fd',
              borderRadius: '12px',
              padding: '10px 40px 10px 16px',
              fontSize: '14.5px',
              fontWeight: '600',
              color: '#1e1b4b',
              width: '100%',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 1px 3px rgba(109, 40, 217, 0.08)'
            }}
          >
            {events.map((ev) => (
              <option key={ev.event_id} value={ev.event_id}>
                {ev.title}
              </option>
            ))}
          </select>
          <span style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6d28d9',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center'
          }}>
            <ChevronDownIcon size={16} />
          </span>
        </div>

        {/* Show no-shows toggle button */}
        <button
          type="button"
          onClick={() => setShowNoShows(!showNoShows)}
          style={{
            backgroundColor: showNoShows ? '#ede9fe' : '#ffffff',
            border: showNoShows ? '1.5px solid #7c3aed' : '1px solid #c4b5fd',
            borderRadius: '12px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#6d28d9',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(109, 40, 217, 0.05)'
          }}
        >
          {showNoShows ? '✓ Showing No-shows' : 'Show no-shows'}
        </button>
      </div>

      {/* Registrations & Attendance Table (Slide 10) */}
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
                <th style={{ width: '25%' }}>Name</th>
                <th style={{ width: '35%' }}>Email</th>
                <th style={{ width: '20%' }}>Status</th>
                <th style={{ width: '20%' }}>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading registrations...
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    {showNoShows ? 'No no-shows for this event!' : 'No registrations found for this event.'}
                  </td>
                </tr>
              ) : (
                registrations.map((r) => {
                  const isPresent = Boolean(r.is_present);
                  const isConfirmed = r.status === 'confirmed';
                  const isCancelled = r.status === 'cancelled';

                  return (
                    <tr key={r.registration_id}>
                      <td style={{ fontWeight: '500', color: '#111827' }}>
                        {r.name}
                      </td>

                      <td style={{ color: '#4b5563' }}>
                        {r.email}
                      </td>

                      <td>
                        <span className={`badge-status ${r.status}`}>
                          {r.status}
                        </span>
                      </td>

                      <td>
                        {isPresent ? (
                          <span style={{
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            padding: '6px 14px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <CheckIcon size={14} /> Present
                          </span>
                        ) : isConfirmed ? (
                          <button
                            onClick={() => handleMarkPresent(r.registration_id)}
                            disabled={markingId === r.registration_id}
                            className="btn-primary"
                            style={{
                              padding: '8px 18px',
                              fontSize: '13px',
                              borderRadius: '10px'
                            }}
                          >
                            {markingId === r.registration_id ? 'Marking...' : 'Mark present'}
                          </button>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '14px' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
