export const newMemberTemplate = (name: string, password: string) => {
    return `
    <div style="font-family: Arial; max-width: 600px; margin: auto;">
      <p>Hello ${name},</p>
      <h2>By your email registred a new account in Project management system</h2>
      <p>Your password is : ${password}</p>
      <p>If you didn’t request this, ignore this email.</p>
    </div>
  `;
};