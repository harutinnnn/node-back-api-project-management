export const resetPasswordTemplate = (name: string, resetLink: string) => {
    return `
    <div style="font-family: Arial; max-width: 600px; margin: auto;">
      <h2>Password Reset</h2>
      <p>Hello ${name},</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetLink}" 
         style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
         Reset Password
      </a>
      <p>If you didn’t request this, ignore this email.</p>
    </div>
  `;
};