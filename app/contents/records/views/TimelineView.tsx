import React from 'react';
import { EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import { motion } from 'framer-motion';
import styles from './TimelineView.module.scss';
import type { HealthRecord } from '~/types/record';

interface TimelineViewProps {
  records: HealthRecord[];
  onEdit: (record: HealthRecord) => void;
  onDelete: (id: string) => void;
}

// Group records by date
function groupByDate(records: HealthRecord[]): Map<string, HealthRecord[]> {
  const groups = new Map<string, HealthRecord[]>();

  records.forEach((record) => {
    const dateKey = new Date(record.date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(record);
  });

  return groups;
}

// Get highest severity from symptoms
function getHighestSeverity(record: HealthRecord): string {
  if (!record.symptoms || record.symptoms.length === 0) return 'low';

  const severityOrder = { critical: 3, medium: 2, low: 1 };
  let highest = 'low';

  record.symptoms.forEach((symptom) => {
    if (severityOrder[symptom.severity] > severityOrder[highest as keyof typeof severityOrder]) {
      highest = symptom.severity;
    }
  });

  return highest;
}

const TimelineView: React.FC<TimelineViewProps> = ({ records, onEdit, onDelete }) => {
  const groupedRecords = groupByDate(records);

  return (
    <div className={styles.timelineView}>
      {Array.from(groupedRecords.entries()).map(([date, dateRecords]) => (
        <motion.div
          key={date}
          className={styles.timelineGroup}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}>
          <div className={styles.dateHeader}>
            <div className={styles.dateIcon}>
              <CalendarOutlined />
            </div>
            <span className={styles.dateText}>{date}</span>
          </div>

          <div className={styles.timelineItems}>
            {dateRecords.map((record) => (
              <motion.div
                key={record.id}
                className={`${styles.timelineItem} ${styles[getHighestSeverity(record)]}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}>
                <div className={styles.recordCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardDate}>
                      {new Date(record.date).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className={`${styles.categoryBadge} ${styles[record.category]}`}>{record.category}</span>
                  </div>

                  <div className={styles.cardContent}>
                    {record.symptoms && record.symptoms.length > 0 && (
                      <div className={styles.symptomsPreview}>
                        {record.symptoms.slice(0, 3).map((symptom, idx) => (
                          <span key={idx} className={`${styles.symptomChip} ${styles[symptom.severity]}`}>
                            {symptom.name}
                          </span>
                        ))}
                        {record.symptoms.length > 3 && (
                          <span className={styles.symptomChip}>+{record.symptoms.length - 3} lainnya</span>
                        )}
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
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TimelineView;
