import React, { useState } from 'react';
import { ArrowLeftOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Form, Input, Button, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router';
import styles from './AuthPage.module.scss';
import { useAuth } from '~/contexts/AuthContext';

const { Title, Text } = Typography;

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { name?: string; email: string; password: string }) => {
    setLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        message.success('Login berhasil!');
        navigate('/');
      } else {
        message.error('Login gagal. Coba lagi.');
      }
    } catch {
      message.error('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
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
            {mode === 'signup' ? 'Daftar' : 'Login'}
          </Button>

          <div className={styles.altLink}>
            {mode === 'signup' ? (
              <Text>
                Sudah memiliki akun?{' '}
                <Link to="#" onClick={() => setMode('login')}>
                  Login
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
