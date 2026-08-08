import React from 'react';
import { 
  MessageSquare, 
  CheckSquare, 
  Layers, 
  FileText, 
  Award, 
  Database, 
  BarChart3 
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Layers size={20} />
        </div>
        <div>
          <h1 className="brand-title gradient-text-accent">RTO Services AI</h1>
          <p className="context-label" style={{ fontSize: '10px' }}>GUIDANCE PROTOTYPE</p>
        </div>
      </div>

      <nav className="nav-links">
        <div 
          onClick={() => setActiveTab('chat')} 
          className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
        >
          <MessageSquare size={18} />
          <span>AI Chat Assistant</span>
        </div>
        <div 
          onClick={() => setActiveTab('wizard')} 
          className={`nav-link ${activeTab === 'wizard' ? 'active' : ''}`}
        >
          <CheckSquare size={18} />
          <span>Checklist & Steps Wizard</span>
        </div>
        <div 
          onClick={() => setActiveTab('compare')} 
          className={`nav-link ${activeTab === 'compare' ? 'active' : ''}`}
        >
          <FileText size={18} />
          <span>State Variations Matrix</span>
        </div>
        <div 
          onClick={() => setActiveTab('inspector')} 
          className={`nav-link ${activeTab === 'inspector' ? 'active' : ''}`}
        >
          <Database size={18} />
          <span>RAG Pipeline Inspector</span>
        </div>
        <div 
          onClick={() => setActiveTab('analytics')} 
          className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
        >
          <BarChart3 size={18} />
          <span>Helpdesk Trends & Analytics</span>
        </div>
      </nav>

      {/* Responsible AI Panel in Sidebar footer */}
      <div className="glass-panel" style={{ padding: '16px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold' }}>
          <Award size={16} className="text-emerald-400" />
          <span>AI Trust Center</span>
        </div>
        <div className="metrics-row">
          <div className="metric-card" style={{ padding: '4px' }}>
            <div className="metric-val" style={{ fontSize: '12px', color: '#10b981' }}>Grounded</div>
            <div className="metric-label" style={{ fontSize: '8px' }}>Logic</div>
          </div>
          <div className="metric-card" style={{ padding: '4px' }}>
            <div className="metric-val" style={{ fontSize: '12px', color: '#06b6d4' }}>Delhi/MH/KA</div>
            <div className="metric-label" style={{ fontSize: '8px' }}>State Scope</div>
          </div>
          <div className="metric-card" style={{ padding: '4px' }}>
            <div className="metric-val" style={{ fontSize: '12px', color: '#f59e0b' }}>MORTH</div>
            <div className="metric-label" style={{ fontSize: '8px' }}>Reference</div>
          </div>
        </div>
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
          All responses are strictly grounded in our RTO Knowledge Base with verification safeguards.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
