export class BigIntHelper {
  static toBigInt(value: any): bigint {
    if (value === null || value === undefined) {
      return 0n;
    }
    
    if (typeof value === 'bigint') {
      return value;
    }
    
    if (typeof value === 'number') {
      // Ensure it's an integer
      return BigInt(Math.floor(value));
    }
    
    if (typeof value === 'string') {
      try {
        // Remove any non-numeric characters except minus sign
        const numericString = value.replace(/[^\d.-]/g, '');
        return BigInt(Math.floor(parseFloat(numericString) || 0));
      } catch {
        return 0n;
      }
    }
    
    return 0n;
  }

  /**
   * Convert GB to bytes (BigInt)
   */
  static gbToBytes(gb: number): bigint {
    return this.toBigInt(gb) * 1024n * 1024n * 1024n;
  }

  /**
   * Add two values safely
   */
  static add(a: any, b: any): bigint {
    return this.toBigInt(a) + this.toBigInt(b);
  }

  /**
   * Subtract two values safely
   */
  static subtract(a: any, b: any): bigint {
    return this.toBigInt(a) - this.toBigInt(b);
  }

  /**
   * Multiply two values safely
   */
  static multiply(a: any, b: any): bigint {
    return this.toBigInt(a) * this.toBigInt(b);
  }

  /**
   * Format bytes to human readable string
   */
  static formatBytes(bytes: bigint, decimals: number = 2): string {
    if (bytes === 0n) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    
    const bytesNumber = Number(bytes);
    const i = Math.floor(Math.log(bytesNumber) / Math.log(k));
    
    return parseFloat((bytesNumber / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }

  /**
   * Calculate percentage (BigInt safe)
   */
  static calculatePercentage(part: bigint, total: bigint): number {
    if (total === 0n) return 0;
    
    // Calculate with 2 decimal precision
    const percentage = Number((part * 10000n) / total) / 100;
    return Math.min(100, Math.max(0, percentage));
  }
}