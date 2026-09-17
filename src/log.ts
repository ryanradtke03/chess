class Logger {
  enabled = false;

  debug(...args: unknown[]): void {
    if (this.enabled) console.log(...args);
  }
}

// Toggle from the browser console with `log.enabled = true`.
export const log = new Logger();
