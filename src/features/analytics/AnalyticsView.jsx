import React from 'react';

export const AnalyticsView = ({ chatMessages }) => {
  return (
    <div className="glass-panel tab-content" style={{ overflowY: 'auto' }}>
      <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Helpdesk Trends & Analytics</h2>
        <p className="context-label">Admin insights analyzing common citizen queries, state-specific bottlenecks, and service confusion analytics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginTop: '12px' }}>
        {/* Trends & Confusions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Confusion details card */}
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '18px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--secondary)', fontSize: '15px', fontWeight: '600', marginBottom: '14px' }}>
              ⚠️ Primary Citizen Friction & Confusion Areas
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '12px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>MH RC Transfer Signature Matching:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                  In Maharashtra, buyer/seller signatures are strictly compared against the original registration records. Signature mismatch accounts for 32% of ownership transfer delays, requiring physical appearance at the RTO.
                </p>
              </div>

              <div style={{ borderLeft: '3px solid var(--secondary)', paddingLeft: '12px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Medical Certificate (Form 1A) Mandate:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                  Applicants above 40 years old or those renewing a commercial license often miss uploading Form 1A signed by registered practitioners, leading to 25% of application rejections.
                </p>
              </div>

              <div style={{ borderLeft: '3px solid var(--accent-purple)', paddingLeft: '12px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Delhi Aadhaar Contactless Test Failures:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                  Face-recognition verification during the contactless Learner's License test fails if the applicant's photo on Aadhaar is outdated. Must switch to physical RTO slot bookings instead.
                </p>
              </div>
            </div>
          </div>

          {/* Session query history tracker */}
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '18px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
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
                    <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '6px' }}>Timestamp</th>
                      <th style={{ padding: '6px' }}>User Query</th>
                      <th style={{ padding: '6px' }}>Language</th>
                      <th style={{ padding: '6px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chatMessages.map((msg, idx) => {
                      if (msg.sender !== 'assistant' || msg.id === 'welcome') return null;
                      const userMsg = chatMessages[idx - 1];
                      return (
                        <tr key={msg.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '8px 6px', color: 'var(--text-muted)' }}>{msg.timestamp}</td>
                          <td style={{ padding: '8px 6px', fontWeight: '500', color: 'var(--text-primary)' }}>{userMsg?.text}</td>
                          <td style={{ padding: '8px 6px', textTransform: 'uppercase', color: 'var(--secondary)' }}>
                            {msg.metadata?.grounding ? (userMsg?.text.toLowerCase().includes('kaise') ? 'Hinglish' : 'English') : 'English'}
                          </td>
                          <td style={{ padding: '8px 6px' }}>
                            <span style={{ 
                              color: msg.metadata?.grounding > 70 ? '#10b981' : '#f59e0b',
                              fontWeight: 'bold'
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
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '18px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--secondary)', fontSize: '15px', fontWeight: '600', marginBottom: '14px' }}>
              📈 Frequent Service Inquiries
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Learner's License Eligibility</span>
                  <strong>34%</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '34%', height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Vehicle RC Ownership Transfer</span>
                  <strong>28%</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '28%', height: '100%', background: 'var(--secondary)', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>E-Challan Lok Adalat Waivers</span>
                  <strong>21%</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '21%', height: '100%', background: 'var(--accent-purple)', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Driving License Renewal Steps</span>
                  <strong>17%</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '17%', height: '100%', background: 'var(--accent-pink)', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* State Query Share */}
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '18px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '15px', fontWeight: '600', marginBottom: '14px' }}>
              🌍 Jurisdiction Traffic Share
            </h3>
            
            <div style={{ display: 'flex', gap: '10px', height: '120px', alignItems: 'flex-end', justifyContent: 'space-around', padding: '10px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '32px', height: '80px', background: 'linear-gradient(to top, var(--primary), #a5b4fc)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '10px', fontWeight: 'bold' }}>40%</div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MH (Mumb)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '32px', height: '70px', background: 'linear-gradient(to top, var(--secondary), #22d3ee)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '10px', fontWeight: 'bold' }}>35%</div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DL (Delhi)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '32px', height: '50px', background: 'linear-gradient(to top, var(--accent-purple), #c084fc)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '10px', fontWeight: 'bold' }}>25%</div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>KA (Blru)</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
