import React, { useEffect, useRef, useState } from 'react';
import {
  MessageOutlined,
  SendOutlined,
  HeartOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { v7 as uuidv7 } from 'uuid';
import styles from './ChatRoom.module.scss';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  createdAt: string;
};

const ChatRoom = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem('hd_chat_messages');
      return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    } catch (e) {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem('hd_chat_messages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      const systemMsg: ChatMessage = {
        id: uuidv7(),
        role: 'system',
        text: 'Halo — Saya adalah asisten AI yang suportif bagi pasien hemodialisis. Saya sudah ditraining dengan data jurnal dan paper penelitian tentang Hemodialisis. Saya dapat menjawab pertanyaan seputar dialisis, pengobatan, diet, dan membantu mencatat gejala. Saya TIDAK menggantikan tim medis Anda. Jika Anda mengalami keadaan darurat, hubungi tim medis.',
        createdAt: new Date().toISOString(),
      };
      setMessages([systemMsg]);
    }
  }, []);

  const postMessage = async (text: string) => {
    setError(null);

    const userMsg: ChatMessage = {
      id: uuidv7(),
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversation: messages.concat(userMsg) }),
      });

      if (!resp.ok) throw new Error(`Server responded ${resp.status}`);
      const data = await resp.json();

      const assistantMsg: ChatMessage = {
        id: uuidv7(),
        role: 'assistant',
        text: data.reply ?? 'Maaf — saya tidak mendapat respons.',
        createdAt: new Date().toISOString(),
      };

      setMessages((m) => [...m, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError('Gagal menyambungkan ke server. Periksa koneksi Anda atau coba lagi nanti.');
      const failMsg: ChatMessage = {
        id: uuidv7(),
        role: 'assistant',
        text: 'Saya tidak dapat menjangkau server. Jika ini terus berlanjut, beri tahu tim perawatan Anda atau coba lagi nanti. (Pesan ini disimpan dalam cache lokal.)',
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, failMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Makanan apa yang harus saya hindari setelah dialisis?',
    'Cara mengatasi kulit gatal setelah dialisis',
    'Catat: pusing setelah sesi dialisis',
    'Kapan saya harus menghubungi perawat saya?',
  ];

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    postMessage(trimmed);
  };

  const handleQuick = (q: string) => {
    postMessage(q);
  };

  const clearConversation = () => {
    if (!confirm('Hapus percakapan? Ini akan menghapus riwayat pesan lokal.')) return;
    setMessages([]);
    localStorage.removeItem('hd_chat_messages');
  };

  return (
    <div className={styles.chatContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconCircle}>
            <MessageOutlined style={{ fontSize: 30 }} />
          </div>
          <div>
            <h1 className={styles.title}>Hemodialysis Support Chat</h1>
            <p className={styles.subtitle}>Teman AI khusus Hemodialysis</p>
          </div>
        </div>

        <div className={styles.headerControls}>
          <button onClick={() => setFontSize((s) => Math.min(22, s + 2))}>A+</button>
          <button onClick={() => setFontSize((s) => Math.max(12, s - 2))}>A-</button>
          <button onClick={clearConversation}>Clear</button>
        </div>
      </header>

      <main className={styles.chatBody} style={{ fontSize }}>
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
                <div className={styles.messageText}>{m.text}</div>
                <div className={styles.timestamp}>{new Date(m.createdAt).toLocaleString()}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </main>

      <section className={styles.quickSection}>
        <div className={styles.quickHeader}>
          <div className={styles.quickLeft}>
            <HeartOutlined /> Prompt instant
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
          {quickPrompts.map((q) => (
            <button key={q} onClick={() => handleQuick(q)}>
              {q}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className={styles.inputForm}>
          <label htmlFor="chat-input" className="sr-only">
            Pesan
          </label>
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan tentang pola makan, gejala, atau ketik 'Catat: ...' untuk mencatat gejala"
            disabled={loading}
            aria-label="Message input"
          />

          <button type="submit" disabled={loading}>
            <SendOutlined /> Kirinm
          </button>
        </form>

        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <FileTextOutlined /> Tips: Sampaikan gejala Anda dengan jelas.
          </div>
          <div>
            <span>v1.0</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChatRoom;
