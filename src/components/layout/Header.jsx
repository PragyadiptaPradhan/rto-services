import React from 'react';
import { MapPin, Globe2 } from 'lucide-react';

export const Header = ({ 
  activeTab, 
  stateCode, 
  setStateCode, 
  vehicleType, 
  setVehicleType, 
  applicantType, 
  setApplicantType, 
  language, 
  setLanguage 
}) => {
  return (
    <header className="top-bar">
      <div>
        <h2 className="gradient-text" style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-dark)' }}>
          {activeTab === 'chat' && "Conversational AI Assistant"}
          {activeTab === 'wizard' && "State & Category Step Builder"}
          {activeTab === 'compare' && "State-by-State Comparison Matrix"}
          {activeTab === 'inspector' && "5-Layer Dev Inspector"}
          {activeTab === 'analytics' && "Helpdesk Insights & Analytics"}
        </h2>
        <p className="context-label" style={{ marginTop: '2px' }}>
          Select context parameters below to personalize the AI engine dynamically
        </p>
      </div>

      <div className="context-pill-group">
        <div className="context-select-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={15} style={{ color: '#d97706' }} />
          <select 
            className="context-select" 
            value={stateCode} 
            onChange={(e) => setStateCode(e.target.value)}
          >
            <option value="DL">Delhi (DL)</option>
            <option value="MH">Maharashtra (MH)</option>
            <option value="KA">Karnataka (KA)</option>
            <option value="UP">Uttar Pradesh (UP)</option>
            <option value="TN">Tamil Nadu (TN)</option>
            <option value="TS">Telangana (TS)</option>
            <option value="GJ">Gujarat (GJ)</option>
          </select>
        </div>

        <select 
          className="context-select" 
          value={vehicleType} 
          onChange={(e) => setVehicleType(e.target.value)}
        >
          <option value="MCWOG">Motorcycle without Gear (MCWOG)</option>
          <option value="MCWG">Motorcycle with Gear (MCWG)</option>
          <option value="LMV">Light Motor Vehicle (LMV - Cars)</option>
        </select>

        <select 
          className="context-select" 
          value={applicantType} 
          onChange={(e) => setApplicantType(e.target.value)}
        >
          <option value="General">General Category</option>
          <option value="Under18">Under 18 Years</option>
          <option value="Senior">Senior Citizen (Age 40+)</option>
        </select>

        <div className="context-select-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Globe2 size={15} style={{ color: '#059669' }} />
          <select 
            className="context-select" 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;
