import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, apiKey, options = {} } = body

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key bắt buộc phải có' },
        { status: 400 }
      )
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt bắt buộc phải có' },
        { status: 400 }
      )
    }

    // BFL Dashboard API URL - Updated to use dashboard API
    const apiUrl = 'https://api.bfl.ml'
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Calling BFL API:', `${apiUrl}/v1/flux-pro-1.1`)
      console.log('Prompt:', prompt)
      console.log('Options:', options)
    }

    // Validate API key format for BFL
    if (!apiKey.startsWith('bfl-')) {
      return NextResponse.json(
        { 
          error: 'API key không đúng định dạng. API key phải bắt đầu bằng "bfl-"',
          hint: 'Lấy API key từ https://dashboard.bfl.ai/keys'
        },
        { status: 400 }
      )
    }

    // Call BFL API with proper headers and payload
    const bflResponse = await fetch(`${apiUrl}/v1/flux-pro-1.1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ChatBot-VEO3/1.0',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        width: options.aspect_ratio === '9:16' ? 576 : options.aspect_ratio === '1:1' ? 1024 : 1024,
        height: options.aspect_ratio === '9:16' ? 1024 : options.aspect_ratio === '1:1' ? 1024 : 576,
        prompt_upsampling: options.prompt_upsampling || false,
        seed: options.seed || Math.floor(Math.random() * 1000000),
        safety_tolerance: options.safety_tolerance || 2,
        output_format: options.output_format || 'jpeg'
      }),
    })

    const responseText = await bflResponse.text()
    if (process.env.NODE_ENV === 'development') {
      console.log('BFL API Response status:', bflResponse.status)
      console.log('BFL API Response headers:', Object.fromEntries(bflResponse.headers.entries()))
      console.log('BFL API Response body:', responseText)
    }

    if (!bflResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { error: responseText || bflResponse.statusText }
      }
      
      // Enhanced error messages for BFL API
      let userFriendlyError = '';
      switch (bflResponse.status) {
        case 401:
          userFriendlyError = 'API key không hợp lệ. Vui lòng lấy API key mới từ BFL Dashboard.'
          break
        case 402:
          userFriendlyError = 'Tài khoản BFL không có đủ credits để tạo ảnh.'
          break
        case 403:
          userFriendlyError = 'Không có quyền truy cập BFL API. Kiểm tra API key và subscription.'
          break
        case 429:
          userFriendlyError = 'Quá nhiều yêu cầu đến BFL API. Vui lòng thử lại sau.'
          break
        case 500:
        case 502:
        case 503:
          userFriendlyError = 'BFL API đang bảo trì. Vui lòng thử lại sau.'
          break
        default:
          userFriendlyError = errorData.error || errorData.message || 'Lỗi không xác định từ BFL API'
      }
      
      return NextResponse.json(
        { 
          error: userFriendlyError,
          details: errorData,
          status: bflResponse.status,
          suggestion: bflResponse.status === 401 ? 
            'Lấy API key mới tại: https://dashboard.bfl.ai/keys' : 
            'Vui lòng thử lại sau hoặc kiểm tra BFL Dashboard.'
        },
        { status: bflResponse.status }
      )
    }

    let data;
    try {
      data = JSON.parse(responseText)
    } catch {
      // If not JSON, might be direct image data
      return NextResponse.json({ 
        success: true, 
        data: { 
          result: responseText,
          message: 'Tạo ảnh thành công từ BFL API!'
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Tạo ảnh thành công từ BFL API!' 
    })

  } catch (error) {
    console.error('BFL API error:', error)
    
    let errorMessage = 'Lỗi server nội bộ'
    let suggestion = 'Vui lòng thử lại sau.'
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Không thể kết nối đến BFL API. Vui lòng kiểm tra kết nối mạng.'
        suggestion = 'Kiểm tra internet và thử lại.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Timeout khi gọi BFL API.'
        suggestion = 'BFL API đang bận, vui lòng thử lại sau.'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        suggestion: suggestion,
        provider: 'BFL API',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 