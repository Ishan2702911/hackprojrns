# Artenis ✦ Synthetic Architect

Artenis is a premium, AI-powered developer tool designed to bridge the gap between codebase activity and technical oversight. It provides a visual, animated dashboard that ingests GitHub repository data to map PR dependencies, detect cross-branch conflicts, generate AI-driven release notes, and recommend open Pull Requests to team members based on difficulty and impact.

Built with an ultra-modern, dark-themed UI featuring glassmorphism and magnetic cursor animations, Artenis focuses on giving developers and engineering managers unparalleled visibility into their repository's heartbeat.

## 🚀 Key Features

* **Secure GitHub OAuth Integration:** First-class secure connection to GitHub to fetch live Repositories, Commits, and Pull Requests.
* **Pulse & Timeline Tracking:** Visual timelines connecting PRs, commits, and related codebase changes in an intuitive interface.
* **Conflict Engine:** Automatically flags logical intersections and potential file conflicts between active, unmerged Pull Requests across different branches.
* **Skill-Based PR Routing:** Evaluates open PRs and flags specific recommendations (e.g. "Start Fixing") directly matched to team difficulty levels (Moderate, Easy). Click any recommendation to instantly open the PR on GitHub.
* **AI-Powered Commit Summaries:** Uses the **Groq API (Llama 3.3 70b)** or Google Gemini to distill hundreds of commits into instantaneous, categorization models:
  * **For You:** Plain-English, jargon-free bullet points bridging the gap for non-technical stakeholders.
  * **For Team:** Hyper-technical overviews tracking architecture shifts and module patterns.
* **Auto-Documentation & PDF Release Notes:** Dynamically categorizes commits into "Features" and "Fixes". One-click export generates a beautifully styled HTML/PDF Release Note document.
* **Interactive Commit History:** A comprehensive timeline of repository history. Commits are automatically parsed and color-coded via badges (Feature, Fix, Perf, Docs, Milestone, etc.).
* **The Oracle:** An integrated AI Chat assistant with real-time codebase context.

## 🛠️ Tech Stack

* **Frontend:** React 19, TypeScript, **Vite**
* **Styling:** Tailwind CSS v4, custom vanilla CSS (glassmorphism, advanced animations), Framer Motion
* **Backend:** Express.js (unified single-server architecture routing via Vite middleware)
* **APIs:** GitHub REST API, Groq OpenAI-compatible API (Llama), Google GenAI
* **Icons:** Google Material Symbols

## ⚙️ Local Setup

### 1. Prerequisites
You need **Node.js 20+** and **npm** installed.

### 2. Clone the repository
\`\`\`bash
git clone https://github.com/Ishan2702911/hackprojrns.git
cd hackprojrns
\`\`\`

### 3. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 4. Environment Variables
Create a \`.env\` file in the root directory and add the following keys. You will need to create a GitHub OAuth App and obtain API keys for full functionality:

\`\`\`env
# GitHub OAuth App Credentials
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# AI APIs
GROQ_API_KEY=your_groq_api_key      # Required for AI Commit Summaries
GEMINI_API_KEY=your_gemini_api_key  # Required for Oracle AI Chat

# Local Auth URL Configuration
APP_URL=http://localhost:3000
\`\`\`

*Note: The GitHub OAuth app's authorization callback URL must be set to \`http://localhost:3000/api/auth/callback\`.*

### 5. Start the Development Server
This project utilizes a unified Express and Vite middleware pipeline. You only need to run a single command to boot both the API and client concurrently.

\`\`\`bash
npm run dev
\`\`\`
The application will be running at \`http://localhost:3000\`.
