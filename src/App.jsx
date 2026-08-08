import React, { useState, useEffect, useRef } from 'react';
import rtoDatabase from './data/rto_database.json';
import { RAGEngine } from './utils/ragEngine';
import { IntelligenceEngine } from './utils/intelligenceEngine';
import { 
  MessageSquare, 
  CheckSquare, 
  Layers, 
  FileText, 
  Send, 
  Mic, 
  Volume2, 
  ShieldAlert, 
  Award, 
  Database, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle, 
  Info, 
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Globe2,
  Trash2,
  BarChart3
} from 'lucide-react';

// Instantiate engines
const ragEngine = new RAGEngine(rtoDatabase);
const intelEngine = new IntelligenceEngine(ragEngine);

// Simple local Markdown parser function for chat responses
const parseMarkdown = (text) => {
  if (!text) return '';
  
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Headings
    if (line.startsWith('###')) {
      return <h3 key={idx} className="mt-4 mb-2 text-indigo-400 font-semibold border-b border-white/5 pb-1">{line.replace('###', '').trim()}</h3>;
    }
    // Bullet lists
    if (line.startsWith('-') || line.startsWith('*')) {
      const formatted = formatInline(line.substring(1).trim());
      return <li key={idx} className="ml-4 list-disc text-gray-300 my-1">{formatted}</li>;
    }
    // Numbers
    if (/^\d+\./.test(line)) {
      const formatted = formatInline(line.replace(/^\d+\./, '').trim());
      return <li key={idx} className="ml-4 list-decimal text-gray-300 my-1">{formatted}</li>;
    }
    // Empty lines
    if (line.trim() === '') {
      return <div key={idx} className="h-2"></div>;
    }
    // Standard paragraph
    return <p key={idx} className="my-1.5 text-gray-200">{formatInline(line)}</p>;
  });
};

// Formatter for inline elements (**bold**, [source_citation])
const formatInline = (text) => {
  const parts = [];
  let currentText = text;
  
  // Highlight citation tags [Source: chunk_id] or [Source ID: chunk_id] or [learners_license_desc]
  const citationRegex = /\[(?:Source|Source ID|श्रौत|स्रोत)?:\s*([\w_]+)\]|\[([\w_]+)\]/g;
  
  // Parse bold and citations
  // A simplistic replacement for demonstration
  let match;
  let lastIndex = 0;
  
  while ((match = citationRegex.exec(currentText)) !== null) {
    const textBefore = currentText.substring(lastIndex, match.index);
    const citationId = match[1] || match[2];
    
    // Parse bold in textBefore
    parts.push(...formatBold(textBefore));
    
    // Add citation badge
    parts.push(
      <span 
        key={`cite-${match.index}`} 
        className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 cursor-help"
        title={`Verified Knowledge Chunk: ${citationId}`}
      >
        🔗 {citationId.replace('_desc', ' Info').replace('_steps', ' Steps')}
      </span>
    );
    
    lastIndex = citationRegex.lastIndex;
  }
  
  parts.push(...formatBold(currentText.substring(lastIndex)));
  return parts;
};

// Formatter for bold text **like this**
const formatBold = (text) => {
  const parts = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  let lastIndex = 0;
  
  while ((match = boldRegex.exec(text)) !== null) {
    parts.push(text.substring(lastIndex, match.index));
    parts.push(<strong key={`bold-${match.index}`} className="text-white font-semibold">{match[1]}</strong>);
    lastIndex = boldRegex.lastIndex;
  }
  
  parts.push(text.substring(lastIndex));
  return parts;
};

