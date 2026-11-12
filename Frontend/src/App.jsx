import { useEffect, useRef, useState } from 'react'
import {
  CheckCheck,
  Camera,
  Ellipsis,
  Image,
  Menu,
  Mic,
  Moon,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Sun,
  UserPlus,
  X,
} from 'lucide-react'
import { MessageList } from '@chatscope/chat-ui-kit-react'
import socket from './socket.js'

const initialConversations = [
  {
    id: 'alex',
    name: 'Alex Morgan',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&h=96&q=80',
    online: true,
    preview: 'That sounds great, see you then!',
    time: '10:42 AM',
    unread: 2,
    messages: [
      { id: 'alex-1', role: 'other', content: 'Hey! Are we still on for coffee this afternoon?', time: '10:36 AM' },
      { id: 'alex-2', role: 'user', content: 'Absolutely! I know a great place near the park.', time: '10:39 AM' },
      { id: 'alex-3', role: 'other', content: 'That sounds great, see you then!', time: '10:42 AM' },
    ],
  },
  {
    id: 'maya',
    name: 'Maya Chen',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&h=96&q=80',
    online: true,
    preview: 'Sent you the photos 📸',
    time: '9:18 AM',
    unread: 0,
    messages: [
      { id: 'maya-1', role: 'other', content: 'Sent you the photos 📸', time: '9:18 AM' },
    ],
  },
  {
    id: 'jordan',
    name: 'Jordan Lee',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=96&h=96&q=80',
    online: false,
    preview: 'Thanks for your help!',
    time: 'Yesterday',
    unread: 0,
    messages: [
      { id: 'jordan-1', role: 'other', content: 'Thanks for your help!', time: 'Yesterday' },
    ],
  },
  {
    id: 'team',
    name: 'Design Team',
    avatar:
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=96&h=96&q=80',
    online: false,
    preview: 'Maya: updated the latest mockups',
    time: 'Yesterday',
    unread: 0,
    messages: [
      { id: 'team-1', role: 'other', content: 'Maya: updated the latest mockups', time: 'Yesterday' },
    ],
  },
]

const quickEmojis = ['😀', '😂', '🥰', '👍', '🎉', '❤️']
const emptyMessages = []
const defaultProfileAvatar =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&h=96&q=80'

const isEmojiOnlyMessage = (content) =>
  /^[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Emoji_Modifier}\uFE0F\u200D\s]+$/u.test(
    content,
  )

