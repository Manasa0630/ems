import React from 'react';
import { TagIcon, ClockIcon, MapPinIcon, ArrowRightIcon } from './Icons';

export default function EventCard({
  event,
  userRegistration,
  onRegister,
  onJoinWaitlist,
  loading
}) {
  // Parse date into Day and Month Year
  const dateObj = new Date(event.event_date);
  const day = !isNaN(dateObj.getDate()) ? dateObj.getDate() : '25';
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = !isNaN(dateObj.getMonth()) ? monthNames[dateObj.getMonth()] : 'Nov';
  const year = !isNaN(dateObj.getFullYear()) ? dateObj.getFullYear() : '2026';

  // Format Closing time display (e.g. "Registration closes 25 Nov, 1:00 PM")
  const formatClosingTime = () => {
    const timeStr = event.event_time ? String(event.event_time).slice(0, 5) : '13:00';
    let [hh, mm] = timeStr.split(':').map(Number);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    return `Registration closes ${day} ${month}, ${hh}:${mm < 10 ? '0' + mm : mm} ${ampm}`;
  };

  const confirmed = Number(event.confirmed_count) || 0;
  const capacity = Number(event.capacity) || 0;
  const seatsLeft = Math.max(0, capacity - confirmed);
  const isFull = confirmed >= capacity;
  const progressPercent = Math.min(100, capacity > 0 ? (confirmed / capacity) * 100 : 0);

  const fee = Number(event.fee) || 0;
  const isFree = fee === 0;

  const isUserRegistered = !!userRegistration && userRegistration.status !== 'cancelled';
  const userStatus = userRegistration?.status;

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      border: '1px solid #f1f0f5',
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      marginBottom: '20px',
      boxShadow: '0 4px 20px -2px rgba(109, 40, 217, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
      transition: 'all 0.2s ease',
      flexWrap: 'wrap'
    }}>
      {/* Purple Date Block (Left) */}
      <div style={{
        width: '96px',
        height: '96px',
        flexShrink: 0,
        borderRadius: '18px',
        background: 'linear-gradient(145deg, #5b21b6 0%, #7c3aed 50%, #9333ea 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        boxShadow: '0 6px 16px rgba(109, 40, 217, 0.28)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative wave */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '24px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderTopLeftRadius: '50%',
          borderTopRightRadius: '50%'
        }} />
        <span style={{
          fontSize: '38px',
          fontWeight: '800',
          lineHeight: 1,
          letterSpacing: '-1px'
        }}>
          {day}
        </span>
        <span style={{
          fontSize: '12.5px',
          fontWeight: '600',
          marginTop: '4px',
          opacity: 0.95,
          letterSpacing: '0.2px'
        }}>
          {month} {year}
        </span>
      </div>

      {/* Middle Details Section */}
      <div style={{ flex: 1, minWidth: '280px' }}>
        <h3 style={{
          fontSize: '22px',
          fontWeight: '800',
          color: '#111827',
          marginBottom: '8px'
        }}>
          {event.title}
        </h3>

        {/* Badges Row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '10px'
        }}>
          {event.category_name && (
            <span className="badge-lavender">
              <span style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                border: '1.5px solid #6b21a8',
                borderRadius: '2px'
              }} />
              {event.category_name}
            </span>
          )}

          <span className="badge-lavender">
            <ClockIcon size={14} color="#6b21a8" />
            {formatClosingTime()}
          </span>

          {event.venue_name && (
            <span className="badge-lavender">
              <MapPinIcon size={14} color="#6b21a8" />
              {event.venue_name}{event.venue_location ? `, ${event.venue_location}` : ''}
            </span>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p style={{
            fontSize: '14px',
            color: '#4b5563',
            marginBottom: '12px',
            lineHeight: 1.45
          }}>
            {event.description}
          </p>
        )}

        {/* Capacity Progress Bar */}
        <div style={{ maxWidth: '440px', marginTop: '6px' }}>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#f3e8ff',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #6d28d9, #9333ea)',
              borderRadius: '9999px',
              transition: 'width 0.3s ease'
            }} />
          </div>

          <p style={{
            fontSize: '12.5px',
            color: '#6b7280',
            marginTop: '6px',
            fontWeight: '500'
          }}>
            {isFull
              ? `${confirmed} of ${capacity} registered. Full, waitlist is open`
              : `${confirmed} of ${capacity} registered, ${seatsLeft} seats left`}
          </p>
        </div>
      </div>

      {/* Right Price & Action Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '20px',
        alignSelf: 'stretch',
        minWidth: '150px'
      }}>
        {/* Fee Display */}
        <div style={{
          fontSize: '26px',
          fontWeight: '800',
          color: '#6d28d9',
          letterSpacing: '-0.5px'
        }}>
          {isFree ? 'Free' : `₹${fee}`}
        </div>

        {/* Action Button */}
        <div>
          {isUserRegistered ? (
            <div style={{
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: userStatus === 'confirmed' ? '#f5f3ff' : '#fef3c7',
              color: userStatus === 'confirmed' ? '#6d28d9' : '#b45309',
              border: `1px solid ${userStatus === 'confirmed' ? '#e9d5ff' : '#fde68a'}`
            }}>
              {userStatus === 'confirmed' ? '✓ Registered' : '⏱ Waitlisted'}
            </div>
          ) : isFull ? (
            <button
              onClick={() => onJoinWaitlist(event)}
              disabled={loading}
              className="btn-primary"
              style={{
                borderRadius: '14px',
                padding: '11px 20px',
                fontSize: '14.5px'
              }}
            >
              <span>Join waitlist</span>
              <ArrowRightIcon size={16} />
            </button>
          ) : (
            <button
              onClick={() => onRegister(event)}
              disabled={loading}
              className="btn-primary"
              style={{
                borderRadius: '14px',
                padding: '11px 22px',
                fontSize: '14.5px'
              }}
            >
              <span>Register</span>
              <ArrowRightIcon size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
