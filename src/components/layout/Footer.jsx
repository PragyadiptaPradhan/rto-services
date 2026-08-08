import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ marginTop: 'auto', textAlign: 'center', padding: '16px', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
        <ShieldAlert size={14} className="text-amber-500" />
        <strong>RTO Services AI Prototype Guidance:</strong> This assistant provides helpful process directions based on official documentation. It does not replace legal decisions, licensing approvals, or fee payments.
      </div>
      <p>© 2026 Transport and RTO Services AI. Built in accordance with Ministry of Road Transport and Highways (MoRTH) standards.</p>
    </footer>
  );
};

export default Footer;
