import React from 'react';
import { MessageSquare, Mic, Volume2, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import { MarkdownViewer } from '../../../components/common/MarkdownViewer';

export const ChatWindow = ({
  chatMessages,
  chatEndRef,
  language,
  queryInput,
  setQueryInput,
  handleSendMessage,
  triggerVoiceRecording,
  isRecording,
  isTranscribing,
  isSpeaking,
  speakingText,
  handleFeedback
}) => {
  return (
    <div className="glass-panel chat-container">
      <div className="panel-header">
        <div className="panel-title">
          <MessageSquare size={18} className="text-indigo-400" />
          <span>RTO Grounded Assistant</span>
          <span className="badge-live">Online Guidance</span>
        </div>
        
        {/* Voice Indicators & Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={triggerVoiceRecording} 
            disabled={isTranscribing}
            className={`nav-link ${isRecording || isTranscribing ? 'active' : ''}`}
            style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-light)' }}
            title="Click to speak your RTO query via Sarvam STT"
          >
            <Mic size={14} className={isRecording ? "text-red-400 animate-pulse" : isTranscribing ? "text-cyan-400 animate-spin" : "text-gray-400"} />
            <span>
              {isRecording ? "Stop & Transcribe (Recording...)" : isTranscribing ? "Transcribing (Sarvam Saaras)..." : "Voice Query (Mic)"}
            </span>
          </button>

          {isSpeaking && (
            <div className="nav-link active" style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-light)' }}>
              <Volume2 size={14} className="text-cyan-400 animate-bounce" />
              <span>Speaking (Bulbul)...</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Speech display */}
      {isSpeaking && speakingText && (
        <div style={{ background: 'rgba(6, 182, 212, 0.1)', borderBottom: '1px solid rgba(6, 182, 212, 0.2)', padding: '10px 24px', fontSize: '12px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="voice-visualizer">
            <span className="voice-bar active"></span>
            <span className="voice-bar active"></span>
            <span className="voice-bar active"></span>
            <span className="voice-bar active"></span>
            <span className="voice-bar active"></span>
          </div>
          <span><strong>Audio response (Bulbul):</strong> "{speakingText}"</span>
        </div>
      )}

      {/* Chat Message Window */}
      <div className="chat-messages">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
            <div className="flex flex-col">
              <div>
                {msg.sender === 'assistant' ? <MarkdownViewer text={msg.text} /> : msg.text}
              </div>
              
              {msg.sender === 'assistant' && msg.id !== 'welcome' && (
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px' }}>
                  <span style={{ color: '#10b981', fontWeight: '600' }}>Confidence: {msg.metadata?.confidence}%</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span>Is this accurate?</span>
                    <button 
                      onClick={() => handleFeedback(msg.id, true)} 
                      style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                    >
                      <ThumbsUp size={12} /> Yes
                    </button>
                    <button 
                      onClick={() => handleFeedback(msg.id, false)} 
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                    >
                      <ThumbsDown size={12} /> No
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="suggestion-chips">
        {language === 'en' && [
          "What are Learner License documents?",
          "Driving License test steps",
          "Delhi DL renewal Form 1A requirement",
          "Vehicle Ownership Transfer Karnataka documents",
          "Lok Adalat challan payment waiver"
        ].map((chip, idx) => (
          <button key={idx} className="chip" onClick={() => handleSendMessage(chip)}>{chip}</button>
        ))}
        {language === 'hi' && [
          "लर्नर लाइसेंस के नियम",
          "ड्राइविंग लाइसेंस का टेस्ट कैसे होता है?",
          "लाइसेंस रिन्यूअल फीस",
          "ओनरशिप ट्रांसफर कैसे करें?",
          "चालान चेक करने की विधि"
        ].map((chip, idx) => (
          <button key={idx} className="chip" onClick={() => handleSendMessage(chip)}>{chip}</button>
        ))}
        {language === 'hinglish' && [
          "Learner license documents kya chahiye?",
          "Permanent DL test rules",
          "DL renewal fees kitna hai?",
          "Vehicle transfer kaise karein?",
          "Challan discount in Lok Adalat"
        ].map((chip, idx) => (
          <button key={idx} className="chip" onClick={() => handleSendMessage(chip)}>{chip}</button>
        ))}
      </div>

      {/* Chat inputs */}
      <div className="chat-input-area">
        <input 
          type="text" 
          className="chat-input"
          placeholder={
            language === 'hi' 
            ? "आरटीओ सेवा के बारे में पूछें..." 
            : language === 'hinglish' 
            ? "RTO service ke baare me poochhein..." 
            : "Ask about documents, steps, fees, e-challans..."
          }
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button 
          className={`action-btn ${isRecording ? 'recording' : ''}`}
          onClick={triggerVoiceRecording}
          disabled={isTranscribing}
          title={isRecording ? "Stop & Transcribe Audio" : "Record Voice via Sarvam STT"}
          style={{ background: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)', color: isRecording ? '#ef4444' : 'var(--text-muted)', border: '1px solid var(--border-light)' }}
        >
          <Mic size={18} className={isRecording ? "animate-pulse" : ""} />
        </button>
        <button className="action-btn" onClick={() => handleSendMessage()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
