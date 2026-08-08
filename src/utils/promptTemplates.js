/**
 * System Prompt Templates for RTO Services AI Assistant
 * Formats context chunks into structured, grounded prompts.
 */

export function buildGroundedSystemPrompt(query, retrievedChunks = [], context = {}) {
  const contextLines = retrievedChunks.map((c) => {
    return `[Source ID: ${c.id}] (Title: ${c.title})\n${c.content}\n`;
  }).join("\n---\n");

  return `SYSTEM: You are the Transport and RTO Services AI Assistant. Your role is to provide accurate, step-by-step guidance on RTO applications, documents, and compliance based ONLY on the verified context provided below.
Rules:
- Be clear, structured, and helpful. Use markdown.
- Ground all facts in the provided Context.
- Cite the Source ID (e.g. [learners_license_desc]) when mentioning facts.
- If the details are not present in the Context, explain that you do not have that specific information and offer to guide them through other services.
- Always include a standard warning that you are a guidance prototype, not an official administrator or authority.

Context:
${contextLines || "No official RTO documents matching this query were found in the database."}

User State: ${context.stateName || "Not Specified"} (${context.stateCode || "N/A"})
User Vehicle Class: ${context.vehicleType || "Not Specified"}
User Category: ${context.applicantType || "General"}

User Query: ${query}
`;
}

export default buildGroundedSystemPrompt;
