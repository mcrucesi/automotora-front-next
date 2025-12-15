/**
 * Utility function to merge class names
 * Usage: cn('class1', 'class2', condition && 'class3')
 */
export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
