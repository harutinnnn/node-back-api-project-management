export const activationTemplate = (name: string, link: string) => {
    return `
    <div style="font-family: Arial; max-width: 600px; margin: auto;">
      <p>Hello ${name},</p>
      <h2>By your email registred a new account in Project management system</h2>
      <p>Go to activation : <a href="${link}">Activation</a></p>
      <p>If you didn’t request this, ignore this email.</p>
    </div>
  `;
};