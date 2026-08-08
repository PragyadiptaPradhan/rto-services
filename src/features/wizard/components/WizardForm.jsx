import React from 'react';
import { CheckSquare } from 'lucide-react';

export const WizardForm = ({
  wizardService,
  setWizardService,
  stateCode,
  setStateCode,
  applicantType,
  setApplicantType,
  handleGenerateWizardChecklist
}) => {
  return (
    <div className="glass-panel" style={{ padding: '24px', height: 'fit-content', background: '#ffffff' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-dark)' }}>
        Step Builder Configuration
      </h3>
      
      <div className="wizard-form">
        <div className="form-group">
          <label>Select RTO Service</label>
          <select 
            className="context-select"
            style={{ width: '100%', padding: '10px' }}
            value={wizardService}
            onChange={(e) => setWizardService(e.target.value)}
          >
            <option value="learners_license">Learner's License (LL)</option>
            <option value="driving_license">Permanent Driving License (DL)</option>
            <option value="dl_renewal">Driving License Renewal</option>
            <option value="rc_transfer">Vehicle Ownership Transfer</option>
            <option value="change_of_address">Change of Address in DL / RC</option>
            <option value="duplicate_dl_rc">Duplicate DL / Vehicle RC Issue</option>
            <option value="noc_issue">No Objection Certificate (NOC)</option>
            <option value="hypothecation_cancellation">Hypothecation Deletion / Addition</option>
            <option value="international_driving_permit">International Driving Permit (IDP)</option>
            <option value="fitness_certificate">Vehicle Fitness Certificate & Renewal</option>
          </select>
        </div>

        <div className="form-group">
          <label>Target Jurisdiction (State)</label>
          <select 
            className="context-select"
            style={{ width: '100%', padding: '10px' }}
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

        <div className="form-group">
          <label>Applicant Category</label>
          <select 
            className="context-select"
            style={{ width: '100%', padding: '10px' }}
            value={applicantType}
            onChange={(e) => setApplicantType(e.target.value)}
          >
            <option value="General">General Applicant</option>
            <option value="Under18">Under 18 Years (Non-geared up to 50cc)</option>
            <option value="Senior">Senior Citizen (Age 40+ with medical form)</option>
            <option value="Commercial">Commercial / Transport Drivers</option>
          </select>
        </div>

        <button 
          className="generate-btn"
          onClick={handleGenerateWizardChecklist}
        >
          <CheckSquare size={16} />
          <span>Build Steps & Checklists</span>
        </button>
      </div>
    </div>
  );
};

export default WizardForm;
