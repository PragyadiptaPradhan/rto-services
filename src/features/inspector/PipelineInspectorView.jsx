import React from 'react';
import { Layers } from 'lucide-react';
import rtoDatabase from '../../data/index.js';

export const PipelineInspectorView = ({ pipelineData }) => {
  return (
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
  );
};

export default PipelineInspectorView;
