// Utility functions for API calls

export interface FluxAPIResponse {
  success: boolean
  data?: any
  error?: string
}

export class FluxAPI {
  private apiKey: string
  private baseURL: string

  constructor(apiKey: string, baseURL: string = 'https://api.flux.ai/v1') {
    this.apiKey = apiKey
    this.baseURL = baseURL
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<FluxAPIResponse> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // VEO3 Prompt Generation
  async generateVEO3Prompt(prompt: string, options: any = {}): Promise<FluxAPIResponse> {
    return this.makeRequest('/veo3/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        ...options
      })
    })
  }

  // Image Inpaint
  async inpaintImage(image: File, mask: File, prompt: string, options: any = {}): Promise<FluxAPIResponse> {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('mask', mask)
    formData.append('prompt', prompt)
    
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, String(value ?? ''))
    })

    return this.makeRequest('/inpaint', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        // Don't set Content-Type for FormData
      }
    })
  }

  // Image Outpaint
  async outpaintImage(image: File, prompt: string, options: any = {}): Promise<FluxAPIResponse> {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('prompt', prompt)
    
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, String(value ?? ''))
    })

    return this.makeRequest('/outpaint', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      }
    })
  }

  // Get available models
  async getModels(): Promise<FluxAPIResponse> {
    return this.makeRequest('/models')
  }

  // Get user info
  async getUserInfo(): Promise<FluxAPIResponse> {
    return this.makeRequest('/user')
  }
}

// Helper function to validate API key
export function validateAPIKey(apiKey: string): boolean {
  return apiKey.length > 0 && apiKey.startsWith('flux_')
}

// Helper function to format error messages
export function formatErrorMessage(error: string): string {
  const errorMap: Record<string, string> = {
    'invalid_api_key': 'API key không hợp lệ',
    'insufficient_credits': 'Không đủ credits',
    'rate_limit_exceeded': 'Vượt quá giới hạn request',
    'invalid_prompt': 'Prompt không hợp lệ',
    'image_too_large': 'Ảnh quá lớn',
    'unsupported_format': 'Định dạng không được hỗ trợ'
  }
  
  return errorMap[error] || error
} 