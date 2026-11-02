import { useEffect, useState } from 'react'
import ChatWindow from './components/ChatWindow.jsx'
import socket from './socket.js'

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content: "Hi there! I'm Nova, your AI assistant. How can I help you today?",
    timestamp: new Date().toISOString(),
  },
]

function App() {
  const [messages, setMessages] = useState(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content:
            typeof data?.message === 'string'
              ? data.message
              : JSON.stringify(data?.message ?? ''),
          timestamp: new Date().toISOString(),
        },
      ])
      setIsTyping(false)
    }

    const handleSocketError = (error) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: 'error',
          content: error?.message || 'Unable to connect. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ])
      setIsTyping(false)
    }

    socket.on('receive-message', handleReceiveMessage)
    socket.on('connect_error', handleSocketError)
    socket.on('error', handleSocketError)

    return () => {
      socket.off('receive-message', handleReceiveMessage)
      socket.off('connect_error', handleSocketError)
      socket.off('error', handleSocketError)
    }
  }, [])

  const handleSend = (message) => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || isTyping) return

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-user`,
        role: 'user',
        content: trimmedMessage,
        timestamp: new Date().toISOString(),
      },
    ])
    setIsTyping(true)
    socket.emit('send-message', { message: trimmedMessage })
  }

  return (
    <main
      className={`min-h-screen px-3 py-4 transition-colors duration-300 sm:px-6 sm:py-8 ${
        isDarkMode
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-100 text-slate-900'
      }`}
    >
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-6xl items-center justify-center sm:min-h-[calc(100dvh-4rem)]">
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((currentMode) => !currentMode)}
          onSend={handleSend}
        />
      </div>
    </main>
  )
}

export default App