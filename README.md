# 🚗 RTO Services AI — Grounded Transport Guidance Prototype

[![React 19](https://img.shields.io/badge/React-19.2.8-blue.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2.0-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Oxlint](https://img.shields.io/badge/Linted_with-Oxlint-ff69b4.svg)](https://oxc.rs/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status: Prototype](https://img.shields.io/badge/Status-Guidance_Prototype-emerald.svg)](#-responsible-ai--disclaimer)

An intelligent, grounded Retrieval-Augmented Generation (RAG) assistant designed to simplify **Regional Transport Office (RTO)** procedures in India. Built with React 19 and Vite, this application provides clear, step-by-step guidance on driver's licensing, vehicle transfers, license renewals, and traffic e-challans across multiple states (**Delhi**, **Maharashtra**, and **Karnataka**) with support for **English**, **Hindi (हिंदी)**, and **Hinglish**.

---

## 📁 Project Architecture & Modular Structure

The codebase is organized following the **Separation of Concerns (SoC)** principle, decomposing application domains into isolated functional feature modules and shared layout components.

```
rto-services/
├── public/                     # Static assets
├── src/
│   ├── components/             # Shared UI & Layout Components
│   │   ├── common/
│   │   │   └── MarkdownViewer.jsx # Markdown parser & citation badge formatter
│   │   └── layout/
│   │       ├── Sidebar.jsx      # Navigation sidebar, branding & AI Trust Center
│   │       ├── Header.jsx       # Dynamic top bar with user context selectors
│   │       └── Footer.jsx       # Legal caveated disclaimer & MoRTH notice
│   ├── features/               # Isolated Functional Feature Modules
│   │   ├── chat/               # Module 1: AI Conversational Assistant
│   │   │   ├── components/
│   │   │   │   ├── ChatWindow.jsx    # Chat header, messages list, suggestion chips & inputs
│   │   │   │   ├── QuickScenarios.jsx# Citizen scenario templates
│   │   │   │   ├── AppointmentPrep.jsx# RTO slot visit readiness checklist
│   │   │   │   └── FeedbackAudit.jsx  # Accuracy feedback audit logger
│   │   │   └── ChatAssistantView.jsx # Top-level chat dashboard layout
│   │   ├── wizard/             # Module 2: Step & Checklist Builder
│   │   │   ├── components/
│   │   │   │   ├── WizardForm.jsx    # Service & applicant selection form
│   │   │   │   └── WizardResults.jsx # Dynamic document checklist & step roadmap
│   │   │   └── WizardView.jsx    # Step builder layout view
│   │   ├── compare/            # Module 3: State Comparison Matrix
│   │   │   └── StateMatrixView.jsx # Side-by-side state variations comparison table
│   │   ├── inspector/          # Module 4: Developer RAG Pipeline Inspector
│   │   │   └── PipelineInspectorView.jsx # 5-layer diagnostic metrics & prompt inspector
│   │   └── analytics/          # Module 5: Helpdesk Trends & Analytics
│   │       └── AnalyticsView.jsx # Citizen friction insights & session query audit logs
│   ├── data/
│   │   └── rto_database.json   # Verified RTO knowledge base & rules database
│   ├── utils/
│   │   ├── ragEngine.js        # Data indexing, TF-IDF tokenization, & meta-boosting search
│   │   └── intelligenceEngine.js # Synthesis engine, language detection & hallucination guard
│   ├── App.jsx                 # Main application container & tab router
│   ├── App.css                 # Component & module styles
│   ├── index.css               # Global theme tokens, variables & glassmorphism CSS
│   └── main.jsx                # React application entry point
├── .oxlintrc.json              # Oxlint rules configuration
├── package.json                # Project manifest & scripts
└── vite.config.js              # Vite build setup
```

---

## 🌟 Key Functional Modules

### 1. 💬 `src/features/chat` (AI Chat Assistant)
- **Context-Aware RAG Engine**: Generates responses strictly tied to verified database chunks with clickable source citations (`[Source ID]`).
- **Multilingual Support**: Automatic language detection and response generation for English, Hindi, and Hinglish.
- **Hallucination Safeguards**: Real-time grounding score calculation and confidence indicators on every assistant message.
- **Voice Simulators**: Built-in speech-to-text (Saaras STT) and text-to-speech (Bulbul TTS) simulation modes.
- **Feedback Audit**: Instant upvote/downvote logging saved to local storage for auditing response quality.

### 2. 📋 `src/features/wizard` (Step & Document Checklist Wizard)
- Interactive workflow builder based on selected service, state, and applicant category (General, Under 18, Senior Citizen 40+).
- Interactive document checklist allowing citizens to track required original documents and physical RTO visit preparation.

### 3. 📊 `src/features/compare` (State Variations Comparison Matrix)
- Dynamic side-by-side comparison table detailing fee structures, contactless portal support (Parivahan/Sarathi/Vahan), and testing standards across Delhi (DL), Maharashtra (MH), and Karnataka (KA).

### 4. 🔬 `src/features/inspector` (Developer RAG Pipeline Inspector)
- A 5-layer diagnostic panel exposing internal AI pipeline operations:
  - Raw query and active context parameters.
  - TF-IDF keyword tokenization and retrieval scoring.
  - Top retrieved knowledge chunks with relevance breakdown.
  - Synthesized system prompt sent to the intelligence layer.
  - Grounding ratio and hallucination guard metrics.

### 5. 📈 `src/features/analytics` (Helpdesk Trends & Analytics)
- Live visual analytics tracking feedback metrics, query confidence averages, grounding ratios, and historical user interaction logs.

---

## 🏗️ System Architecture

```
                    ┌─────────────────────────┐
                    │  User Interface (React) │
                    │   - Context Controls    │
                    │   - Modular Feature Views│
                    └────────────┬────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │ RTO Knowledge Base    │
                     │ (rto_database.json)   │
                     └───────────┬───────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ RAG Engine (ragEngine)  │
                    │  - TF-IDF Tokenization  │
                    │  - State Meta-Boosting  │
                    │  - Chunk Retrieval      │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Intelligence Engine    │
                    │  - Language Detector    │
                    │  - Answer Synthesizer   │
                    │  - Hallucination Guard  │
                    └─────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PragyadiptaPradhan/rto-services.git
   cd rto-services
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 🛠️ Scripts & Commands

- **`npm run dev`**: Starts Vite dev server with HMR.
- **`npm run build`**: Compiles production bundle to `dist/`.
- **`npm run preview`**: Previews the built production application.
- **`npm run lint`**: Runs fast JavaScript/React linting via `oxlint`.

---

## ⚠️ Responsible AI & Disclaimer

> **IMPORTANT**: **RTO Services AI** is an independent, non-governmental guidance prototype built for educational and informational purposes. It is **not** an official RTO portal, legal enforcement system, or government approval platform. For legal compliance and official application submission, always visit the official Ministry of Road Transport and Highways (MoRTH) portal at [parivahan.gov.in](https://parivahan.gov.in).

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.