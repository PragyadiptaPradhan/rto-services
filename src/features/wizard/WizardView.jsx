import React from 'react';
import WizardForm from './components/WizardForm';
import WizardResults from './components/WizardResults';

export const WizardView = ({
  wizardService,
  setWizardService,
  stateCode,
  setStateCode,
  applicantType,
  setApplicantType,
  handleGenerateWizardChecklist,
  wizardResult,
  checklistItems,
  toggleChecklistItem
}) => {
  return (
    <div className="dashboard-grid" style={{ gridTemplateColumns: '350px 1fr' }}>
      <WizardForm 
        wizardService={wizardService}
        setWizardService={setWizardService}
        stateCode={stateCode}
        setStateCode={setStateCode}
        applicantType={applicantType}
        setApplicantType={setApplicantType}
        handleGenerateWizardChecklist={handleGenerateWizardChecklist}
      />

      <WizardResults 
        wizardResult={wizardResult}
        stateCode={stateCode}
        applicantType={applicantType}
        checklistItems={checklistItems}
        toggleChecklistItem={toggleChecklistItem}
      />
    </div>
  );
};

export default WizardView;
