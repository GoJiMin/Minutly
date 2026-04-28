import '@testing-library/jest-dom';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({priority, fill, ...props}: {priority: boolean; fill: boolean}) => (
    <img {...props} loading={priority ? 'eager' : 'lazy'} className={fill ? 'absolute' : 'static'} />
  ),
}));

window.HTMLElement.prototype.setPointerCapture = jest.fn();
window.HTMLElement.prototype.hasPointerCapture = jest.fn();
window.HTMLElement.prototype.scrollIntoView = jest.fn();
