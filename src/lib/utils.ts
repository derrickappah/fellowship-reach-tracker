
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDateSafe = (
  date: string | Date | null | undefined, 
  formatString: string = 'MMM dd, yyyy',
  fallback: string = '-'
): string => {
  if (!date) {
    return fallback;
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return fallback;
  }
  
  try {
    return format(dateObj, formatString);
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return fallback;
  }
};
