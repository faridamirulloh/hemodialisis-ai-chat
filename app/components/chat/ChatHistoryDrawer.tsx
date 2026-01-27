import React, { useEffect, useCallback } from 'react';
import { CloseOutlined, DeleteOutlined, HistoryOutlined, MessageOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Spin } from 'antd';
import { Link } from 'react-router';
import styles from './ChatHistoryDrawer.module.scss';
import type { ChatSessionSummary } from '~/types/chat';

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSessionSummary[];
  loading: boolean;
  isAuthenticated: boolean;
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession?: (sessionId: string) => void;
}

const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  loading,
  isAuthenticated,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
}) => {
  // Handle outside click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.drawerOverlay} ${isOpen ? styles.open : ''}`}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2>
            <HistoryOutlined /> Riwayat Chat
          </h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Tutup riwayat">
            <CloseOutlined />
          </button>
        </div>

        <div className={styles.content}>
          {!isAuthenticated ? (
            <div className={styles.loginPrompt}>
              <p>Masuk untuk melihat riwayat chat Anda</p>
              <Link to="/auth">
                <Button type="primary">Masuk</Button>
              </Link>
            </div>
          ) : loading ? (
            <div className={styles.loading}>
              <Spin size="large" />
            </div>
          ) : sessions.length === 0 ? (
            <div className={styles.emptyState}>
              <MessageOutlined className={styles.emptyIcon} />
              <p>Belum ada riwayat chat</p>
            </div>
          ) : (
            <div className={styles.sessionList}>
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`${styles.sessionItem} ${currentSessionId === session.sessionId ? styles.active : ''}`}>
                  <div
                    className={styles.sessionContent}
                    onClick={() => onSelectSession(session.sessionId)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && onSelectSession(session.sessionId)}>
                    <div className={styles.sessionTitle}>{session.title || 'Chat tanpa judul'}</div>
                    <div className={styles.sessionDate}>{formatDate(session.createdAt)}</div>
                  </div>
                  {onDeleteSession && (
                    <Popconfirm
                      title="Hapus riwayat chat?"
                      description="Tindakan ini tidak dapat dibatalkan."
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        onDeleteSession(session.sessionId);
                      }}
                      onCancel={(e) => e?.stopPropagation()}
                      okText="Hapus"
                      cancelText="Batal"
                      okButtonProps={{ danger: true }}>
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        className={styles.deleteButton}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Hapus chat"
                      />
                    </Popconfirm>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatHistoryDrawer;
