'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Sparkles, Copy, Check, Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react'

interface Character {
  id: string
  name: string
  appearance: string
  voiceStyle: string
  dialogue: string
}

export default function VEO3PromptGenerator() {
  const { data: session } = useSession()
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [sceneContext, setSceneContext] = useState('')
  const [characters, setCharacters] = useState<Character[]>([
    { id: '1', name: '', appearance: '', voiceStyle: '', dialogue: '' }
  ])
  const [ambientSound, setAmbientSound] = useState('')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [cameraAngle, setCameraAngle] = useState('')
  const [additionalConditions, setAdditionalConditions] = useState('')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [showCopied, setShowCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  // Load API keys when component mounts
  useEffect(() => {
    if (session?.user?.id) {
      loadApiKeys()
    }
  }, [session])

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/user/api-keys')
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || {})
      }
    } catch (error) {
      console.error('Error loading API keys:', error)
    }
  }

  const addCharacter = () => {
    const newId = (characters.length + 1).toString()
    setCharacters([...characters, { id: newId, name: '', appearance: '', voiceStyle: '', dialogue: '' }])
  }

  const removeCharacter = (id: string) => {
    if (characters.length > 1) {
      setCharacters(characters.filter(char => char.id !== id))
    }
  }

  const updateCharacter = (id: string, field: keyof Character, value: string) => {
    setCharacters(characters.map(char => 
      char.id === id ? { ...char, [field]: value } : char
    ))
  }

  const generatePrompt = async () => {
    if (!sceneContext.trim()) {
      setError('Vui lòng nhập Bối cảnh cảnh!')
      return
    }

    const fluxApiKey = apiKeys['flux']
    if (!fluxApiKey) {
      setError('Vui lòng cấu hình Flux API key trong phần Quản lý API Keys!')
      return
    }

    setIsGenerating(true)
    setError('')
    
    try {
      // Tạo prompt từ input
      let prompt = sceneContext.trim()
      
      // Add characters if they have content
      const validCharacters = characters.filter(char => 
        char.name.trim() || char.appearance.trim() || char.voiceStyle.trim() || char.dialogue.trim()
      )
      
      if (validCharacters.length > 0) {
        prompt += '\n\nNhân vật:'
        validCharacters.forEach((char, index) => {
          prompt += `\n- Nhân vật ${index + 1}:`
          if(char.name.trim()) prompt += ` ${char.name.trim()}`
          if(char.appearance.trim()) prompt += `, ${char.appearance.trim()}`
          if(char.voiceStyle.trim()) prompt += `, giọng nói: ${char.voiceStyle.trim()}`
          if(char.dialogue.trim()) prompt += `, nói: "${char.dialogue.trim()}"`
        })
      }
      
      // Add technical specifications
      const specs = []
      if (ambientSound.trim()) specs.push(`Âm thanh: ${ambientSound.trim()}`)
      if (aspectRatio) specs.push(`Tỷ lệ khung hình: ${aspectRatio}`)
      if (cameraAngle.trim()) specs.push(`Góc máy: ${cameraAngle.trim()}`)
      
      if (specs.length > 0) {
        prompt += `\n\n${specs.join(', ')}`
      }
      
      if (additionalConditions.trim()) {
        prompt += `\n\nYêu cầu thêm: ${additionalConditions.trim()}`
      }

      // Gọi API VEO3 thật
      const response = await fetch('/api/flux/veo3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          apiKey: fluxApiKey,
          options: {
            aspect_ratio: aspectRatio,
            duration: 5, // 5 seconds default
            quality: 'high'
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.success) {
        // Nếu API trả về kết quả thành công
        if (data.data && data.data.result) {
          setGeneratedPrompt(`✅ Video đã được tạo thành công!

📝 Prompt gốc:
${prompt.trim()}

🎬 Kết quả từ VEO3:
${JSON.stringify(data.data, null, 2)}

📥 Để tải video, vui lòng kiểm tra link trong response trên.`)
        } else {
          setGeneratedPrompt(`✅ Yêu cầu đã được gửi thành công!

📝 Prompt đã gửi:
${prompt.trim()}

⏳ Đang xử lý... Vui lòng kiểm tra kết quả sau ít phút.

📊 Response:
${JSON.stringify(data, null, 2)}`)
        }
      } else {
        throw new Error(data.error || 'Không thể tạo video')
      }

    } catch (error) {
      console.error('VEO3 API error:', error)
      
      let errorMessage = 'Lỗi khi gọi API VEO3!'
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'API key không hợp lệ! Vui lòng kiểm tra lại.'
        } else if (error.message.includes('403')) {
          errorMessage = 'Không đủ quyền truy cập hoặc hết credits!'
        } else if (error.message.includes('429')) {
          errorMessage = 'Quá nhiều yêu cầu! Vui lòng thử lại sau.'
        } else if (error.message.includes('500')) {
          errorMessage = 'Lỗi server! Vui lòng thử lại sau.'
        } else {
          errorMessage = `Lỗi: ${error.message}`
        }
      }
      
      setError(errorMessage)
      
      // Hiển thị prompt đã tạo để user có thể copy
      let fallbackPrompt = sceneContext.trim()
      const fallbackValidCharacters = characters.filter(char => 
        char.name.trim() || char.appearance.trim() || char.voiceStyle.trim() || char.dialogue.trim()
      )
      if (fallbackValidCharacters.length > 0) {
        fallbackPrompt += '\n\nNhân vật:'
        fallbackValidCharacters.forEach((char, index) => {
          fallbackPrompt += `\n- Nhân vật ${index + 1}:`
          if(char.name.trim()) fallbackPrompt += ` ${char.name.trim()}`
          if(char.appearance.trim()) fallbackPrompt += `, ${char.appearance.trim()}`
          if(char.voiceStyle.trim()) fallbackPrompt += `, giọng nói: ${char.voiceStyle.trim()}`
          if(char.dialogue.trim()) fallbackPrompt += `, nói: "${char.dialogue.trim()}"`
        })
      }
      
      const specs = []
      if (ambientSound.trim()) specs.push(`Âm thanh: ${ambientSound.trim()}`)
      if (aspectRatio) specs.push(`Tỷ lệ khung hình: ${aspectRatio}`)
      if (cameraAngle.trim()) specs.push(`Góc máy: ${cameraAngle.trim()}`)
      
      if (specs.length > 0) {
        fallbackPrompt += `\n\n${specs.join(', ')}`
      }
      
      if (additionalConditions.trim()) {
        fallbackPrompt += `\n\nYêu cầu thêm: ${additionalConditions.trim()}`
      }
      
      setGeneratedPrompt(`❌ Không thể kết nối API, nhưng đây là prompt đã tạo:

${fallbackPrompt.trim()}

💡 Bạn có thể copy prompt này và sử dụng trực tiếp trên website VEO3.`)
      
    } finally {
      setIsGenerating(false)
    }
  }

  const copyPrompt = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          🎬 Trình Tạo Prompt VEO3
        </h2>
        <p className="text-gray-300">Tạo prompt chất lượng cao cho việc tạo video VEO3</p>
        {apiKeys['flux'] ? (
          <div className="mt-2 text-sm text-green-400">
            ✅ Flux API key đã được cấu hình - Sẵn sàng tạo video thật!
          </div>
        ) : (
          <div className="mt-2 text-sm text-yellow-400">
            ⚠️ Vui lòng cấu hình Flux API key trong phần Quản lý API Keys để sử dụng chức năng tạo video
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center gap-3 mb-6">
          <AlertCircle className="text-red-400" size={20} />
          <span className="text-red-300">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bối cảnh cảnh
            </label>
            <textarea
              value={sceneContext}
              onChange={(e) => setSceneContext(e.target.value)}
              placeholder="ví dụ: Buổi sáng sớm trong một quán cà phê nhỏ bên bờ sông Sài Gòn..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white placeholder-gray-400"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">Ví dụ: Hai phụ nữ trò chuyện. Một người hỏi câu hỏi, người kia đưa ra câu trả lời tinh nghịch.</p>
          </div>

          {/* Characters Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Nhân vật {characters.length > 1 ? '' : ''}
            </label>
            <div className="space-y-4">
              {characters.map((character, index) => (
                <div key={character.id} className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-200">Nhân vật {index + 1}</h4>
                    {characters.length > 1 && (
                      <button
                        onClick={() => removeCharacter(character.id)}
                        className="p-1 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={character.name}
                      onChange={(e) => updateCharacter(character.id, 'name', e.target.value)}
                      placeholder="Tên ví dụ: Anna"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    />
                    <input
                      type="text"
                      value={character.appearance}
                      onChange={(e) => updateCharacter(character.id, 'appearance', e.target.value)}
                      placeholder="Ngoại hình ví dụ: Một phụ nữ 30 tuổi..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    />
                    <input
                      type="text"
                      value={character.voiceStyle}
                      onChange={(e) => updateCharacter(character.id, 'voiceStyle', e.target.value)}
                      placeholder="Phong cách giọng nói ví dụ: Nhẹ nhàng và dịu dàng..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    />
                    <input
                      type="text"
                      value={character.dialogue}
                      onChange={(e) => updateCharacter(character.id, 'dialogue', e.target.value)}
                      placeholder="Lời thoại ví dụ: Cuộc sống thật khó khăn..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
              ))}
              
              <button
                onClick={addCharacter}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                <Plus size={16} />
                + Thêm nhân vật khác
              </button>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Âm thanh xung quanh
              </label>
              <input
                type="text"
                value={ambientSound}
                onChange={(e) => setAmbientSound(e.target.value)}
                placeholder="ví dụ: Tiếng ồn đường phố với tiếng rao bán trái cây xa xa..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tỷ lệ khung hình
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value="16:9">16:9 (Màn hình rộng)</option>
                  <option value="9:16">9:16 (Dọc)</option>
                  <option value="1:1">1:1 (Vuông)</option>
                  <option value="4:3">4:3 (Truyền thống)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Góc máy quay
                </label>
                <input
                  type="text"
                  value={cameraAngle}
                  onChange={(e) => setCameraAngle(e.target.value)}
                  placeholder="ví dụ: Góc thấp cận cảnh"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Điều kiện bổ sung
              </label>
              <textarea
                value={additionalConditions}
                onChange={(e) => setAdditionalConditions(e.target.value)}
                placeholder="ví dụ: Không có tiêu đề hiển thị, thêm mưa..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white placeholder-gray-400"
                rows={3}
              />
            </div>
          </div>

          <button
            onClick={generatePrompt}
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Đang tạo video...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                🎬 Tạo Video VEO3 Thật
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="sticky top-24">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 h-full min-h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                📄 Kết Quả VEO3
              </h3>
              <button
                onClick={copyPrompt}
                disabled={!generatedPrompt}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white"
              >
                {showCopied ? <Check size={16} /> : <Copy size={16} />}
                {showCopied ? 'Đã sao chép!' : 'Sao chép'}
              </button>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-[520px] overflow-y-auto">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Loader2 className="animate-spin h-12 w-12 mb-4 text-blue-500" />
                  <p className="text-center">
                    Đang gọi API VEO3...<br/>
                    <span className="text-sm text-gray-500">Quá trình này có thể mất 30-60 giây</span>
                  </p>
                </div>
              ) : generatedPrompt ? (
                <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {generatedPrompt}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Kết quả tạo video sẽ xuất hiện ở đây...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 