import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import EventCard from './EventCard';
import { SearchIcon, GridIcon, CalendarIcon, ChevronDownIcon } from './Icons';

export default function ParticipantDashboard({
  user,
  userRegistrations = [],
  onOpenPayment,
  onRefreshRegistrations,
  onShowMessage
}) {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, catData, venueData] = await Promise.all([
        api.getEvents({
          search,
          category: selectedCategory,
          venue: selectedVenue
        }),
        api.getCategories(),
        api.getVenues()
      ]);
      setEvents(eventsData);
      setCategories(catData);
      setVenues(venueData);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedCategory, selectedVenue]);

  const handleRegister = async (event) => {
    // If event has fee, open simulated payment modal first
    if (Number(event.fee) > 0) {
      onOpenPayment(event);
      return;
    }

    try {
      setActionLoadingId(event.event_id);
      const result = await api.registerForEvent(user.user_id, event.event_id);
      onShowMessage(`Registered successfully for "${event.title}"!`, 'success');
      onRefreshRegistrations();
      loadData();
    } catch (err) {
      onShowMessage(err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleJoinWaitlist = async (event) => {
    try {
      setActionLoadingId(event.event_id);
      const result = await api.registerForEvent(user.user_id, event.event_id);
      onShowMessage(`Added to waitlist for "${event.title}". You will be notified if a seat opens up!`, 'info');
      onRefreshRegistrations();
      loadData();
    } catch (err) {
      onShowMessage(err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="app-container">
      {/* Search and Filters Bar (Slide 8) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '28px',
        flexWrap: 'wrap'
      }}>
        {/* Search Input */}
        <div style={{
          position: 'relative',
          flex: '1',
          minWidth: '260px',
          maxWidth: '480px'
        }}>
          <span style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center'
          }}>
            <SearchIcon size={18} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            style={{
              width: '100%',
              padding: '12px 18px 12px 44px',
              borderRadius: '9999px',
              border: '1px solid #e2e8f0',
              fontSize: '14.5px',
              backgroundColor: '#ffffff',
              outline: 'none',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              transition: 'all 0.2s'
            }}
          />
        </div>

        {/* Right Dropdown Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Categories Dropdown */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6d28d9',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center'
            }}>
              <GridIcon size={16} />
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                appearance: 'none',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '9999px',
                padding: '10px 38px 10px 38px',
                fontSize: '13.5px',
                fontWeight: '600',
                color: '#374151',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
              }}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center'
            }}>
              <ChevronDownIcon size={14} />
            </span>
          </div>

          {/* Venues Dropdown */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6d28d9',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center'
            }}>
              <CalendarIcon size={16} />
            </span>
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              style={{
                appearance: 'none',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '9999px',
                padding: '10px 38px 10px 38px',
                fontSize: '13.5px',
                fontWeight: '600',
                color: '#374151',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
              }}
            >
              <option value="all">All venues</option>
              {venues.map((v) => (
                <option key={v.venue_id} value={v.venue_id}>
                  {v.name}
                </option>
              ))}
            </select>
            <span style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center'
            }}>
              <ChevronDownIcon size={14} />
            </span>
          </div>
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '60px 20px',
          textAlign: 'center',
          border: '1px solid #f1f0f5',
          color: '#64748b'
        }}>
          <p style={{ fontSize: '16px', fontWeight: '600' }}>No events found</p>
          <p style={{ fontSize: '13px', marginTop: '6px' }}>Try clearing your search or filter</p>
        </div>
      ) : (
        <div>
          {events.map((ev) => {
            const userReg = userRegistrations.find((r) => r.event_id === ev.event_id);
            return (
              <EventCard
                key={ev.event_id}
                event={ev}
                userRegistration={userReg}
                onRegister={handleRegister}
                onJoinWaitlist={handleJoinWaitlist}
                loading={actionLoadingId === ev.event_id}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
