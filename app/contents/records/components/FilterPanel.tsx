import React from 'react';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { Input, DatePicker, Select, Button, Typography } from 'antd';
import styles from './FilterPanel.module.scss';
import type { RecordFilter, RecordCategory } from '~/types/record';

interface FilterPanelProps {
  filter: RecordFilter;
  onChange: (filter: RecordFilter) => void;
  onClear: () => void;
}

const { RangePicker } = DatePicker;

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'Umum' },
  { value: 'dialysis', label: 'Dialisis' },
  { value: 'lab', label: 'Lab' },
  { value: 'symptoms', label: 'Gejala' },
];

const FilterPanel: React.FC<FilterPanelProps> = ({ filter, onChange, onClear }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filter, searchTerm: e.target.value || undefined });
  };

  const handleDateRangeChange = (dates: [unknown, unknown] | null) => {
    if (dates && dates[0] && dates[1]) {
      onChange({
        ...filter,
        dateFrom: (dates[0] as { toISOString: () => string }).toISOString(),
        dateTo: (dates[1] as { toISOString: () => string }).toISOString(),
      });
    } else {
      onChange({
        ...filter,
        dateFrom: undefined,
        dateTo: undefined,
      });
    }
  };

  const handleCategoryChange = (value: RecordCategory | undefined) => {
    onChange({ ...filter, category: value });
  };

  const hasActiveFilters = filter.searchTerm || filter.dateFrom || filter.dateTo || filter.category;

  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterRow}>
        <div className={styles.filterItem}>
          <Typography.Text>Cari</Typography.Text>
          <Input
            placeholder="Cari catatan..."
            prefix={<SearchOutlined />}
            value={filter.searchTerm || ''}
            onChange={handleSearchChange}
            allowClear
          />
        </div>

        <div className={styles.filterItem}>
          <Typography.Text>Rentang Tanggal</Typography.Text>
          <RangePicker onChange={handleDateRangeChange} placeholder={['Dari', 'Sampai']} format="DD/MM/YYYY" />
        </div>

        <div className={styles.filterItem}>
          <Typography.Text>Kategori</Typography.Text>
          <Select
            placeholder="Semua kategori"
            options={CATEGORY_OPTIONS}
            value={filter.category}
            onChange={handleCategoryChange}
            allowClear
            style={{ width: '100%' }}
          />
        </div>

        <div className={styles.filterActions}>
          {hasActiveFilters && (
            <Button icon={<ClearOutlined />} onClick={onClear}>
              Hapus Filter
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
