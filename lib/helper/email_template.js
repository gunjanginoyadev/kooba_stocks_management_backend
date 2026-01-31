export const resetPasswordEmailTemplate = (resetLink, resetToken) => {
  const fullLink = `${resetLink}?token=${resetToken}`;

  return `
You requested a password reset.

Click the link below to reset your password:
${fullLink}

If you did not request this, please ignore this email.

This link will expire in 10 minutes.
  `;
};