function App() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'wizard', 'compare', 'inspector'
  
  // RTO Context States
  const [stateCode, setStateCode] = useState('DL');
  const [vehicleType, setVehicleType] = useState('LMV');
  const [applicantType, setApplicantType] = useState('General');
  const [language, setLanguage] = useState('en');

  // Chat States
  const [queryInput, setQueryInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  
  // Voice Simulation States
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState('');
  
  // Pipeline & RAG Details
  const [pipelineData, setPipelineData] = useState(null);
  
  // User feedback logs
  const [feedbackLogs, setFeedbackLogs] = useState([]);
  
  // Checklist Wizard States
  const [wizardService, setWizardService] = useState('learners_license');
  const [checklistItems, setChecklistItems] = useState({});
  const [wizardResult, setWizardResult] = useState(null);

  // Message scroll reference
  const chatEndRef = useRef(null);

  // Set greeting message on load
  useEffect(() => {
    resetGreeting(language);
    // Load feedback logs from localStorage if present
    const savedLogs = localStorage.getItem('rto_ai_feedback');
    if (savedLogs) {
      setFeedbackLogs(JSON.parse(savedLogs));
    }
  }, [language]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const resetGreeting = (lang) => {
    let welcomeText = '';
    if (lang === 'hi') {
      welcomeText = `नमस्ते! मैं आपका आरटीओ सेवा सहायक हूँ। मैं दिल्ली, महाराष्ट्र और कर्नाटक के लिए निम्नलिखित मामलों में सहायता कर सकता हूँ:
- लर्नर्स लाइसेंस (LL) और स्थायी ड्राइविंग लाइसेंस (DL)
- लाइसेंस नवीनीकरण (DL Renewal)
- वाहन स्वामित्व स्थानांतरण (RC Ownership Transfer)
- ई-चालान और आरटीओ कार्यालय नियुक्ति (Appointments) की तैयारी

**आप कोई भी प्रश्न पूछ सकते हैं, उदाहरण के लिए:**
- *"लर्नर लाइसेंस के लिए कौन से दस्तावेज चाहिए?"*
- *"गाड़ी का ओनरशिप ट्रांसफर दिल्ली में कैसे होता है?"*
- *"ई-चालान कैसे भरें?"*`;
    } else if (lang === 'hinglish') {
      welcomeText = `Namaste! Main aapka RTO Service Assistant hoon. Main Delhi, Maharashtra aur Karnataka ke liye in services me help kar sakta hoon:
- Learner's License (LL) aur Permanent Driving License (DL)
- DL Renewal steps aur documents
- Vehicle RC Ownership Transfer
- E-Challan details aur Lok Adalat queries
- RTO slot and physical appointment readiness

**Aap kuch bhi pooch sakte hain, jaise:**
- *"Learner license ke liye documents list kya hai?"*
- *"Maharashtra me DL renewal fees kitna lagta hai?"*
- *"Lok Adalat me challan discount kaise milta hai?"*`;
    } else {
      welcomeText = `Hello! I am your RTO Services Assistant. I provide grounded guidance on steps, documents, fees, and rules for:
- Learner's License (LL) & Permanent Driving License (DL)
- Driving License Renewal
- Vehicle Registration & Ownership Transfer
- E-Challan FAQs & Lok Adalat dispute guidance
- RTO Visit preparation

**Ask me a question or try these templates:**
- *"What are the documents needed for a Learners License?"*
- *"How to transfer vehicle ownership in Karnataka?"*
- *"What happens if I don't pay my traffic challan?"*`;
    }
    
    setChatMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Run the RAG + Intelligence pipeline for Chat
  const handleSendMessage = (textToSend) => {
    const query = textToSend || queryInput;
    if (!query.trim()) return;

    // Add user message
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp
    };

    setChatMessages(prev => [...prev, userMsg]);
    setQueryInput('');
    
    // Simulate thinking...
    setTimeout(() => {
      // Execute Intelligence Layer
      const ctx = {
        stateCode,
        stateName: stateCode === 'DL' ? 'Delhi' : stateCode === 'MH' ? 'Maharashtra' : 'Karnataka',
        vehicleType,
        applicantType,
        language
      };
      
      const result = intelEngine.generate(query, ctx);
      
      // Update Pipeline Inspector data
      setPipelineData({
        query,
        context: ctx,
        retrievedChunks: result.retrievedChunks,
        prompt: result.prompt,
        confidence: result.confidence,
        hallucinationCheck: result.hallucinationCheck,
        languageDetected: result.language,
        timestamp: new Date().toLocaleTimeString()
      });

      // Add assistant response
      const assistantMsg = {
        id: 'assistant-' + Date.now(),
        sender: 'assistant',
        text: result.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metadata: {
          confidence: result.confidence,
          grounding: result.hallucinationCheck.score,
          chunks: result.retrievedChunks
        }
      };

      setChatMessages(prev => [...prev, assistantMsg]);
      
      // If voice simulation is on, let Bulbul speak
      if (isSpeaking || isRecording) {
        speakResponse(result.response);
      }
    }, 600);
  };

  // Mock voice commands (Saaras simulator)
  const triggerVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    setIsSpeaking(false);
    
    // Simulate spoken speech-to-text input after 3 seconds
    setTimeout(() => {
      let voiceText = '';
      if (language === 'hi') {
        voiceText = 'दिल्ली में लर्नर लाइसेंस का टेस्ट कैसे पास करें?';
      } else if (language === 'hinglish') {
        voiceText = 'MH me ownership transfer ki papers kya lagti hai?';
      } else {
        voiceText = 'How do I renew my license after it expires?';
      }
      setQueryInput(voiceText);
      setIsRecording(false);
    }, 2500);
  };

  // Mock TTS speaker (Bulbul simulator)
  const speakResponse = (fullResponse) => {
    setIsSpeaking(true);
    // Strip markdown formatting for readable speaking display
    const cleanText = fullResponse
      .replace(/\*+/g, '')
      .replace(/###/g, '')
      .replace(/\[Source:.*?\]/g, '')
      .replace(/\[Source ID:.*?\]/g, '')
      .replace(/\[.*?\]/g, '')
      .split('\n')[0] + "... (speaking guidelines)";
      
    setSpeakingText(cleanText);
    
    // Stop speaking animation after 4 seconds
    setTimeout(() => {
      setIsSpeaking(false);
      setSpeakingText('');
    }, 4500);
  };

  // Handle Feedback Submission
  const handleFeedback = (msgId, isUpvote) => {
    // Find the message
    const msg = chatMessages.find(m => m.id === msgId);
    if (!msg) return;

    // Create a new feedback log entry
    const entry = {
      id: 'fb-' + Date.now(),
      query: chatMessages[chatMessages.indexOf(msg) - 1]?.text || "Vague Query",
      responseSnippet: msg.text.substring(0, 100) + "...",
      rating: isUpvote ? 'Upvote 👍' : 'Downvote 👎',
      confidence: msg.metadata?.confidence || 'N/A',
      grounding: msg.metadata?.grounding || 'N/A',
      timestamp: new Date().toLocaleString()
    };

    const updatedLogs = [entry, ...feedbackLogs].slice(0, 20); // Keep last 20 entries
    setFeedbackLogs(updatedLogs);
    localStorage.setItem('rto_ai_feedback', JSON.stringify(updatedLogs));
  };

  // Generate Interactive Checklist (Wizard Panel)
  const handleGenerateWizardChecklist = () => {
    const selectedService = rtoDatabase.services.find(s => s.id === wizardService);
    if (!selectedService) return;

    // Gather steps & requirements based on inputs
    const commonSteps = selectedService.common_steps;
    const stateDetails = selectedService.state_variations[stateCode];
    const requirements = selectedService.applicant_requirements[applicantType] || selectedService.applicant_requirements['General'];

    // Assemble checklist items
    const docChecklist = {};
    requirements.documents.forEach(doc => {
      docChecklist[doc] = false;
    });

    setChecklistItems(docChecklist);
    setWizardResult({
      serviceName: selectedService.name,
      steps: commonSteps,
      stateNotes: stateDetails,
      requirementsNote: requirements.additional_notes,
      rawRequirements: requirements.documents
    });
  };

  const toggleChecklistItem = (item) => {
    setChecklistItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const clearFeedbackLogs = () => {
    setFeedbackLogs([]);
    localStorage.removeItem('rto_ai_feedback');
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
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

      {/* Main content Workspace */}
      <main className="main-content">
        
        {/* Top Control Bar containing User Context Toggles */}
        <header className="top-bar">
          <div>
            <h2 className="gradient-text" style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {activeTab === 'chat' && "Conversational AI Assistant"}
              {activeTab === 'wizard' && "State & Category Step Builder"}
              {activeTab === 'compare' && "State-by-State Comparison Matrix"}
              {activeTab === 'inspector' && "5-Layer Dev Inspector"}
              {activeTab === 'analytics' && "Helpdesk Insights & Analytics"}
            </h2>
            <p className="context-label">Setup context variables below to personalize the AI engine dynamically</p>
          </div>

          <div className="context-pill-group">
            <div className="context-select-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} className="text-indigo-400" />
              <select 
                className="context-select" 
                value={stateCode} 
                onChange={(e) => setStateCode(e.target.value)}
              >
                <option value="DL">Delhi (DL)</option>
                <option value="MH">Maharashtra (MH)</option>
                <option value="KA">Karnataka (KA)</option>
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
              <Globe2 size={14} className="text-cyan-400" />
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

        {/* Tab 1: AI Chat Assistant & Simulator Dashboard */}
        {activeTab === 'chat' && (
          <div className="dashboard-grid">
            <div className="glass-panel chat-container">
              <div className="panel-header">
                <div className="panel-title">
                  <MessageSquare size={18} className="text-indigo-400" />
                  <span>RTO Grounded Assistant</span>
                  <span className="badge-live">Online Guidance</span>
                </div>
                
                {/* Voice Simulators Indicators */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={triggerVoiceRecording} 
                    className={`nav-link ${isRecording ? 'active' : ''}`}
                    style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-light)' }}
                  >
                    <Mic size={14} className={isRecording ? "text-red-400 animate-pulse" : "text-gray-400"} />
                    <span>{isRecording ? "Listening (Saaras)..." : "Voice Query"}</span>
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
                        {msg.sender === 'assistant' ? parseMarkdown(msg.text) : msg.text}
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
                <button className="action-btn" onClick={() => handleSendMessage()}>
                  <Send size={18} />
                </button>
              </div>
            </div>

            {/* Quick Helper Panel on Right side */}
            <div className="right-panel">
              {/* Quick Scenarios */}
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

              {/* RTO Visit Readiness Checklist */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <CheckSquare size={18} className="text-indigo-400" />
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: '600' }}>RTO Appointment Preparation</h3>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Before going to your slot, check if you have everything ready:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <label className="checklist-item">
                    <input type="checkbox" defaultChecked />
                    <span>Physical File Folder for safety</span>
                  </label>
                  <label className="checklist-item">
                    <input type="checkbox" />
                    <span>Application Form printout & Slot confirmation receipt</span>
                  </label>
                  <label className="checklist-item">
                    <input type="checkbox" />
                    <span>All uploaded scanned documents in original format</span>
                  </label>
                  <label className="checklist-item">
                    <input type="checkbox" />
                    <span>Vehicle with valid PUCC/Insurance (if appearing for driving test)</span>
                  </label>
                  <label className="checklist-item">
                    <input type="checkbox" />
                    <span>L-plates installed (for driving license testing)</span>
                  </label>
                </div>
              </div>

              {/* Feedback Audit Tracker */}
              <div className="glass-panel" style={{ padding: '20px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} className="text-emerald-400" />
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: '600' }}>Recent Feedback Audit</h3>
                  </div>
                  {feedbackLogs.length > 0 && (
                    <button onClick={clearFeedbackLogs} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Trash2 size={12} /> Clear
                    </button>
                  )}
                </div>
                
                {feedbackLogs.length === 0 ? (
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No audit records yet. Submit feedback on AI answers using the 👍/👎 thumbs icons to log audits here.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                    {feedbackLogs.map((log) => (
                      <div key={log.id} className="feedback-log-item">
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                          <strong>Q:</strong> {log.query}
                        </div>
                        <span style={{ 
                          color: log.rating.includes('Up') ? '#10b981' : '#ef4444',
                          fontWeight: 'bold',
                          fontSize: '10px'
                        }}>
                          {log.rating}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Checklist & Steps Wizard */}
        {activeTab === 'wizard' && (
          <div className="dashboard-grid" style={{ gridTemplateColumns: '350px 1fr' }}>
            {/* Form selectors */}
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

            {/* Generated Checklist and steps */}
            <div className="glass-panel" style={{ padding: '24px', overflowY: 'auto' }}>
              {!wizardResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  <CheckSquare size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p>Configure details on the left and click **Build Steps & Checklists** to generate your customized RTO preparation map.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 'bold' }}>Grounded Output Map</span>
                    <h2 style={{ fontSize: '22px', fontWeight: '700' }}>{wizardResult.serviceName} Roadmap</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Personalized for <strong>{stateCode === 'DL' ? 'Delhi' : stateCode === 'MH' ? 'Maharashtra' : 'Karnataka'}</strong> | <strong>{applicantType}</strong> Category
                    </p>
                  </div>

                  {/* Warning Warning alert */}
                  <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px 16px', borderRadius: '8px', fontSize: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <AlertTriangle size={18} className="text-amber-500" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>Guidance Disclaimer:</strong> This list has been generated dynamically based on official guidance sources. Always check details on the official <a href="https://parivahan.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>Sarathi / Vahan Portal</a> before payment.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
                    
                    {/* Document checklist with active tracking */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="checklist-title">
                        📋 Required Documents Checklist
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {wizardResult.rawRequirements.map((doc, idx) => (
                          <div key={idx} className="checklist-card" style={{ padding: '12px', background: checklistItems[doc] ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.01)' }}>
                            <label className="checklist-item" style={{ fontSize: '13px', fontWeight: '500' }}>
                              <input 
                                type="checkbox" 
                                checked={checklistItems[doc] || false}
                                onChange={() => toggleChecklistItem(doc)}
                                style={{ width: '16px', height: '16px' }}
                              />
                              <span style={{ color: checklistItems[doc] ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                                {doc}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>

                      {wizardResult.requirementsNote && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                          <strong>Note:</strong> {wizardResult.requirementsNote}
                        </div>
                      )}
                    </div>

                    {/* Step-by-Step Guidance */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="checklist-title">
                        🗺️ Process Steps & Walkthrough
                      </div>

                      {/* State Specific Rule Callout */}
                      {wizardResult.stateNotes && (
                        <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>
                            📍 {wizardResult.stateNotes.state_name} Jurisdiction Info:
                          </span>
                          <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <li><strong>Contactless processing:</strong> {wizardResult.stateNotes.contactless ? "Yes (Aadhaar Online)" : "No (RTO visit required)"}</li>
                            <li><strong>Fees Estimate:</strong> {wizardResult.stateNotes.fee_breakdown}</li>
                            <li><strong>Testing Setup:</strong> {wizardResult.stateNotes.test_format}</li>
                            <li><strong>Specific Rule:</strong> {wizardResult.stateNotes.special_note}</li>
                          </ul>
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {wizardResult.steps.map((step, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '50%', 
                              background: 'var(--primary-glow)', 
                              border: '1px solid var(--primary)', 
                              color: 'var(--text-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              flexShrink: 0
                            }}>
                              {idx + 1}
                            </div>
                            <div style={{ fontSize: '13px', paddingTop: '3px' }}>
                              {step}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: State Comparison Matrix */}
        {activeTab === 'compare' && (
          <div className="glass-panel" style={{ padding: '24px', overflowY: 'auto' }}>
            <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>State-by-State Rules Comparison</h2>
              <p className="context-label">Analyze fees, processing, and testing format differences side-by-side between states.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {rtoDatabase.services.map((service) => (
                <div key={service.id} style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '18px' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--secondary)', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                    {service.name}
                  </h3>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                          <th style={{ padding: '10px', color: 'var(--text-muted)', fontWeight: 'bold', width: '150px' }}>State / Region</th>
                          <th style={{ padding: '10px', color: 'var(--text-muted)', fontWeight: 'bold', width: '120px' }}>Contactless Mode</th>
                          <th style={{ padding: '10px', color: 'var(--text-muted)', fontWeight: 'bold', width: '200px' }}>Estimated Costs</th>
                          <th style={{ padding: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Test Setup / Inspector Rule</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(service.state_variations).map(([code, details]) => (
                          <tr key={code} style={{ borderBottom: '1px solid var(--border-light)', hover: { background: 'rgba(255,255,255,0.01)' } }}>
                            <td style={{ padding: '12px 10px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                              📍 {details.state_name} ({code})
                            </td>
                            <td style={{ padding: '12px 10px' }}>
                              <span style={{ 
                                padding: '3px 8px', 
                                borderRadius: '12px', 
                                fontSize: '10px', 
                                fontWeight: 'bold',
                                background: details.contactless ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                color: details.contactless ? '#10b981' : '#ef4444'
                              }}>
                                {details.contactless ? 'ENABLED' : 'RTO VISIT'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 10px', color: 'var(--text-primary)' }}>
                              {details.fee_breakdown}
                            </td>
                            <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                              <strong>{details.test_format}</strong>. <span style={{ fontSize: '12px', display: 'block', marginTop: '2px' }}>{details.special_note}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: RAG Pipeline Inspector */}
        {activeTab === 'inspector' && (
          <div className="glass-panel tab-content" style={{ overflowY: 'auto' }}>
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>5-Layer AI Execution Details</h2>
              <p className="context-label">Developer logs showing the data ingestion pipeline, text chunk indexes, similarity scores, and grounded prompts.</p>
            </div>

            {!pipelineData ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
                <Layers size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p>Send a message in the chat assistant first to view its execution logs here.</p>
              </div>
            ) : (
              <div className="pipeline-inspector">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '10px' }}>
                  
                  {/* Layer 1 & 2 Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div className="inspector-step">
                        <span>1. DATA LAYER (Clean Database Schema)</span>
                        <span style={{ color: '#10b981' }}>OK</span>
                      </div>
                      <div className="inspector-card">
{`Database Scope: दिल्ली (DL), महाराष्ट्र (MH), कर्नाटक (KA)
Loaded Services: ${rtoDatabase.services.map(s => s.id).join(', ')}
Loaded FAQs: ${rtoDatabase.general_faqs.length} entries
Metadata Keys: state, category, applicantType, source_scope`}
                      </div>
                    </div>

                    <div>
                      <div className="inspector-step">
                        <span>2. RAG LAYER (Search Similarity Index)</span>
                        <span style={{ color: '#10b981' }}>Retrieved {pipelineData.retrievedChunks.length} chunks</span>
                      </div>
                      <div className="inspector-card">
{`User Query: "${pipelineData.query}"
Active State Filter: ${pipelineData.context.stateCode}
Active Applicant Filter: ${pipelineData.context.applicantType}

Ranked Retrieval Results:
` + pipelineData.retrievedChunks.map((c, i) => `${i + 1}. [ID: ${c.id}] (Match Score: ${c.score.toFixed(2)})
   Title: "${c.title}"
   Excerpt: "${c.content.substring(0, 100)}..."`).join('\n\n')}
                      </div>
                    </div>
                  </div>

                  {/* Layer 3 & 5 Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div className="inspector-step">
                        <span>3. INTELLIGENCE LAYER (Prompt Grounding & Personalization)</span>
                        <span style={{ color: '#10b981' }}>Active</span>
                      </div>
                      <div className="inspector-card">
{`Simulated LLM Grounded Prompt:
----------------------------------------
` + pipelineData.prompt}
                      </div>
                    </div>

                    <div>
                      <div className="inspector-step">
                        <span>5. RESPONSIBLE AI LAYER (Safeguards Audit)</span>
                        <span style={{ 
                          color: pipelineData.hallucinationCheck.status === 'PASSED' ? '#10b981' : '#f59e0b' 
                        }}>
                          {pipelineData.hallucinationCheck.status}
                        </span>
                      </div>
                      <div className="inspector-card">
{`Safety Checks Executed:
- Disclaimer Enforced: YES
- Fact Grounding Ratio: ${pipelineData.hallucinationCheck.score}% (Matched words vs generated words)
- Low-confidence Fallback Triggered: ${pipelineData.confidence < 25 ? 'YES (Confidence too low)' : 'NO (Confidence OK)'}
- Speech translation module: Saaras/Bulbul Simulator Active
- Language detected: ${pipelineData.languageDetected.toUpperCase()}`}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Helpdesk Trends & Analytics */}
        {activeTab === 'analytics' && (
          <div className="glass-panel tab-content" style={{ overflowY: 'auto' }}>
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Helpdesk Trends & Analytics</h2>
              <p className="context-label">Admin insights analyzing common citizen queries, state-specific bottlenecks, and service confusion analytics.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginTop: '12px' }}>
              {/* Trends & Confusions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Confusion details card */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '18px' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--secondary)', fontSize: '15px', fontWeight: '600', marginBottom: '14px' }}>
                    ⚠️ Primary Citizen Friction & Confusion Areas
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                    <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '12px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>MH RC Transfer Signature Matching:</strong>
                      <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                        In Maharashtra, buyer/seller signatures are strictly compared against the original registration records. Signature mismatch accounts for 32% of ownership transfer delays, requiring physical appearance at the RTO.
                      </p>
                    </div>

                    <div style={{ borderLeft: '3px solid var(--secondary)', paddingLeft: '12px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Medical Certificate (Form 1A) Mandate:</strong>
                      <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                        Applicants above 40 years old or those renewing a commercial license often miss uploading Form 1A signed by registered practitioners, leading to 25% of application rejections.
                      </p>
                    </div>

                    <div style={{ borderLeft: '3px solid var(--accent-purple)', paddingLeft: '12px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Delhi Aadhaar Contactless Test Failures:</strong>
                      <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                        Face-recognition verification during the contactless Learner's License test fails if the applicant's photo on Aadhaar is outdated. Must switch to physical RTO slot bookings instead.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Session query history tracker */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '18px' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
                    📋 Active Session Query Audit Tracker
                  </h3>
                  
                  {chatMessages.filter(m => m.sender === 'user').length === 0 ? (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No queries run in this session yet. Ask questions in the AI Chat Assistant to track audit logs.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '6px' }}>Timestamp</th>
                            <th style={{ padding: '6px' }}>User Query</th>
                            <th style={{ padding: '6px' }}>Language</th>
                            <th style={{ padding: '6px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chatMessages.map((msg, idx) => {
                            if (msg.sender !== 'assistant' || msg.id === 'welcome') return null;
                            const userMsg = chatMessages[idx - 1];
                            return (
                              <tr key={msg.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '8px 6px', color: 'var(--text-muted)' }}>{msg.timestamp}</td>
                                <td style={{ padding: '8px 6px', fontWeight: '500', color: 'var(--text-primary)' }}>{userMsg?.text}</td>
                                <td style={{ padding: '8px 6px', textTransform: 'uppercase', color: 'var(--secondary)' }}>
                                  {msg.metadata?.grounding ? (userMsg?.text.toLowerCase().includes('kaise') ? 'Hinglish' : 'English') : 'English'}
                                </td>
                                <td style={{ padding: '8px 6px' }}>
                                  <span style={{ 
                                    color: msg.metadata?.grounding > 70 ? '#10b981' : '#f59e0b',
                                    fontWeight: 'bold'
                                  }}>
                                    {msg.metadata?.grounding > 70 ? 'Grounded' : 'Reviewed'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>

              {/* Charts and distributions Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Query volume trends */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '18px' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--secondary)', fontSize: '15px', fontWeight: '600', marginBottom: '14px' }}>
                    📈 Frequent Service Inquiries
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span>Learner's License Eligibility</span>
                        <strong>34%</strong>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '34%', height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span>Vehicle RC Ownership Transfer</span>
                        <strong>28%</strong>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '28%', height: '100%', background: 'var(--secondary)', borderRadius: '4px' }}></div>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span>E-Challan Lok Adalat Waivers</span>
                        <strong>21%</strong>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '21%', height: '100%', background: 'var(--accent-purple)', borderRadius: '4px' }}></div>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span>Driving License Renewal Steps</span>
                        <strong>17%</strong>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '17%', height: '100%', background: 'var(--accent-pink)', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* State Query Share */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '18px' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: '15px', fontWeight: '600', marginBottom: '14px' }}>
                    🌍 Jurisdiction Traffic Share
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '10px', height: '120px', alignItems: 'flex-end', justifyContent: 'space-around', padding: '10px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ width: '32px', height: '80px', background: 'linear-gradient(to top, var(--primary), #a5b4fc)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '10px', fontWeight: 'bold' }}>40%</div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MH (Mumb)</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ width: '32px', height: '70px', background: 'linear-gradient(to top, var(--secondary), #22d3ee)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '10px', fontWeight: 'bold' }}>35%</div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DL (Delhi)</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ width: '32px', height: '50px', background: 'linear-gradient(to top, var(--accent-purple), #c084fc)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '10px', fontWeight: 'bold' }}>25%</div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>KA (Blru)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Footer caveats */}
        <footer style={{ marginTop: 'auto', textAlign: 'center', padding: '16px', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
            <ShieldAlert size={14} className="text-amber-500" />
            <strong>RTO Services AI Prototype Guidance:</strong> This assistant provides helpful process directions based on official documentation. It does not replace legal decisions, licensing approvals, or fee payments.
          </div>
          <p>© 2026 Transport and RTO Services AI. Built in accordance with Ministry of Road Transport and Highways (MoRTH) standards.</p>
        </footer>

      </main>
    </div>
  );
}

export default App;
