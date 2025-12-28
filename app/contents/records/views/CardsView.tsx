import React, { useState } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CardsView.module.scss';
import type { HealthRecord, RecordCategory } from '~/types/record';

interface CardsViewProps {
  records: HealthRecord[];
  onEdit: (record: HealthRecord) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES: { key: RecordCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'general', label: 'Umum' },
  { key: 'dialysis', label: 'Dialisis' },
  { key: 'lab', label: 'Lab' },
  { key: 'symptoms', label: 'Gejala' },
];

const CardsView: React.FC<CardsViewProps> = ({ records, onEdit, onDelete }) => {
  const [activeCategory, setActiveCategory] = useState<RecordCategory | 'all'>('all');

  const filteredRecords =
    activeCategory === 'all' ? records : records.filter((record) => record.category === activeCategory);

  return (
    <div className={styles.cardsView}>
      <div className={styles.categoryTabs}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`${styles.categoryTab} ${activeCategory === cat.key ? styles.active : ''}`}
            onClick={() => setActiveCategory(cat.key)}>
            {cat.label}
            <span style={{ marginLeft: 4, opacity: 0.7 }}>
              ({cat.key === 'all' ? records.length : records.filter((r) => r.category === cat.key).length})
            </span>
          </button>
        ))}
      </div>

      <div className={styles.cardsGrid}>
        <AnimatePresence mode="popLayout">
          {filteredRecords.map((record) => (
            <motion.div
              key={record.id}
              className={styles.recordCard}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              layout>
              <div className={styles.cardHeader}>
                <span className={styles.cardDate}>
                  {new Date(record.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className={`${styles.categoryBadge} ${styles[record.category]}`}>{record.category}</span>
              </div>

              <div className={styles.cardContent}>
                {record.symptoms && record.symptoms.length > 0 && (
                  <div className={styles.symptomsPreview}>
                    {record.symptoms.map((symptom, idx) => (
                      <span key={idx} className={`${styles.symptomChip} ${styles[symptom.severity]}`}>
                        {symptom.name}
                      </span>
                    ))}
                  </div>
                )}

                {record.dialysisSchedule && (
                  <div className={styles.cardStats}>
                    <span className={styles.stat}>
                      🏥 {record.dialysisSchedule.type} - {record.dialysisSchedule.duration} menit
                    </span>
                  </div>
                )}

                {record.labResults && record.labResults.length > 0 && (
                  <div className={styles.cardStats}>
                    <span className={styles.stat}>🧪 {record.labResults.length} hasil lab</span>
                  </div>
                )}

                {record.note && <p className={styles.cardNote}>{record.note}</p>}

                <div className={styles.cardStats}>
                  {record.bloodPressure && (
                    <span className={styles.stat}>
                      🩺 {record.bloodPressure.systolic}/{record.bloodPressure.diastolic}
                    </span>
                  )}
                  {record.weight && <span className={styles.stat}>⚖️ {record.weight} kg</span>}
                  {record.fluidIntake && <span className={styles.stat}>💧 {record.fluidIntake} ml</span>}
                  {record.mood && (
                    <span className={styles.stat}>
                      {record.mood === 'good' ? '😊' : record.mood === 'neutral' ? '😐' : '😔'}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.cardActions}>
                <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)}>
                  Edit
                </Button>
                <Popconfirm
                  title="Hapus catatan?"
                  description="Tindakan ini tidak dapat dibatalkan."
                  onConfirm={() => onDelete(record.id)}
                  okText="Hapus"
                  cancelText="Batal">
                  <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                    Hapus
                  </Button>
                </Popconfirm>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CardsView;
