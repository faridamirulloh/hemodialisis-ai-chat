import React, { useState, useMemo, useEffect } from 'react';
import {
  LeftOutlined,
  RightOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Button, Popconfirm, Drawer } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CalendarView.module.scss';
import type { HealthRecord } from '~/types/record';

interface CalendarViewProps {
  records: HealthRecord[];
  onEdit: (record: HealthRecord) => void;
  onDelete: (id: string) => void;
  onAdd?: (date: Date) => void;
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

const CalendarView: React.FC<CalendarViewProps> = ({ records, onEdit, onDelete, onAdd }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);

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

  // All records sorted by date for navigation
  const allRecordsSorted = useMemo(() => {
    return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records]);

  const selectedDateRecords = useMemo(() => {
    if (!selectedDate) return [];
    return recordsByDate.get(selectedDate.toDateString()) || [];
  }, [selectedDate, recordsByDate]);

  const currentRecord = selectedDateRecords[currentRecordIndex] || null;

  // Reset index when selected date changes
  useEffect(() => {
    setCurrentRecordIndex(0);
  }, [selectedDate]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    setDrawerVisible(false);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
    setDrawerVisible(false);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setCurrentRecordIndex(0);
    const dateRecords = recordsByDate.get(date.toDateString()) || [];
    if (dateRecords.length > 0) {
      setDrawerVisible(true);
    }
  };

