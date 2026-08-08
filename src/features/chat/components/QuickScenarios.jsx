import React from 'react';
import { HelpCircle } from 'lucide-react';

export const QuickScenarios = ({ handleSendMessage }) => {
  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <HelpCircle size={18} className="text-cyan-400" />
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: '600' }}>Mock Citizen Scenarios</h3>
      </div>
      <div className="scenarios-grid">
        <div 
          className="scenario-card"
          onClick={() => handleSendMessage("I am 17 years old. Can I apply for a Learner's License for a scooter?")}
        >
          <div className="scenario-title">Under-18 LL Inquiry</div>
          <p style={{ color: 'var(--text-muted)' }}>Asking for LL eligibility & parent consent rules.</p>
        </div>

        <div 
          className="scenario-card"
          onClick={() => handleSendMessage("My Driving License expired 3 months ago. How do I renew it in Delhi?")}
        >
          <div className="scenario-title">Expired DL Renewal</div>
          <p style={{ color: 'var(--text-muted)' }}>Delhi specific renewal grace period & fees query.</p>
        </div>

        <div 
          className="scenario-card"
          onClick={() => handleSendMessage("What documents does a buyer and seller need for vehicle RC transfer in Maharashtra?")}
        >
          <div className="scenario-title">RC Transfer MH</div>
          <p style={{ color: 'var(--text-muted)' }}>Ownership transfer Forms 29, 30 & physical chassis rules.</p>
        </div>

        <div 
          className="scenario-card"
          onClick={() => handleSendMessage("What is the process to clear pending traffic challans during Lok Adalat?")}
        >
          <div className="scenario-title">Lok Adalat Waiver</div>
          <p style={{ color: 'var(--text-muted)' }}>Checking E-Challan & seeking Lok Adalat details.</p>
        </div>
      </div>
    </div>
  );
};

export default QuickScenarios;
