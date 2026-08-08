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
          <MessageSquare size={18} style={{ color: '#059669' }} />
          <span>RTO Grounded Assistant</span>
          <span className="badge-live">Online Guidance</span>
        </div>
        
        {/* Voice Indicators & Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={triggerVoiceRecording} 
            disabled={isTranscribing}
            className={`nav-link ${isRecording || isTranscribing ? 'active' : ''}`}
            style={{ 
              padding: '6px 14px', 
              fontSize: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              border: '1px solid var(--border-light)',
              background: isRecording ? '#fee2e2' : isTranscribing ? '#e0f2fe' : '#ffffff',
              color: isRecording ? '#dc2626' : isTranscribing ? '#0284c7' : 'var(--text-primary)',
              borderRadius: '20px'
            }}
            title="Click to speak your RTO query via Sarvam STT"
          >
            <Mic size={14} className={isRecording ? "text-red-500 animate-pulse" : isTranscribing ? "text-sky-500 animate-spin" : "text-slate-500"} />
            <span style={{ fontWeight: '600' }}>
              {isRecording ? "Recording..." : isTranscribing ? "Transcribing..." : "Voice Query"}
            </span>
          </button>

          {isSpeaking && (
            <div 
              className="nav-link active" 
              style={{ 
                padding: '6px 14px', 
                fontSize: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: '#e0f2fe',
                borderColor: '#bae6fd',
                color: '#0369a1',
                borderRadius: '20px'
              }}
            >
              <Volume2 size={14} className="animate-bounce" />
              <span style={{ fontWeight: '600' }}>Speaking (Bulbul)...</span>
            </div>
          )}
        </div>
      </div>

      {/* Speech Visualizer Banner */}
      {isSpeaking && speakingText && (
        <div style={{ background: '#f0f9ff', borderBottom: '1px solid #bae6fd', padding: '10px 20px', fontSize: '12px', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="voice-visualizer">
            <span className="voice-bar active"></span>
            <span className="voice-bar active"></span>
            <span className="voice-bar active"></span>
            <span className="voice-bar active"></span>
            <span className="voice-bar active"></span>
          </div>
          <span><strong>Audio Response (Bulbul):</strong> "{speakingText}"</span>
        </div>
      )}

      {/* Chat Messages */}
      <div className="chat-messages">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
            <div className="flex flex-col">
              <div>
                {msg.sender === 'assistant' ? <MarkdownViewer text={msg.text} /> : msg.text}
              </div>
              
              {msg.sender === 'assistant' && msg.id !== 'welcome' && (
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                  <span style={{ color: '#16a34a', fontWeight: '600' }}>Confidence: {msg.metadata?.confidence}%</span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span>Is this accurate?</span>
                    <button 
                      onClick={() => handleFeedback(msg.id, true)} 
                      style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}
                    >
                      <ThumbsUp size={12} /> Yes
                    </button>
                    <button 
                      onClick={() => handleFeedback(msg.id, false)} 
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}
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

      {/* Input Area */}
      <div className="chat-input-area">
        <input 
          type="text" 
          className="chat-input"
          placeholder={language === 'hi' ? "प्रश्न लिखें (उदा. लर्नर लाइसेंस के दस्तावेज)..." : language === 'hinglish' ? "Sawalt poohein (eg. DL renewal steps)..." : "Ask RTO query in English, Hindi, or Hinglish..."}
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(queryInput)}
        />
        <button 
          className="action-btn"
          onClick={() => handleSendMessage(queryInput)}
          title="Send query"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
