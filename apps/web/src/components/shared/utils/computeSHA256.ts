// Pure JavaScript SHA-256 implementation (fallback when crypto.subtle is unavailable)
// Based on: https://gist.github.com/alex-alekseichuk/b2aff6156a1126b91cb0bd72db551ed4

const K = [
  0x428a2f98 | 0, 0x71374491 | 0, 0xb5c0fbcf | 0, 0xe9b5dba5 | 0,
  0x3956c25b | 0, 0x59f111f1 | 0, 0x923f82a4 | 0, 0xab1c5ed5 | 0,
  0xd807aa98 | 0, 0x12835b01 | 0, 0x243185be | 0, 0x550c7dc3 | 0,
  0x72be5d74 | 0, 0x80deb1fe | 0, 0x9bdc06a7 | 0, 0xc19bf174 | 0,
  0xe49b69c1 | 0, 0xefbe4786 | 0, 0x0fc19dc6 | 0, 0x240ca1cc | 0,
  0x2de92c6f | 0, 0x4a7484aa | 0, 0x5cb0a9dc | 0, 0x76f988da | 0,
  0x983e5152 | 0, 0xa831c66d | 0, 0xb00327c8 | 0, 0xbf597fc7 | 0,
  0xc6e00bf3 | 0, 0xd5a79147 | 0, 0x06ca6351 | 0, 0x14292967 | 0,
  0x27b70a85 | 0, 0x2e1b2138 | 0, 0x4d2c6dfc | 0, 0x53380d13 | 0,
  0x650a7354 | 0, 0x766a0abb | 0, 0x81c2c92e | 0, 0x92722c85 | 0,
  0xa2bfe8a1 | 0, 0xa81a664b | 0, 0xc24b8b70 | 0, 0xc76c51a3 | 0,
  0xd192e819 | 0, 0xd6990624 | 0, 0xf40e3585 | 0, 0x106aa070 | 0,
  0x19a4c116 | 0, 0x1e376c08 | 0, 0x2748774c | 0, 0x34b0bcb5 | 0,
  0x391c0cb3 | 0, 0x4ed8aa4a | 0, 0x5b9cca4f | 0, 0x682e6ff3 | 0,
  0x748f82ee | 0, 0x78a5636f | 0, 0x84c87814 | 0, 0x8cc70208 | 0,
  0x90befffa | 0, 0xa4506ceb | 0, 0xbef9a3f7 | 0, 0xc67178f2 | 0,
];

const hex32 = (num: number) => (num + 0x100000000).toString(16).substr(-8);
const swapLE = (c: number) => (((c << 24) & 0xff000000) | ((c << 8) & 0xff0000) | ((c >> 8) & 0xff00) | ((c >> 24) & 0xff));
const swapBE = (c: number) => c;
const isBE = () => {
  const buf = new Uint8Array(new Uint16Array([0xFEFF]).buffer);
  return buf[0] === 0xFE;
};
const swap32 = isBE() ? swapBE : swapLE;

