import React, { useState, useEffect } from 'react';
import { ArrowLeftOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Form, Input, Button, Typography, message } from 'antd';
import { Link, useSubmit, useActionData, useNavigation } from 'react-router';
import styles from './AuthPage.module.scss';

const { Title, Text } = Typography;

const AuthPage: React.FC = () => {
  const submit = useSubmit();
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const loading = navigation.state === 'submitting';

  // Show error message from server
  useEffect(() => {
    if (actionData?.error) {
      message.error(actionData.error);
    }
  }, [actionData]);

  const handleSubmit = async (values: { name?: string; email: string; password: string }) => {
    const formData = new FormData();
    formData.append('mode', mode);
    formData.append('email', values.email);
    formData.append('password', values.password);
    if (mode === 'signup') {
      formData.append('name', values.name || '');
    }
    submit(formData, { method: 'post' });
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <Link to="/" className={styles.backButton}>
          <Button type="text" size="large" icon={<ArrowLeftOutlined style={{ fontSize: 24 }} />} />
        </Link>

        <Title level={2} className={styles.authTitle}>
          {mode === 'signup' ? 'Buat Akun' : 'Login'}
        </Title>

        <Form name="authForm" layout="vertical" onFinish={handleSubmit} className={styles.authForm}>
          {mode === 'signup' && (
            <Form.Item name="name" label="Nama" rules={[{ required: true, message: 'Masukkan nama' }]}>
              <Input
                variant="borderless"
                prefix={<UserOutlined style={{ paddingRight: 4 }} />}
                placeholder="Nama Lengkap"
              />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Masukkan alamat email yang valid' }]}>
            <Input
              variant="borderless"
              prefix={<MailOutlined style={{ paddingRight: 4 }} />}
              placeholder="Alamat Email"
            />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Masukkan password' }]}>
            <Input.Password
              variant="borderless"
              prefix={<LockOutlined style={{ paddingRight: 4 }} />}
              placeholder="Password"
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            {mode === 'signup' ? 'Daftar' : 'Masuk'}
          </Button>

          <div className={styles.altLink}>
            {mode === 'signup' ? (
              <Text>
                Sudah memiliki akun?{' '}
                <Link to="#" onClick={() => setMode('login')}>
                  Masuk
                </Link>
              </Text>
            ) : (
              <Text>
                Belum memiliki akun?{' '}
                <Link to="#" onClick={() => setMode('signup')}>
                  Daftar
                </Link>
              </Text>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AuthPage;
