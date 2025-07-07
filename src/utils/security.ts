
// Input validation utilities
export const validatePlayerName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Name is required' };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Name cannot exceed 50 characters' };
  }
  
  // Allow letters, numbers, spaces, hyphens, and underscores
  const nameRegex = /^[a-zA-Z0-9\s\-_]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }
  
  return { isValid: true };
};

export const validateScore = (score: number): { isValid: boolean; error?: string } => {
  if (typeof score !== 'number' || isNaN(score)) {
    return { isValid: false, error: 'Score must be a valid number' };
  }
  
  if (score < 0) {
    return { isValid: false, error: 'Score cannot be negative' };
  }
  
  if (score > 1000000) {
    return { isValid: false, error: 'Score cannot exceed 1,000,000' };
  }
  
  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>\"'&]/g, '');
};

// Security monitoring
export const logSecurityEvent = (event: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITY] ${timestamp}: ${event}`, details);
};

export const validateImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Only allow https URLs from trusted domains
    return urlObj.protocol === 'https:' && 
           (urlObj.hostname === 'images.unsplash.com' || 
            urlObj.hostname === 'via.placeholder.com');
  } catch {
    return false;
  }
};
