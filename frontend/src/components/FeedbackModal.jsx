import React, { useState } from 'react';
import { api } from '../services/api';
import { StarIcon } from './Icons';

export default function FeedbackModal({ registration, onClose, onSuccess, onShowMessage }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.submitFeedback(registration.registration_id, rating, comment);
      onShowMessage('Thank you for your feedback!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      onShowMessage(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827' }}>
            Event Feedback
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

        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '20px' }}>
          How was your experience at <strong>{registration.title}</strong>?
        </p>

        <form onSubmit={handleSubmit}>
          {/* Star Rating Selector */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    transition: 'transform 0.1s'
                  }}
                >
                  <StarIcon
                    size={32}
                    filled={star <= (hoverRating || rating)}
                    color="#f59e0b"
                  />
                </button>
              ))}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#6d28d9' }}>
              {rating} of 5 Stars
            </span>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Comments & Suggestions</label>
            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like? What can we improve next time?"
              className="form-textarea"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: '15px', borderRadius: '12px' }}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
