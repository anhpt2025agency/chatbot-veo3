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

    // URL API chính xác của Black Forest Labs - Updated URL
    const apiUrl = process.env.FLUX_API_URL || 'https://api.bfl.ml'
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Calling VEO3 API:', `${apiUrl}/v1/flux-pro-1.1`)
      console.log('Prompt:', prompt)
      console.log('Options:', options)
    }

    // Validate API key format
    if (!apiKey.startsWith('bfl-')) {
      return NextResponse.json(
        { 
          error: 'API key không đúng định dạng. API key phải bắt đầu bằng "bfl-"',
          hint: 'Lấy API key từ https://api.bfl.ml/'
        },
        { status: 400 }
      )
    }

    // Gọi Flux API thực tế với improved error handling
    const fluxResponse = await fetch(`${apiUrl}/v1/flux-pro-1.1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'VEO3-Prompt-Generator/1.0',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        width: options.aspect_ratio === '9:16' ? 576 : options.aspect_ratio === '1:1' ? 1024 : 1024,
        height: options.aspect_ratio === '9:16' ? 1024 : options.aspect_ratio === '1:1' ? 1024 : 576,
        prompt_upsampling: false,
        seed: Math.floor(Math.random() * 1000000),
        safety_tolerance: 2,
        output_format: 'jpeg'
      }),
    })

    const responseText = await fluxResponse.text()
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response status:', fluxResponse.status)
      console.log('API Response headers:', Object.fromEntries(fluxResponse.headers.entries()))
      console.log('API Response body:', responseText)
    }

    if (!fluxResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { error: responseText || fluxResponse.statusText }
      }
      
      // Enhanced error messages based on status codes
      let userFriendlyError = '';
      switch (fluxResponse.status) {
        case 401:
          userFriendlyError = 'API key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại API key.'
          break
        case 402:
          userFriendlyError = 'Tài khoản không có đủ credits để thực hiện yêu cầu này.'
          break
        case 403:
          userFriendlyError = 'Không có quyền truy cập. Vui lòng kiểm tra API key và quyền hạn.'
          break
        case 429:
          userFriendlyError = 'Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.'
          break
        case 500:
        case 502:
        case 503:
          userFriendlyError = 'Lỗi server Flux API. Vui lòng thử lại sau.'
          break
        default:
          userFriendlyError = errorData.error || errorData.message || 'Lỗi không xác định từ Flux API'
      }
      
      return NextResponse.json(
        { 
          error: userFriendlyError,
          details: errorData,
          status: fluxResponse.status,
          suggestion: fluxResponse.status === 401 ? 
            'Lấy API key mới tại: https://api.bfl.ml/' : 
            'Vui lòng thử lại sau hoặc liên hệ support.'
        },
        { status: fluxResponse.status }
      )
    }

    let data;
    try {
      data = JSON.parse(responseText)
    } catch {
      // Nếu không phải JSON, có thể là image trực tiếp
      return NextResponse.json({ 
        success: true, 
        data: { 
          result: responseText,
          message: 'Đã tạo thành công! Response không phải JSON format.'
        }
      })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('VEO3 API error:', error)
    
    let errorMessage = 'Lỗi server nội bộ'
    let suggestion = 'Vui lòng thử lại sau.'
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Không thể kết nối đến Flux API. Vui lòng kiểm tra kết nối mạng.'
        suggestion = 'Kiểm tra internet và thử lại.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Timeout khi gọi Flux API.'
        suggestion = 'API đang bận, vui lòng thử lại sau.'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        suggestion: suggestion,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 