const buttonClass =
  'flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [conversations, setConversations] = useState(initialConversations)
  const [selectedChatId, setSelectedChatId] = useState('alex')
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUserNameInput, setNewUserNameInput] = useState('')
  const [messagesByChat, setMessagesByChat] = useState(
    Object.fromEntries(
      initialConversations.map(({ id, messages }) => [id, messages]),
    ),
  )
  const [search, setSearch] = useState('')
  const [messageSearch, setMessageSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false)
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [fontFamily, setFontFamily] = useState('sans')
  const [fontSize, setFontSize] = useState('text-sm')
  const [notice, setNotice] = useState('')
  const [attachmentName, setAttachmentName] = useState('')
  const [profileAvatar, setProfileAvatar] = useState(defaultProfileAvatar)
  const pendingChatId = useRef(selectedChatId)
  const messageListRef = useRef(null)
  const fileInputRef = useRef(null)
  const profilePictureInputRef = useRef(null)

  const selectedChat = conversations.find(({ id }) => id === selectedChatId)
  const messages = messagesByChat[selectedChatId] ?? emptyMessages
  const visibleConversations = conversations.filter(({ name, preview }) =>
    `${name} ${preview}`.toLowerCase().includes(search.toLowerCase()),
  )
  const visibleMessages = messages.filter((message) =>
    message.content.toLowerCase().includes(messageSearch.trim().toLowerCase()),
  )

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      const content =
        typeof data?.message === 'string'
          ? data.message
          : JSON.stringify(data?.message ?? '')
      const chatId =
        typeof data?.conversationId === 'string'
          ? data.conversationId
          : pendingChatId.current

      setMessagesByChat((previous) => ({
        ...previous,
        [chatId]: [
          ...(previous[chatId] ?? []),
          {
            id: `${Date.now()}-assistant`,
            role: 'other',
            content,
            time: new Date().toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            }),
          },
        ],
      }))
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === chatId
            ? {
                ...conversation,
                preview: content,
                time: new Date().toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                }),
              }
            : conversation,
        ),
      )
      if (chatId === pendingChatId.current) setIsTyping(false)
    }

    const handleSocketError = (error) => {
      const chatId = pendingChatId.current
      setMessagesByChat((previous) => ({
        ...previous,
        [chatId]: [
          ...(previous[chatId] ?? []),
          {
            id: `${Date.now()}-error`,
            role: 'error',
            content: error?.message || 'Unable to connect. Please try again.',
            time: new Date().toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            }),
          },
        ],
      }))
      setIsTyping(false)
    }

    socket.on('receive-message', handleReceiveMessage)
    socket.on('connect_error', handleSocketError)
    socket.on('error', handleSocketError)
    socket.on('chat-error', handleSocketError)

    return () => {
      socket.off('receive-message', handleReceiveMessage)
      socket.off('connect_error', handleSocketError)
      socket.off('error', handleSocketError)
      socket.off('chat-error', handleSocketError)
    }
  }, [])

  useEffect(() => {
    const joinConversation = () => {
      socket.emit('join-conversation', { conversationId: selectedChatId })
    }

    socket.on('connect', joinConversation)
    if (socket.connected) joinConversation()

    return () => socket.off('connect', joinConversation)
  }, [selectedChatId])

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    }
  }, [messages, isTyping])

  useEffect(() => {
    if (!notice) return undefined
    const timeoutId = window.setTimeout(() => setNotice(''), 2800)
    return () => window.clearTimeout(timeoutId)
  }, [notice])

  useEffect(() => {
    if (!profileAvatar.startsWith('blob:')) return undefined
    return () => URL.revokeObjectURL(profileAvatar)
  }, [profileAvatar])

  const handleProfilePictureChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setNotice('Choose an image file for your profile picture.')
      return
    }

    setProfileAvatar(URL.createObjectURL(file))
  }

  const handleSend = (event) => {
    event.preventDefault()
    const content = draft.trim()
    if ((!content && !attachmentName) || isTyping) return

    const messageContent = attachmentName
      ? `${content ? `${content} · ` : ''}Attachment: ${attachmentName}`
      : content
    const time = new Date().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })

    setMessagesByChat((previous) => ({
      ...previous,
      [selectedChatId]: [
        ...(previous[selectedChatId] ?? []),
        { id: `${Date.now()}-user`, role: 'user', content: messageContent, time },
      ],
    }))
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === selectedChatId
          ? { ...conversation, preview: messageContent, time }
          : conversation,
      ),
    )
    setDraft('')
    setAttachmentName('')

    if (content) {
      pendingChatId.current = selectedChatId
      setIsTyping(true)
      socket.emit('send-message', {
        message: content,
        recipientId: selectedChat?.email ?? selectedChatId,
        conversationId: selectedChatId,
      })
    }
  }

  const selectConversation = (chatId) => {
    setSelectedChatId(chatId)
    pendingChatId.current = chatId
    setIsMobileSidebarOpen(false)
    setMessageSearch('')
    setNotice('')
  }

  const handleAddUser = (event) => {
    event.preventDefault()
    const enteredValue = newUserNameInput.trim()
    if (!enteredValue) return

    const normalizedValue = enteredValue.toLocaleLowerCase()
    const existingConversation = conversations.find(
      ({ name, email }) =>
        name.toLocaleLowerCase() === normalizedValue ||
        email?.toLocaleLowerCase() === normalizedValue,
    )
    if (existingConversation) {
      selectConversation(existingConversation.id)
      setIsAddUserOpen(false)
      setNewUserNameInput('')
      setNotice(`${existingConversation.name} is already in your conversations.`)
      return
    }

    const id = `conversation-${crypto.randomUUID()}`
    const name = enteredValue.includes('@')
      ? enteredValue.split('@')[0]
      : enteredValue
    const time = new Date().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })
    const newConversation = {
      id,
      name,
      email: enteredValue.includes('@') ? enteredValue : undefined,
      avatar: defaultProfileAvatar,
      online: true,
      preview: `Start a conversation with ${name}`,
      time,
      unread: 0,
    }

    setConversations((previous) => [...previous, newConversation])
    setMessagesByChat((previous) => ({
      ...previous,
      [id]: [
        {
          id: `${id}-welcome`,
          role: 'other',
          content: `You can start chatting with ${name} here.`,
          time,
        },
      ],
    }))
    setSelectedChatId(id)
    pendingChatId.current = id
    setIsMobileSidebarOpen(false)
    setIsAddUserOpen(false)
    setNewUserNameInput('')
    setMessageSearch('')
  }

  const addEmoji = (emoji) => {
    setDraft((value) => `${value}${emoji}`)
    setIsEmojiPickerOpen(false)
  }

  return (
    <div
      className={`min-h-dvh bg-slate-100 text-slate-900 dark:text-slate-100 ${
        isDarkMode ? 'dark' : ''
      } ${
        fontFamily === 'serif'
          ? 'font-serif'
          : fontFamily === 'mono'
            ? 'font-mono'
            : 'font-sans'
      }`}
    >
      <main
        className={`mx-auto flex h-dvh max-w-[1600px] overflow-hidden bg-white shadow-xl shadow-slate-900/5 dark:bg-slate-950 ${
          isDarkMode ? 'dark' : ''
        }`}
      >
        <aside
          className={`absolute inset-y-0 left-0 z-30 flex w-[min(88vw,360px)] flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 md:relative md:w-[320px] md:translate-x-0 lg:w-[360px] ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Conversations"
        >
          <header className="flex h-[76px] items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
            <div className="flex min-w-0 items-center gap-3">
              <input
                ref={profilePictureInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureChange}
              />
              <button
                type="button"
                className="group relative size-11 shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                aria-label="Change profile picture"
                onClick={() => profilePictureInputRef.current?.click()}
              >
                <img
                  src={profileAvatar}
                  alt="Taylor Kim"
                  className="size-11 rounded-full bg-indigo-100 object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/45 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Camera size={17} />
                </span>
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Taylor Kim</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">My account</p>
              </div>
            </div>
            <div className="relative">
              <button
                type="button"
                className={buttonClass}
                aria-label="Open profile and chat preferences"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((open) => !open)}
              >
                <Ellipsis size={21} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-12 z-40 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <button
                    type="button"
                    className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                    onClick={() => {
                      setNotice('Profile settings are ready to customize.')
                      setIsMenuOpen(false)
                    }}
                  >
                    Profile Settings
                  </button>
                  <label className="mt-1 flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
                    <span>Font family</span>
                    <select
                      value={fontFamily}
                      onChange={(event) => setFontFamily(event.target.value)}
                      className="max-w-28 rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-xs dark:border-slate-600"
                    >
                      <option value="sans">Sans</option>
                      <option value="serif">Serif</option>
                      <option value="mono">Mono</option>
                    </select>
                  </label>
                  <label className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
                    <span>Font size</span>
                    <select
                      value={fontSize}
                      onChange={(event) => setFontSize(event.target.value)}
                      className="max-w-28 rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-xs dark:border-slate-600"
                    >
                      <option value="text-xs">Small</option>
                      <option value="text-sm">Normal</option>
                      <option value="text-base">Large</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                    onClick={() => setIsEmojiPickerOpen((open) => !open)}
                  >
                    Emoji preferences
                    <Smile size={16} />
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                    onClick={() => setIsDarkMode((dark) => !dark)}
                  >
                    {isDarkMode ? 'Light theme' : 'Dark theme'}
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                    onClick={() => setIsMuted((muted) => !muted)}
                  >
                    {isMuted ? 'Unmute notifications' : 'Mute notifications'}
                    <span
                      className={`h-5 w-9 rounded-full p-0.5 transition ${
                        isMuted ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`block size-4 rounded-full bg-white transition ${
                          isMuted ? 'translate-x-4' : ''
                        }`}
                      />
                    </span>
                  </button>
                </div>
              )}
            </div>
          </header>

          <div className="px-5 pb-4 pt-5">
            <div className="mb-5 flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight">Messages</h1>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-indigo-600 px-3 text-xs font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                <UserPlus size={16} />
                <span>+ Add User</span>
              </button>
            </div>
            <label className="flex h-11 items-center gap-2.5 rounded-xl bg-slate-100 px-3.5 text-slate-500 focus-within:ring-2 focus-within:ring-indigo-500/30 dark:bg-slate-800 dark:text-slate-300">
              <Search size={17} />
              <span className="sr-only">Search conversations</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversations"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear conversation search"
                  onClick={() => setSearch('')}
                >
                  <X size={15} />
                </button>
              )}
            </label>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4">
            <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
              Recent chats
            </p>
            {visibleConversations.length ? (
              visibleConversations.map((chat) => (
                <button
                  type="button"
                  key={chat.id}
                  onClick={() => selectConversation(chat.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                    selectedChatId === chat.id
                      ? 'bg-indigo-50 dark:bg-indigo-500/15'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="relative shrink-0">
                    <img
                      src={chat.avatar}
                      alt=""
                      className="size-12 rounded-full bg-slate-200 object-cover"
                    />
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{chat.name}</span>
                      <span className="shrink-0 text-[11px] text-slate-500 dark:text-slate-300">{chat.time}</span>
                    </span>
                    <span className="mt-1 flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-slate-500 dark:text-slate-300">
                        {chat.preview}
                      </span>
                      {chat.unread > 0 && (
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white">
                          {chat.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-300">
                No conversations found.
              </p>
            )}
          </div>

          <footer className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-300">Stay connected, wherever you are.</p>
          </footer>
        </aside>

        {isMobileSidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-slate-950/40 md:hidden"
            aria-label="Close conversations"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <section className="flex min-w-0 flex-1 flex-col bg-white dark:bg-slate-950">
          <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 px-3 dark:border-slate-800 sm:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                className={`${buttonClass} md:hidden`}
                aria-label="Open conversations"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu size={21} />
              </button>
              {selectedChat && (
                <>
                  <img
                    src={selectedChat.avatar}
                    alt=""
                    className="size-10 rounded-full bg-slate-200 object-cover sm:size-11"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold sm:text-base">
                      {selectedChat.name}
                    </h2>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-300">
                      <span
                        className={`size-2 rounded-full ${
                          selectedChat.online ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {selectedChat.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </>
              )}
            </div>
            <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Chat actions">
              <button
                type="button"
                className={buttonClass}
                aria-label={messageSearch ? 'Close message search' : 'Search messages'}
                onClick={() => setMessageSearch((value) => (value ? '' : ' '))}
              >
                <Search size={19} />
              </button>
              <button
                type="button"
                className={buttonClass}
                aria-label="Start voice call"
                onClick={() => {
                  setIsVoiceCallActive(false)
                  setIsCallModalOpen(true)
                }}
              >
                <Phone size={19} />
              </button>
              <div className="relative">
                <button
                  type="button"
                  className={buttonClass}
                  aria-label="More chat options"
                  aria-expanded={isChatMenuOpen}
                  onClick={() => setIsChatMenuOpen((open) => !open)}
                >
                  <Ellipsis size={21} />
                </button>
                {isChatMenuOpen && (
                  <div className="absolute right-0 top-12 z-20 w-52 rounded-2xl border border-slate-200 bg-white p-2 text-sm shadow-xl dark:border-slate-700 dark:bg-slate-800">
                    <button
                      type="button"
                      className="w-full rounded-xl px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700"
                      onClick={() => {
                        setIsMuted((muted) => !muted)
                        setIsChatMenuOpen(false)
                      }}
                    >
                      {isMuted ? 'Unmute notifications' : 'Mute notifications'}
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </header>

          {messageSearch !== '' && (
            <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-800 sm:px-6">
              <label className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                <Search size={16} />
                <span className="sr-only">Search messages in this chat</span>
                <input
                  autoFocus
                  value={messageSearch.trimStart()}
                  onChange={(event) => setMessageSearch(event.target.value || ' ')}
                  placeholder="Search messages in this chat"
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-400"
                />
                <button
                  type="button"
                  aria-label="Close message search"
                  onClick={() => setMessageSearch('')}
                >
                  <X size={17} />
                </button>
              </label>
            </div>
          )}

          <div className="relative flex min-h-0 flex-1 flex-col bg-slate-50 dark:bg-slate-950">
            <MessageList
              ref={messageListRef}
              className="flex-1 px-4 py-6 sm:px-8"
              autoScrollToBottom
              scrollBehavior="smooth"
              aria-live="polite"
              aria-label={`Messages with ${selectedChat?.name ?? 'contact'}`}
            >
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
                <div className="py-2 text-center">
                  <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                    Today
                  </span>
                </div>
                {visibleMessages.map((message) => {
                  const isUser = message.role === 'user'
                  const isError = message.role === 'error'
                  const emojiOnly = isEmojiOnlyMessage(message.content)
                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2.5 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isUser && (
                        <img
                          src={selectedChat?.avatar}
                          alt=""
                          className="size-8 shrink-0 rounded-full bg-slate-200 object-cover"
                        />
                      )}
                      <div
                        className={`flex max-w-[85%] flex-col ${
                          isUser ? 'items-end' : 'items-start'
                        }`}
                      >
                        <p
                          className={`${emojiOnly ? 'text-3xl leading-tight' : `${fontSize} leading-6`} whitespace-pre-wrap break-words rounded-2xl px-4 py-3 sm:px-5 ${
                            isUser
                              ? 'rounded-br-md bg-indigo-600 text-white'
                              : isError
                                ? 'rounded-bl-md border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200'
                                : 'rounded-bl-md bg-white text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {message.content}
                        </p>
                        <span className="mt-1 flex items-center gap-1 px-1 text-[10px] text-slate-500 dark:text-slate-300">
                          <time>{message.time}</time>
                          {isUser && <CheckCheck size={13} className="text-indigo-500" />}
                        </span>
                      </div>
                      {isUser && (
                        <img
                          src={profileAvatar}
                          alt="Taylor Kim"
                          className="mb-5 size-8 shrink-0 rounded-full bg-indigo-100 object-cover"
                        />
                      )}
                    </div>
                  )
                })}
                {isTyping && (
                  <div className="flex items-center gap-2.5" role="status">
                    <img
                      src={selectedChat?.avatar}
                      alt=""
                      className="size-8 rounded-full bg-slate-200 object-cover"
                    />
                    <span className="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-xs text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                      {selectedChat?.name} is typing…
                    </span>
                  </div>
                )}
              </div>
            </MessageList>
          </div>

          <footer className="relative shrink-0 border-t border-slate-100 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-950 sm:px-6 sm:py-4">
            {attachmentName && (
              <div className="mx-auto mb-2 flex max-w-3xl items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                <Image size={15} />
                <span className="truncate">{attachmentName}</span>
                <button
                  type="button"
                  aria-label="Remove attachment"
                  onClick={() => setAttachmentName('')}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {isEmojiPickerOpen && (
              <div className="absolute bottom-[calc(100%-8px)] left-4 z-10 flex gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                {quickEmojis.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    className="rounded-lg p-2 text-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                    aria-label={`Add ${emoji} emoji`}
                    onClick={() => addEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={handleSend}
              className="mx-auto flex max-w-3xl items-end gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 sm:gap-2 sm:p-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(event) =>
                  setAttachmentName(event.target.files?.[0]?.name ?? '')
                }
              />
              <button
                type="button"
                className={buttonClass}
                aria-label="Attach a file"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={19} />
              </button>
              <label className="sr-only" htmlFor="chat-draft">
                Write a message
              </label>
              <input
                id="chat-draft"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write a message..."
                className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-400"
              />
              <button
                type="button"
                className={buttonClass}
                aria-label="Open emoji picker"
                aria-expanded={isEmojiPickerOpen}
                onClick={() => setIsEmojiPickerOpen((open) => !open)}
              >
                <Smile size={19} />
              </button>
              <button
                type="button"
                className={`${buttonClass} ${isRecording ? 'text-rose-600 dark:text-rose-400' : ''}`}
                aria-label={isRecording ? 'Stop voice note recording' : 'Record a voice note'}
                aria-pressed={isRecording}
                onClick={() => {
                  setIsRecording((recording) => !recording)
                  setNotice(
                    isRecording
                      ? 'Voice note recording stopped.'
                      : 'Voice note recording is not connected yet.',
                  )
                }}
              >
                <Mic size={19} />
              </button>
              <button
                type="submit"
                disabled={(!draft.trim() && !attachmentName) || isTyping}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </footer>
        </section>
      </main>

      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <button
            type="button"
            className="absolute inset-0 size-full cursor-default"
            aria-label="Close add user dialog"
            onClick={() => {
              setIsAddUserOpen(false)
              setNewUserNameInput('')
            }}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-user-title"
            className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="add-user-title" className="text-lg font-semibold">
                  Add a conversation
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Enter a name or email address to start a chat.
                </p>
              </div>
              <button
                type="button"
                className={buttonClass}
                aria-label="Close add user dialog"
                onClick={() => {
                  setIsAddUserOpen(false)
                  setNewUserNameInput('')
                }}
              >
                <X size={19} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="mt-5">
              <label
                htmlFor="new-user-name"
                className="mb-2 block text-sm font-medium"
              >
                Name or email
              </label>
              <input
                id="new-user-name"
                type="text"
                autoComplete="off"
                autoFocus
                required
                maxLength={120}
                value={newUserNameInput}
                onChange={(event) => setNewUserNameInput(event.target.value)}
                placeholder="e.g. Jamie or jamie@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:placeholder:text-slate-500"
              />
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  onClick={() => {
                    setIsAddUserOpen(false)
                    setNewUserNameInput('')
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Add user
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {isCallModalOpen && selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <button
            type="button"
            className="absolute inset-0 size-full cursor-default"
            aria-label="Close voice call dialog"
            onClick={() => {
              setIsCallModalOpen(false)
              setIsVoiceCallActive(false)
            }}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="voice-call-title"
            className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl dark:bg-slate-900"
          >
            <img
              src={selectedChat.avatar}
              alt=""
              className="mx-auto size-20 rounded-full object-cover"
            />
            <h2 id="voice-call-title" className="mt-4 text-lg font-semibold">
              Voice call with {selectedChat.name}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {isVoiceCallActive
                ? 'Demo call active. Connect a voice service to enable live audio.'
                : 'This is a call preview. Live audio requires a voice calling service.'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                onClick={() => {
                  setIsCallModalOpen(false)
                  setIsVoiceCallActive(false)
                }}
              >
                {isVoiceCallActive ? 'End call' : 'Close'}
              </button>
              {!isVoiceCallActive && (
                <button
                  type="button"
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                  onClick={() => setIsVoiceCallActive(true)}
                >
                  Start demo call
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {notice && (
        <div
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg dark:bg-slate-700"
          role="status"
        >
          {notice}
        </div>
      )}
    </div>
  )
}

export default App
