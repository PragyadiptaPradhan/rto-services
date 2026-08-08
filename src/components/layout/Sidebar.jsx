import React from 'react';
import { 
  MessageSquare, 
  CheckSquare, 
  FileText, 
  Database, 
  BarChart3,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Sparkles size={20} className="text-amber-700" />
        </div>
        <div>
          <h1 className="brand-title">RTO Services AI</h1>
          <p className="context-label" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>GUIDANCE PROTOTYPE</p>
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
    </aside>
  );
};

export default Sidebar;
