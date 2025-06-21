'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Copy, Check, Trash2, RefreshCw, Sparkles, Edit3, Plus, Save, X } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface ContentStyle {
  id: string
  name: string
  description: string
  systemPrompt: string
  icon: string
}

interface AIProvider {
  id: string
  name: string
  icon: string
  placeholder: string
}

interface ScriptWriterChatbotProps {
  onScriptGenerated?: (script: string) => void
}

export default function ScriptWriterChatbot({ onScriptGenerated }: ScriptWriterChatbotProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<string>('general')
  const [showStyleEditor, setShowStyleEditor] = useState(false)
  const [editingStyle, setEditingStyle] = useState<ContentStyle | null>(null)
  const [customStyles, setCustomStyles] = useState<ContentStyle[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showApiKeyEditor, setShowApiKeyEditor] = useState(false)
  const [selectedAIProvider, setSelectedAIProvider] = useState<string>('openai')
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    openai: '',
    gemini: '',
    claude: ''
  })
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: `🤖 **Xin chào! Tôi là AI Script Writer chuyên nghiệp.**

⚠️ **LƯU Ý QUAN TRỌNG:** Dự án này chỉ sử dụng **AI APIs thật**, không có template fallback.

**🔑 YÊU CẦU BẮT BUỘC:** 
Bạn cần có ít nhất một API key từ:
- **OpenAI** (GPT-4): Kịch bản chuyên nghiệp
- **Google Gemini**: Kịch bản sáng tạo  
- **Anthropic Claude**: Kịch bản chi tiết

**⚙️ Cách cấu hình:** Nhấp vào ⚡ ở góc trên bên phải

**📝 Tôi có thể giúp bạn:**
- Viết kịch bản hoàn chỉnh cho video ngắn
- Tạo nhân vật với tính cách rõ ràng
- Mô tả cảnh quay chi tiết
- Viết lời thoại tự nhiên và hấp dẫn
- Gợi ý âm thanh phù hợp

**💡 Ví dụ:** "Tôi muốn một video 30 giây về một cô gái uống cà phê buổi sáng"`,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [aiProgress, setAiProgress] = useState<{[key: string]: 'waiting' | 'processing' | 'completed' | 'error'}>({})
  const [showAiProgress, setShowAiProgress] = useState(false)
  const [currentScript, setCurrentScript] = useState<string>('')
  const [scriptVersion, setScriptVersion] = useState<number>(0)
  const [isRefining, setIsRefining] = useState(false)
  const [scriptHistory, setScriptHistory] = useState<{version: number, content: string, timestamp: Date}[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showNewScriptNotice, setShowNewScriptNotice] = useState(false)
  const [showDeletedStyles, setShowDeletedStyles] = useState(false)
  const [showCopied, setShowCopied] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [userScrolled, setUserScrolled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Định nghĩa các AI providers
  const aiProviders: AIProvider[] = [
    {
      id: 'openai',
      name: 'OpenAI GPT',
      icon: '🤖',
      placeholder: 'sk-proj-...'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      icon: '✨',
      placeholder: 'AIza...'
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      icon: '🧠',
      placeholder: 'sk-ant-...'
    }
  ]

  // Định nghĩa các phong cách content
  const contentStyles: ContentStyle[] = [
    {
      id: 'general',
      name: 'Tổng quát',
      description: 'Phong cách trung tính, phù hợp mọi nội dung',
      icon: '📝',
      systemPrompt: 'Bạn là một chuyên gia viết kịch bản video chuyên nghiệp. Hãy viết kịch bản chi tiết, dễ hiểu và hấp dẫn.'
    },
    {
      id: 'doctor',
      name: 'Bác sĩ',
      description: 'Phong cách chuyên môn y khoa, tin cậy',
      icon: '👩‍⚕️',
      systemPrompt: 'Bạn là một bác sĩ chuyên khoa với kinh nghiệm lâu năm. Viết kịch bản với giọng điệu chuyên nghiệp, đáng tin cậy, sử dụng thuật ngữ y khoa phù hợp nhưng vẫn dễ hiểu cho người dân. Luôn nhấn mạnh tính khoa học và an toàn.'
    },
    {
      id: 'review',
      name: 'Review',
      description: 'Đánh giá sản phẩm, dịch vụ chi tiết',
      icon: '⭐',
      systemPrompt: 'Bạn là một reviewer chuyên nghiệp với kinh nghiệm đánh giá sản phẩm. Viết kịch bản review chi tiết, khách quan, bao gồm ưu nhược điểm, so sánh với các sản phẩm khác, và đưa ra khuyến nghị rõ ràng. Sử dụng ngôn ngữ thân thiện nhưng chuyên môn.'
    },
    {
      id: 'comedy',
      name: 'Hài hước',
      description: 'Nội dung giải trí, vui nhộn',
      icon: '😂',
      systemPrompt: 'Bạn là một comedian chuyên nghiệp. Viết kịch bản hài hước, sử dụng các tình huống bất ngờ, wordplay, và yếu tố hài phù hợp với văn hóa Việt Nam. Đảm bảo nội dung tích cực và không gây khó chịu.'
    },
    {
      id: 'interview',
      name: 'Phỏng vấn',
      description: 'Phong cách trao đổi, hỏi đáp',
      icon: '🎤',
      systemPrompt: 'Bạn là một nhà báo/MC chuyên nghiệp. Viết kịch bản phỏng vấn với các câu hỏi sâu sắc, logic, tạo không khí thoải mái cho đối tượng được phỏng vấn. Bao gồm câu hỏi mở đầu, câu hỏi chính và câu hỏi kết thúc.'
    },
    {
      id: 'educational',
      name: 'Giáo dục',
      description: 'Nội dung học tập, giảng dạy',
      icon: '📚',
      systemPrompt: 'Bạn là một giáo viên kinh nghiệm. Viết kịch bản giáo dục với cấu trúc rõ ràng: mở đầu thu hút, phần chính dễ hiểu với ví dụ cụ thể, và phần tổng kết. Sử dụng ngôn ngữ đơn giản, hình象hoá và tương tác.'
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle',
      description: 'Phong cách sống, thời trang, làm đẹp',
      icon: '✨',
      systemPrompt: 'Bạn là một lifestyle blogger có ảnh hưởng. Viết kịch bản về phong cách sống với giọng điệu thân thiện, truyền cảm hứng. Chia sẻ kinh nghiệm cá nhân, tips hữu ích và tạo cảm giác gần gũi với người xem.'
    },
    {
      id: 'business',
      name: 'Kinh doanh',
      description: 'Nội dung về khởi nghiệp, quản lý',
      icon: '💼',
      systemPrompt: 'Bạn là một chuyên gia kinh doanh với nhiều năm kinh nghiệm. Viết kịch bản về chủ đề kinh doanh với insights sâu sắc, case studies thực tế, và lời khuyên hành động cụ thể. Sử dụng ngôn ngữ chuyên nghiệp nhưng dễ tiếp cận.'
    }
  ]

  const scrollToBottom = () => {
    if (autoScroll && !userScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Chỉ scroll khi có tin nhắn mới từ user hoặc khi bot bắt đầu typing
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && (lastMessage.type === 'user' || isTyping)) {
      scrollToBottom()
    }
  }, [messages, isTyping, autoScroll, userScrolled, scrollToBottom])

  // Detect user manual scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isAtBottom = scrollHeight - scrollTop === clientHeight
    setUserScrolled(!isAtBottom)
  }

  // Reset userScrolled when new message from user
  const resetScrollState = () => {
    setUserScrolled(false)
  }

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load custom styles from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const saved = localStorage.getItem('customContentStyles')
      if (saved) {
        setCustomStyles(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load custom styles:', error)
    }

    // Load API keys from localStorage
    try {
      const savedApiKeys = localStorage.getItem('aiApiKeys')
      if (savedApiKeys) {
        setApiKeys(JSON.parse(savedApiKeys))
      }
    } catch (error) {
      console.error('Failed to load API keys:', error)
    }
  }, [])

  // Save custom styles to localStorage
  const saveCustomStyles = (styles: ContentStyle[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Saving custom styles:', styles)
    }
    setCustomStyles(styles)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('customContentStyles', JSON.stringify(styles))
        if (process.env.NODE_ENV === 'development') {
          console.log('Saved to localStorage')
        }
      } catch (error) {
        console.error('Failed to save custom styles:', error)
      }
    }
  }

  const saveApiKeys = (keys: Record<string, string>) => {
    setApiKeys(keys)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('aiApiKeys', JSON.stringify(keys))
      } catch (error) {
        console.error('Failed to save API keys:', error)
      }
    }
  }

  const getVisibleStyles = () => {
    if (typeof window === 'undefined') return contentStyles.concat(customStyles)
    
    try {
      const hiddenStyles = JSON.parse(localStorage.getItem('hiddenBuiltInStyles') || '[]')
      return contentStyles.filter(style => !hiddenStyles.includes(style.id)).concat(customStyles)
    } catch (error) {
      console.error('Failed to load hidden styles:', error)
      return contentStyles.concat(customStyles)
    }
  }

  const getHiddenStyles = () => {
    if (typeof window === 'undefined') return []
    
    try {
      const hiddenStyleIds = JSON.parse(localStorage.getItem('hiddenBuiltInStyles') || '[]')
      return contentStyles.filter(style => hiddenStyleIds.includes(style.id))
    } catch (error) {
      console.error('Failed to load hidden styles:', error)
      return []
    }
  }

  const generateScriptResponse = async (userMessage: string): Promise<string> => {
    // Kiểm tra xem có phải đang chỉnh sửa kịch bản không
    const isRefinementRequest = currentScript && (
      userMessage.toLowerCase().includes('sửa') ||
      userMessage.toLowerCase().includes('thay đổi') ||
      userMessage.toLowerCase().includes('chỉnh') ||
      userMessage.toLowerCase().includes('cải thiện') ||
      userMessage.toLowerCase().includes('bổ sung') ||
      userMessage.toLowerCase().includes('xóa') ||
      userMessage.toLowerCase().includes('không hợp lý') ||
      userMessage.toLowerCase().includes('chưa ổn') ||
      userMessage.toLowerCase().includes('thêm') ||
      userMessage.toLowerCase().includes('bớt')
    )

    if (isRefinementRequest) {
      return await refineScript(userMessage)
    }

    // Lấy system prompt theo phong cách đã chọn
    const currentStyle = getVisibleStyles().find(style => style.id === selectedStyle)
    const systemPrompt = currentStyle?.systemPrompt || contentStyles[0].systemPrompt
    
    // Tạo prompt đầy đủ với hướng dẫn cụ thể và ví dụ
    const prompt = `${systemPrompt}

**NHIỆM VỤ CHÍNH:** Viết kịch bản video hoàn chỉnh cho yêu cầu sau:
"${userMessage}"

**YÊU CẦU BẮT BUỘC:**
1. **Phân tích yêu cầu trước**: Hiểu rõ người dùng muốn gì
2. **Tuân thủ nguyên tắc**: Kịch bản phải khớp 100% với yêu cầu
3. **Không tự ý thêm**: Chỉ viết theo đúng yêu cầu, không tự sáng tạo thêm ý tưởng khác

**CẤU TRÚC KỊCH BẢN:**

🎬 **THÔNG TIN CHUNG**
- Tiêu đề: [Tên video dựa trên yêu cầu]
- Thời lượng: [Ước tính thời gian]
- Phong cách: ${currentStyle?.name}

👤 **NHÂN VẬT CHÍNH**
- Tên: [Tên phù hợp]
- Tuổi: [Độ tuổi hợp lý]
- Ngoại hình: [Mô tả ngắn gọn]
- Tính cách: [Đặc điểm tính cách]

🎭 **KỊCH BẢN CHI TIẾT**

**[Thời điểm: 00:00-00:05]**
📹 Góc quay: [Mô tả góc máy]
🎬 Hành động: [Mô tả chi tiết những gì xảy ra]
💬 Lời thoại: "[Lời nói cụ thể nếu có]"
🎵 Âm thanh: [Âm thanh nền/hiệu ứng]

**[Thời điểm: 00:05-00:15]**
📹 Góc quay: [Mô tả góc máy]
🎬 Hành động: [Mô tả chi tiết những gì xảy ra]
💬 Lời thoại: "[Lời nói cụ thể nếu có]"
🎵 Âm thanh: [Âm thanh nền/hiệu ứng]

[Tiếp tục cho đến khi hết video...]

🎨 **KỸ THUẬT QUAY**
- Ánh sáng: [Gợi ý ánh sáng]
- Màu sắc: [Tông màu chủ đạo]
- Chuyển cảnh: [Hiệu ứng chuyển cảnh]

**LƯU Ý QUAN TRỌNG:**
- Viết bằng tiếng Việt
- Đảm bảo kịch bản khớp chính xác với yêu cầu "${userMessage}"
- Nếu yêu cầu không rõ ràng, hỏi lại thay vì tự đoán
- Tập trung vào yêu cầu chính, không thêm bớt nội dung`

    // Tìm tất cả AI providers có API key
    const availableProviders = aiProviders.filter(provider => apiKeys[provider.id]?.trim())
    
    if (availableProviders.length > 0) {
      try {
        // Hiển thị progress cho multiple AI
        setShowAiProgress(true)
        const initialProgress: any = {}
        availableProviders.forEach(provider => {
          initialProgress[provider.id] = 'waiting'
        })
        setAiProgress(initialProgress)

        // Gọi tất cả AI APIs song song
        const apiPromises = availableProviders.map(async (provider) => {
          setAiProgress(prev => ({...prev, [provider.id]: 'processing'}))
          
          try {
            const response = await fetch('/api/script-writer', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prompt,
                userMessage,
                apiKey: apiKeys[provider.id],
                provider: provider.id
              }),
            })

            if (response.ok) {
              const data = await response.json()
              setAiProgress(prev => ({...prev, [provider.id]: 'completed'}))
              
              // Thêm quality feedback vào response nếu có
              let qualityNote = ''
              if (data.quality && !data.quality.isValid) {
                qualityNote = `\n\n⚠️ **LƯU Ý CHẤT LƯỢNG:**\n${data.quality.issues.join('\n')}\n\n💡 **GỢI Ý CẢI THIỆN:**\n${data.quality.suggestions.join('\n')}`
              }
              
              if (data.improved) {
                qualityNote += '\n\n✨ **Kịch bản đã được tự động cải thiện để phù hợp hơn với yêu cầu**'
              }
              
              return {
                provider: provider.id,
                providerName: provider.name,
                script: String(data.script || data.content || '') + qualityNote,
                success: true
              }
            } else {
              setAiProgress(prev => ({...prev, [provider.id]: 'error'}))
              return {
                provider: provider.id,
                providerName: provider.name,
                script: null,
                success: false
              }
            }
          } catch (error) {
            console.error(`${provider.name} API error:`, error)
            setAiProgress(prev => ({...prev, [provider.id]: 'error'}))
            return {
              provider: provider.id,
              providerName: provider.name,
              script: null,
              success: false
            }
          }
        })

        // Đợi tất cả APIs hoàn thành
        const results = await Promise.all(apiPromises)
        const successfulResults = results.filter(result => result.success && result.script)

        if (successfulResults.length > 0) {
          let finalScript = ''
          // Nếu có nhiều kết quả, tổng hợp chúng lại
          if (successfulResults.length > 1) {
            finalScript = await combineAIResults(successfulResults, userMessage, prompt)
          } else {
            // Chỉ có 1 kết quả
            finalScript = successfulResults[0].script || ''
          }
          
          // Lưu kịch bản hiện tại để có thể chỉnh sửa sau
          const newVersion = scriptVersion + 1
          setCurrentScript(finalScript)
          setScriptVersion(newVersion)
          setScriptHistory(prev => [...prev, {
            version: newVersion,
            content: finalScript,
            timestamp: new Date()
          }])
          setShowAiProgress(false)
          
          // Hiển thị thông báo kịch bản mới
          setShowNewScriptNotice(true)
          setTimeout(() => setShowNewScriptNotice(false), 5000)
          
          return finalScript
        }
      } catch (error) {
        console.error('Multi-AI error:', error)
        setShowAiProgress(false)
      }
    }

    // Không có API key nào hoạt động - trả về thông báo lỗi
    setShowAiProgress(false)
    
    return `⚠️ **CẦN API KEY ĐỂ SỬ DỤNG AI SCRIPT WRITER**

**Hướng dẫn cấu hình:**
1. Nhấp vào biểu tượng ⚡ ở góc trên bên phải
2. Nhập ít nhất một API key cho:
   - **OpenAI** (GPT-4): Cho kịch bản chuyên nghiệp
   - **Google Gemini**: Cho kịch bản sáng tạo
   - **Anthropic Claude**: Cho kịch bản chi tiết
3. Khởi động lại ứng dụng
4. Thử lại yêu cầu của bạn

**Lưu ý:** Dự án này chỉ sử dụng AI APIs thật, không có template fallback.

**Yêu cầu của bạn:** "${userMessage}"`
  }

  // Hàm chỉnh sửa kịch bản dựa trên feedback của user
  const refineScript = async (userFeedback: string): Promise<string> => {
    setIsRefining(true)
    
    // Tạo prompt cho việc chỉnh sửa kịch bản
    const refinementPrompt = `Bạn là một chuyên gia biên tập kịch bản chuyên nghiệp. Người dùng đã yêu cầu chỉnh sửa kịch bản sau đây:

**KỊCH BẢN HIỆN TẠI (Phiên bản ${scriptVersion}):**
${currentScript}

**YÊU CẦU CHỈNH SỬA CỦA NGƯỜI DÙNG:**
"${userFeedback}"

Hãy phân tích yêu cầu của người dùng và chỉnh sửa kịch bản một cách chính xác:

1. **Ghi nhận vấn đề**: Xác định chính xác phần nào người dùng muốn thay đổi
2. **Thực hiện chỉnh sửa**: Chỉ sửa những phần được yêu cầu, giữ nguyên những phần tốt
3. **Đảm bảo tính liền mạch**: Kịch bản sau khi sửa phải hoàn chỉnh và mạch lạc
4. **Giải thích thay đổi**: Mô tả ngắn gọn những gì đã được chỉnh sửa

Trả về kịch bản đã chỉnh sửa theo định dạng:

**📝 THAY ĐỔI THỰC HIỆN:**
[Mô tả ngắn gọn những gì đã sửa]

**🎬 KỊCH BẢN ĐÃ CHỈNH SỬA (Phiên bản ${scriptVersion + 1}):**
[Kịch bản hoàn chỉnh sau khi chỉnh sửa]

Viết bằng tiếng Việt.`

    // Tìm AI provider tốt nhất để chỉnh sửa
    const availableProviders = aiProviders.filter(provider => apiKeys[provider.id]?.trim())
    const bestProvider = ['openai', 'claude', 'gemini'].find(id => 
      availableProviders.some(p => p.id === id)
    )
    
    if (bestProvider && apiKeys[bestProvider]) {
      try {
        const response = await fetch('/api/script-writer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: refinementPrompt,
            userMessage: userFeedback,
            apiKey: apiKeys[bestProvider],
            provider: bestProvider,
            isRefining: true
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const refinedScript = data.script || data.content
          
          // Cập nhật kịch bản hiện tại
          const newVersion = scriptVersion + 1
          setCurrentScript(refinedScript)
          setScriptVersion(newVersion)
          setScriptHistory(prev => [...prev, {
            version: newVersion,
            content: refinedScript,
            timestamp: new Date()
          }])
          setIsRefining(false)
          
          return refinedScript
        }
      } catch (error) {
        console.error('Script refinement error:', error)
      }
    }

    setIsRefining(false)
    return `❌ **Không thể chỉnh sửa kịch bản**

Xin lỗi, tôi không thể thực hiện chỉnh sửa lúc này. Có thể do:
- Chưa cấu hình AI API
- Lỗi kết nối
- API key không hợp lệ

**Kịch bản hiện tại của bạn:**
${currentScript}

Vui lòng thử lại hoặc kiểm tra cấu hình API.`
  }

  // Hàm tổng hợp kết quả từ nhiều AI
  const combineAIResults = async (results: any[], userMessage: string, originalPrompt: string): Promise<string> => {
    // Tạo prompt cho việc tổng hợp
    const combinePrompt = `Bạn là một chuyên gia biên tập kịch bản chuyên nghiệp. Hãy tổng hợp và tạo ra kịch bản tốt nhất từ ${results.length} kịch bản sau đây:

${results.map((result, index) => `
**KỊCH BẢN ${index + 1} (từ ${result.providerName}):**
${result.script}

---`).join('\n')}

Hãy tạo ra một kịch bản cuối cùng bằng cách:
1. Lấy những ý tưởng hay nhất từ mỗi kịch bản
2. Kết hợp thành một kịch bản hoàn chỉnh và mạch lạc
3. Đảm bảo chất lượng cao nhất về nội dung, cấu trúc và chi tiết
4. Giữ nguyên yêu cầu gốc: "${userMessage}"

Kết quả phải là kịch bản hoàn chỉnh, không đề cập đến việc tổng hợp.`

    // Tìm AI provider tốt nhất để tổng hợp (ưu tiên OpenAI hoặc Claude)
    const bestProvider = ['openai', 'claude', 'gemini'].find(id => apiKeys[id]?.trim())
    
    if (bestProvider) {
      try {
        const response = await fetch('/api/script-writer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: combinePrompt,
            userMessage: 'Tổng hợp kịch bản',
            apiKey: apiKeys[bestProvider],
            provider: bestProvider,
            style: selectedStyle,
            isCombining: true
          }),
        })

        if (response.ok) {
          const data = await response.json()
          return `🎬 **KỊCH BẢN TỔNG HỢP TỪ ${results.length} AI**\n\n${data.script}\n\n---\n💡 *Kịch bản này được tạo bởi sự kết hợp của ${results.map(r => r.providerName).join(', ')} và tổng hợp bởi ${aiProviders.find(p => p.id === bestProvider)?.name}*`
        }
      } catch (error) {
        console.error('Combine error:', error)
      }
    }

    // Fallback: Ghép đơn giản
    return `🎬 **KỊCH BẢN TỪ MULTIPLE AI**

${results.map((result, index) => `
**📝 Từ ${result.providerName}:**
${result.script}

