import { Principal } from '@dfinity/principal';

export function validatePrincipal(text: string): { valid: boolean; principal?: Principal; error?: string } {
  if (!text || !text.trim()) {
    return { valid: false, error: 'Principal ID is required' };
  }

  try {
    const principal = Principal.fromText(text.trim());
    return { valid: true, principal };
  } catch (error) {
    return { valid: false, error: 'Invalid principal ID format' };
  }
}
