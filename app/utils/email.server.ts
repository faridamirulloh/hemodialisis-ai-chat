import { Resend } from 'resend';

const resend = new Resend('re_MEH1hP2J_GK8HzjvFsBxbH8SnRDtnH6yE');

export async function sendPasswordResetEmail(email: string, code: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: 'AsistenHemodialysis@aridevianto.my.id',
      to: email,
      subject: 'Kode Reset Password - Hemodialysis App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1890ff;">Reset Password</h2>
          <p>Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda.</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0; color: #666;">Kode verifikasi Anda:</p>
            <h1 style="color: #1890ff; font-size: 36px; letter-spacing: 8px; margin: 10px 0;">${code}</h1>
          </div>
          <p style="color: #666;">Kode ini berlaku selama <strong>15 menit</strong>.</p>
          <p style="color: #999; font-size: 12px;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
        </div>
      `,
      text: `Kode reset password Anda: ${code}. Kode ini berlaku selama 15 menit.`,
    });
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

// Generate a 6-digit code
export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
