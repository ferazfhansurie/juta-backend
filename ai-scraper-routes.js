import express from 'express';
import puppeteer from 'puppeteer';

const router = express.Router();

// Store active scrapers to manage resources
const activeScraper = new Map();

class AIWebScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  // AI-powered element discovery
  async discoverElements(url) {
    try {
      await this.page.goto(url, { waitUntil: 'networkidle0' });
      
      // Smart element discovery using AI-like heuristics
      const pageAnalysis = await this.page.evaluate(() => {
        // Inject selector generator function
        function generateSelector(element) {
          if (element.id) {
            return '#' + element.id;
          }
          
          if (element.className) {
            const classes = element.className.split(' ').filter(c => c.trim());
            if (classes.length > 0) {
              return '.' + classes.join('.');
            }
          }
          
          let selector = element.tagName.toLowerCase();
          const parent = element.parentElement;
          
          if (parent) {
            const siblings = Array.from(parent.children).filter(child => 
              child.tagName === element.tagName
            );
            
            if (siblings.length > 1) {
              const index = siblings.indexOf(element) + 1;
              selector += ':nth-child(' + index + ')';
            }
          }
          
          return selector;
        }

        const elements = [];
        
        // Discover interactive elements
        const interactives = document.querySelectorAll('button, input, select, textarea, a[href], [onclick], [role="button"]');
        interactives.forEach((el, idx) => {
          if (el.offsetParent !== null) { // Only visible elements
            elements.push({
              type: 'interactive',
              selector: generateSelector(el),
              text: el.textContent?.trim() || el.value || el.placeholder || '',
              tagName: el.tagName.toLowerCase(),
              attributes: Array.from(el.attributes).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
              }, {}),
              position: el.getBoundingClientRect(),
              id: `interactive_${idx}`
            });
          }
        });

        // Discover content elements
        const contents = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div:not(:empty), article, section, [data-*], .card, .item, .product, .row');
        contents.forEach((el, idx) => {
          if (el.offsetParent !== null && el.textContent?.trim()) {
            const rect = el.getBoundingClientRect();
            if (rect.height > 20 && rect.width > 50) { // Filter out tiny elements
              elements.push({
                type: 'content',
                selector: generateSelector(el),
                text: el.textContent?.trim().substring(0, 200),
                tagName: el.tagName.toLowerCase(),
                attributes: Array.from(el.attributes).reduce((acc, attr) => {
                  acc[attr.name] = attr.value;
                  return acc;
                }, {}),
                position: rect,
                id: `content_${idx}`
              });
            }
          }
        });

        // Discover form elements
        const forms = document.querySelectorAll('form');
        forms.forEach((form, idx) => {
          const formData = {
            type: 'form',
            selector: generateSelector(form),
            action: form.action,
            method: form.method,
            fields: [],
            id: `form_${idx}`
          };

          const fields = form.querySelectorAll('input, select, textarea');
          fields.forEach((field, fieldIdx) => {
            formData.fields.push({
              selector: generateSelector(field),
              type: field.type || field.tagName.toLowerCase(),
              name: field.name,
              id: field.id,
              placeholder: field.placeholder,
              required: field.required,
              fieldId: `field_${idx}_${fieldIdx}`
            });
          });

          if (formData.fields.length > 0) {
            elements.push(formData);
          }
        });

        return elements;
      });

      return pageAnalysis;
    } catch (error) {
      console.error('Error discovering elements:', error);
      return [];
    }
  }

  // Smart data extraction based on AI analysis
  async extractData(url, extractionRules = {}) {
    try {
      await this.page.goto(url, { waitUntil: 'networkidle0' });
      
      const extractedData = await this.page.evaluate((rules) => {
        const data = {
          url: window.location.href,
          title: document.title,
          metadata: {},
          content: {},
          interactions: {},
          forms: {},
          timestamp: new Date().toISOString()
        };

        // Extract metadata
        const metaTags = document.querySelectorAll('meta');
        metaTags.forEach(meta => {
          const name = meta.getAttribute('name') || meta.getAttribute('property') || meta.getAttribute('http-equiv');
          const content = meta.getAttribute('content');
          if (name && content) {
            data.metadata[name] = content;
          }
        });

        // Smart content extraction
        const contentSelectors = [
          'main', 'article', 'section', '.content', '#content', '.main-content',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div[class*="text"]',
          '[data-testid]', '[data-cy]', '[data-test]', '.card', '.item', '.product'
        ];

        contentSelectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el, idx) => {
              if (el.offsetParent !== null && el.textContent?.trim()) {
                const key = `${selector.replace(/[^a-zA-Z0-9]/g, '_')}_${idx}`;
                data.content[key] = {
                  text: el.textContent.trim(),
                  html: el.innerHTML,
                  selector: selector,
                  attributes: Array.from(el.attributes).reduce((acc, attr) => {
                    acc[attr.name] = attr.value;
                    return acc;
                  }, {})
                };
              }
            });
          } catch (e) {
            console.warn(`Error processing selector ${selector}:`, e);
          }
        });

        // Extract interactive elements
        const interactiveSelectors = ['button', 'a[href]', 'input', 'select', 'textarea', '[onclick]', '[role="button"]'];
        interactiveSelectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el, idx) => {
              if (el.offsetParent !== null) {
                const key = `${selector.replace(/[^a-zA-Z0-9]/g, '_')}_${idx}`;
                data.interactions[key] = {
                  text: el.textContent?.trim() || el.value || el.placeholder || '',
                  type: el.tagName.toLowerCase(),
                  attributes: Array.from(el.attributes).reduce((acc, attr) => {
                    acc[attr.name] = attr.value;
                    return acc;
                  }, {}),
                  href: el.href || null,
                  onclick: el.onclick ? el.onclick.toString() : null
                };
              }
            });
          } catch (e) {
            console.warn(`Error processing interactive selector ${selector}:`, e);
          }
        });

        // Extract forms
        const forms = document.querySelectorAll('form');
        forms.forEach((form, idx) => {
          data.forms[`form_${idx}`] = {
            action: form.action,
            method: form.method,
            enctype: form.enctype,
            fields: []
          };

          const fields = form.querySelectorAll('input, select, textarea');
          fields.forEach((field, fieldIdx) => {
            data.forms[`form_${idx}`].fields.push({
              name: field.name,
              id: field.id,
              type: field.type || field.tagName.toLowerCase(),
              placeholder: field.placeholder,
              value: field.value,
              required: field.required,
              options: field.tagName.toLowerCase() === 'select' ? 
                Array.from(field.options).map(opt => ({ value: opt.value, text: opt.text })) : null
            });
          });
        });

        return data;
      }, extractionRules);

      return extractedData;
    } catch (error) {
      console.error('Error extracting data:', error);
      return null;
    }
  }

  // AI-powered interaction simulation
  async simulateInteraction(url, interactions = []) {
    try {
      await this.page.goto(url, { waitUntil: 'networkidle0' });
      
      const results = [];
      
      for (const interaction of interactions) {
        try {
          const result = { ...interaction, success: false, error: null, data: null };
          
          switch (interaction.type) {
            case 'click':
              await this.page.click(interaction.selector);
              await this.page.waitForTimeout(1000); // Wait for any animations/changes
              result.success = true;
              break;
              
            case 'type':
              await this.page.type(interaction.selector, interaction.value);
              result.success = true;
              break;
              
            case 'select':
              await this.page.select(interaction.selector, interaction.value);
              result.success = true;
              break;
              
            case 'screenshot':
              const screenshot = await this.page.screenshot({ 
                encoding: 'base64',
                fullPage: interaction.fullPage || false 
              });
              result.success = true;
              result.data = screenshot;
              break;
              
            case 'waitFor':
              await this.page.waitForSelector(interaction.selector, { timeout: 10000 });
              result.success = true;
              break;
              
            case 'evaluate':
              const evalResult = await this.page.evaluate(interaction.code);
              result.success = true;
              result.data = evalResult;
              break;
              
            default:
              result.error = `Unknown interaction type: ${interaction.type}`;
          }
          
          results.push(result);
        } catch (error) {
          results.push({
            ...interaction,
            success: false,
            error: error.message
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error simulating interactions:', error);
      return [];
    }
  }

  // Generate comprehensive page report
  async generatePageReport(url) {
    try {
      const [elements, data] = await Promise.all([
        this.discoverElements(url),
        this.extractData(url)
      ]);

      const report = {
        url,
        timestamp: new Date().toISOString(),
        summary: {
          totalElements: elements.length,
          interactiveElements: elements.filter(el => el.type === 'interactive').length,
          contentElements: elements.filter(el => el.type === 'content').length,
          forms: elements.filter(el => el.type === 'form').length
        },
        discoveredElements: elements,
        extractedData: data,
        aiRecommendations: this.generateRecommendations(elements, data)
      };

      return report;
    } catch (error) {
      console.error('Error generating page report:', error);
      return null;
    }
  }

  // AI-like recommendations for testing
  generateRecommendations(elements, data) {
    const recommendations = [];

    // Recommend form testing
    const forms = elements.filter(el => el.type === 'form');
    forms.forEach((form, idx) => {
      recommendations.push({
        type: 'form_testing',
        priority: 'high',
        description: `Test form submission with various input combinations`,
        formId: form.id,
        suggestedTests: form.fields.map(field => ({
          field: field.name || field.id,
          tests: ['valid_input', 'invalid_input', 'boundary_values', 'empty_input']
        }))
      });
    });

    // Recommend interactive element testing
    const buttons = elements.filter(el => el.type === 'interactive' && 
      (el.tagName === 'button' || el.attributes.role === 'button'));
    if (buttons.length > 0) {
      recommendations.push({
        type: 'interaction_testing',
        priority: 'medium',
        description: `Test ${buttons.length} interactive elements for functionality`,
        elements: buttons.map(btn => btn.selector)
      });
    }

    // Recommend accessibility testing
    const elementsWithoutAlt = elements.filter(el => 
      el.tagName === 'img' && !el.attributes.alt);
    if (elementsWithoutAlt.length > 0) {
      recommendations.push({
        type: 'accessibility',
        priority: 'medium',
        description: `${elementsWithoutAlt.length} images missing alt text`,
        elements: elementsWithoutAlt.map(el => el.selector)
      });
    }

    return recommendations;
  }
}

// Initialize scraper for session
async function getOrCreateScraper(sessionId = 'default') {
  if (!activeScraper.has(sessionId)) {
    const scraper = new AIWebScraper();
    await scraper.initialize();
    activeScraper.set(sessionId, scraper);
    
    // Auto-cleanup after 10 minutes of inactivity
    setTimeout(() => {
      if (activeScraper.has(sessionId)) {
        activeScraper.get(sessionId).close();
        activeScraper.delete(sessionId);
      }
    }, 10 * 60 * 1000);
  }
  
  return activeScraper.get(sessionId);
}

// AI Analysis endpoint
router.post('/analyze', async (req, res) => {
  try {
    const { url, sessionId = 'default' } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const scraper = await getOrCreateScraper(sessionId);
    const results = await scraper.generatePageReport(url);
    
    if (!results) {
      return res.status(500).json({ error: 'Failed to analyze page' });
    }
    
    res.json(results);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: error.message 
    });
  }
});

// Interactive testing endpoint
router.post('/interact', async (req, res) => {
  try {
    const { url, interactions, sessionId = 'default' } = req.body;
    
    if (!url || !interactions) {
      return res.status(400).json({ error: 'URL and interactions are required' });
    }

    const scraper = await getOrCreateScraper(sessionId);
    const results = await scraper.simulateInteraction(url, interactions);
    
    res.json(results);
  } catch (error) {
    console.error('Interactive test error:', error);
    res.status(500).json({ 
      error: 'Interactive test failed', 
      details: error.message 
    });
  }
});

// Custom script execution endpoint
router.post('/custom', async (req, res) => {
  try {
    const { url, script, sessionId = 'default' } = req.body;
    
    if (!url || !script) {
      return res.status(400).json({ error: 'URL and script are required' });
    }

    const scraper = await getOrCreateScraper(sessionId);
    
    // Navigate to page first
    await scraper.page.goto(url, { waitUntil: 'networkidle0' });
    
    // Execute custom script
    const result = await scraper.page.evaluate(script);
    
    res.json({ 
      success: true, 
      result,
      executedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Custom script error:', error);
    res.status(500).json({ 
      error: 'Script execution failed', 
      details: error.message 
    });
  }
});

// Cleanup endpoint
router.post('/cleanup', async (req, res) => {
  try {
    const { sessionId = 'default' } = req.body;
    
    if (activeScraper.has(sessionId)) {
      await activeScraper.get(sessionId).close();
      activeScraper.delete(sessionId);
    }
    
    res.json({ success: true, message: 'Session cleaned up' });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ 
      error: 'Cleanup failed', 
      details: error.message 
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeSessions: activeScraper.size,
    timestamp: new Date().toISOString()
  });
});

export default router;