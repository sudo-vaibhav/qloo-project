interface QlooEntity {
  id: string;
  name: string;
  type: string;
  score?: number;
}

interface QlooResponse {
  results: QlooEntity[];
}

interface QlooInsightsResponse {
  results: {
    recommendations: QlooEntity[];
    tags?: string[];
  };
}

class QlooAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.QLOO_API_KEY!;
    this.baseUrl = process.env.QLOO_API_BASE_URL || 'https://api.qloo.com';
    
    if (!this.apiKey) {
      throw new Error('QLOO_API_KEY is required');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Qloo API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async searchEntities(query: string, type?: string): Promise<QlooEntity[]> {
    const params = new URLSearchParams({
      q: query,
      ...(type && { type }),
    });

    const response: QlooResponse = await this.request(`/v1/cultural/search?${params}`);
    return response.results || [];
  }

  async getRecommendations(entityIds: string[], limit: number = 10): Promise<{
    recommendations: QlooEntity[];
    tags: string[];
  }> {
    const response: QlooInsightsResponse = await this.request('/v1/cultural/insights', {
      method: 'POST',
      body: JSON.stringify({
        input: entityIds.map(id => ({ id })),
        options: {
          limit,
          include_tags: true,
        },
      }),
    });

    return {
      recommendations: response.results.recommendations || [],
      tags: response.results.tags || [],
    };
  }

  async getStyleCorrelations(tastesInput: string[]): Promise<{
    fashionEntities: QlooEntity[];
    decorEntities: QlooEntity[];
    tags: string[];
  }> {
    try {
      const entityPromises = tastesInput.map(taste => 
        this.searchEntities(taste).catch(() => [])
      );
      
      const entityResults = await Promise.all(entityPromises);
      const allEntities = entityResults.flat();
      
      if (allEntities.length === 0) {
        return { fashionEntities: [], decorEntities: [], tags: [] };
      }

      const entityIds = allEntities.slice(0, 10).map(e => e.id);
      const { recommendations, tags } = await this.getRecommendations(entityIds, 20);
      
      const fashionEntities = recommendations.filter(e => 
        e.type === 'fashion' || e.type === 'brand' || e.name.toLowerCase().includes('fashion')
      );
      
      const decorEntities = recommendations.filter(e => 
        e.type === 'home' || e.type === 'design' || e.name.toLowerCase().includes('decor')
      );

      return {
        fashionEntities,
        decorEntities,
        tags,
      };
    } catch (error) {
      console.error('Error getting style correlations:', error);
      return { fashionEntities: [], decorEntities: [], tags: [] };
    }
  }
}

export const qlooAPI = new QlooAPI();