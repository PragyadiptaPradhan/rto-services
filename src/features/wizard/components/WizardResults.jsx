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
    <div className="glass-panel" style={{ padding: '24px', overflowY: 'auto' }}>
      {!wizardResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
          <CheckSquare size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>Configure details on the left and click **Build Steps & Checklists** to generate your customized RTO preparation map.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 'bold' }}>Grounded Output Map</span>
            <h2 style={{ fontSize: '22px', fontWeight: '700' }}>{wizardResult.serviceName} Roadmap</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Personalized for <strong>{stateCode === 'DL' ? 'Delhi' : stateCode === 'MH' ? 'Maharashtra' : 'Karnataka'}</strong> | <strong>{applicantType}</strong> Category
            </p>
          </div>

          {/* Warning alert */}
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px 16px', borderRadius: '8px', fontSize: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <AlertTriangle size={18} className="text-amber-500" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Guidance Disclaimer:</strong> This list has been generated dynamically based on official guidance sources. Always check details on the official <a href="https://parivahan.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>Sarathi / Vahan Portal</a> before payment.
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
                  <div key={idx} className="checklist-card" style={{ padding: '12px', background: checklistItems[doc] ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.01)' }}>
                    <label className="checklist-item" style={{ fontSize: '13px', fontWeight: '500' }}>
                      <input 
                        type="checkbox" 
                        checked={checklistItems[doc] || false}
                        onChange={() => toggleChecklistItem(doc)}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span style={{ color: checklistItems[doc] ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {doc}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              {wizardResult.requirementsNote && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
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
                <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>
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
                      background: 'var(--primary-glow)', 
                      border: '1px solid var(--primary)', 
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ fontSize: '13px', paddingTop: '3px' }}>
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
