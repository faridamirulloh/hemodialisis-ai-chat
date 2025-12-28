import React, { useState, useEffect } from 'react';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Modal, Form, Input, DatePicker, Select, InputNumber, Button, Row, Col, Divider, Tag } from 'antd';
import dayjs from 'dayjs';
import styles from './RecordForm.module.scss';
import { createRecord, updateRecord } from '~/services/recordServices';
import {
  type HealthRecord,
  type Symptom,
  type LabResult,
  type SeverityLevel,
  type MoodType,
  LAB_TEST_CATEGORIES,
  COMMON_SYMPTOMS,
} from '~/types/record';

interface RecordFormProps {
  visible: boolean;
  record: HealthRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

const { TextArea } = Input;

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'Umum' },
  { value: 'dialysis', label: 'Dialisis' },
  { value: 'lab', label: 'Lab' },
  { value: 'symptoms', label: 'Gejala' },
];

const DIALYSIS_TYPE_OPTIONS = [
  { value: 'HD', label: 'Hemodialisis (HD)' },
  { value: 'PD', label: 'Peritoneal Dialisis (PD)' },
  { value: 'HDF', label: 'Hemodiafiltration (HDF)' },
];

const ACCESS_TYPE_OPTIONS = [
  { value: 'AVF', label: 'Arteriovenous Fistula (AVF)' },
  { value: 'AVG', label: 'Arteriovenous Graft (AVG)' },
  { value: 'Catheter', label: 'Catheter' },
];

const ALL_LAB_TESTS = Object.values(LAB_TEST_CATEGORIES).flat();

