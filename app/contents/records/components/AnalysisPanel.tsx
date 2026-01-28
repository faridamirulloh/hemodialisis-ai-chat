import React, { useState, useEffect, useCallback } from 'react';
import {
  RobotOutlined,
  BulbOutlined,
  LoadingOutlined,
  CloseOutlined,
  PlusCircleOutlined,
  HistoryOutlined,
  PlayCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Button, Spin, Typography, Empty, Radio, DatePicker, Space, Divider } from 'antd';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AnalysisPanel.module.scss';
import Typewriter from '~/components/chat/Typewriter';
import { useAuth } from '~/contexts/AuthContext';
import { formatBoldText, generateKeyEl } from '~/helper/stringHelper';
import {
  analyzeHealth,
  fetchAnalysisHistory,
  fetchAnalysisSession,
  type HealthAnalysis,
  type AnalysisOptions,
  type AnalysisHistoryItem,
} from '~/services/recordServices';

const { Title, Text } = Typography;

interface AnalysisPanelProps {
  visible: boolean;
  onClose: () => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTypewriterComplete, setIsTypewriterComplete] = useState(true);
  const [isTypewriterSkipped, setIsTypewriterSkipped] = useState(false);

  // History state
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);
  const [currentHistoryDate, setCurrentHistoryDate] = useState<string | null>(null);

  // Date range options
  const [startFrom, setStartFrom] = useState<AnalysisOptions['startFrom']>('beginning');
  const [customStartDate, setCustomStartDate] = useState<dayjs.Dayjs | null>(null);
  const [customEndDate, setCustomEndDate] = useState<dayjs.Dayjs | null>(null);
  const [showDateOptions, setShowDateOptions] = useState(false);

  // Load history when panel opens
  const loadHistory = useCallback(async () => {
    if (!user) return;

    setLoadingHistory(true);
    try {
      const history = await fetchAnalysisHistory(user.id);
      setHistoryItems(history);

      // If there's history, load the most recent one
      if (history.length > 0) {
        setCurrentHistoryIndex(0);
        const latestSession = history[0];
        setCurrentHistoryDate(latestSession.createdAt);
        // Default to start from last analysis for next analysis
        setStartFrom('lastAnalysis');

        // Load the analysis content
        const analysisData = await fetchAnalysisSession(latestSession.sessionId);
        if (analysisData) {
          setAnalysis(analysisData);
          setIsTypewriterComplete(true); // Don't animate for history
        }
      } else {
        // No history - show date options by default
        setShowDateOptions(true);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    if (visible) {
      loadHistory();
    }
  }, [visible, loadHistory]);

  const handleAnalyze = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setCurrentHistoryIndex(-1);
    setCurrentHistoryDate(null);
    try {
      const options: AnalysisOptions = {
        startFrom,
        startDate: startFrom === 'custom' && customStartDate ? customStartDate.toISOString() : undefined,
        endDate: customEndDate ? customEndDate.toISOString() : undefined,
      };
      const result = await analyzeHealth(user.id, options);
      setAnalysis(result);
      setIsTypewriterComplete(false);
      setIsTypewriterSkipped(false);
      // Refresh history after new analysis
      loadHistory();
    } catch (err) {
      setError('Gagal menganalisis data kesehatan. Silakan coba lagi.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateHistory = async (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentHistoryIndex + 1 : currentHistoryIndex - 1;

    if (newIndex < 0 || newIndex >= historyItems.length) return;

    setLoadingHistory(true);
    try {
      const historyItem = historyItems[newIndex];
      const analysisData = await fetchAnalysisSession(historyItem.sessionId);
      if (analysisData) {
        setAnalysis(analysisData);
        setCurrentHistoryIndex(newIndex);
        setCurrentHistoryDate(historyItem.createdAt);
        setIsTypewriterComplete(true);
      }
    } catch (err) {
      console.error('Failed to load history item:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Detect mobile for responsive animation
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!visible) return null;

  // Animation variants based on screen size
  const variants = {
    initial: isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, x: 300 },
    animate: isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 },
    exit: isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, x: 300 },
  };

  const hasHistory = historyItems.length > 0;
  const canGoPrev = currentHistoryIndex < historyItems.length - 1;
  const canGoNext = currentHistoryIndex > 0;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.analysisPanel}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
        <div className={styles.analysisPanelHeader}>
          <div className={styles.analysisPanelTitle}>
            <RobotOutlined className={styles.aiIcon} />
            <Title level={4}>Analisis AI</Title>
          </div>
          <div className={styles.analysisPanelActions}>
            <Button
              type="text"
              icon={<PlusCircleOutlined />}
              onClick={() => setShowDateOptions(!showDateOptions)}
              title="Analisis baru"
            />
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} title="Tutup" />
          </div>
        </div>

        {/* Date Range Options */}
        <AnimatePresence>
          {showDateOptions && (
            <motion.div
              className={styles.dateRangeSection}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}>
              <Divider style={{ margin: '8px 0' }} />
              <div className={styles.dateRangeContent}>
                <Text strong>Rentang Data untuk Analisis Baru:</Text>
                <Space direction="vertical" size="small" style={{ width: '100%', marginTop: 8 }}>
                  <Radio.Group value={startFrom} onChange={(e) => setStartFrom(e.target.value)} size="small">
                    <Space direction="vertical">
                      <Radio value="beginning">Dari awal catatan</Radio>
                      <Radio value="lastAnalysis">Dari analisis terakhir</Radio>
                      <Radio value="custom">Pilih tanggal</Radio>
                    </Space>
                  </Radio.Group>

                  {startFrom === 'custom' && (
                    <Space size="small" style={{ marginTop: 8 }}>
                      <DatePicker
                        placeholder="Mulai dari"
                        value={customStartDate}
                        onChange={setCustomStartDate}
                        size="small"
                        style={{ width: 120 }}
                      />
                      <span>-</span>
                      <DatePicker
                        placeholder="Sampai"
                        value={customEndDate}
                        onChange={setCustomEndDate}
                        size="small"
                        style={{ width: 120 }}
                      />
                    </Space>
                  )}

                  {startFrom !== 'custom' && (
                    <Space size="small" style={{ marginTop: 8 }}>
                      <Text type="secondary">Sampai:</Text>
                      <DatePicker
                        placeholder="Hari ini"
                        value={customEndDate}
                        onChange={setCustomEndDate}
                        size="small"
                        style={{ width: 130 }}
                      />
                    </Space>
                  )}

                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={handleAnalyze}
                    loading={loading}
                    style={{ marginTop: 12 }}>
                    Mulai Analisis Baru
                  </Button>
                </Space>
              </div>
              <Divider style={{ margin: '8px 0' }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Navigation */}
        {hasHistory && currentHistoryDate && (
          <div className={styles.historyNavigation}>
            <Button
              type="text"
              icon={<LeftOutlined />}
              disabled={!canGoPrev || loadingHistory}
              onClick={() => navigateHistory('prev')}
              size="small"
            />
            <div className={styles.historyInfo}>
              <HistoryOutlined />
              <Text type="secondary">
                {dayjs(currentHistoryDate).format('DD MMM YYYY, HH:mm')}
                {currentHistoryIndex === 0 && ' (Terbaru)'}
              </Text>
            </div>
            <Button
              type="text"
              icon={<RightOutlined />}
              disabled={!canGoNext || loadingHistory}
              onClick={() => navigateHistory('next')}
              size="small"
            />
          </div>
        )}

        <div className={styles.analysisPanelContent}>
          {loading || loadingHistory ? (
            <div className={styles.analysisLoading}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
              <Text type="secondary">
                {loading ? 'Menganalisis data kesehatan Anda...' : 'Memuat riwayat analisis...'}
              </Text>
            </div>
          ) : error ? (
            <div className={styles.analysisError}>
              <Empty description={error} image={Empty.PRESENTED_IMAGE_SIMPLE} />
              <Button type="primary" onClick={handleAnalyze}>
                Coba Lagi
              </Button>
            </div>
          ) : analysis ? (
            <>
              <div className={styles.analysisSection}>
                <div className={styles.analysisSectionHeader}>
                  <Title level={5}>
                    <RobotOutlined /> Ringkasan Analisis
                  </Title>
                </div>
                <div className={styles.analysisText}>
                  {isTypewriterComplete ? (
                    analysis.analysis || 'Tidak ada analisis tersedia.'
                  ) : (
                    <Typewriter
                      text={analysis.analysis || 'Tidak ada analisis tersedia.'}
                      speed={15}
                      isSkipped={isTypewriterSkipped}
                      onComplete={() => setIsTypewriterComplete(true)}
                    />
                  )}
                </div>
              </div>

              {analysis.recommendations && analysis.recommendations.length > 0 && isTypewriterComplete && (
                <div className={styles.analysisSection}>
                  <Title level={5}>
                    <BulbOutlined /> Rekomendasi Langkah Selanjutnya
                  </Title>
                  <ul className={styles.recommendationsList}>
                    {analysis.recommendations.map((rec, index) => (
                      <motion.li
                        key={generateKeyEl(rec.slice(0, 20), index)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 }}>
                        <span className={styles.recNumber}>{index + 1}</span>
                        <span className={styles.recText}>{formatBoldText(rec)}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className={styles.noAnalysis}>
              <Empty
                image={<RobotOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
                description={
                  <div>
                    <Text>Belum ada riwayat analisis.</Text>
                    <br />
                    <Text type="secondary">Pilih rentang tanggal dan mulai analisis pertama Anda.</Text>
                  </div>
                }
              />
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={() => setShowDateOptions(true)}
                style={{ marginTop: 16 }}>
                Mulai Analisis
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnalysisPanel;
