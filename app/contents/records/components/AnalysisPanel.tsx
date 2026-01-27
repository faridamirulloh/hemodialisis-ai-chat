import React, { useState, useEffect, useRef } from 'react';
import {
  RobotOutlined,
  BulbOutlined,
  LoadingOutlined,
  CloseOutlined,
  ReloadOutlined,
  FastForwardOutlined,
} from '@ant-design/icons';
import { Button, Spin, Typography, Empty } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AnalysisPanel.module.scss';
import Typewriter from '~/components/chat/Typewriter';
import { useAuth } from '~/contexts/AuthContext';
import { formatBoldText, generateKeyEl } from '~/helper/stringHelper';
import { analyzeHealth, type HealthAnalysis } from '~/services/recordServices';

const { Title, Text } = Typography;

interface AnalysisPanelProps {
  visible: boolean;
  onClose: () => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTypewriterComplete, setIsTypewriterComplete] = useState(false);
  const [isTypewriterSkipped, setIsTypewriterSkipped] = useState(false);
  const hasInitialLoad = useRef(false);

  const handleAnalyze = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const result = await analyzeHealth(user.id);
      setAnalysis(result);
      setIsTypewriterComplete(false);
      setIsTypewriterSkipped(false);
    } catch (err) {
      setError('Gagal menganalisis data kesehatan. Silakan coba lagi.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-analyze when panel is opened for the first time
  useEffect(() => {
    if (visible && !hasInitialLoad.current) {
      hasInitialLoad.current = true;
      handleAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

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
              icon={<ReloadOutlined spin={loading} />}
              onClick={handleAnalyze}
              disabled={loading}
              title="Refresh analisis"
            />
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} title="Tutup" />
          </div>
        </div>

        <div className={styles.analysisPanelContent}>
          {loading ? (
            <div className={styles.analysisLoading}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
              <Text type="secondary">Menganalisis data kesehatan Anda...</Text>
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
                  {!isTypewriterComplete && (
                    <Button
                      size="small"
                      type="text"
                      icon={<FastForwardOutlined />}
                      onClick={() => setIsTypewriterSkipped(true)}>
                      Skip
                    </Button>
                  )}
                </div>
                <div className={styles.analysisText}>
                  <Typewriter
                    text={analysis.analysis || 'Tidak ada analisis tersedia.'}
                    speed={15}
                    isSkipped={isTypewriterSkipped}
                    onComplete={() => setIsTypewriterComplete(true)}
                  />
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
            <Empty description="Klik tombol analisis untuk memulai" />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnalysisPanel;
