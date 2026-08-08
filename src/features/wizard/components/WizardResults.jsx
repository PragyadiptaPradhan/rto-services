import React from 'react';
import { CheckSquare, AlertTriangle } from 'lucide-react';

export const WizardResults = ({
  wizardResult,
  stateCode,
  applicantType,
  checklistItems,
  toggleChecklistItem
}) => {
  return (
    <div className="glass-panel" style={{ padding: '24px', overflowY: 'auto', background: '#ffffff' }}>
      {!wizardResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
          <CheckSquare size={48} style={{ opacity: 0.25, marginBottom: '12px', color: '#64748b' }} />
          <p>Configure details on the left and click <strong>Build Steps & Checklists</strong> to generate your customized RTO preparation map.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#059669', fontWeight: '800', letterSpacing: '0.5px' }}>Grounded Output Map</span>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-dark)' }}>{wizardResult.serviceName} Roadmap</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Personalized for <strong>{stateCode === 'DL' ? 'Delhi' : stateCode === 'MH' ? 'Maharashtra' : 'Karnataka'}</strong> | <strong>{applicantType}</strong> Category
            </p>
          </div>

          {/* Warning alert: Soft pastel yellow alert */}
          <div style={{ background: '#fffbeb', border: '1px solid #fef08a', padding: '12px 16px', borderRadius: '10px', fontSize: '12.5px', color: '#92400e', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Guidance Disclaimer:</strong> This list has been generated dynamically based on official guidance sources. Always check details on the official <a href="https://parivahan.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'underline', fontWeight: '600' }}>Sarathi / Vahan Portal</a> before payment.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
            
            {/* Document checklist with active tracking */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="checklist-title">
                📋 Required Documents Checklist
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {wizardResult.rawRequirements.map((doc, idx) => (
                  <div 
                    key={idx} 
                    className="checklist-card" 
                    style={{ 
                      padding: '12px 14px', 
                      background: checklistItems[doc] ? '#f0fdf4' : '#ffffff',
                      borderColor: checklistItems[doc] ? '#bbf7d0' : 'var(--border-light)'
                    }}
                  >
                    <label className="checklist-item" style={{ fontSize: '13px', fontWeight: '500' }}>
                      <input 
                        type="checkbox" 
                        checked={checklistItems[doc] || false}
                        onChange={() => toggleChecklistItem(doc)}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span style={{ color: checklistItems[doc] ? '#166534' : 'var(--text-primary)' }}>
                        {doc}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              {wizardResult.requirementsNote && (
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <strong>Note:</strong> {wizardResult.requirementsNote}
                </div>
              )}
            </div>

            {/* Step-by-Step Guidance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="checklist-title">
                🗺️ Process Steps & Walkthrough
              </div>

              {/* State Specific Rule Callout */}
              {wizardResult.stateNotes && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', color: '#166534' }}>
                  <span style={{ fontWeight: '800', color: '#15803d', display: 'block', marginBottom: '6px' }}>
                    📍 {wizardResult.stateNotes.state_name} Jurisdiction Info:
                  </span>
                  <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li><strong>Contactless processing:</strong> {wizardResult.stateNotes.contactless ? "Yes (Aadhaar Online)" : "No (RTO visit required)"}</li>
                    <li><strong>Fees Estimate:</strong> {wizardResult.stateNotes.fee_breakdown}</li>
                    <li><strong>Testing Setup:</strong> {wizardResult.stateNotes.test_format}</li>
                    <li><strong>Specific Rule:</strong> {wizardResult.stateNotes.special_note}</li>
                  </ul>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {wizardResult.steps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: '#fef08a', 
                      border: '1px solid #facc15', 
                      color: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '800',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ fontSize: '13.5px', paddingTop: '2px', color: 'var(--text-primary)' }}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default WizardResults;
