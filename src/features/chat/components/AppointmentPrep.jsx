import React from 'react';
import { CheckSquare } from 'lucide-react';

export const AppointmentPrep = () => {
  return (
    <div className="glass-panel" style={{ padding: '20px', background: '#ffffff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <CheckSquare size={18} style={{ color: '#059669' }} />
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: '700', color: 'var(--text-dark)' }}>RTO Appointment Preparation</h3>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
        Before going to your slot, check if you have everything ready:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
        <label className="checklist-item" style={{ color: 'var(--text-primary)' }}>
          <input type="checkbox" defaultChecked />
          <span>Physical File Folder for safety</span>
        </label>
        <label className="checklist-item" style={{ color: 'var(--text-primary)' }}>
          <input type="checkbox" />
          <span>Application Form printout & Slot confirmation receipt</span>
        </label>
        <label className="checklist-item" style={{ color: 'var(--text-primary)' }}>
          <input type="checkbox" />
          <span>All uploaded scanned documents in original format</span>
        </label>
        <label className="checklist-item" style={{ color: 'var(--text-primary)' }}>
          <input type="checkbox" />
          <span>Vehicle with valid PUCC/Insurance (if appearing for driving test)</span>
        </label>
        <label className="checklist-item" style={{ color: 'var(--text-primary)' }}>
          <input type="checkbox" />
          <span>L-plates installed (for driving license testing)</span>
        </label>
      </div>
    </div>
  );
};

export default AppointmentPrep;
