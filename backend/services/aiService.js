const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StructuredOutputParser } = require('langchain/output_parsers');
const { z } = require('zod');

// Schema specification for LangChain StructuredOutputParser
const reportZodSchema = z.object({
  companyName: z.string().describe('The clean official name of the company researched.'),
  overview: z.string().describe('Comprehensive business overview of the company.'),
  industry: z.string().describe('Detailed industry sector analysis and market dynamics.'),
  strengths: z.array(z.string()).describe('List of 3-5 core business/financial strengths.'),
  weaknesses: z.array(z.string()).describe('List of 3-5 core weaknesses or current issues.'),
  opportunities: z.array(z.string()).describe('List of 3-5 growth opportunities and positive catalysts.'),
  threats: z.array(z.string()).describe('List of 3-5 macro or competitive threats/risks.'),
  investmentDecision: z.enum(['INVEST', 'PASS']).describe('Final investment recommendation decision: must be either INVEST or PASS.'),
  reasoning: z.string().describe('Detailed professional analyst reasoning supporting the investment decision.'),
  confidenceScore: z.number().int().min(0).max(100).describe('Confidence score from 0 to 100 on this recommendation.'),
  tickerSymbol: z.string().describe('The stock ticker symbol of the company on a major public exchange like NASDAQ/NYSE (e.g., AAPL, TSLA, NVDA).'),
  fairValueEstimate: z.string().describe('Estimated fair value range of the stock in Indian Rupees, e.g., "₹15,000 - ₹16,500". Always prefix with the ₹ symbol.'),
  buyRange: z.string().describe('Recommended entry buy range in Indian Rupees, e.g., "Below ₹15,500" or "Wait for dip". Always prefix with the ₹ symbol.'),
  targetPrice: z.string().describe('Estimated 1-year target price in Indian Rupees, e.g., "₹18,000". Always prefix with the ₹ symbol.')
});

const parser = StructuredOutputParser.fromZodSchema(reportZodSchema);

const generateInvestmentReport = async (companyName) => {
  // Initialize the Gemini Model using LangChain's Google GenAI integration
  const model = new ChatGoogleGenerativeAI({
    modelName: 'gemini-2.5-flash',
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.2 // Lower temperature for analytical reliability
  });

  const promptTemplate = new PromptTemplate({
    template: `You are an expert Wall Street investment research analyst.
Conduct comprehensive research and provide a structured investment evaluation for: {company}

Your task is to analyze the company's fundamentals, business model, market position, financial health, and risks, and make an objective decision whether to INVEST or PASS.

CRITICAL INSTRUCTION: All currency references and monetary valuations (e.g., Fair Value, Target Price, Buy Range) must be calculated, presented, and formatted in Indian Rupees (INR) using the "₹" symbol. Even if the company is listed outside of India (like US stocks such as Apple, Tesla, or Nvidia), convert all dollar-based or foreign currency calculations to Indian Rupees (INR) based on current approximate exchange rates.

{format_instructions}

Ensure all fields in the JSON schema are populated. Do not return empty fields. Include specific details and data points where appropriate.`,
    inputVariables: ['company'],
    partialVariables: {
      format_instructions: parser.getFormatInstructions()
    }
  });

  const input = await promptTemplate.format({ company: companyName });
  
  try {
    const response = await model.invoke(input);
    const parsedOutput = await parser.parse(response.content);
    return parsedOutput;
  } catch (error) {
    console.error('LangChain/Gemini Generation Error:', error);
    // Fallback JSON parser if LangChain format parser fails due to output format issues
    try {
      const rawText = error.output || error.message;
      const jsonStart = rawText.indexOf('{');
      const jsonEnd = rawText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const cleanedJson = rawText.substring(jsonStart, jsonEnd + 1);
        return JSON.parse(cleanedJson);
      }
    } catch (innerError) {
      throw new Error(`Failed to generate or parse AI analysis: ${innerError.message}`);
    }
    throw error;
  }
};

module.exports = {
  generateInvestmentReport
};
