import React, { useEffect, useState, useCallback } from 'react';
import {
  CalendarOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  FilterOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { Button, Segmented, Spin, Empty, message } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import AnalysisPanel from './components/AnalysisPanel';
import FilterPanel from './components/FilterPanel';
import RecordForm from './components/RecordForm';
import styles from './RecordsPage.module.scss';
import CalendarView from './views/CalendarView';
import CardsView from './views/CardsView';
import TimelineView from './views/TimelineView';
import type { HealthRecord, RecordFilter, ViewMode } from '~/types/record';
import { useAuth } from '~/contexts/AuthContext';
import { fetchRecords, deleteRecord } from '~/services/recordServices';

const viewOptions = [
  { value: 'timeline', icon: <UnorderedListOutlined />, label: 'Timeline' },
  { value: 'cards', icon: <AppstoreOutlined />, label: 'Kartu' },
  { value: 'calendar', icon: <CalendarOutlined />, label: 'Kalender' },
];

const RecordsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [filter, setFilter] = useState<RecordFilter>({});
  const [showAnalysis, setShowAnalysis] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRecords(filter, user?.id);
      setRecords(data);
    } catch (error) {
      console.error('Failed to load records:', error);
      message.error('Gagal memuat catatan');
    } finally {
      setLoading(false);
    }
  }, [filter, user?.id]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleAddRecord = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleEditRecord = (record: HealthRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteRecord(id);
      message.success('Catatan berhasil dihapus');
      loadRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
      message.error('Gagal menghapus catatan');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadRecords();
    message.success(editingRecord ? 'Catatan berhasil diperbarui' : 'Catatan berhasil ditambahkan');
  };

  const handleFilterChange = (newFilter: RecordFilter) => {
    setFilter(newFilter);
  };

  const handleClearFilter = () => {
    setFilter({});
  };

  const renderView = () => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <Spin size="large" />
          <p>Memuat catatan...</p>
        </div>
      );
    }

    if (records.length === 0) {
      return (
        <Empty className={styles.emptyState} description="Belum ada catatan" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRecord}>
            Tambah Catatan Pertama
          </Button>
        </Empty>
      );
    }

    switch (viewMode) {
      case 'timeline':
        return <TimelineView records={records} onEdit={handleEditRecord} onDelete={handleDeleteRecord} />;
      case 'cards':
        return <CardsView records={records} onEdit={handleEditRecord} onDelete={handleDeleteRecord} />;
      case 'calendar':
        return <CalendarView records={records} onEdit={handleEditRecord} onDelete={handleDeleteRecord} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.recordsContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/chat')}
            className={styles.backButton}
          />
          <div>
            <h1 className={styles.title}>Riwayat Catatan</h1>
            <p className={styles.subtitle}>Catatan kesehatan hemodialisis Anda</p>
          </div>
        </div>

        <div className={styles.headerControls}>
          <Segmented
            options={viewOptions}
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
            className={styles.viewSwitcher}
          />
          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowFilter(!showFilter)}
            type={showFilter ? 'primary' : 'default'}>
            Filter
          </Button>
          <Button icon={<RobotOutlined />} onClick={() => setShowAnalysis(true)} className={styles.analyzeButton}>
            Analisis AI
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRecord}>
            Tambah Catatan
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <FilterPanel filter={filter} onChange={handleFilterChange} onClear={handleClearFilter} />
          </motion.div>
        )}
      </AnimatePresence>

      <main className={styles.content}>{renderView()}</main>

      <RecordForm visible={showForm} record={editingRecord} onClose={handleFormClose} onSuccess={handleFormSuccess} />

      <AnalysisPanel visible={showAnalysis} onClose={() => setShowAnalysis(false)} />
    </div>
  );
};

export default RecordsPage;
