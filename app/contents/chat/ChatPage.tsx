import React, { useEffect, useRef, useState } from 'react';
import {
  MessageOutlined,
  SendOutlined,
  HeartOutlined,
  ExclamationCircleOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { Button, Input } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { v7 as uuidv7 } from 'uuid';
import styles from './ChatPage.module.scss';
import type { ChatMessage } from '~/types/chat';
import Typewriter from '~/components/chat/Typewriter';
import { QuickPrompts, WelcomeMessage } from '~/constant/chatConstant';
import { postMessage } from '~/services/chatServices';

const ChatPage = () => {
  const [sessionId, setSessionId] = useState<string>(uuidv7());
  const [messages, setMessages] = useState<ChatMessage[]>([WelcomeMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAssistantMessageId, setLastAssistantMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    const reply = await postMessage(newMsg, sessionId);
    setMessages(newMessages.concat(reply));
    setLastAssistantMessageId(reply.id);
    setLoading(false);
  };

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    handlePostMessage(trimmed);
  };

  const handleQuick = (q: string) => {
    handlePostMessage(q);
  };

  const handleNewChat = () => {
    setSessionId(uuidv7());
    setMessages([WelcomeMessage]);
    setLastAssistantMessageId(null);
    setInput('');
  };

  return (
    <div className={styles.chatContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <MessageOutlined className={styles.iconCircle} style={{ fontSize: 30 }} />
          <div>
            <h1 className={styles.title}>Hemodialysis Support Chat</h1>
            <p className={styles.subtitle}>Teman AI khusus Hemodialysis</p>
          </div>
        </div>

        <div className={styles.headerControls}>
          {/* <Button size="large">Riwayat Chat</Button> */}
          <Button size="large" onClick={handleNewChat}>
            Chat Baru
          </Button>
        </div>
      </header>

      <main className={styles.chatBody}>
        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className={m.role === 'user' ? styles.userMessage : styles.otherMessage}>
              <div className={styles.messageBox}>
                <div className={styles.messageRole}>{m.role.toUpperCase()}</div>
                <div className={styles.messageText}>
                  {m.role === 'assistant' && m.id === lastAssistantMessageId ? <Typewriter text={m.text} /> : m.text}
                </div>
                <div className={styles.timestamp}>{new Date(m.createdAt).toLocaleString()}</div>
              </div>
            </motion.div>
          ))}
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
            <HeartOutlined /> Prompt Cepat
          </div>
          {error ? (
            <div className={styles.errorText}>
              <ExclamationCircleOutlined /> {error}
            </div>
          ) : (
            <div className={styles.notice}>Teman AI · Bukan ahli medis</div>
          )}
        </div>

        <div className={styles.quickButtons}>
          {QuickPrompts.map((q) => (
            <Button key={q} onClick={() => handleQuick(q)}>
              {q}
            </Button>
          ))}
        </div>

        <form onSubmit={onSubmit} className={styles.inputForm}>
          <label htmlFor="chat-input">Pesan</label>
          <Input.TextArea
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
    </div>
  );
};

export default ChatPage;
