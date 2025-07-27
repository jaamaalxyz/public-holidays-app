import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Extend vitest expect with jest-dom matchers
expect.extend({});

// Cleanup after each test case
afterEach(() => {
  cleanup();
});
