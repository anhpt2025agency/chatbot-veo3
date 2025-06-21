'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Header from '@/components/Header'
import ScriptWriterChatbot from '@/components/ScriptWriterChatbot'
import VEO3PromptGenerator from '@/components/VEO3PromptGenerator'
import { LogOut, User } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!session) {
    return null
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* User Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              {session.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={session.user.image} 
                  alt={session.user.name || 'User'} 
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <User size={20} className="text-white" />
              )}
            </div>
            <div>
              <h1 className="text-white font-semibold">{session.user?.name}</h1>
              <p className="text-gray-400 text-sm">{session.user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Header />
        
        {/* Script Writer Section */}
        <div className="mb-12">
          <ScriptWriterChatbot 
            onScriptGenerated={(script) => {
              console.log('Generated script:', script)
            }}
          />
        </div>
        
        {/* VEO3 Prompt Generator Section */}
        <VEO3PromptGenerator />
      </div>
    </div>
  )
} 