---`).join('\n')}

💡 *Bạn có thể chọn phần nào hay nhất từ các kịch bản trên để sử dụng*`
  }

  // Loại bỏ template fallback - chỉ sử dụng AI APIs thật

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)
    resetScrollState() // Reset scroll state khi user gửi tin nhắn

    // Gọi AI để generate response
    try {
      const response = await generateScriptResponse(inputMessage)
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
      onScriptGenerated?.(response)
    } catch (error) {
      console.error('Error generating script:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: '❌ Có lỗi xảy ra khi tạo kịch bản. Vui lòng thử lại.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    }

    setIsTyping(false)
  }

  const copyMessage = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content)
    setShowCopied(messageId)
    setTimeout(() => setShowCopied(''), 2000)
  }

  const clearChat = () => {
    setMessages([messages[0]]) // Giữ lại message chào đầu tiên
  }

  // Style management functions
  const openStyleEditor = (style?: ContentStyle) => {
    if (style) {
      setEditingStyle({ ...style })
    } else {
      // Create new style
      setEditingStyle({
        id: `custom_${Date.now()}`,
        name: '',
        description: '',
        systemPrompt: '',
        icon: '🎭'
      })
    }
    setShowStyleEditor(true)
  }

  const saveStyle = () => {
    if (!editingStyle || !editingStyle.name.trim()) return

    const isCustom = editingStyle.id.startsWith('custom_')
    if (isCustom) {
      const existingIndex = customStyles.findIndex(s => s.id === editingStyle.id)
      if (existingIndex >= 0) {
        // Update existing
        const updated = [...customStyles]
        updated[existingIndex] = editingStyle
        saveCustomStyles(updated)
      } else {
        // Add new
        saveCustomStyles([...customStyles, editingStyle])
      }
    }
    
    setShowStyleEditor(false)
    setEditingStyle(null)
  }

  const confirmDeleteStyle = (styleId: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Confirm delete style:', styleId)
    }
    setShowDeleteConfirm(styleId)
  }

  const deleteStyle = (styleId: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Delete style called:', styleId)
    }
    
    // Không cho xóa phong cách "Tổng quát" (luôn giữ làm mặc định)
    if (styleId === 'general') {
      if (process.env.NODE_ENV === 'development') {
        console.log('Cannot delete default "Tổng quát" style')
      }
      setShowDeleteConfirm(null)
      return
    }
    
    if (styleId.startsWith('custom_')) {
      // Xóa custom style
      const updated = customStyles.filter(s => s.id !== styleId)
      if (process.env.NODE_ENV === 'development') {
        console.log('Updated custom styles after delete:', updated)
      }
      saveCustomStyles(updated)
    } else {
      // Xóa built-in style - thêm vào danh sách ẩn
      try {
        const hiddenStyles = JSON.parse((typeof window !== 'undefined' ? localStorage.getItem('hiddenBuiltInStyles') : null) || '[]')
        if (!hiddenStyles.includes(styleId)) {
          hiddenStyles.push(styleId)
          if (typeof window !== 'undefined') {
            localStorage.setItem('hiddenBuiltInStyles', JSON.stringify(hiddenStyles))
          }
          if (process.env.NODE_ENV === 'development') {
            console.log('Hidden built-in style:', styleId)
          }
          
          // Force re-render bằng cách trigger state update
          setCustomStyles([...customStyles])
        }
      } catch (error) {
        console.error('Error hiding built-in style:', error)
      }
    }
    
    // If deleted style was selected, switch to general
    if (selectedStyle === styleId) {
      setSelectedStyle('general')
    }
    
    setShowDeleteConfirm(null)
  }

  // Khôi phục một phong cách cụ thể
  const restoreStyle = (styleId: string) => {
    if (typeof window !== 'undefined') {
      try {
        const hiddenStyles = JSON.parse(localStorage.getItem('hiddenBuiltInStyles') || '[]')
        const updatedHidden = hiddenStyles.filter((id: string) => id !== styleId)
        localStorage.setItem('hiddenBuiltInStyles', JSON.stringify(updatedHidden))
        setCustomStyles([...customStyles]) // Force re-render
      } catch (error) {
        console.error('Error restoring style:', error)
      }
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Script Writer</h3>
            <p className="text-sm text-gray-400">Chatbot chuyên viết kịch bản video</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-2 rounded-lg transition-colors ${
              autoScroll 
                ? 'text-green-400 hover:text-green-300 hover:bg-gray-700' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title={autoScroll ? "Tắt tự động scroll" : "Bật tự động scroll"}
          >
            {autoScroll ? '📌' : '📍'}
          </button>
          <button
            onClick={() => setShowApiKeyEditor(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Cấu hình API Keys"
          >
            <Sparkles size={18} />
          </button>
          <button
            onClick={clearChat}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Xóa cuộc trò chuyện"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* AI Provider Status */}
      <div className="mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">🤖 AI Provider:</span>
                         {(() => {
               const activeProviders = aiProviders.filter(p => apiKeys[p.id]?.trim())
               if (activeProviders.length === 0) {
                 return (
                   <span className="text-sm text-red-400">
                     ⚠️ Cần API Key để sử dụng
                   </span>
                 )
               } else if (activeProviders.length === 1) {
                 return (
                   <span className="text-sm text-green-400">
                     {activeProviders[0].icon} {activeProviders[0].name}
                   </span>
                 )
               } else {
                 return (
                   <div className="flex items-center gap-2">
                     <span className="text-sm text-green-400">
                       🚀 Multi-AI ({activeProviders.length} AIs)
                     </span>
                     <div className="flex gap-1">
                       {activeProviders.map(provider => (
                         <span key={provider.id} className="text-xs" title={provider.name}>
                           {provider.icon}
                         </span>
                       ))}
                     </div>
                   </div>
                 )
               }
             })()}
          </div>
          <button
            onClick={() => setShowApiKeyEditor(true)}
            className="text-xs text-purple-400 hover:text-purple-300 underline"
          >
            Cấu hình API
          </button>
        </div>
      </div>

      {/* Style Selector */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">
            🎭 Chọn phong cách viết kịch bản:
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                // Tạo phong cách test để demo chức năng xóa
                const testStyle: ContentStyle = {
                  id: `custom_test_${Date.now()}`,
                  name: 'Phong cách Test',
                  description: 'Phong cách test có thể xóa được',
                  icon: '🧪',
                  systemPrompt: 'Đây là phong cách test để demo chức năng xóa.'
                }
                saveCustomStyles([...customStyles, testStyle])
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              🧪 Test
            </button>
            <button
              onClick={() => setShowDeletedStyles(!showDeletedStyles)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              title="Xem phong cách đã xóa"
            >
              <RefreshCw size={12} />
              <span suppressHydrationWarning>
                Đã xóa ({isMounted ? getHiddenStyles().length : 0})
              </span>
            </button>
            <button
              onClick={() => openStyleEditor()}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={12} />
              Thêm phong cách
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(isMounted ? getVisibleStyles() : contentStyles).map((style) => (
            <div key={style.id} className="relative group">
              <button
                onClick={() => setSelectedStyle(style.id)}
                className={`w-full p-3 rounded-lg border transition-colors text-left ${
                  selectedStyle === style.id
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
                title={style.description}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{style.icon}</span>
                  <span className="font-medium text-sm">{style.name}</span>
                  {style.id.startsWith('custom_') && (
                    <span className="text-xs bg-blue-600 text-white px-1 rounded">Custom</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{style.description}</p>
              </button>
              
              {/* Edit/Delete buttons - cho phép xóa tất cả trừ "Tổng quát" */}
              {style.id !== 'general' && (
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  {/* Chỉ cho edit custom styles */}
                  {style.id.startsWith('custom_') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openStyleEditor(style)
                      }}
                      className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      title="Chỉnh sửa"
                    >
                      <Edit3 size={10} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      confirmDeleteStyle(style.id)
                    }}
                    className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                    title="Xóa phong cách"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Deleted Styles Panel */}
        {showDeletedStyles && isMounted && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
            <h4 className="text-red-400 text-sm font-medium mb-2">🗑️ Phong cách đã xóa</h4>
            {getHiddenStyles().length === 0 ? (
              <p className="text-red-300 text-sm">Không có phong cách nào bị xóa.</p>
            ) : (
              <div className="space-y-2">
                {getHiddenStyles().map((style) => (
                  <div key={style.id} className="flex items-center justify-between p-2 bg-red-800/20 rounded border border-red-700/50">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{style.icon}</span>
                      <div>
                        <span className="text-red-200 font-medium text-sm">{style.name}</span>
                        <p className="text-red-300 text-xs">{style.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => restoreStyle(style.id)}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Khôi phục
                    </button>
                  </div>
                ))}
                <div className="mt-3 pt-2 border-t border-red-700/50">
                  <p className="text-red-300 text-xs">
                    💡 <strong>Lưu ý:</strong> Phong cách đã xóa sẽ không tự động khôi phục. 
                    Bạn cần chọn từng phong cách để khôi phục riêng biệt.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div 
        className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-96 overflow-y-auto mb-4"
        onScroll={handleScroll}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 mb-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'bot' && (
              <div className="p-1.5 bg-purple-600 rounded-full flex-shrink-0 h-fit">
                <Bot size={16} className="text-white" />
              </div>
            )}
            
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : ''}`}>
              <div
                className={`p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-200 border border-gray-600'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                
                {message.type === 'bot' && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-600">
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <button
                      onClick={() => copyMessage(message.content, message.id)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >
                      {showCopied === message.id ? (
                        <>
                          <Check size={12} />
                          Đã copy
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {message.type === 'user' && (
              <div className="p-1.5 bg-blue-600 rounded-full flex-shrink-0 h-fit order-3">
                <User size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {(isTyping || showAiProgress || isRefining) && (
          <div className="flex gap-3 mb-4">
            <div className="p-1.5 bg-purple-600 rounded-full flex-shrink-0 h-fit">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 min-w-0 flex-1">
              {isRefining ? (
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-orange-400 ml-2">🛠️ Đang chỉnh sửa kịch bản theo yêu cầu của bạn...</span>
                </div>
              ) : !showAiProgress ? (
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-400 ml-2">Đang viết kịch bản...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-gray-400 mb-3">🚀 Đang gọi multiple AI để tạo kịch bản tốt nhất...</div>
                  {aiProviders.filter(p => apiKeys[p.id]?.trim()).map(provider => (
                    <div key={provider.id} className="flex items-center gap-3">
                      <span className="text-lg">{provider.icon}</span>
                      <span className="text-sm text-gray-300 min-w-0 flex-1">{provider.name}</span>
                      <div className="flex items-center gap-1">
                        {aiProgress[provider.id] === 'waiting' && (
                          <span className="text-xs text-gray-500">Chờ...</span>
                        )}
                        {aiProgress[provider.id] === 'processing' && (
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        )}
                        {aiProgress[provider.id] === 'completed' && (
                          <span className="text-xs text-green-400">✓ Hoàn thành</span>
                        )}
                        {aiProgress[provider.id] === 'error' && (
                          <span className="text-xs text-red-400">✗ Lỗi</span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {Object.values(aiProgress).some(status => status === 'completed') && 
                   Object.values(aiProgress).every(status => status !== 'processing') && (
                    <div className="mt-3 pt-2 border-t border-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-purple-400">Đang tổng hợp kết quả...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

                {/* New Script Notice */}
      {showNewScriptNotice && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-600/30 rounded-lg animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-green-400">🎉</span>
            <span className="text-green-300 text-sm font-medium">
              Kịch bản đã được tạo thành công! Bây giờ bạn có thể yêu cầu chỉnh sửa.
            </span>
          </div>
        </div>
      )}

      {/* Script Context Info */}
      {currentScript && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-medium">📋 Kịch bản hiện tại</span>
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">v{scriptVersion}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                {showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}
              </button>
              <button
                onClick={() => {
                  setCurrentScript('')
                  setScriptVersion(0)
                  setScriptHistory([])
                }}
                className="text-xs text-red-400 hover:text-red-300 underline"
              >
                Bỏ context
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-blue-300 text-sm">
              💡 <strong>Tính năng chỉnh sửa kịch bản đang hoạt động!</strong>
            </p>
            <p className="text-blue-200 text-xs">
              Bạn có thể yêu cầu chỉnh sửa kịch bản này bằng cách nói: 
              <br />
              <span className="italic font-mono bg-blue-900/30 px-1 rounded">
                &quot;Sửa phần đối thoại&quot;, &quot;Thay đổi nhân vật&quot;, &quot;Thêm âm thanh&quot;, &quot;Bớt quá dài&quot;, &quot;Làm ngắn hơn&quot;, v.v.
              </span>
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {[
                'Sửa lời thoại',
                'Thay đổi bối cảnh',
                'Thêm cảnh',
                'Bớt dài',
                'Đổi nhân vật',
                'Thêm âm thanh'
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(suggestion.toLowerCase())}
                  className="text-xs bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 px-2 py-1 rounded transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          {/* Script History */}
          {showHistory && scriptHistory.length > 0 && (
            <div className="mt-3 p-3 bg-gray-800 rounded-lg max-h-60 overflow-y-auto">
              <h4 className="text-blue-400 text-sm font-medium mb-2">📚 Lịch sử kịch bản</h4>
              <div className="space-y-2">
                {scriptHistory.map((item, index) => (
                  <div key={index} className="border border-gray-700 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-blue-300">
                        Phiên bản {item.version} - {item.timestamp.toLocaleString('vi-VN')}
                      </span>
                      <button
                        onClick={() => {
                          setCurrentScript(item.content)
                          setScriptVersion(item.version)
                        }}
                        className="text-xs text-green-400 hover:text-green-300 underline"
                      >
                        Khôi phục
                      </button>
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {item.content.substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          placeholder={
            currentScript 
              ? "Yêu cầu chỉnh sửa kịch bản... (VD: Sửa lời thoại cho hay hơn, thêm âm thanh)"
              : "Mô tả video bạn muốn tạo kịch bản... (VD: Video 30s về cô gái uống cà phê)"
          }
          className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
          disabled={isTyping || isRefining}
        />
        <button
          onClick={handleSendMessage}
          disabled={isTyping || isRefining || !inputMessage.trim()}
          className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Send size={18} />
          <span className="hidden sm:inline">
            {currentScript ? 'Chỉnh sửa' : 'Gửi'}
          </span>
        </button>
      </div>

      {!aiProviders.some(p => apiKeys[p.id]?.trim()) && (
        <div className="mt-3 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-red-400" />
            <span className="text-sm font-medium text-red-400">⚠️ Yêu cầu AI API Key</span>
          </div>
          <p className="text-xs text-red-300 mb-2">
            Dự án này chỉ sử dụng AI APIs thật. Vui lòng thêm ít nhất một API key để sử dụng:
          </p>
          <div className="flex flex-wrap gap-2">
            {aiProviders.map(provider => (
              <span key={provider.id} className="text-xs bg-red-800/30 text-red-200 px-2 py-1 rounded">
                {provider.icon} {provider.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Style Editor Modal */}
      {showStyleEditor && editingStyle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingStyle.id.startsWith('custom_') && editingStyle.name ? 'Chỉnh sửa phong cách' : 'Tạo phong cách mới'}
              </h3>
              <button
                onClick={() => setShowStyleEditor(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Icon (emoji):
                </label>
                <input
                  type="text"
                  value={editingStyle.icon}
                  onChange={(e) => setEditingStyle({...editingStyle, icon: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="🎭"
                  maxLength={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tên phong cách:
                </label>
                <input
                  type="text"
                  value={editingStyle.name}
                  onChange={(e) => setEditingStyle({...editingStyle, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: Khoa học, Tâm lý học, Marketing..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mô tả ngắn:
                </label>
                <input
                  type="text"
                  value={editingStyle.description}
                  onChange={(e) => setEditingStyle({...editingStyle, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Mô tả ngắn gọn về phong cách này..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  System Prompt (Hướng dẫn AI):
                </label>
                <textarea
                  value={editingStyle.systemPrompt}
                  onChange={(e) => setEditingStyle({...editingStyle, systemPrompt: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none"
                  placeholder="Bạn là một chuyên gia [lĩnh vực]. Viết kịch bản với giọng điệu [đặc điểm], sử dụng [thuật ngữ/phong cách]. Luôn nhấn mạnh [điểm đặc biệt]..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Hướng dẫn này sẽ giúp AI viết kịch bản theo phong cách bạn mong muốn
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveStyle}
                disabled={!editingStyle.name.trim() || !editingStyle.systemPrompt.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={16} />
                Lưu phong cách
              </button>
              <button
                onClick={() => setShowStyleEditor(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
            </div>
                     </div>
         </div>
       )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-600 rounded-lg">
                <Trash2 size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Xác nhận xóa phong cách</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-2">
                Bạn có chắc chắn muốn xóa phong cách này không?
              </p>
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-3">
                {(() => {
                  const styleToDelete = getVisibleStyles().find(s => s.id === showDeleteConfirm)
                  return styleToDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{styleToDelete.icon}</span>
                      <div>
                        <p className="text-white font-medium">{styleToDelete.name}</p>
                        <p className="text-gray-400 text-sm">{styleToDelete.description}</p>
                      </div>
                    </div>
                  ) : null
                })()}
              </div>
              <p className="text-red-400 text-sm mt-2">
                ⚠️ Hành động này không thể khôi phục!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => deleteStyle(showDeleteConfirm)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                Xóa phong cách
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
            </div>
                     </div>
         </div>
       )}

      {/* API Key Editor Modal */}
      {showApiKeyEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Cấu hình AI API Keys</h3>
              </div>
              <button
                onClick={() => setShowApiKeyEditor(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-gray-300 text-sm">
                Thêm API key cho các AI models để tạo kịch bản chất lượng cao. Chỉ cần một API key là đủ.
              </p>

              {aiProviders.map((provider) => (
                <div key={provider.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{provider.icon}</span>
                    <div>
                      <h4 className="text-white font-medium">{provider.name}</h4>
                      <p className="text-gray-400 text-sm">
                        {provider.id === 'openai' && 'GPT-3.5/GPT-4 - Lấy từ platform.openai.com'}
                        {provider.id === 'gemini' && 'Gemini Pro - Lấy từ ai.google.dev'}
                        {provider.id === 'claude' && 'Claude 3 - Lấy từ console.anthropic.com'}
                      </p>
                    </div>
                    {apiKeys[provider.id]?.trim() && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                        ✓ Đã cấu hình
                      </span>
                    )}
                  </div>
                  
                  <div className="relative">
                    <input
                      type="password"
                      value={apiKeys[provider.id] || ''}
                      onChange={(e) => {
                        const newKeys = { ...apiKeys, [provider.id]: e.target.value }
                        saveApiKeys(newKeys)
                      }}
                      placeholder={provider.placeholder}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 pr-24"
                    />
                    {apiKeys[provider.id]?.trim() && (
                      <button
                        onClick={() => {
                          const newKeys = { ...apiKeys, [provider.id]: '' }
                          saveApiKeys(newKeys)
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-red-400 hover:text-red-300"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <h5 className="text-blue-400 font-medium mb-2">💡 Hướng dẫn lấy API Key:</h5>
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>• <strong>OpenAI:</strong> platform.openai.com → API keys → Create new key</li>
                  <li>• <strong>Gemini:</strong> ai.google.dev → Get API key → Create key</li>
                  <li>• <strong>Claude:</strong> console.anthropic.com → API Keys → Create key</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowApiKeyEditor(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 