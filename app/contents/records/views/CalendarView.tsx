import React, { useState, useMemo } from 'react';
import { LeftOutlined, RightOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CalendarView.module.scss';
import type { HealthRecord } from '~/types/record';

interface CalendarViewProps {
  records: HealthRecord[];
  onEdit: (record: HealthRecord) => void;
  onDelete: (id: string) => void;
}

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);

  // Add days from previous month to fill the first week
  const firstDayOfWeek = date.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i);
    days.push(prevDate);
  }

  // Add days of current month
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  // Add days from next month to complete the last week
  const lastDayOfWeek = days[days.length - 1].getDay();
  for (let i = 1; i < 7 - lastDayOfWeek; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

const CalendarView: React.FC<CalendarViewProps> = ({ records, onEdit, onDelete }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const days = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);

  // Group records by date
  const recordsByDate = useMemo(() => {
    const map = new Map<string, HealthRecord[]>();
    records.forEach((record) => {
      const dateKey = new Date(record.date).toDateString();
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(record);
    });
    return map;
  }, [records]);

  const selectedDateRecords = useMemo(() => {
    if (!selectedDate) return [];
    return recordsByDate.get(selectedDate.toDateString()) || [];
  }, [selectedDate, recordsByDate]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.calendarView}>
      <div className={styles.calendarHeader}>
        <div className={styles.monthNav}>
          <Button icon={<LeftOutlined />} onClick={goToPrevMonth} />
          <span className={styles.monthTitle}>{monthName}</span>
          <Button icon={<RightOutlined />} onClick={goToNextMonth} />
        </div>
        <Button onClick={goToToday}>Hari Ini</Button>
      </div>

      <div className={styles.calendarGrid}>
        {WEEKDAYS.map((day) => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}

        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentMonth;
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const dateRecords = recordsByDate.get(date.toDateString()) || [];

          return (
            <div
              onKeyDown={() => setSelectedDate(date)}
              role="button"
              tabIndex={0}
              key={index}
              className={`
                ${styles.dayCell}
                ${!isCurrentMonth ? styles.otherMonth : ''}
                ${isToday ? styles.today : ''}
                ${isSelected ? styles.selected : ''}
              `}
              onClick={() => setSelectedDate(date)}>
              <div className={styles.dayNumber}>{date.getDate()}</div>
              {dateRecords.length > 0 && (
                <div className={styles.recordIndicators}>
                  {Array.from(new Set(dateRecords.map((r) => r.category))).map((category) => (
                    <div key={category} className={`${styles.indicator} ${styles[category]}`} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDate && selectedDateRecords.length > 0 && (
          <motion.div
            className={styles.selectedDateRecords}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}>
            <h3 className={styles.selectedDateTitle}>
              Catatan untuk{' '}
              {selectedDate.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h3>

            {selectedDateRecords.map((record) => (
              <div key={record.id} className={styles.recordCard}>
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
                      {record.symptoms.map((symptom, idx) => (
                        <span key={idx} className={`${styles.symptomChip} ${styles[symptom.severity]}`}>
                          {symptom.name}
                        </span>
                      ))}
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
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedDate && selectedDateRecords.length === 0 && (
        <motion.div
          className={styles.selectedDateRecords}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}>
          <h3 className={styles.selectedDateTitle}>
            Tidak ada catatan untuk{' '}
            {selectedDate.toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </h3>
        </motion.div>
      )}
    </div>
  );
};

export default CalendarView;
