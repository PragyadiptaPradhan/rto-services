import React from 'react';
import ChatWindow from './components/ChatWindow';
import QuickScenarios from './components/QuickScenarios';
import AppointmentPrep from './components/AppointmentPrep';
import FeedbackAudit from './components/FeedbackAudit';

export const ChatAssistantView = ({
  chatMessages,
  chatEndRef,
  language,
  queryInput,
  setQueryInput,
  handleSendMessage,
  triggerVoiceRecording,
  isRecording,
  isSpeaking,
  speakingText,
  handleFeedback,
  feedbackLogs,
  clearFeedbackLogs
}) => {
  return (
    <div className="dashboard-grid">
      <ChatWindow 
        chatMessages={chatMessages}
        chatEndRef={chatEndRef}
        language={language}
        queryInput={queryInput}
        setQueryInput={setQueryInput}
        handleSendMessage={handleSendMessage}
        triggerVoiceRecording={triggerVoiceRecording}
        isRecording={isRecording}
        isSpeaking={isSpeaking}
        speakingText={speakingText}
        handleFeedback={handleFeedback}
      />

      <div className="right-panel">
        <QuickScenarios handleSendMessage={handleSendMessage} />
        <AppointmentPrep />
        <FeedbackAudit feedbackLogs={feedbackLogs} clearFeedbackLogs={clearFeedbackLogs} />
      </div>
    </div>
  );
};

export default ChatAssistantView;
