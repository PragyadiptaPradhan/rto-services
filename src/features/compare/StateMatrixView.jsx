import React from 'react';
import rtoDatabase from '../../data/index.js';

export const StateMatrixView = () => {
  return (
    <div className="glass-panel" style={{ padding: '24px', overflowY: 'auto', background: '#ffffff' }}>
      <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-dark)' }}>State-by-State Rules Comparison</h2>
        <p className="context-label" style={{ marginTop: '2px' }}>Analyze fees, processing, and testing format differences side-by-side between states.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {rtoDatabase.services.map((service) => (
          <div key={service.id} style={{ background: '#fafcfb', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '18px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: '#059669', fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
              {service.name}
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                    <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: '700', width: '160px' }}>State / Region</th>
                    <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: '700', width: '130px' }}>Contactless Mode</th>
                    <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: '700', width: '210px' }}>Estimated Costs</th>
                    <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: '700' }}>Test Setup / Inspector Rule</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(service.state_variations).map(([code, details]) => (
                    <tr key={code} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px', fontWeight: '700', color: 'var(--text-dark)' }}>
                        📍 {details.state_name} ({code})
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '10px', 
                          fontWeight: '800',
                          background: details.contactless ? '#dcfce7' : '#fee2e2',
                          color: details.contactless ? '#15803d' : '#dc2626',
                          border: `1px solid ${details.contactless ? '#bbf7d0' : '#fca5a5'}`
                        }}>
                          {details.contactless ? 'ENABLED' : 'RTO VISIT'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>
                        {details.fee_breakdown}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--text-dark)' }}>{details.test_format}</strong>
                        <span style={{ fontSize: '12px', display: 'block', marginTop: '2px', color: 'var(--text-muted)' }}>{details.special_note}</span>
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
