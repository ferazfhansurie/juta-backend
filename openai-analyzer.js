import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeWithAI(testResults) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found. Skipping AI analysis.');
      return {
        summary: 'AI analysis unavailable - OpenAI API key not configured',
        recommendations: [],
        priorityBugs: testResults.bugs || []
      };
    }

    // Prepare the context for AI analysis
    const context = {
      url: testResults.url,
      testType: testResults.testType,
      performance: testResults.performance,
      bugs: testResults.bugs || [],
      results: testResults.results || []
    };

    const prompt = `
You are a senior QA engineer analyzing automated test results for a web application. 

**Test Results for: ${context.url}**

**Performance Metrics:**
- Load Time: ${context.performance?.loadTime || 'N/A'}ms
- Elements Count: ${context.performance?.elementsCount || 'N/A'}
- Console Errors: ${context.performance?.consoleErrors || 0}

**Bugs Found (${context.bugs.length}):**
${context.bugs.map((bug, index) => 
  `${index + 1}. [${bug.severity?.toUpperCase()}] ${bug.type}: ${bug.description}`
).join('\n')}

**Test Results:**
${context.results.map(result => 
  `- ${result.testName}: ${result.status.toUpperCase()} (${result.bugs?.length || 0} issues)`
).join('\n')}

Please provide a comprehensive analysis including:
1. **Executive Summary**: Overall health assessment of the page/application
2. **Critical Issues**: Most urgent problems that need immediate attention
3. **Performance Analysis**: Assessment of load times and resource usage
4. **User Experience Impact**: How these issues affect end users
5. **Prioritized Recommendations**: Actionable steps to fix issues (most important first)
6. **Technical Insights**: Deeper technical analysis of root causes

Format your response as a structured analysis that would be useful for developers and product managers.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert QA engineer and web performance specialist. Provide detailed, actionable insights based on automated test results. Focus on practical recommendations and clear explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    const analysis = completion.choices[0].message.content;

    // Extract priority bugs using simple heuristics
    const priorityBugs = context.bugs
      .filter(bug => bug.severity === 'critical' || bug.severity === 'high')
      .sort((a, b) => {
        const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

    // Generate specific recommendations based on bug types
    const recommendations = generateRecommendations(context.bugs, context.performance);

    return {
      analysis,
      summary: analysis.split('\n')[0], // First line as summary
      recommendations,
      priorityBugs,
      aiInsights: {
        analysisDate: new Date().toISOString(),
        model: "gpt-4-turbo-preview",
        confidence: calculateConfidence(context)
      }
    };

  } catch (error) {
    console.error('OpenAI Analysis Error:', error);
    
    // Fallback analysis
    return {
      summary: `Found ${testResults.bugs?.length || 0} issues. AI analysis failed.`,
      analysis: `Basic analysis: The page has ${testResults.bugs?.length || 0} identified issues. ${testResults.performance?.loadTime ? `Load time: ${testResults.performance.loadTime}ms. ` : ''}Review the detailed results below.`,
      recommendations: generateRecommendations(testResults.bugs || [], testResults.performance),
      priorityBugs: (testResults.bugs || []).filter(bug => bug.severity === 'critical' || bug.severity === 'high'),
      error: error.message
    };
  }
}

function generateRecommendations(bugs, performance) {
  const recommendations = [];
  
  // Performance recommendations
  if (performance?.loadTime > 3000) {
    recommendations.push({
      type: 'Performance',
      priority: 'High',
      issue: 'Slow page load time',
      action: 'Optimize images, minify CSS/JS, enable compression, or use a CDN',
      impact: 'Improves user experience and SEO rankings'
    });
  }

  // Security recommendations
  const securityBugs = bugs.filter(bug => bug.type?.toLowerCase().includes('security'));
  if (securityBugs.length > 0) {
    recommendations.push({
      type: 'Security',
      priority: 'Critical',
      issue: 'Security vulnerabilities detected',
      action: 'Review and fix all security-related issues immediately',
      impact: 'Prevents potential security breaches and data loss'
    });
  }

  // Accessibility recommendations
  const accessibilityBugs = bugs.filter(bug => bug.type?.toLowerCase().includes('accessibility'));
  if (accessibilityBugs.length > 0) {
    recommendations.push({
      type: 'Accessibility',
      priority: 'Medium',
      issue: 'Accessibility improvements needed',
      action: 'Add alt text to images, improve keyboard navigation, ensure proper contrast',
      impact: 'Makes the application usable for users with disabilities'
    });
  }

  // JavaScript error recommendations
  if (performance?.consoleErrors > 0) {
    recommendations.push({
      type: 'JavaScript',
      priority: 'High',
      issue: `${performance.consoleErrors} JavaScript errors found`,
      action: 'Debug and fix JavaScript errors in browser console',
      impact: 'Prevents functionality issues and improves user experience'
    });
  }

  // Form validation recommendations
  const formBugs = bugs.filter(bug => bug.type?.toLowerCase().includes('form'));
  if (formBugs.length > 0) {
    recommendations.push({
      type: 'Forms',
      priority: 'Medium',
      issue: 'Form validation issues detected',
      action: 'Add proper client and server-side validation to all forms',
      impact: 'Improves data quality and user experience'
    });
  }

  return recommendations;
}

function calculateConfidence(context) {
  // Simple confidence calculation based on data availability
  let confidence = 0.5; // Base confidence
  
  if (context.performance?.loadTime) confidence += 0.2;
  if (context.bugs?.length > 0) confidence += 0.2;
  if (context.results?.length > 0) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

export default { analyzeWithAI };