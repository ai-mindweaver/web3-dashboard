import classnames from 'classnames';

export function cn(...args: Parameters<typeof classnames>): string {
  return classnames(...args);
}
