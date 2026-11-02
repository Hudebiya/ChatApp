import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble.jsx'
import MessageInput from './MessageInput.jsx'

function ChatWindow({
  messages,
  isTyping,
  isDarkMode,
  onToggleTheme,
  onSend,
}) {
  const latestMessageRef = useRef(null)

  useEffect(() => {
    latestMessageRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messages, isTyping])

  return (
    <section
      aria-label="Chat with Nova"
      className={`flex h-[min(820px,calc(100dvh-2rem))] min-h-[520px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border shadow-2xl shadow-slate-900/10 sm:h-[min(820px,calc(100dvh-4rem))] ${
        isDarkMode
          ? 'border-slate-800 bg-slate-900'
          : 'border-white bg-white'
      }`}
    >
      <header
        className={`flex items-center justify-between border-b px-4 py-4 sm:px-7 ${
          isDarkMode ? 'border-slate-800' : 'border-slate-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
            <svg
              aria-hidden="true"
              className="size-6"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 3.5v2m0 13v2m8.5-8.5h-2m-13 0h-2m15.01-6.01-1.42 1.42M6.91 17.09l-1.42 1.42m12.02 0-1.42-1.42M6.91 6.91 5.49 5.49"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <circle
                cx="12"
                cy="12"
                r="5"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1
              className={`text-base font-semibold tracking-tight sm:text-lg ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              Nova
            </h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/15" />
              Online and ready to help
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`flex size-10 items-center justify-center rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
            isDarkMode
              ? 'text-slate-300 hover:bg-slate-800'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          {isDarkMode ? (
            <svg
              aria-hidden="true"
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="4"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M20.2 15.1A8.4 8.4 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </header>

      <div
        aria-live="polite"
        className={`flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 ${
          isDarkMode ? 'bg-slate-900' : 'bg-slate-50/70'
        }`}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isDarkMode={isDarkMode}
            />
          ))}
          {isTyping && <MessageBubble isTyping isDarkMode={isDarkMode} />}
          <div ref={latestMessageRef} />
        </div>
      </div>

      <footer
        className={`border-t px-3 py-3 sm:px-6 sm:py-5 ${
          isDarkMode
            ? 'border-slate-800 bg-slate-900'
            : 'border-slate-100 bg-white'
        }`}
      >
        <div className="mx-auto w-full max-w-2xl">
          <MessageInput onSend={onSend} isSending={isTyping} isDarkMode={isDarkMode} />
          <p
            className={`mt-2 text-center text-[11px] ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Nova can make mistakes. Check important information.
          </p>
        </div>
      </footer>
    </section>
  )
}

export default ChatWindow