const ch = (x: number, y: number, z: number) => (z ^ (x & (y ^ z)));
const maj = (x: number, y: number, z: number) => ((x & y) | (z & (x | y)));
const sigma0 = (x: number) => ((x >>> 2 | x << 30) ^ (x >>> 13 | x << 19) ^ (x >>> 22 | x << 10));
const sigma1 = (x: number) => ((x >>> 6 | x << 26) ^ (x >>> 11 | x << 21) ^ (x >>> 25 | x << 7));
const gamma0 = (x: number) => ((x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ (x >>> 3));
const gamma1 = (x: number) => ((x >>> 17 | x << 15) ^ (x >>> 19 | x << 13) ^ (x >>> 10));

class PureSHA256 {
  A = 0x6a09e667 | 0;
  B = 0xbb67ae85 | 0;
  C = 0x3c6ef372 | 0;
  D = 0xa54ff53a | 0;
  E = 0x510e527f | 0;
  F = 0x9b05688c | 0;
  G = 0x1f83d9ab | 0;
  H = 0x5be0cd19 | 0;
  _size = 0;
  private _byte: Uint8Array;
  private _word: Int32Array;

  constructor() {
    const buffer = new ArrayBuffer(80);
    this._byte = new Uint8Array(buffer, 0, 64);
    this._word = new Int32Array(buffer, 0, 20);
  }

  update(data: Uint8Array) {
    const { _byte, _word } = this;
    const length = data.length;
    let offset = 0;

    while (offset < length) {
      const start = this._size % 64;
      let index = start;

      while (offset < length && index < 64) {
        _byte[index++] = data[offset++];
      }

      if (index >= 64) {
        this._processBlock(_word);
      }

      this._size += index - start;
    }

    return this;
  }

  private _processBlock(data: Int32Array) {
    const W = new Int32Array(64);
    let { A, B, C, D, E, F, G, H } = this;
    let i = 0;

    while (i < 16) {
      W[i++] = swap32(data[i - 1]);
    }

    for (i = 16; i < 64; i++) {
      W[i] = (gamma1(W[i - 2]) + W[i - 7] + gamma0(W[i - 15]) + W[i - 16]) | 0;
    }

    for (i = 0; i < 64; i++) {
      const T1 = (H + sigma1(E) + ch(E, F, G) + K[i] + W[i]) | 0;
      const T2 = (sigma0(A) + maj(A, B, C)) | 0;
      H = G;
      G = F;
      F = E;
      E = (D + T1) | 0;
      D = C;
      C = B;
      B = A;
      A = (T1 + T2) | 0;
    }

    this.A = (A + this.A) | 0;
    this.B = (B + this.B) | 0;
    this.C = (C + this.C) | 0;
    this.D = (D + this.D) | 0;
    this.E = (E + this.E) | 0;
    this.F = (F + this.F) | 0;
    this.G = (G + this.G) | 0;
    this.H = (H + this.H) | 0;
  }

  digest(): string {
    const { _byte, _word } = this;
    let i = (this._size % 64) | 0;
    _byte[i++] = 0x80;

    while (i & 3) {
      _byte[i++] = 0;
    }
    i >>= 2;

    if (i > 14) {
      while (i < 16) {
        _word[i++] = 0;
      }
      i = 0;
      this._processBlock(_word);
    }

    while (i < 16) {
      _word[i++] = 0;
    }

    const bits64 = this._size * 8;
    const low32 = (bits64 & 0xffffffff) >>> 0;
    const high32 = (bits64 - low32) / 0x100000000;
    if (high32) _word[14] = swap32(high32);
    if (low32) _word[15] = swap32(low32);

    this._processBlock(_word);

    const { A, B, C, D, E, F, G, H } = this;
    return hex32(A) + hex32(B) + hex32(C) + hex32(D) + hex32(E) + hex32(F) + hex32(G) + hex32(H);
  }
}

function computeSHA256PureJS(buffer: ArrayBuffer): string {
  const hash = new PureSHA256();
  const data = new Uint8Array(buffer);
  hash.update(data);
  return hash.digest();
}

async function computeSHA256(file: File): Promise<string> {
  // Get crypto API - prefer window.crypto, fallback to global crypto
  let cryptoApi: Crypto | undefined;
  
  if (typeof window !== "undefined" && window.crypto) {
    cryptoApi = window.crypto;
  } else if (typeof crypto !== "undefined") {
    cryptoApi = crypto;
  }
  
  // Try to use crypto.subtle if available (faster, native)
  if (cryptoApi?.subtle) {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await cryptoApi.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (error) {
      console.warn("crypto.subtle.digest failed, falling back to pure JS:", error);
      // Fall through to pure JS implementation
    }
  }
  
  // Fallback to pure JavaScript implementation
  console.log("Using pure JavaScript SHA-256 implementation (crypto.subtle not available)");
  const buffer = await file.arrayBuffer();
  return computeSHA256PureJS(buffer);
}

export default computeSHA256;
