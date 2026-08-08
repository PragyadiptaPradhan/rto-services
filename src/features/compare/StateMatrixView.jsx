import React from 'react';
import rtoDatabase from '../../data/index.js';

export const StateMatrixView = () => {
  return (
    <div className="glass-panel" style={{ padding: '24px', overflowY: 'auto' }}>
      <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>State-by-State Rules Comparison</h2>
        <p className="context-label">Analyze fees, processing, and testing format differences side-by-side between states.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {rtoDatabase.services.map((service) => (
          <div key={service.id} style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '18px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--secondary)', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              {service.name}
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                    <th style={{ padding: '10px', color: 'var(--text-muted)', fontWeight: 'bold', width: '150px' }}>State / Region</th>
                    <th style={{ padding: '10px', color: 'var(--text-muted)', fontWeight: 'bold', width: '120px' }}>Contactless Mode</th>
                    <th style={{ padding: '10px', color: 'var(--text-muted)', fontWeight: 'bold', width: '200px' }}>Estimated Costs</th>
                    <th style={{ padding: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Test Setup / Inspector Rule</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(service.state_variations).map(([code, details]) => (
                    <tr key={code} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        📍 {details.state_name} ({code})
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '12px', 
                          fontSize: '10px', 
                          fontWeight: 'bold',
                          background: details.contactless ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: details.contactless ? '#10b981' : '#ef4444'
                        }}>
                          {details.contactless ? 'ENABLED' : 'RTO VISIT'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-primary)' }}>
                        {details.fee_breakdown}
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                        <strong>{details.test_format}</strong>. <span style={{ fontSize: '12px', display: 'block', marginTop: '2px' }}>{details.special_note}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StateMatrixView;
