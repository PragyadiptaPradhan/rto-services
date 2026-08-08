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
    <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--secondary)' }}>
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
            <option value="ownership_transfer">Vehicle Ownership Transfer</option>
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
