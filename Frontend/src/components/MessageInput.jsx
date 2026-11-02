import { useState } from 'react'

function MessageInput({ onSend, isSending, isDarkMode }) {
  const [value, setValue] = useState('')
  const canSend = value.trim().length > 0 && !isSending

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSend) return

    onSend(value)
    setValue('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-end gap-2 rounded-2xl border p-2 transition-colors focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 ${
        isDarkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <label htmlFor="chat-message" className="sr-only">
        Write a message
      </label>
      <textarea
        id="chat-message"
        rows="1"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a message..."
        className={`max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-5 outline-none placeholder:text-slate-400 ${
          isDarkMode ? 'text-slate-100' : 'text-slate-800'
        }`}
      />
      <button
        type="submit"
        disabled={!canSend}
        className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
      >
        <span className="hidden sm:inline">Send</span>
        <svg
          aria-hidden="true"
          className="size-4"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="m3.3 9.2 12.9-5.5-5.5 12.9-2.1-5.3-5.3-2.1Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m8.6 11.3 3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </form>
  )
}

export default MessageInput
