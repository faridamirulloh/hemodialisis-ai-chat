import React from 'react';
import { MessageOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button, Image, Typography } from 'antd';
import { Link } from 'react-router';
import styles from './HomePage.module.scss';
import { useAuth } from '~/contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className={styles.homeContainer}>
      <div className={styles.heroAction}>
        {isAuthenticated ? (
          <Button type="primary" danger size="large" icon={<LogoutOutlined />} onClick={logout}>
            Logout
          </Button>
        ) : (
          <Link to="/auth">
            <Button type="primary" size="large">
              Login
            </Button>
          </Link>
        )}
      </div>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          {isAuthenticated && (
            <Typography.Title className={styles.userWelcome}>Selamat Datang, {user?.name}!</Typography.Title>
          )}
          <Image preview={false} src="/logo.png" />
          <Typography.Title className={styles.heroTitle}>Asisten AI Hemodialisis</Typography.Title>
          <Typography.Paragraph className={styles.heroSubtitle}>
            Memberdayakan pasien dan profesional perawatan kesehatan dengan wawasan berbasis AI untuk perawatan dialisis
            yang lebih baik.
          </Typography.Paragraph>
          <div className={styles.heroButtons}>
            <Link to="/chat">
              <Button type="primary" size="large" icon={<MessageOutlined />}>
                Mulai Chat
              </Button>
            </Link>
            {/* <Link to="/about">
              <Button size="large">Tentang Kami</Button>
            </Link> */}
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Chat AI Hemodialisis — Dikembangkan untuk perawatan dan edukasi pasien.</p>
      </footer>
    </div>
  );
};

export default HomePage;
