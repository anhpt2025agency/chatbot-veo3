import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, userMessage, apiKey, provider, isCombining, isRefining } = await request.json()

    if (!userMessage) {
      return NextResponse.json(
        { error: 'Thiếu thông tin userMessage' },
        { status: 400 }
      )
    }

    // Gọi AI API tương ứng với provider
    if (apiKey && provider && prompt) {
      try {
        let aiResponse = null

        if (provider === 'openai') {
          aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: (isCombining || isRefining) ? 'gpt-4' : 'gpt-3.5-turbo',
              messages: (isCombining || isRefining) ? [
                {
                  role: 'user',
                  content: prompt
                }
              ] : [
                {
                  role: 'system',
                  content: prompt.split('\n\n')[0] // Lấy system prompt
                },
                {
                  role: 'user',
                  content: userMessage
                }
              ],
              max_tokens: (isCombining || isRefining) ? 3000 : 2000,
              temperature: isRefining ? 0.3 : 0.7, // Lower temperature for refinement
            }),
          })

          if (aiResponse.ok) {
            const data = await aiResponse.json()
            return NextResponse.json({
              script: data.choices[0].message.content,
              success: true,
              provider: 'OpenAI'
            })
          }
        }

        if (provider === 'gemini') {
          // Debug logging cho Gemini
          console.log('🔍 GEMINI DEBUG INFO:')
          console.log('API Key format:', apiKey?.substring(0, 10) + '...')
          console.log('API Key starts with AIza:', apiKey?.startsWith('AIza'))
          console.log('Request URL:', `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey?.substring(0, 10)}...`)
          
          // Tối ưu hoá prompt cho Gemini
          let geminiPrompt
          if (isCombining || isRefining) {
            // Đối với combining/refining, sử dụng prompt trực tiếp
            geminiPrompt = prompt
          } else {
            // Đối với request thường, kết hợp prompt và user message một cách rõ ràng
            geminiPrompt = `${prompt}

**BƯỚC 1: PHÂN TÍCH YÊU CẦU**
Yêu cầu từ người dùng: "${userMessage}"

**BƯỚC 2: XÁC NHẬN HIỂU ĐÚNG**
Tôi sẽ tạo kịch bản video về: ${userMessage}

**BƯỚC 3: VIẾT KỊCH BẢN**
Bây giờ tôi sẽ viết kịch bản chi tiết theo đúng yêu cầu trên:`
          }
          
          const geminiRequestBody = {
            contents: [{
              parts: [{
                text: geminiPrompt
              }]
            }],
            generationConfig: {
              temperature: isRefining ? 0.3 : 0.7,
              topK: 40,
              topP: 0.8,
              maxOutputTokens: isCombining || isRefining ? 3000 : 2000
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH", 
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          }
          
          console.log('Request body structure:', JSON.stringify(geminiRequestBody, null, 2))

          aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(geminiRequestBody),
          })

          console.log('Response status:', aiResponse.status)
          console.log('Response headers:', Object.fromEntries(aiResponse.headers.entries()))

          const responseText = await aiResponse.text()
          console.log('Raw response:', responseText)

          if (aiResponse.ok) {
            try {
              const data = JSON.parse(responseText)
              console.log('Parsed response:', JSON.stringify(data, null, 2))
              
              // Kiểm tra cấu trúc response của Gemini
              if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                const generatedScript = data.candidates[0].content.parts[0].text
                
                // Kiểm tra chất lượng kịch bản
                const scriptQuality = validateScriptQuality(generatedScript, userMessage)
                
                if (scriptQuality.isValid) {
                  return NextResponse.json({
                    script: generatedScript,
                    success: true,
                    provider: 'Gemini',
                    quality: scriptQuality
                  })
                } else {
                  console.log('⚠️ Script quality issues:', scriptQuality.issues)
                  
                  // Thử cải thiện kịch bản
                  const improvedScript = await improveScript(generatedScript, userMessage, scriptQuality.suggestions)
                  
                  return NextResponse.json({
                    script: improvedScript || generatedScript,
                    success: true,
                    provider: 'Gemini',
                    quality: scriptQuality,
                    improved: !!improvedScript
                  })
                }
              } else {
                console.error('❌ Gemini response structure unexpected:', data)
                return NextResponse.json({
                  error: 'Gemini API trả về cấu trúc dữ liệu không mong đợi',
                  details: data,
                  success: false
                }, { status: 500 })
              }
            } catch (parseError) {
              console.error('❌ Failed to parse Gemini response:', parseError)
              return NextResponse.json({
                error: 'Không thể parse response từ Gemini API',
                rawResponse: responseText,
                success: false
              }, { status: 500 })
            }
          } else {
            // Detailed error handling for Gemini
            let errorData
            try {
              errorData = JSON.parse(responseText)
            } catch {
              errorData = { message: responseText }
            }
            
            console.error('❌ Gemini API Error:', {
              status: aiResponse.status,
              statusText: aiResponse.statusText,
              error: errorData
            })

            let userFriendlyError = ''
            switch (aiResponse.status) {
              case 400:
                userFriendlyError = 'Yêu cầu không hợp lệ. Kiểm tra API key và định dạng request.'
                break
              case 401:
                userFriendlyError = 'API key Gemini không hợp lệ hoặc không có quyền truy cập.'
                break
              case 403:
                userFriendlyError = 'API key bị từ chối. Kiểm tra quota và permissions trong Google AI Studio.'
                break
              case 429:
                userFriendlyError = 'Quá nhiều request. Vui lòng thử lại sau vài phút.'
                break
              case 500:
                userFriendlyError = 'Lỗi server Gemini API. Vui lòng thử lại sau.'
                break
              default:
                userFriendlyError = `Lỗi Gemini API (${aiResponse.status}): ${errorData.message || aiResponse.statusText}`
            }

            return NextResponse.json({
              error: userFriendlyError,
              details: errorData,
              status: aiResponse.status,
              suggestion: aiResponse.status === 401 || aiResponse.status === 403 ? 
                'Lấy API key mới tại: https://aistudio.google.com/apikey' : 
                'Vui lòng thử lại sau hoặc liên hệ support.',
              success: false
            }, { status: aiResponse.status })
          }
        }

        if (provider === 'claude') {
          aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-3-sonnet-20240229',
              max_tokens: (isCombining || isRefining) ? 3000 : 2000,
              system: (isCombining || isRefining) ? 'Bạn là một chuyên gia biên tập kịch bản chuyên nghiệp.' : prompt.split('\n\n')[0],
              messages: [
                {
                  role: 'user',
                  content: (isCombining || isRefining) ? prompt : userMessage
                }
              ]
            }),
          })

          if (aiResponse.ok) {
            const data = await aiResponse.json()
            return NextResponse.json({
              script: data.content[0].text,
              success: true,
              provider: 'Claude'
            })
          }
        }

      } catch (error) {
        console.error('AI API Error:', error)
        return NextResponse.json({
          error: `Lỗi kết nối ${provider} API: ${error instanceof Error ? error.message : 'Unknown error'}`,
          success: false
        }, { status: 500 })
      }
    }

    // Không có API key nào hoạt động
    return NextResponse.json(
      { 
        error: 'Cần API key để sử dụng AI Script Writer. Vui lòng cấu hình ít nhất một AI API key (OpenAI, Gemini, hoặc Claude).',
        requiresApiKey: true,
        success: false
      },
      { status: 400 }
    )

  } catch (error) {
    console.error('Script Writer API Error:', error)
    return NextResponse.json(
      { 
        error: 'Có lỗi xảy ra khi tạo kịch bản',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    )
  }
}

