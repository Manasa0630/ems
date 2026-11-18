import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import RegistrationsAttendance from './RegistrationsAttendance';

export default function AdminDashboard({ onShowMessage }) {
  const [activeSubTab, setActiveSubTab] = useState('events'); // 'events' | 'venues' | 'categories' | 'registrations'
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Event Form State (matches Slide 9)
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [closingTime, setClosingTime] = useState('09:00');
  const [categoryId, setCategoryId] = useState('');
  const [venueId, setVenueId] = useState('');
  const [fee, setFee] = useState('0');
  const [seats, setSeats] = useState('50');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New Venue Form State
  const [venueName, setVenueName] = useState('');
  const [venueLocation, setVenueLocation] = useState('');
  const [venueCapacity, setVenueCapacity] = useState('60');

  // New Category Form State
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, catData, venueData] = await Promise.all([
        api.getEvents(),
        api.getCategories(),
        api.getVenues()
      ]);
      setEvents(eventsData);
      setCategories(catData);
      setVenues(venueData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title || !eventDate || !seats) {
      onShowMessage('Title, event date and seats are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.createEvent({
        title,
        description,
        event_date: eventDate,
        event_time: closingTime ? `${closingTime}:00` : '09:00:00',
        category_id: categoryId || null,
        venue_id: venueId || null,
        fee: Number(fee) || 0,
        capacity: Number(seats)
      });
      onShowMessage(`Event "${title}" created successfully!`, 'success');
      // Reset form
      setTitle('');
      setEventDate('');
      setClosingTime('09:00');
      setCategoryId('');
      setVenueId('');
      setFee('0');
      setSeats('50');
      setDescription('');
      loadData();
    } catch (err) {
      onShowMessage(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to delete event "${eventTitle}"? All registrants will be notified of cancellation.`)) {
      return;
    }
    try {
      await api.deleteEvent(eventId);
      onShowMessage(`Event "${eventTitle}" deleted and registrants notified.`, 'info');
      loadData();
    } catch (err) {
      onShowMessage(err.message, 'error');
    }
  };

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    if (!venueName || !venueCapacity) {
      onShowMessage('Venue name and capacity are required', 'error');
      return;
    }
    try {
      await api.createVenue({
        name: venueName,
        location: venueLocation,
        capacity: Number(venueCapacity)
      });
      onShowMessage(`Venue "${venueName}" created!`, 'success');
      setVenueName('');
      setVenueLocation('');
      setVenueCapacity('60');
      loadData();
    } catch (err) {
      onShowMessage(err.message, 'error');
    }
  };

  const handleDeleteVenue = async (id, name) => {
    if (!window.confirm(`Delete venue "${name}"?`)) return;
    try {
      await api.deleteVenue(id);
      onShowMessage(`Venue "${name}" deleted`, 'info');
      loadData();
    } catch (err) {
      onShowMessage(err.message, 'error');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName) {
      onShowMessage('Category name is required', 'error');
      return;
    }
    try {
      await api.createCategory({
        name: catName,
        description: catDescription
      });
      onShowMessage(`Category "${catName}" created!`, 'success');
      setCatName('');
      setCatDescription('');
      loadData();
    } catch (err) {
      onShowMessage(err.message, 'error');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await api.deleteCategory(id);
      onShowMessage(`Category "${name}" deleted`, 'info');
      loadData();
    } catch (err) {
      onShowMessage(err.message, 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Page Heading (Slide 9) */}
      <h1 style={{
        fontSize: '34px',
        fontWeight: '800',
        color: '#111827',
        marginBottom: '20px',
        letterSpacing: '-0.5px'
      }}>
        Manage
      </h1>

      {/* Sub-Navigation Pills (Slide 9) */}
      <div style={{
        display: 'inline-flex',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '5px',
        marginBottom: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {[
          { key: 'events', label: 'Events' },
          { key: 'venues', label: 'Venues' },
          { key: 'categories', label: 'Categories' },
          { key: 'registrations', label: 'Registrations' }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveSubTab(tab.key)}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14.5px',
              fontWeight: activeSubTab === tab.key ? '700' : '600',
              cursor: 'pointer',
              color: activeSubTab === tab.key ? '#ffffff' : '#4b5563',
              background: activeSubTab === tab.key
                ? 'linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)'
                : 'transparent',
              transition: 'all 0.2s',
              boxShadow: activeSubTab === tab.key ? '0 2px 8px rgba(109, 40, 217, 0.25)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Manage Events */}
      {activeSubTab === 'events' && (
        <div>
          {/* New Event Form (Slide 9) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #f1f0f5',
            padding: '32px',
            boxShadow: '0 4px 20px -2px rgba(109, 40, 217, 0.04)',
            marginBottom: '36px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '24px'
            }}>
              New event
            </h2>

            <form onSubmit={handleCreateEvent}>
              {/* Row 1: Title, Event date, Registration closing time, Category */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Event title"
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Event date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Registration closing time</label>
                  <input
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Venue, Fee in ₹, Seats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Venue</label>
                  <select
                    value={venueId}
                    onChange={(e) => setVenueId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">None</option>
                    {venues.map((v) => (
                      <option key={v.venue_id} value={v.venue_id}>
                        {v.name} ({v.capacity} capacity)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Fee in ₹ (0 for free)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Seats</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Row 3: Description */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter details, schedule and requirements..."
                  className="form-textarea"
                />
              </div>

              {/* Submit Button (Slide 9) */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{
                  padding: '12px 28px',
                  fontSize: '15px',
                  borderRadius: '12px'
                }}
              >
                {submitting ? 'Creating...' : 'Create event'}
              </button>
            </form>
          </div>

          {/* Existing Events List */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #f1f0f5',
            boxShadow: '0 4px 20px -2px rgba(109, 40, 217, 0.04)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f0f5' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                Existing Events ({events.length})
              </h3>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date & Closing</th>
                    <th>Category & Venue</th>
                    <th>Fee & Capacity</th>
                    <th>Registrations</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev.event_id}>
                      <td style={{ fontWeight: '600', color: '#111827' }}>
                        {ev.title}
                      </td>
                      <td>
                        <div>{new Date(ev.event_date).toLocaleDateString()}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Closes: {String(ev.event_time).slice(0, 5)}</div>
                      </td>
                      <td>
                        <span className="badge-lavender" style={{ marginRight: '6px' }}>
                          {ev.category_name || 'General'}
                        </span>
                        <span style={{ fontSize: '13px', color: '#4b5563' }}>
                          {ev.venue_name || 'TBA'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: '600', color: '#6d28d9' }}>
                          {Number(ev.fee) === 0 ? 'Free' : `₹${ev.fee}`}
                        </span>
                        <span style={{ fontSize: '12.5px', color: '#64748b', marginLeft: '8px' }}>
                          ({ev.capacity} seats)
                        </span>
                      </td>
                      <td>
                        <span style={{
                          backgroundColor: ev.is_full ? '#fef3c7' : '#f5f3ff',
                          color: ev.is_full ? '#b45309' : '#6d28d9',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {ev.confirmed_count} / {ev.capacity} ({ev.is_full ? 'Full' : `${ev.available_seats} left`})
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteEvent(ev.event_id, ev.title)}
                          className="btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Venues */}
      {activeSubTab === 'venues' && (
        <div>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #f1f0f5',
            padding: '32px',
            boxShadow: '0 4px 20px -2px rgba(109, 40, 217, 0.04)',
            marginBottom: '32px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
              Add New Venue
            </h2>
            <form onSubmit={handleCreateVenue} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Venue Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Minchu, Auditorium"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Location / Department</label>
                <input
                  type="text"
                  placeholder="e.g. UVCE, Main Block"
                  value={venueLocation}
                  onChange={(e) => setVenueLocation(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Capacity (Max Seats)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={venueCapacity}
                  onChange={(e) => setVenueCapacity(e.target.value)}
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-primary" style={{ height: '42px' }}>
                Add Venue
              </button>
            </form>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #f1f0f5',
            boxShadow: '0 4px 20px -2px rgba(109, 40, 217, 0.04)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f0f5' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Venues ({venues.length})</h3>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Venue Name</th>
                    <th>Location</th>
                    <th>Capacity</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map((v) => (
                    <tr key={v.venue_id}>
                      <td style={{ fontWeight: '600' }}>{v.name}</td>
                      <td>{v.location || 'Campus'}</td>
                      <td>{v.capacity} seats</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleDeleteVenue(v.venue_id, v.name)} className="btn-danger">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Manage Categories */}
      {activeSubTab === 'categories' && (
        <div>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #f1f0f5',
            padding: '32px',
            boxShadow: '0 4px 20px -2px rgba(109, 40, 217, 0.04)',
            marginBottom: '32px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
              Add New Category
            </h2>
            <form onSubmit={handleCreateCategory} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical, Cultural, Sports"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group" style={{ margin: 0, flex: 2 }}>
                <label className="form-label">Description</label>
                <input
                  type="text"
                  placeholder="Brief category description"
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-primary" style={{ height: '42px' }}>
                Add Category
              </button>
            </form>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #f1f0f5',
            boxShadow: '0 4px 20px -2px rgba(109, 40, 217, 0.04)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f0f5' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Categories ({categories.length})</h3>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.category_id}>
                      <td style={{ fontWeight: '600', color: '#6d28d9' }}>{c.name}</td>
                      <td>{c.description || '-'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleDeleteCategory(c.category_id, c.name)} className="btn-danger">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Registrations & Attendance (Slide 10) */}
      {activeSubTab === 'registrations' && (
        <RegistrationsAttendance events={events} onShowMessage={onShowMessage} />
      )}
    </div>
  );
}
