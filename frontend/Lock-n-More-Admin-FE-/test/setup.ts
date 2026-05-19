import '@testing-library/jest-dom';

class MockAudio {
  src = '';
  volume = 1;
  play() {
    return Promise.resolve();
  }
}

// Minimal browser API shim for notification sound helper.
(globalThis as any).Audio = MockAudio;
