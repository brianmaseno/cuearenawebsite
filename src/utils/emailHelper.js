/**
 * Masks an email address for privacy (e.g., k***@cuearena.com)
 * @param {string} email - The email to mask
 * @returns {string} The masked email
 */
export const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 1) {
    return `*@${domain}`;
  }
  
  const firstChar = localPart[0];
  return `${firstChar}***@${domain}`;
};
