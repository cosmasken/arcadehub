interface FormatCurrencyOptions {
  decimals?: number;
  currency?: string;
  locale?: string;
}

interface FormatDateOptions {
  format?: 'relative' | 'short' | 'medium' | 'long' | 'full' | string;
  locale?: string;
  relative?: boolean;
}

export function formatCurrency(
  value: string | number,
  options: FormatCurrencyOptions = {}
): string {
  const { 
    decimals = 2, 
    currency = 'USD',
    locale = 'en-US' 
  } = options;

  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) return '0';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
  .format(numericValue)
  .replace(/[^0-9.,\s]/g, ''); // Remove currency symbol for crypto
}

export function formatDate(
  dateString: string,
  options: FormatDateOptions = {}
): string {
  const { 
    format = 'relative',
    locale = 'en-US' 
  } = options;

  const date = new Date(dateString);
  const now = new Date();
  
  if (format === 'relative') {
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      
      if (interval >= 1) {
        return interval === 1 
          ? `${interval} ${unit} ago` 
          : `${interval} ${unit}s ago`;
      }
    }
    
    return 'just now';
  }
  
  const formatOptions: Intl.DateTimeFormatOptions = {};
  
  switch (format) {
    case 'short':
      formatOptions.dateStyle = 'short';
      formatOptions.timeStyle = 'short';
      break;
    case 'medium':
      formatOptions.dateStyle = 'medium';
      formatOptions.timeStyle = 'short';
      break;
    case 'long':
      formatOptions.dateStyle = 'long';
      formatOptions.timeStyle = 'short';
      break;
    case 'full':
      formatOptions.dateStyle = 'full';
      formatOptions.timeStyle = 'long';
      break;
    default:
      // Custom format string like 'MMM d, yyyy h:mm a'
      if (format.includes('MMM') || format.includes('d') || format.includes('yyyy')) {
        return new Intl.DateTimeFormat(locale, {
          month: format.includes('MMM') ? 'short' : undefined,
          day: format.includes('d') ? 'numeric' : undefined,
          year: format.includes('yyyy') ? 'numeric' : undefined,
          hour: format.includes('h') ? 'numeric' : undefined,
          minute: format.includes('mm') ? '2-digit' : undefined,
          hour12: format.includes('a'),
        }).format(date);
      }
      formatOptions.dateStyle = 'medium';
      formatOptions.timeStyle = 'short';
  }
  
  return new Intl.DateTimeFormat(locale, formatOptions).format(date);
}

// Format token amount with appropriate decimal places
export function formatTokenAmount(
  amount: string | number,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const divisor = Math.pow(10, decimals);
  const formatted = (numericAmount / divisor).toFixed(displayDecimals);
  
  // Remove trailing zeros and unnecessary decimal point
  return formatted.replace(/\.?0+$/, '');
}

// Truncate wallet address for display
export function truncateAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  
  return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
}
