import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  MessageOutlined,
  SendOutlined,
  HeartOutlined,
  ExclamationCircleOutlined,
  BulbOutlined,
  FastForwardOutlined,
  UserOutlined,
  LogoutOutlined,
  HistoryOutlined,
  CaretRightOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Input, Typography } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router';
import { v7 as uuidv7 } from 'uuid';
import styles from './ChatPage.module.scss';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import type { ChatMessage, ChatSessionSummary } from '~/types/chat';
import ChatHistoryDrawer from '~/components/chat/ChatHistoryDrawer';
import Typewriter from '~/components/chat/Typewriter';
import { QuickPrompts, welcomeMessage } from '~/constant/chatConstant';
import { DEV_MODE } from '~/constant/constant';
import { useAuth } from '~/contexts/AuthContext';
import { cleanChatMessage, formatBoldText, formatMarkdownText, generateKeyEl } from '~/helper/stringHelper';
import { postMessage } from '~/services/chatServices';

const { Title } = Typography;

// Helper to check if session is an analysis session
const checkIsAnalysisSession = (id: string) => id.startsWith('health-analysis-');

// Helper to check if message is an analysis prompt (user message)
const isAnalysisPrompt = (text: string) =>
  text.includes('Kamu adalah asisten kesehatan AI') && text.includes('Format respons dalam JSON');

// Helper to parse analysis content from AI response (may be wrapped in markdown code blocks)
const parseAnalysisContent = (text: string): { analysis: string; recommendations: string[] } | null => {
  try {
    // First, try to extract JSON from markdown code block
    const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonText = jsonBlockMatch ? jsonBlockMatch[1] : text;

    // Clean up potential trailing commas in JSON (common AI mistake)
    const cleanedJson = jsonText.replace(/,(\s*[}\]])/g, '$1');

    const parsed = JSON.parse(cleanedJson);
    if (parsed.analysis) {
      return {
        analysis: parsed.analysis,
        recommendations: parsed.recommendations || [],
      };
    }
  } catch {
    // Not valid JSON
  }
  return null;
};

const ChatPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [sessionId, setSessionId] = useState<string>(uuidv7());
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage(new Date())]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAssistantMessageId, setLastAssistantMessageId] = useState<string | null>(null);
  const [isTypewriterComplete, setIsTypewriterComplete] = useState(false);
  const [isTypewriterSkipped, setIsTypewriterSkipped] = useState(false);
  const [isTestAPI, setTestAPI] = useState(false);
  const [isAnalysisSession, setIsAnalysisSession] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<TextAreaRef | null>(null);

  // Chat history drawer state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySessions, setHistorySessions] = useState<ChatSessionSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch chat history when drawer opens
  const fetchChatHistory = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;

    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/chat-history?userId=${user.id}`);
      if (response.ok) {
        const sessions = await response.json();
        setHistorySessions(sessions);
      }
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (isHistoryOpen) {
      fetchChatHistory();
    }
  }, [isHistoryOpen, fetchChatHistory]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Save chat session when first message is sent
  const saveChatSession = useCallback(
    async (title: string) => {
      if (!isAuthenticated || !user?.id || sessionSaved) return;

      try {
        await fetch('/api/chat-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            sessionId,
            title,
          }),
        });
        setSessionSaved(true);
      } catch (err) {
        console.error('Failed to save chat session:', err);
      }
    },
    [isAuthenticated, user?.id, sessionId, sessionSaved],
  );

  const loadSession = useCallback(async (selectedSessionId: string) => {
    try {
      const response = await fetch(`/api/chat-history?sessionId=${selectedSessionId}`);
      if (response.ok) {
        const loadedMessages: ChatMessage[] = await response.json();
        if (loadedMessages.length > 0) {
          setSessionId(selectedSessionId);
          setMessages(loadedMessages);
          setLastAssistantMessageId(null);
          setIsAnalysisSession(checkIsAnalysisSession(selectedSessionId));
          setIsHistoryOpen(false);
        }
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  }, []);

  const deleteSession = useCallback(
    async (targetSessionId: string) => {
      try {
        const response = await fetch(`/api/chat-history?sessionId=${targetSessionId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove from local state
          setHistorySessions((prev) => prev.filter((s) => s.sessionId !== targetSessionId));

          // If deleting current session, start a new chat
          if (targetSessionId === sessionId) {
            setSessionId(uuidv7());
            setMessages([welcomeMessage(new Date())]);
            setLastAssistantMessageId(null);
            setSessionSaved(false);
          }
        }
      } catch (err) {
        console.error('Failed to delete session:', err);
      }
    },
    [sessionId],
  );

  // Auto scroll during typewriter animation
  const handleTypewriterProgress = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTypewriterComplete = () => {
    setIsTypewriterComplete(true);
    inputRef.current?.focus();
  };

  const handleSkipTypewriter = () => {
    setIsTypewriterSkipped(true);
  };

  const handlePostMessage = async (text: string) => {
    setError(null);

    const newMsg: ChatMessage = {
      id: uuidv7(),
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };

    const newMessages = messages.concat(newMsg);
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setIsTypewriterComplete(false);
    setIsTypewriterSkipped(false);

    // Save session on first user message
    if (!sessionSaved && isAuthenticated) {
      saveChatSession(text.substring(0, 100));
    }
    const reply = await postMessage(newMsg, sessionId, user?.id, isTestAPI);
    setMessages(newMessages.concat(reply));
    setLastAssistantMessageId(reply.id);
    setLoading(false);

    // Auto focus after sending
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    handlePostMessage(trimmed);
  };

  const handleQuick = (message: string) => {
    handlePostMessage(message);
  };

  const handleNewChat = () => {
    setSessionId(uuidv7());
    setMessages([welcomeMessage(new Date())]);
    setLastAssistantMessageId(null);
    setInput('');
    setIsTypewriterComplete(false);
    setIsTypewriterSkipped(false);
    setSessionSaved(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className={styles.chatContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <MessageOutlined className={styles.iconCircle} style={{ fontSize: 30 }} />
          <div>
            <h1 className={styles.title}>Hemodialysis Support Chat</h1>
            <p className={styles.subtitle}>Teman AI Khusus Pasien Hemodialisis</p>
          </div>
        </div>

        <div className={styles.headerControls}>
          {isAuthenticated && (
            <Button size="large" onClick={() => navigate('/records')}>
              Catatan Kesehatan
            </Button>
          )}
          <Button size="large" icon={<HistoryOutlined />} onClick={() => setIsHistoryOpen(true)}>
            Riwayat
          </Button>
          <Button size="large" onClick={handleNewChat}>
            Chat Baru
          </Button>
          {isAuthenticated ? (
            <Button size="large" icon={<LogoutOutlined />} onClick={handleLogout}>
              {user?.name || 'Keluar'}
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="large" type="primary" icon={<UserOutlined />}>
                Masuk
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className={styles.chatBody}>
        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((m) => {
            // Check if this is an analysis session message
            const isUserAnalysisPrompt = isAnalysisSession && m.role === 'user' && isAnalysisPrompt(m.text);
            const analysisContent = isAnalysisSession && m.role === 'assistant' ? parseAnalysisContent(m.text) : null;

            // Format date for analysis prompt display
            const analysisDate = new Date(m.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className={`${m.role === 'user' ? styles.userMessage : styles.otherMessage} ${analysisContent ? styles.analysisMessage : ''} ${isUserAnalysisPrompt ? styles.analysisPrompt : ''}`}>
                <div className={styles.messageBox}>
                  <div className={styles.messageRole}>
                    {analysisContent ? (
                      <>
                        <RobotOutlined /> ANALISIS KESEHATAN AI
                      </>
                    ) : isUserAnalysisPrompt ? (
                      <>
                        <HeartOutlined /> PERMINTAAN ANALISIS
                      </>
                    ) : (
                      m.role.toUpperCase()
                    )}
                  </div>
                  <div className={styles.messageText}>
                    {isUserAnalysisPrompt ? (
                      // Show simplified text for analysis prompt
                      <span>Analisa kesehatan pada tanggal {analysisDate}</span>
                    ) : analysisContent ? (
                      // Render formatted analysis content
                      <div className={styles.analysisContent}>
                        <div className={styles.analysisSection}>
                          <Title level={5}>
                            <RobotOutlined /> Ringkasan Analisis
                          </Title>
                          <div className={styles.analysisText}>{analysisContent.analysis}</div>
                        </div>
                        {analysisContent.recommendations.length > 0 && (
                          <div className={styles.analysisSection}>
                            <Title level={5}>
                              <BulbOutlined /> Rekomendasi
                            </Title>
                            <ul className={styles.recommendationsList}>
                              {analysisContent.recommendations.map((rec, index) => (
                                <motion.li
                                  key={generateKeyEl(rec.slice(0, 20), index)}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}>
                                  <span className={styles.recNumber}>{index + 1}</span>
                                  <span className={styles.recText}>{formatBoldText(rec)}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : m.role === 'assistant' && m.id === lastAssistantMessageId ? (
                      <Typewriter
                        text={m.text}
                        onProgress={handleTypewriterProgress}
                        onComplete={handleTypewriterComplete}
                        isSkipped={isTypewriterSkipped}
                        formatText={formatMarkdownText}
                      />
                    ) : m.role === 'assistant' ? (
                      // Format assistant messages with markdown (bold, bullets)
                      formatMarkdownText(m.text)
                    ) : (
                      // Format user messages and clean up ' || ' at end
                      cleanChatMessage(m.text)
                    )}
                  </div>
                  {m.role === 'assistant' &&
                    m.id === lastAssistantMessageId &&
                    !isTypewriterComplete &&
                    !analysisContent && (
                      <Button
                        size="small"
                        type="text"
                        onClick={handleSkipTypewriter}
                        className={styles.skipButton}
                        icon={<FastForwardOutlined />}>
                        Skip
                      </Button>
                    )}
                  <div className={styles.timestamp}>{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              </motion.div>
            );
          })}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={styles.otherMessage}>
              <div className={styles.typingIndicator}>
                <div className={styles.dot} />
                <div className={styles.dot} />
                <div className={styles.dot} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </main>

      <section className={styles.quickSection}>
        <div className={styles.quickHeader}>
          <div className={styles.quickLeft}>
            <Dropdown
              trigger={['click']}
              placement="topLeft"
              menu={{
                items: QuickPrompts.map((group, groupIndex) => ({
                  key: generateKeyEl(`group-${groupIndex}`, group.name),
                  label: group.name,
                  children: group.items.map((item, i) => ({
                    key: generateKeyEl(`item-${groupIndex}-${i}`),
                    label: item,
                    onClick: () => handleQuick(item),
                  })),
                })),
              }}>
              <Button>
                <HeartOutlined />
                Prompt Cepat
                <CaretRightOutlined />
              </Button>
            </Dropdown>
            {DEV_MODE && (
              <Button
                color={isTestAPI ? 'blue' : 'default'}
                variant={isTestAPI ? 'filled' : 'outlined'}
                onClick={() => setTestAPI(!isTestAPI)}
                style={{ color: isTestAPI ? 'blue' : 'lightgray' }}>
                Test API
              </Button>
            )}
          </div>
          {error ? (
            <div className={styles.errorText}>
              <ExclamationCircleOutlined /> {error}
            </div>
          ) : (
            <div className={styles.notice}>Teman AI · Bukan ahli medis</div>
          )}
        </div>

        <form onSubmit={onSubmit} className={styles.inputForm}>
          <label htmlFor="chat-input">Pesan</label>
          <Input.TextArea
            ref={inputRef}
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={(e) => !e.shiftKey && onSubmit(e)}
            placeholder="Tanyakan tentang pola makan, gejala, atau ketik 'Catat: ...' untuk mencatat gejala"
            disabled={loading}
            aria-label="Message input"
          />

          <Button size="large" htmlType="submit" disabled={loading}>
            <SendOutlined /> Kirim
          </Button>
        </form>

        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <BulbOutlined /> Tips: Sampaikan gejala Anda dengan jelas.
          </div>
          <span>v1.0</span>
        </div>
      </section>

      {/* Chat History Drawer */}
      <ChatHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={historySessions}
        loading={historyLoading}
        isAuthenticated={isAuthenticated}
        currentSessionId={sessionId}
        onSelectSession={loadSession}
        onDeleteSession={deleteSession}
      />
    </div>
  );
};

export default ChatPage;
