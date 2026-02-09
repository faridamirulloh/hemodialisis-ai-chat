import React, { useState, useEffect } from 'react';
import { ArrowLeftOutlined, LockOutlined, MailOutlined, UserOutlined, KeyOutlined } from '@ant-design/icons';
import { Form, Input, Button, Typography, message } from 'antd';
import { Link, useSubmit, useActionData, useNavigation } from 'react-router';
import styles from './AuthPage.module.scss';

const { Title, Text } = Typography;

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

const AuthPage: React.FC = () => {
  const submit = useSubmit();
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const isSubmitting = navigation.state === 'submitting';

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

  const handleForgotPassword = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });
      const data = await response.json();
      
      if (response.ok) {
        message.success(data.message || 'Kode reset dikirim ke email Anda.');
        setResetEmail(values.email);
        setMode('reset-password');
      } else {
        message.error(data.error || 'Terjadi kesalahan.');
      }
    } catch {
      message.error('Terjadi kesalahan. Coba lagi nanti.');
    }
    setLoading(false);
  };

  const handleResetPassword = async (values: { code: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Password tidak cocok!');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          code: values.code,
          newPassword: values.newPassword,
        }),
      });
      const data = await response.json();
      
      if (response.ok) {
        message.success(data.message || 'Password berhasil diubah!');
        setMode('login');
        setResetEmail('');
      } else {
        message.error(data.error || 'Terjadi kesalahan.');
      }
    } catch {
      message.error('Terjadi kesalahan. Coba lagi nanti.');
    }
    setLoading(false);
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Buat Akun';
      case 'forgot-password': return 'Lupa Password';
      case 'reset-password': return 'Reset Password';
      default: return 'Login';
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <Link to="/" className={styles.backButton}>
          <Button type="text" size="large" icon={<ArrowLeftOutlined style={{ fontSize: 24 }} />} />
        </Link>

        <Title level={2} className={styles.authTitle}>
          {getTitle()}
        </Title>

        {/* Login / Signup Form */}
        {(mode === 'login' || mode === 'signup') && (
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

            <Button type="primary" htmlType="submit" block loading={isSubmitting}>
              {mode === 'signup' ? 'Daftar' : 'Masuk'}
            </Button>

            {mode === 'login' && (
              <div className={styles.forgotLink}>
                <Link to="#" onClick={() => setMode('forgot-password')}>
                  Lupa Password?
                </Link>
              </div>
            )}

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
        )}

        {/* Forgot Password Form */}
        {mode === 'forgot-password' && (
          <Form name="forgotForm" layout="vertical" onFinish={handleForgotPassword} className={styles.authForm}>
            <Text className={styles.description}>
              Masukkan alamat email Anda. Kami akan mengirim kode untuk reset password.
            </Text>

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

            <Button type="primary" htmlType="submit" block loading={loading}>
              Kirim Kode
            </Button>

            <div className={styles.altLink}>
              <Link to="#" onClick={() => setMode('login')}>
                Kembali ke Login
              </Link>
            </div>
          </Form>
        )}

        {/* Reset Password Form */}
        {mode === 'reset-password' && (
          <Form name="resetForm" layout="vertical" onFinish={handleResetPassword} className={styles.authForm}>
            <Text className={styles.description}>
              Masukkan kode yang dikirim ke <strong>{resetEmail}</strong> dan password baru Anda.
            </Text>

            <Form.Item
              name="code"
              label="Kode Verifikasi"
              rules={[{ required: true, message: 'Masukkan kode 6 digit' }]}>
              <Input
                variant="borderless"
                prefix={<KeyOutlined style={{ paddingRight: 4 }} />}
                placeholder="123456"
                maxLength={6}
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="Password Baru"
              rules={[{ required: true, min: 6, message: 'Password minimal 6 karakter' }]}>
              <Input.Password
                variant="borderless"
                prefix={<LockOutlined style={{ paddingRight: 4 }} />}
                placeholder="Password Baru"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Konfirmasi Password"
              rules={[{ required: true, message: 'Konfirmasi password' }]}>
              <Input.Password
                variant="borderless"
                prefix={<LockOutlined style={{ paddingRight: 4 }} />}
                placeholder="Konfirmasi Password"
              />
            </Form.Item>

            <Button type="primary" htmlType="submit" block loading={loading}>
              Reset Password
            </Button>

            <div className={styles.altLink}>
              <Link to="#" onClick={() => setMode('forgot-password')}>
                Kirim ulang kode
              </Link>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
