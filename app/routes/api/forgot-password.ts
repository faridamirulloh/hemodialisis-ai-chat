import prisma from '~/lib/prisma.server';
import { sendPasswordResetEmail, generateResetCode } from '~/utils/email.server';

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    let { email } = body;

    if (!email) {
      return Response.json({ error: 'Email diperlukan' }, { status: 400 });
    }

    email = email.toLowerCase();

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether email exists for security
      return Response.json({ success: true, message: 'Jika email terdaftar, kode reset akan dikirim.' });
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // Generate new code and save
    const code = generateResetCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.passwordResetToken.create({
      data: {
        email,
        token: code,
        expiresAt,
      },
    });

    // Send email
    const emailSent = await sendPasswordResetEmail(email, code);
    if (!emailSent) {
      return Response.json({ error: 'Gagal mengirim email. Coba lagi nanti.' }, { status: 500 });
    }

    return Response.json({ success: true, message: 'Kode reset password telah dikirim ke email Anda.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return Response.json({ error: 'Terjadi kesalahan. Coba lagi nanti.' }, { status: 500 });
  }
}
