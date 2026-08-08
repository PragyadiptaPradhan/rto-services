import React from 'react';
import { Info, Trash2 } from 'lucide-react';

export const FeedbackAudit = ({ feedbackLogs, clearFeedbackLogs }) => {
  return (
    <div className="glass-panel" style={{ padding: '20px', flex: 1, background: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} style={{ color: '#059669' }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)' }}>Recent Feedback Audit</h3>
        </div>
        {feedbackLogs.length > 0 && (
          <button onClick={clearFeedbackLogs} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>
      
      {feedbackLogs.length === 0 ? (
        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No audit records yet. Submit feedback on AI answers using the 👍/👎 icons to log audits here.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
          {feedbackLogs.map((log) => (
            <div key={log.id} className="feedback-log-item">
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%', color: 'var(--text-primary)' }}>
                <strong>Q:</strong> {log.query}
              </div>
              <span style={{ 
                color: log.rating.includes('Up') ? '#16a34a' : '#dc2626',
                fontWeight: '700',
                fontSize: '10.5px'
              }}>
                {log.rating}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackAudit;
