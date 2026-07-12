# EquityIntel - AI-Powered Investment Research Agent

EquityIntel is a premium, real-time AI-powered investment research terminal. By combining the cognitive capabilities of Large Language Models (LLM) with live market quote engines, the agent conducts fundamental analysis, compiles SWOT profiles, estimates target buy valuations, and generates interactive stock price trends—all formatted uniformly in Indian Rupees (INR, ₹).

---

## Overview
Evaluating stock opportunities requires cross-referencing multiple data vectors: financial metrics, historical prices, growth catalysts, and risk factors. EquityIntel automates this pipeline. Simply search a company name or ticker, and the AI agent researches the company's business model, retrieves live historical closes from Yahoo Finance, formats currencies, and provides an immediate, structured `INVEST` or `PASS` evaluation alongside a confidence index.

## Features
*   **AI Fundamental Analyst**: Generates analytical summaries, industry sectors, catalyst indexes, and risk vectors using Google Gemini 2.5-Flash.
*   **Structured Buy Targets**: Computes Fair Value Estimates, Target Entry Buy Ranges, and 1-Year Price Targets.
*   **Uniform INR Formatting (₹)**: Converts all international currencies (USD, EUR, etc.) to Indian Rupees using approximate exchange rates.
*   **Interactive Crosshair SVG Chart**: Custom-designed SVG chart displaying a 10-day price trend. Tracks mouse movements to display a vertical guide line, glowing data points, and a floating HUD tooltip showing close prices and dates.
*   **Dynamic Trend Colors**: The stock line and glow automatically colorize in **Emerald Green** (positive 10-day trend) or **Rose Red** (negative 10-day trend).
*   **Sequential Loading Animation**: A dynamic step-tracker displaying the agent's progress (e.g., *Collecting Data*, *Reading Trends*, *Building SWOT*) during research.
*   **Today's Market Movers**: A split-layout sidebar listing the day's Top 5 Gaining and Top 5 Losing stocks (TCS, Reliance, Apple, Tesla, etc.) with price tickers, percentage change indicators, and mini-sparklines.
*   **Bento Evaluation History**: Sidebar lists the last 20 queries, displaying a mini-sparkline showing price trend directions and instant click-to-load retrieval.

## Tech Stack
*   **Frontend**: React (Vite), Framer Motion, TailwindCSS, Axios, React Icons.
*   **Backend**: Node.js, Express, MongoDB Atlas, Mongoose.
*   **AI Integration**: LangChain, Google Generative AI (`@langchain/google-genai`), Zod Schemas.
*   **Market Data**: Yahoo Finance API.

---

## Project Architecture

```mermaid
graph TD
    User([User Client]) -->|Search Query| App[React App]
    App -->|POST /api/analyze| ExpressServer[Express Backend]
    ExpressServer -->|1. Build Prompt & Format Schema| LangChain[LangChain + Gemini 2.5-Flash]
    LangChain -->|2. Structured JSON Report| ExpressServer
    ExpressServer -->|3. Extract Ticker & Fetch Closes| YahooFinance[Yahoo Finance API]
    YahooFinance -->|4. Convert to INR & Format| ExpressServer
    ExpressServer -->|5. Save Combined Payload| MongoDB[(MongoDB Atlas)]
    ExpressServer -->|6. Return Report Object| App
    App -->|Interactive Cursor hover| SVGChart[Interactive SVG Crosshair Chart]
    App -->|GET /api/market-movers| Movers[Today's Movers quotes]
```

### Endpoints:
*   `POST /api/analyze`: Generates a full investment analysis report for a given company name.
*   `GET /api/history`: Retrieves the last 20 generated reports to populate the sidebar.
*   `GET /api/market-movers`: Batch fetches quote metrics for top gainers/losers.
*   `DELETE /api/report/:id`: Deletes a custom report by database ID.

---

## How to Run

### 1. Prerequisites
*   Node.js (v18+)
*   NPM
*   MongoDB Instance (local or Atlas cluster)

### 2. Setup the Backend
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment variables in `.env` (see below).
4.  Start the server:
    ```bash
    npm run dev
    ```

### 3. Setup the Frontend
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your Vercel/local variables in `.env`.
4.  Start the client:
    ```bash
    npm run dev
    ```

---

## Environment Variables

### Backend Configuration (`backend/.env`):
```env
PORT=5001
MONGO_URI=mongodb+srv://rajritik34_db_user:ritik1234@cluster0.vontusx.mongodb.net/ai_investment_agent?retryWrites=true&w=majority&appName=Cluster0
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend Configuration (`frontend/.env`):
```env
VITE_API_URL=https://ai-ltx7.onrender.com
```

---

## How It Works
1.  **Search Input**: The user enters a company name (e.g., "Apple" or "TCS").
2.  **AI Research Generation**: The server passes this to LangChain, instructing Gemini 2.5-Flash to analyze fundamentals and map the response strictly to a Zod schema containing tickers, sector summary, SWOT arrays, and Indian Rupee targets.
3.  **Financial API Query**: The backend reads the ticker returned by the AI model (e.g. `AAPL` or `TCS.NS`) and pulls its closing prices for the last 10 days via Yahoo Finance.
4.  **Exchange Conversion**: If the stock is foreign, prices are multiplied by approximate INR exchange rates.
5.  **Persistence**: The combined dataset (AI analysis + Rupees price arrays) is saved to MongoDB.
6.  **HUD Render**: The frontend receives the object and updates the state. Numbers count up dynamically, and the custom SVG chart becomes active with crosshair mouse tracking.

---

## Key Decisions & Trade-offs
*   **LangChain Structured Output vs Raw JSON**: Setting Zod validation schemas guarantees that the AI returns exact formatting keys. However, API validation failures originally threw unhandled mongoose exceptions. We implemented a custom fallback parser validating JSON keys to prevent database validation crashes.
*   **Custom SVG Charting vs Chart Libraries (Recharts/ChartJS)**: Rather than adding heavy chart package weights which slow down compilation and bundlers, we built a native SVG chart. This allowed us to write custom mouse tracking columns to render the interactive crosshair guidelines and floating HUD tooltips.
*   **Fast-Fail Retries**: Changed default LangChain retries from 7 times down to 1. This prevents the server from hanging for 2 minutes when keys are invalid, failing cleanly in 2 seconds instead.

---

## Example Runs
1.  **Search "Nvidia"**:
    *   Generates ticker `NVDA`.
    *   Determines `INVEST` decision with 92% confidence based on graphics accelerator dominance.
    *   Converts prices to INR (~₹74,000 range) and plots a glowing green up-trend line.
2.  **Search "Tesla"**:
    *   Generates ticker `TSLA`.
    *   Evaluates `PASS` based on electric vehicle margin saturation.
    *   Plots a glowing red down-trend line.

---

## Future Improvements
*   **Real-time Stock Websockets**: Integrate real-time websockets to pipe stock prices dynamically rather than batch pooling.
*   **PDF Report Exports**: Add a backend pdf compiler allowing users to export the full bento research dashboard with one click.
*   **Technical Indicator Overlay**: Allow users to toggle MACD or RSI guidelines directly on the custom SVG chart.

---

## Live Demo

Frontend:
https://ai-nu-eight-26.vercel.app/

Backend:
https://ai-ltx7.onrender.com


GitHub Repository:
https://github.com/ritik5504/ai