// Helper function để kiểm tra chất lượng kịch bản
function validateScriptQuality(script: string, userRequest: string) {
  const issues = []
  const suggestions = []
  
  // Kiểm tra độ dài tối thiểu
  if (script.length < 200) {
    issues.push('Kịch bản quá ngắn')
    suggestions.push('Mở rộng nội dung với nhiều chi tiết hơn')
  }
  
  // Kiểm tra có chứa từ khoá từ yêu cầu không
  const requestWords = userRequest.toLowerCase().split(/\s+/).filter(word => word.length > 3)
  const scriptLower = script.toLowerCase()
  const matchedWords = requestWords.filter(word => scriptLower.includes(word))
  
  if (matchedWords.length < requestWords.length * 0.3) {
    issues.push('Kịch bản không khớp với yêu cầu')
    suggestions.push(`Đảm bảo bao gồm các yếu tố: ${requestWords.join(', ')}`)
  }
  
  // Kiểm tra cấu trúc cơ bản
  const hasTimeStamps = /\d{2}:\d{2}/.test(script)
  const hasDialogue = /💬|Lời thoại|".*"/.test(script)
  const hasAction = /🎬|Hành động|📹/.test(script)
  
  if (!hasTimeStamps) {
    issues.push('Thiếu thời gian chi tiết')
    suggestions.push('Thêm mốc thời gian cho từng phân đoạn')
  }
  
  if (!hasDialogue && userRequest.toLowerCase().includes('nói')) {
    issues.push('Thiếu lời thoại')
    suggestions.push('Thêm lời thoại cụ thể')
  }
  
  if (!hasAction) {
    issues.push('Thiếu mô tả hành động')
    suggestions.push('Thêm mô tả hành động chi tiết')
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
    score: Math.max(0, 100 - issues.length * 20)
  }
}

// Helper function để cải thiện kịch bản (simplified version)
async function improveScript(script: string, userRequest: string, suggestions: string[]) {
  // Simplified improvement - in real implementation, này sẽ gọi AI API khác để cải thiện
  // Hiện tại chỉ return null để sử dụng script gốc
  return null
} 