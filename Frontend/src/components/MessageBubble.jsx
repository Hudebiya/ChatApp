function MessageBubble({ message, isTyping = false, isDarkMode }) {
  if (isTyping) {
    return (
      <div className="flex items-end gap-2.5" role="status" aria-label="Bot is typing">
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            isDarkMode
              ? 'bg-indigo-500/15 text-indigo-300'
              : 'bg-indigo-100 text-indigo-600'
          }`}
        >
          <span className="text-xs font-semibold">N</span>
        </div>
        <div
          className={`flex items-center gap-2 rounded-2xl rounded-bl-md px-4 py-3 ${
            isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm shadow-slate-900/5'
          }`}
        >
          <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
            Bot is typing...
          </span>
          <span className="flex items-center gap-1" aria-hidden="true">
            <span className="size-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-indigo-400" />
          </span>
        </div>
      </div>
    )
  }

  const isUser = message.role === 'user'
  const isError = message.role === 'error'
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            isError
              ? isDarkMode
                ? 'bg-rose-500/15 text-rose-300'
                : 'bg-rose-100 text-rose-600'
              : isDarkMode
                ? 'bg-indigo-500/15 text-indigo-300'
                : 'bg-indigo-100 text-indigo-600'
          }`}
          aria-hidden="true"
        >
          {isError ? '!' : 'N'}
        </div>
      )}
      <div className={`flex max-w-[85%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 sm:px-5 ${
            isUser
              ? 'rounded-br-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/15'
              : isError
                ? `rounded-bl-md border ${
                    isDarkMode
                      ? 'border-rose-900 bg-rose-950/50 text-rose-200'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                  }`
                : `rounded-bl-md ${
                    isDarkMode
                      ? 'bg-slate-800 text-slate-100'
                      : 'bg-white text-slate-700 shadow-sm shadow-slate-900/5'
                  }`
          }`}
        >
          {message.content}
        </div>
        <time
          dateTime={message.timestamp}
          className={`mt-1.5 px-1 text-[10px] ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          {timestamp}
        </time>
      </div>
    </div>
  )
}

export default MessageBubble
