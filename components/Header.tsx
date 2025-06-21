'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Save, Trash2, Copy, Check, Eye, EyeOff, Key } from 'lucide-react'

export default function Header() {
  const { data: session } = useSession()
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [selectedProvider, setSelectedProvider] = useState('flux')
  const [currentKey, setCurrentKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [showCopied, setShowCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showApiManager, setShowApiManager] = useState(false)

  const providers = [
    { id: 'flux', name: 'Flux (BFL)', placeholder: 'bfl-your-api-key-here' },
    { id: 'gemini', name: 'Google Gemini', placeholder: 'AIza-your-api-key-here' },
    { id: 'openai', name: 'OpenAI GPT', placeholder: 'sk-proj-your-api-key-here' },
    { id: 'claude', name: 'Anthropic Claude', placeholder: 'sk-ant-your-api-key-here' },
  ]

  // Load API keys when component mounts
  useEffect(() => {
    if (session?.user?.id) {
      loadApiKeys()
    }
  }, [session])

  // Update current key when selection changes
  useEffect(() => {
    setCurrentKey(apiKeys[selectedProvider] || '')
  }, [selectedProvider, apiKeys])

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

  const handleSaveKey = async () => {
    if (!currentKey.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: selectedProvider,
          keyValue: currentKey.trim(),
        }),
      })

      if (response.ok) {
        await loadApiKeys() // Reload keys
        alert(`${providers.find(p => p.id === selectedProvider)?.name} API key đã được lưu!`)
      } else {
        alert('Có lỗi khi lưu API key')
      }
    } catch (error) {
      console.error('Error saving API key:', error)
      alert('Có lỗi khi lưu API key')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteKey = async () => {
    if (!apiKeys[selectedProvider]) return

    if (confirm(`Bạn có chắc muốn xóa ${providers.find(p => p.id === selectedProvider)?.name} API key?`)) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/user/api-keys?provider=${selectedProvider}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await loadApiKeys() // Reload keys
          setCurrentKey('')
          alert('API key đã được xóa!')
        } else {
          alert('Có lỗi khi xóa API key')
        }
      } catch (error) {
        console.error('Error deleting API key:', error)
        alert('Có lỗi khi xóa API key')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCopyKey = () => {
    if (currentKey) {
      navigator.clipboard.writeText(currentKey)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    }
  }

  return (
    <header className="bg-gray-800/95 backdrop-blur-lg shadow-lg border-b border-gray-700 mb-8">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">ChatBot VEO3</h1>
            <span className="hidden md:inline text-sm text-gray-400 pt-1">AI Script Writer & Prompt Generator</span>
          </div>

          {/* API Key Manager Toggle */}
          <button
            onClick={() => setShowApiManager(!showApiManager)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Key size={18} />
            Quản lý API Keys
            <span className="text-xs bg-purple-800 px-2 py-1 rounded-full">
              {Object.keys(apiKeys).length}
            </span>
          </button>
        </div>

        {/* API Key Management Panel */}
        {showApiManager && (
          <div className="mt-6 p-6 bg-gray-700/50 rounded-lg border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-4">Quản lý API Keys</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chọn Provider
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} {apiKeys[provider.id] ? '✓' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder={providers.find(p => p.id === selectedProvider)?.placeholder}
                    value={currentKey}
                    onChange={(e) => setCurrentKey(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleSaveKey}
                disabled={isLoading || !currentKey.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={18} />
                {isLoading ? 'Đang lưu...' : 'Lưu Key'}
              </button>
              
              <button
                onClick={handleDeleteKey}
                disabled={isLoading || !apiKeys[selectedProvider]}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 size={18} />
                Xóa Key
              </button>
              
              <button
                onClick={handleCopyKey}
                disabled={!currentKey}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {showCopied ? <Check size={18} /> : <Copy size={18} />}
                {showCopied ? 'Đã sao chép!' : 'Sao chép'}
              </button>
            </div>

            {/* Status Info */}
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong>Trạng thái:</strong> Bạn đã cấu hình {Object.keys(apiKeys).length} API key(s)
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {providers.map(provider => (
                  <span
                    key={provider.id}
                    className={`px-2 py-1 text-xs rounded-full ${
                      apiKeys[provider.id] 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {provider.name} {apiKeys[provider.id] ? '✓' : '✗'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 