  const handleAddClick = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAdd) {
      onAdd(date);
    }
  };

  const handleEditClick = (record: HealthRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(record);
  };

  const handleDeleteClick = (id: string) => {
    onDelete(id);
    if (selectedDateRecords.length <= 1) {
      setDrawerVisible(false);
    } else if (currentRecordIndex >= selectedDateRecords.length - 1) {
      setCurrentRecordIndex(Math.max(0, currentRecordIndex - 1));
    }
  };

  const goToPrevRecord = () => {
    if (currentRecordIndex < selectedDateRecords.length - 1) {
      setCurrentRecordIndex(currentRecordIndex + 1);
    } else {
      // Go to previous day with records
      const currentIndex = allRecordsSorted.findIndex((r) => r.id === currentRecord?.id);
      if (currentIndex < allRecordsSorted.length - 1) {
        const prevRecord = allRecordsSorted[currentIndex + 1];
        const prevDate = new Date(prevRecord.date);
        setSelectedDate(prevDate);
        setCurrentRecordIndex(0);
      }
    }
  };

  const goToNextRecord = () => {
    if (currentRecordIndex > 0) {
      setCurrentRecordIndex(currentRecordIndex - 1);
    } else {
      // Go to next day with records
      const currentIndex = allRecordsSorted.findIndex((r) => r.id === currentRecord?.id);
      if (currentIndex > 0) {
        const nextRecord = allRecordsSorted[currentIndex - 1];
        const nextDate = new Date(nextRecord.date);
        setSelectedDate(nextDate);
        const nextDateRecords = recordsByDate.get(nextDate.toDateString()) || [];
        setCurrentRecordIndex(nextDateRecords.length - 1);
      }
    }
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  // Check if can navigate
  const currentGlobalIndex = allRecordsSorted.findIndex((r) => r.id === currentRecord?.id);
  const canGoPrev = currentGlobalIndex < allRecordsSorted.length - 1;
  const canGoNext = currentGlobalIndex > 0;

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
          const isHovered = hoveredDate && isSameDay(date, hoveredDate);
          const dateRecords = recordsByDate.get(date.toDateString()) || [];
          const firstRecord = dateRecords[0];

          return (
            <div
              key={date.toISOString()}
              className={`
                ${styles.dayCell}
                ${!isCurrentMonth ? styles.otherMonth : ''}
                ${isToday ? styles.today : ''}
                ${isSelected ? styles.selected : ''}
                ${dateRecords.length > 0 ? styles.hasRecords : ''}
              `}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
              onKeyDown={(e) => e.key === 'Enter' && handleDateClick(date)}
              role="button"
              tabIndex={0}>
              <div className={styles.dayNumber}>{date.getDate()}</div>

              {/* Record preview details */}
              {dateRecords.length > 0 && firstRecord && (
                <div className={styles.recordPreview}>
                  <div className={styles.previewMood}>
                    {firstRecord.mood === 'good' ? '😊' : firstRecord.mood === 'neutral' ? '😐' : '😔'}
                  </div>
                  {firstRecord.bloodPressure && (
                    <div className={styles.previewBp}>
                      {firstRecord.bloodPressure.systolic}/{firstRecord.bloodPressure.diastolic}
                    </div>
                  )}
                  {dateRecords.length > 1 && <div className={styles.previewCount}>+{dateRecords.length - 1}</div>}
                </div>
              )}

              {/* Category indicators */}
              {dateRecords.length > 0 && (
                <div className={styles.recordIndicators}>
                  {Array.from(new Set(dateRecords.map((r) => r.category))).map((category) => (
                    <div key={category} className={`${styles.indicator} ${styles[category]}`} />
                  ))}
                </div>
              )}

              {/* Hover overlay with actions */}
              <AnimatePresence>
                {isHovered && isCurrentMonth && (
                  <motion.div
                    className={styles.hoverOverlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={(e) => handleAddClick(date, e)}
                      title="Tambah catatan"
                    />
                    {dateRecords.length > 0 && (
                      <>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => handleEditClick(dateRecords[0], e)}
                          title="Edit catatan"
                        />
                        <Popconfirm
                          title="Hapus catatan?"
                          onConfirm={() => handleDeleteClick(dateRecords[0].id)}
                          okText="Hapus"
                          cancelText="Batal">
                          <Button size="small" danger icon={<DeleteOutlined />} title="Hapus catatan" />
                        </Popconfirm>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom Drawer for Record Details */}
      <Drawer
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        placement="bottom"
        height="auto"
        styles={{
          body: { padding: 0 },
          header: { display: 'none' },
        }}
        className={styles.recordDrawer}>
        <div className={styles.drawerContent}>
          {/* Drawer Header */}
          <div className={styles.drawerHeader}>
            <div className={styles.drawerHandle} />
            <div className={styles.drawerTitle}>
              {selectedDate?.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              {selectedDateRecords.length > 1 && (
                <span className={styles.recordCounter}>
                  {currentRecordIndex + 1} / {selectedDateRecords.length}
                </span>
              )}
            </div>
            <Button type="text" icon={<CloseOutlined />} onClick={() => setDrawerVisible(false)} />
          </div>

          {/* Record Content */}
          {currentRecord && (
            <div className={styles.drawerBody}>
              <div className={styles.recordHeader}>
                <span className={styles.recordTime}>
                  {new Date(currentRecord.date).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className={`${styles.categoryBadge} ${styles[currentRecord.category]}`}>
                  {currentRecord.category}
                </span>
              </div>

              {/* Stats */}
              <div className={styles.recordStats}>
                {currentRecord.bloodPressure && (
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Tekanan Darah</span>
                    <span className={styles.statValue}>
                      {currentRecord.bloodPressure.systolic}/{currentRecord.bloodPressure.diastolic} mmHg
                    </span>
                  </div>
                )}
                {currentRecord.weight && (
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Berat Badan</span>
                    <span className={styles.statValue}>{currentRecord.weight} kg</span>
                  </div>
                )}
                {currentRecord.fluidIntake && (
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Cairan</span>
                    <span className={styles.statValue}>{currentRecord.fluidIntake} ml</span>
                  </div>
                )}
                {currentRecord.mood && (
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Mood</span>
                    <span className={styles.statValue}>
                      {currentRecord.mood === 'good'
                        ? '😊 Baik'
                        : currentRecord.mood === 'neutral'
                          ? '😐 Netral'
                          : '😔 Kurang'}
                    </span>
                  </div>
                )}
              </div>

              {/* Symptoms */}
              {currentRecord.symptoms && currentRecord.symptoms.length > 0 && (
                <div className={styles.symptomsSection}>
                  <h4>Gejala</h4>
                  <div className={styles.symptomsList}>
                    {currentRecord.symptoms.map((symptom) => (
                      <span key={symptom.name} className={`${styles.symptomChip} ${styles[symptom.severity]}`}>
                        {symptom.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {currentRecord.note && (
                <div className={styles.noteSection}>
                  <h4>Catatan</h4>
                  <p>{currentRecord.note}</p>
                </div>
              )}

              {/* Diet Notes */}
              {currentRecord.dietNotes && (
                <div className={styles.noteSection}>
                  <h4>Diet</h4>
                  <p>{currentRecord.dietNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Drawer Footer with Navigation */}
          <div className={styles.drawerFooter}>
            <Button icon={<LeftOutlined />} disabled={!canGoPrev} onClick={goToPrevRecord}>
              Sebelumnya
            </Button>
            <div className={styles.footerActions}>
              <Button icon={<EditOutlined />} onClick={() => currentRecord && onEdit(currentRecord)}>
                Edit
              </Button>
              <Popconfirm
                title="Hapus catatan?"
                description="Tindakan ini tidak dapat dibatalkan."
                onConfirm={() => currentRecord && handleDeleteClick(currentRecord.id)}
                okText="Hapus"
                cancelText="Batal">
                <Button danger icon={<DeleteOutlined />}>
                  Hapus
                </Button>
              </Popconfirm>
            </div>
            <Button icon={<RightOutlined />} disabled={!canGoNext} onClick={goToNextRecord}>
              Berikutnya
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default CalendarView;
