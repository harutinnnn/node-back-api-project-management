export const forgotPassword = (name: string, password: string) => {
    return `
    <div style="font-family: Arial; max-width: 600px; margin: auto;">
      <p>Hello ${name},</p>
      <h2>Your password has been forgoten</h2>
      <p>Your new password is : ${password}</p>
      <p>If you didn’t request this, ignore this email.</p>
    </div>
  `;
};