# AI Investment Research Agent (EquityIntel)

An AI-powered web application that helps users evaluate whether a company is worth investing in. Instead of manually reading annual reports, financial news, and market analysis, users simply enter the name of a company. The AI agent researches the company, analyzes multiple business factors, and generates an investment recommendation (`INVEST` or `PASS`) with clear reasoning.

---

## 1. Overview
The **AI Investment Research Agent** is a full-stack web application that leverages generative AI models to perform structured fundamental analysis of public companies. 

### Key Features
*   **AI-Powered Analysis**: Utilizes Google Gemini API to analyze company profiles, SWOT matrices, sector indices, and financial models.
*   **Structured Recommendations**: Automatically generates binary recommendations (`INVEST` or `PASS`) and assigns a numerical confidence score (0-100%).
*   **SWOT Analysis Grid**: Displays a clean, four-quadrant matrix highlighting Strengths, Weaknesses, Opportunities, and Threats/Risks.
*   **Persistent Search History**: Saves queries and generated reports in a MongoDB database, allowing users to reload previous searches or delete them from their history dashboard.
*   **Premium Visual UI**: Features a modern, dark-mode glassmorphic interface built with React, styled using Tailwind CSS, and powered by micro-animations.

---

## 2. How to Run It

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16+ recommended)
*   [MongoDB](https://www.mongodb.com/try/download/community) (running locally or via MongoDB Atlas cloud URI)
*   [Google Gemini API Key](https://ai.google.dev/) (Generate one from Google AI Studio)

---

### Step-by-Step Installation

#### 1. Clone & Set Up Directory
```bash
git clone https://github.com/yourusername/AI-Investment-Agent.git
cd AI-Investment-Agent
```

#### 2. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend/` folder and insert your credentials:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ai_investment_agent
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

#### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Access the web interface in your browser at `http://localhost:5173`.

---

## 3. How It Works

### Architecture Diagram
```text
                      +-------------------+
                      |   React Frontend  |
                      | (Tailwind/Vite)   |
                      +---------+---------+
                                |
                   HTTP Request | (Axios)
                                v
                      +---------+---------+
                      |   Express Server  |
                      |    (Node.js)      |
                      +---------+---------+
                                |
              +-----------------+-----------------+
              |                                   |
              v                                   v
    +---------+---------+               +---------+---------+
    |  LangChain Agent  |               |  Database Layer   |
    | (Structured output|               |    (MongoDB)      |
    |   Zod validation) |               +-------------------+
    +---------+---------+
              |
              v
    +---------+---------+
    | Google Gemini API |
    | (gemini-1.5-flash)|
    +-------------------+
```

### Flow of Execution
1.  **User Input**: The user enters a company name (e.g., *Nvidia* or *Tesla*) into the React frontend.
2.  **API Call**: The client dispatches a POST request to `/api/analyze` containing the company string.
3.  **Search Logged**: The backend Express controller immediately logs the company query in the MongoDB `SearchHistory` collection.
4.  **AI Orchestration**: The LangChain.js framework builds an instruction prompt containing:
    *   The analyst target (`{company}`).
    *   Zod-based structural requirements (defining fields: `overview`, `industry`, `strengths`, `weaknesses`, `opportunities`, `threats`, `investmentDecision`, `reasoning`, and `confidenceScore`).
5.  **LLM Execution**: The prompt is processed by the `gemini-1.5-flash` model.
6.  **Parsing & Storage**: LangChain parses the output into a validated JSON object. The backend controller stores this report in the MongoDB `Reports` collection.
7.  **Dashboard Render**: The frontend receives the JSON response and renders it dynamically on the glassmorphic SWOT and decision dashboard.

---

## 4. Key Decisions & Trade-offs

### 1. Choice of LangChain.js over Direct API Calling
*   **Why**: LangChain simplifies structured output parsing using Zod models. Instead of manually formatting string responses or cleaning up markdown text blocks, LangChain's `StructuredOutputParser` enforces validation at the library layer.
*   **Trade-off**: Increases bundle size and dependency footprint for the backend, but significantly lowers prompt engineering errors and runtime parser crashes.

### 2. NoSQL MongoDB over SQL
*   **Why**: AI-generated investment briefs have variable metadata and can expand over time (e.g., adding news nodes, price lists, or financial matrices). MongoDB's schema-less nature matches this flexibility.
*   **Trade-off**: Sacrifices ACID relational integrity, which is acceptable since reports do not currently cross-reference complex multi-table joins.

### 3. Google Gemini 1.5 Flash over Gemini 1.5 Pro
*   **Why**: For quick interactive searches on a website, latency is critical. `gemini-1.5-flash` offers near-instant response speeds (often under 3-4 seconds for deep analysis) with a generous free tier compared to `gemini-1.5-pro`.
*   **Trade-off**: The Flash model has slightly less logical reasoning power compared to Pro, but this is mitigated by injecting strong, structured system prompts and analytical system frameworks.

### 4. Static Knowledge vs. Live Financial Feeds
*   **Why**: Using the LLM’s internal knowledge base keeps the architecture simple, clean, and zero-cost (no expensive financial APIs like Bloomberg, Alpha Vantage, or Yahoo Finance required).
*   **Trade-off**: Recommendations are bounded by the LLM’s training cutoff and lack real-time stock price changes or intraday news events. This trade-off is documented on the user interface.

---

## 5. Example Runs

### Example Run 1: Microsoft (MSFT)
*   **Investment Decision**: `INVEST`
*   **Confidence Score**: `92%`
*   **Overview**: Microsoft is a global technology company with strong businesses in cloud computing (Azure), enterprise software, AI integration (Copilot), and gaming.
*   **SWOT Summary**:
    *   *Strengths*: Dominance in enterprise software, Azure's high-margin recurring growth, and early-mover advantage in AI.
    *   *Weaknesses*: Exposure to regulatory scrutiny (antitrust) and minor legacy slow-down segments.
    *   *Opportunities*: Monetizing AI integrations across productivity suites and expansion in cloud infrastructure.
    *   *Threats*: Intense competition from Amazon Web Services (AWS) and Google Cloud Platform (GCP).
*   **Reasoning**: Microsoft demonstrates consistent financial performance, strong free cash flow, diversified products, and clear leadership in the AI revolution. While regulatory risks exist, its enterprise lock-in and cloud runway make it an attractive long-term investment.

---

### Example Run 2: Intel Corporation (INTC)
*   **Investment Decision**: `PASS`
*   **Confidence Score**: `75%`
*   **Overview**: Intel is an American semiconductor chip manufacturer, historically dominant in PC and server processors, now transitioning towards a foundry service model.
*   **SWOT Summary**:
    *   *Strengths*: Established x86 market share, domestic manufacturing footprint, and government backing via the CHIPS Act.
    *   *Weaknesses*: Lags behind in mobile, AI GPU computing, and advanced manufacturing nodes.
    *   *Opportunities*: Expansion of Intel Foundry Services (IFS) and demand for domestic chip supply.
    *   *Threats*: Market share erosion to AMD and ARM-based chips, high capital expenditures.
*   **Reasoning**: Intel is undergoing a risky, highly capital-intensive turnaround strategy. Until foundry operations achieve profitability and market competitiveness, the financial strain and margins compress the investment profile, warranting a PASS for lower-risk seeking investors.

---

## 6. What We Would Improve with More Time
1.  **Live Financial Integration**: Connect API endpoints to services like Yahoo Finance or Alpha Vantage to fetch live stock charts, historical P/E ratios, and trading volumes.
2.  **Web Search Tooling (RAG)**: Enhance the LangChain agent with a Google Search tool (using Serper API) to retrieve current day news sentiment and earnings transcripts, solving the knowledge cutoff limit.
3.  **PDF Export & Email Reports**: Add a feature to download the generated investment report as a formatted PDF or email it directly to a user.
4.  **Portfolio Watchlist**: Enable authenticated users to save multiple companies to a watchlist dashboard to monitor investment decisions over time.
