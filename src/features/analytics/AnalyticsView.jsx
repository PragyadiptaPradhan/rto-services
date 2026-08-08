import React from 'react';

export const AnalyticsView = ({ chatMessages }) => {
  return (
    <div className="glass-panel tab-content" style={{ overflowY: 'auto', background: '#ffffff' }}>
      <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-dark)' }}>Helpdesk Trends & Analytics</h2>
        <p className="context-label" style={{ marginTop: '2px' }}>Admin insights analyzing common citizen queries, state-specific bottlenecks, and service confusion analytics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginTop: '12px' }}>
        {/* Trends & Confusions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Confusion details card */}
          <div style={{ background: '#fafcfb', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '18px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: '#059669', fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>
              ⚠️ Primary Citizen Friction & Confusion Areas
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ borderLeft: '4px solid #fde047', paddingLeft: '12px', background: '#ffffff', padding: '10px 12px', borderRadius: '0 8px 8px 0', border: '1px solid #e2e8f0', borderLeftColor: '#facc15', borderLeftWidth: '4px' }}>
                <strong style={{ color: 'var(--text-dark)' }}>MH RC Transfer Signature Matching:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                  In Maharashtra, buyer/seller signatures are strictly compared against the original registration records. Signature mismatch accounts for 32% of ownership transfer delays, requiring physical appearance at the RTO.
                </p>
              </div>

              <div style={{ borderLeft: '4px solid #059669', paddingLeft: '12px', background: '#ffffff', padding: '10px 12px', borderRadius: '0 8px 8px 0', border: '1px solid #e2e8f0', borderLeftColor: '#059669', borderLeftWidth: '4px' }}>
                <strong style={{ color: 'var(--text-dark)' }}>Medical Certificate (Form 1A) Mandate:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                  Applicants above 40 years old or those renewing a commercial license often miss uploading Form 1A signed by registered practitioners, leading to 25% of application rejections.
                </p>
              </div>

              <div style={{ borderLeft: '4px solid #0284c7', paddingLeft: '12px', background: '#ffffff', padding: '10px 12px', borderRadius: '0 8px 8px 0', border: '1px solid #e2e8f0', borderLeftColor: '#0284c7', borderLeftWidth: '4px' }}>
                <strong style={{ color: 'var(--text-dark)' }}>Delhi Aadhaar Contactless Test Failures:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                  Face-recognition verification during the contactless Learner's License test fails if the applicant's photo on Aadhaar is outdated. Must switch to physical RTO slot bookings instead.
                </p>
              </div>
            </div>
          </div>

          {/* Session query history tracker */}
          <div style={{ background: '#fafcfb', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '18px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-dark)', fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>
              📋 Active Session Query Audit Tracker
            </h3>
            
            {chatMessages.filter(m => m.sender === 'user').length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No queries run in this session yet. Ask questions in the AI Chat Assistant to track audit logs.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px 6px' }}>Timestamp</th>
                      <th style={{ padding: '8px 6px' }}>User Query</th>
                      <th style={{ padding: '8px 6px' }}>Language</th>
                      <th style={{ padding: '8px 6px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chatMessages.map((msg, idx) => {
                      if (msg.sender !== 'assistant' || msg.id === 'welcome') return null;
                      const userMsg = chatMessages[idx - 1];
                      return (
                        <tr key={msg.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '8px 6px', color: 'var(--text-muted)' }}>{msg.timestamp}</td>
                          <td style={{ padding: '8px 6px', fontWeight: '600', color: 'var(--text-dark)' }}>{userMsg?.text}</td>
                          <td style={{ padding: '8px 6px', textTransform: 'uppercase', color: '#059669', fontWeight: '700' }}>
                            {msg.metadata?.grounding ? (userMsg?.text.toLowerCase().includes('kaise') ? 'Hinglish' : 'English') : 'English'}
                          </td>
                          <td style={{ padding: '8px 6px' }}>
                            <span style={{ 
                              color: msg.metadata?.grounding > 70 ? '#16a34a' : '#d97706',
                              fontWeight: '800'
                            }}>
                              {msg.metadata?.grounding > 70 ? 'Grounded' : 'Reviewed'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Charts and distributions Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Query volume trends */}
          <div style={{ background: '#fafcfb', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '18px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: '#059669', fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>
              📈 Frequent Service Inquiries
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: 'var(--text-dark)', fontWeight: '600' }}>
                  <span>Learner's License Eligibility</span>
                  <strong>34%</strong>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '34%', height: '100%', background: '#facc15', borderRadius: '6px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: 'var(--text-dark)', fontWeight: '600' }}>
                  <span>Vehicle RC Ownership Transfer</span>
                  <strong>28%</strong>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '28%', height: '100%', background: '#059669', borderRadius: '6px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: 'var(--text-dark)', fontWeight: '600' }}>
                  <span>E-Challan Lok Adalat Waivers</span>
                  <strong>21%</strong>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '21%', height: '100%', background: '#0284c7', borderRadius: '6px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: 'var(--text-dark)', fontWeight: '600' }}>
                  <span>Driving License Renewal Steps</span>
                  <strong>17%</strong>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '17%', height: '100%', background: '#7c3aed', borderRadius: '6px' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* State Query Share */}
          <div style={{ background: '#fafcfb', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '18px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-dark)', fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>
              🌍 Jurisdiction Traffic Share
            </h3>
            
            <div style={{ display: 'flex', gap: '12px', height: '130px', alignItems: 'flex-end', justifyContent: 'space-around', padding: '10px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '36px', height: '90px', background: '#fde047', border: '1px solid #facc15', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b', fontSize: '11px', fontWeight: '800' }}>40%</div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>MH (Mumb)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '36px', height: '78px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', fontSize: '11px', fontWeight: '800' }}>35%</div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>DL (Delhi)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '36px', height: '56px', background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1', fontSize: '11px', fontWeight: '800' }}>25%</div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>KA (Blru)</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