const RecordForm: React.FC<RecordFormProps> = ({ visible, record, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();
  const [customSymptom, setCustomSymptom] = useState('');

  useEffect(() => {
    if (visible) {
      if (record) {
        form.setFieldsValue({
          ...record,
          date: record.date ? dayjs(record.date) : dayjs(),
          'bloodPressure.systolic': record.bloodPressure?.systolic,
          'bloodPressure.diastolic': record.bloodPressure?.diastolic,
          'bloodPressure.pulse': record.bloodPressure?.pulse,
          'dialysisSchedule.type': record.dialysisSchedule?.type,
          'dialysisSchedule.duration': record.dialysisSchedule?.duration,
          'dialysisSchedule.location': record.dialysisSchedule?.location,
          'dialysisSchedule.accessType': record.dialysisSchedule?.accessType,
        });
        setSelectedSymptoms(record.symptoms || []);
        setLabResults(record.labResults || []);
        setSelectedMood(record.mood);
      } else {
        form.resetFields();
        form.setFieldsValue({ date: dayjs(), category: 'general' });
        setSelectedSymptoms([]);
        setLabResults([]);
        setSelectedMood(undefined);
      }
    }
  }, [visible, record, form]);

  const handleSymptomToggle = (symptomName: string) => {
    const existing = selectedSymptoms.find((s) => s.name === symptomName);
    if (existing) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s.name !== symptomName));
    } else {
      setSelectedSymptoms([...selectedSymptoms, { name: symptomName, severity: 'low' }]);
    }
  };

  const handleAddCustomSymptom = () => {
    const trimmed = customSymptom.trim();
    if (trimmed && !selectedSymptoms.find((s) => s.name === trimmed)) {
      setSelectedSymptoms([...selectedSymptoms, { name: trimmed, severity: 'low' }]);
      setCustomSymptom('');
    }
  };

  const handleRemoveSymptom = (symptomName: string) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s.name !== symptomName));
  };

  const handleSymptomSeverityChange = (symptomName: string, severity: SeverityLevel) => {
    setSelectedSymptoms(selectedSymptoms.map((s) => (s.name === symptomName ? { ...s, severity } : s)));
  };

  const addLabResult = () => {
    setLabResults([...labResults, { testName: '', value: 0, unit: '', normalRange: '', flag: 'normal' }]);
  };

  const removeLabResult = (index: number) => {
    setLabResults(labResults.filter((_, i) => i !== index));
  };

  const updateLabResult = (index: number, field: keyof LabResult, value: unknown) => {
    setLabResults(labResults.map((result, i) => (i === index ? { ...result, [field]: value } : result)));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const bloodPressure =
        values['bloodPressure.systolic'] || values['bloodPressure.diastolic']
          ? {
              systolic: values['bloodPressure.systolic'],
              diastolic: values['bloodPressure.diastolic'],
              pulse: values['bloodPressure.pulse'],
            }
          : undefined;

      const dialysisSchedule =
        values['dialysisSchedule.type'] || values['dialysisSchedule.duration']
          ? {
              date: values.date?.toISOString(),
              type: values['dialysisSchedule.type'],
              duration: values['dialysisSchedule.duration'],
              location: values['dialysisSchedule.location'],
              accessType: values['dialysisSchedule.accessType'],
            }
          : undefined;

      const data: Partial<HealthRecord> = {
        date: values.date?.toISOString() || new Date().toISOString(),
        category: values.category,
        symptoms: selectedSymptoms,
        labResults: labResults.filter((r) => r.testName),
        bloodPressure,
        dialysisSchedule,
        weight: values.weight,
        fluidIntake: values.fluidIntake,
        dietNotes: values.dietNotes,
        note: values.note,
        mood: selectedMood,
        // TODO: Get userId from auth context
        userId: 'demo-user',
      };

      if (record) {
        await updateRecord(record.id, data);
      } else {
        await createRecord(data);
      }

      onSuccess();
    } catch (error) {
      console.error('Form validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title={record ? 'Edit Catatan' : 'Tambah Catatan Baru'}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={record ? 'Simpan' : 'Tambah'}
      cancelText="Batal"
      confirmLoading={loading}
      width={720}
      className={styles.recordFormModal}
      destroyOnHidden>
      <div className={styles.formContent}>
        <Form form={form} layout="vertical" autoComplete="off">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="Tanggal & Waktu" rules={[{ required: true, message: 'Pilih tanggal' }]}>
                <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="Kategori" rules={[{ required: true, message: 'Pilih kategori' }]}>
                <Select options={CATEGORY_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" plain>
            Gejala
          </Divider>

          <div className={styles.symptomsList}>
            {COMMON_SYMPTOMS.map((symptom) => {
              const selected = selectedSymptoms.find((s) => s.name === symptom);
              return (
                <Tag
                  key={symptom}
                  className={`${styles.symptomTag} ${selected ? styles.selected : ''} ${
                    selected ? styles[selected.severity] : ''
                  }`}
                  onClick={() => handleSymptomToggle(symptom)}>
                  {symptom}
                  {selected && (
                    <Select
                      size="small"
                      value={selected.severity}
                      onChange={(v) => handleSymptomSeverityChange(symptom, v)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: 80, marginLeft: 4 }}
                      options={[
                        { value: 'low', label: 'Ringan' },
                        { value: 'medium', label: 'Sedang' },
                        { value: 'critical', label: 'Kritis' },
                      ]}
                    />
                  )}
                </Tag>
              );
            })}
            {/* Custom symptoms (not in predefined list) */}
            {selectedSymptoms
              .filter((s) => !COMMON_SYMPTOMS.includes(s.name as (typeof COMMON_SYMPTOMS)[number]))
              .map((symptom) => (
                <Tag
                  key={symptom.name}
                  className={`${styles.symptomTag} ${styles.selected} ${styles[symptom.severity]}`}
                  closable
                  onClose={() => handleRemoveSymptom(symptom.name)}>
                  {symptom.name}
                  <Select
                    size="small"
                    value={symptom.severity}
                    onChange={(v) => handleSymptomSeverityChange(symptom.name, v)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: 80, marginLeft: 4 }}
                    options={[
                      { value: 'low', label: 'Ringan' },
                      { value: 'medium', label: 'Sedang' },
                      { value: 'critical', label: 'Kritis' },
                    ]}
                  />
                </Tag>
              ))}
          </div>

          <Row gutter={8} style={{ marginTop: 12 }}>
            <Col flex="auto">
              <Input
                placeholder="Tambah gejala lainnya..."
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                onPressEnter={handleAddCustomSymptom}
              />
            </Col>
            <Col>
              <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddCustomSymptom}>
                Tambah
              </Button>
            </Col>
          </Row>

          <Divider titlePlacement="left" plain>
            Tekanan Darah
          </Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="bloodPressure.systolic" label="Sistolik (mmHg)">
                <InputNumber min={0} max={300} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bloodPressure.diastolic" label="Diastolik (mmHg)">
                <InputNumber min={0} max={200} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bloodPressure.pulse" label="Denyut Nadi (bpm)">
                <InputNumber min={0} max={250} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" plain>
            Fisik
          </Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="weight" label="Berat Badan (kg)">
                <InputNumber min={0} max={300} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fluidIntake" label="Asupan Cairan (ml)">
                <InputNumber min={0} max={10000} step={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" plain>
            Jadwal Dialisis
          </Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="dialysisSchedule.type" label="Jenis Dialisis">
                <Select options={DIALYSIS_TYPE_OPTIONS} allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dialysisSchedule.duration" label="Durasi (menit)">
                <InputNumber min={0} max={600} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dialysisSchedule.accessType" label="Akses">
                <Select options={ACCESS_TYPE_OPTIONS} allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="dialysisSchedule.location" label="Lokasi">
            <Input placeholder="Nama rumah sakit atau klinik" />
          </Form.Item>

          <Divider titlePlacement="left" plain>
            Hasil Lab
          </Divider>

          {labResults.map((result, index) => (
            <Row key={index} gutter={8} align="middle" style={{ marginBottom: 8 }}>
              <Col span={7}>
                <Select
                  placeholder="Nama Tes"
                  value={result.testName || undefined}
                  onChange={(v) => updateLabResult(index, 'testName', v)}
                  showSearch
                  options={ALL_LAB_TESTS.map((t) => ({ value: t, label: t }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={5}>
                <InputNumber
                  placeholder="Nilai"
                  value={result.value}
                  onChange={(v) => updateLabResult(index, 'value', v || 0)}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={4}>
                <Input
                  placeholder="Unit"
                  value={result.unit}
                  onChange={(e) => updateLabResult(index, 'unit', e.target.value)}
                />
              </Col>
              <Col span={5}>
                <Input
                  placeholder="Normal Range"
                  value={result.normalRange}
                  onChange={(e) => updateLabResult(index, 'normalRange', e.target.value)}
                />
              </Col>
              <Col span={3}>
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeLabResult(index)} />
              </Col>
            </Row>
          ))}

          <Button type="dashed" onClick={addLabResult} block icon={<PlusOutlined />}>
            Tambah Hasil Lab
          </Button>

          <Divider titlePlacement="left" plain>
            Mood & Catatan
          </Divider>

          <Form.Item label="Mood">
            <div className={styles.moodSelector}>
              {(['good', 'neutral', 'bad'] as MoodType[]).map((mood) => (
                <div
                  onKeyDown={() => setSelectedMood(mood)}
                  role="button"
                  tabIndex={0}
                  key={mood}
                  className={`${styles.moodOption} ${selectedMood === mood ? styles.selected : ''}`}
                  onClick={() => setSelectedMood(mood)}>
                  <span className={styles.moodIcon}>{mood === 'good' ? '😊' : mood === 'neutral' ? '😐' : '😔'}</span>
                  <span className={styles.moodLabel}>
                    {mood === 'good' ? 'Baik' : mood === 'neutral' ? 'Biasa' : 'Buruk'}
                  </span>
                </div>
              ))}
            </div>
          </Form.Item>

          <Form.Item name="dietNotes" label="Catatan Diet">
            <TextArea rows={2} placeholder="Makanan dan minuman yang dikonsumsi hari ini..." />
          </Form.Item>

          <Form.Item name="note" label="Catatan Umum">
            <TextArea rows={3} placeholder="Catatan lainnya..." />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default RecordForm;
