const fetch = require('node-fetch');

class ScaleDownAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.scaledown.com/v1'; // Mock URL - adjust based on actual API
  }

  async compressText(text) {
    // If no API key, use fallback compression
    if (!this.apiKey || this.apiKey === 'your_scaledown_api_key_here') {
      return this.fallbackCompress(text);
    }

    try {
      const response = await fetch(`${this.baseUrl}/compress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          text: text,
          compressionLevel: 'high'
        })
      });

      if (!response.ok) {
        console.log('ScaleDown API failed, using fallback');
        return this.fallbackCompress(text);
      }

      const data = await response.json();
      return data.compressed || this.fallbackCompress(text);
    } catch (error) {
      console.log('ScaleDown API error, using fallback:', error.message);
      return this.fallbackCompress(text);
    }
  }

  fallbackCompress(text) {
    // Simple rule-based compression for demo
    let compressed = text
      .replace(/within (\d+) days/g, '$1-day')
      .replace(/business days/g, 'days')
      .replace(/must be /g, '')
      .replace(/Items /g, '')
      .replace(/We offer /g, '')
      .replace(/\. /g, '. ')
      .replace(/including /g, '')
      .replace(/original /g, 'orig.')
      .replace(/packaging/g, 'pkg')
      .replace(/accessories/g, 'access.')
      .replace(/condition/g, 'cond.')
      .replace(/unworn/g, 'new')
      .replace(/unused/g, 'new')
      .split('. ')
      .slice(0, 3)
      .join('. ');

    return compressed.length > 100 ? compressed.substring(0, 100) + '...' : compressed;
  }

  async compressPolicy(policyText) {
    return await this.compressText(policyText);
  }

  async compressProductDescription(description) {
    return await this.compressText(description);
  }
}

module.exports = ScaleDownAPI;
