import React, { useState, useEffect, useRef } from 'react';
import rtoDatabase from './data/rto_database.json';
import { RAGEngine } from './utils/ragEngine';
import { IntelligenceEngine } from './utils/intelligenceEngine';

// Shared Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Modular Feature Views
import ChatAssistantView from './features/chat/ChatAssistantView';
import WizardView from './features/wizard/WizardView';
import StateMatrixView from './features/compare/StateMatrixView';
import PipelineInspectorView from './features/inspector/PipelineInspectorView';
import AnalyticsView from './features/analytics/AnalyticsView';

// Instantiate AI & RAG engines
const ragEngine = new RAGEngine(rtoDatabase);
const intelEngine = new IntelligenceEngine(ragEngine);

function App() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'wizard', 'compare', 'inspector', 'analytics'
  
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
      const stateNames = {
        DL: 'Delhi',
        MH: 'Maharashtra',
        KA: 'Karnataka',
        UP: 'Uttar Pradesh',
        TN: 'Tamil Nadu',
        TS: 'Telangana',
        GJ: 'Gujarat'
      };

      const ctx = {
        stateCode,
        stateName: stateNames[stateCode] || stateCode,
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
    const cleanText = fullResponse
      .replace(/\*+/g, '')
      .replace(/###/g, '')
      .replace(/\[Source:.*?\]/g, '')
      .replace(/\[Source ID:.*?\]/g, '')
      .replace(/\[.*?\]/g, '')
      .split('\n')[0] + "... (speaking guidelines)";
      
    setSpeakingText(cleanText);
    
    setTimeout(() => {
      setIsSpeaking(false);
      setSpeakingText('');
    }, 4500);
  };

  // Handle Feedback Submission
  const handleFeedback = (msgId, isUpvote) => {
    const msg = chatMessages.find(m => m.id === msgId);
    if (!msg) return;

    const entry = {
      id: 'fb-' + Date.now(),
      query: chatMessages[chatMessages.indexOf(msg) - 1]?.text || "Vague Query",
      responseSnippet: msg.text.substring(0, 100) + "...",
      rating: isUpvote ? 'Upvote 👍' : 'Downvote 👎',
      confidence: msg.metadata?.confidence || 'N/A',
      grounding: msg.metadata?.grounding || 'N/A',
      timestamp: new Date().toLocaleString()
    };

    const updatedLogs = [entry, ...feedbackLogs].slice(0, 20);
    setFeedbackLogs(updatedLogs);
    localStorage.setItem('rto_ai_feedback', JSON.stringify(updatedLogs));
  };

  // Generate Interactive Checklist (Wizard Panel)
  const handleGenerateWizardChecklist = () => {
    const selectedService = rtoDatabase.services.find(s => s.id === wizardService);
    if (!selectedService) return;

    const commonSteps = selectedService.common_steps;
    const stateDetails = selectedService.state_variations[stateCode];
    const requirements = selectedService.applicant_requirements[applicantType] || selectedService.applicant_requirements['General'];

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
      {/* Sidebar Navigation & Trust Center */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main content Workspace */}
      <main className="main-content">
        
        {/* Top Control Bar containing User Context Toggles */}
        <Header 
          activeTab={activeTab}
          stateCode={stateCode}
          setStateCode={setStateCode}
          vehicleType={vehicleType}
          setVehicleType={setVehicleType}
          applicantType={applicantType}
          setApplicantType={setApplicantType}
          language={language}
          setLanguage={setLanguage}
        />

        {/* Feature Tab 1: AI Chat Assistant */}
        {activeTab === 'chat' && (
          <ChatAssistantView 
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
            feedbackLogs={feedbackLogs}
            clearFeedbackLogs={clearFeedbackLogs}
          />
        )}

        {/* Feature Tab 2: Checklist & Steps Wizard */}
        {activeTab === 'wizard' && (
          <WizardView 
            wizardService={wizardService}
            setWizardService={setWizardService}
            stateCode={stateCode}
            setStateCode={setStateCode}
            applicantType={applicantType}
            setApplicantType={setApplicantType}
            handleGenerateWizardChecklist={handleGenerateWizardChecklist}
            wizardResult={wizardResult}
            checklistItems={checklistItems}
            toggleChecklistItem={toggleChecklistItem}
          />
        )}

        {/* Feature Tab 3: State Comparison Matrix */}
        {activeTab === 'compare' && (
          <StateMatrixView />
        )}

        {/* Feature Tab 4: RAG Pipeline Inspector */}
        {activeTab === 'inspector' && (
          <PipelineInspectorView pipelineData={pipelineData} />
        )}

        {/* Feature Tab 5: Helpdesk Trends & Analytics */}
        {activeTab === 'analytics' && (
          <AnalyticsView chatMessages={chatMessages} />
        )}

        {/* Footer caveats */}
        <Footer />

      </main>
    </div>
  );
}

export default App;
