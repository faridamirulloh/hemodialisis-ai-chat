import bcrypt from 'bcrypt';
import prisma from '~/lib/prisma.server';

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return Response.json({ error: 'Semua field diperlukan' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return Response.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { email, token: code },
    });

    if (!resetToken) {
      return Response.json({ error: 'Kode tidak valid' }, { status: 400 });
    }

    // Check if expired
    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return Response.json({ error: 'Kode sudah kadaluarsa. Minta kode baru.' }, { status: 400 });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete used token
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    return Response.json({ success: true, message: 'Password berhasil diubah. Silakan login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json({ error: 'Terjadi kesalahan. Coba lagi nanti.' }, { status: 500 });
  }
}
