/*
 * DES (FIPS 46-3) en modo ECB con relleno de ceros, tal como lo usa el protocolo heredado del
 * servidor intermedio de Autofirma. No debe usarse para ningun otro fin: DES no es seguro.
 *
 * Adaptacion a TypeScript y arrays tipados del algoritmo de tablas SP de Paul Tero (julio de
 * 2001, http://www.tero.co.uk/des/), optimizado por Michael Hayworth (noviembre de 2001), que
 * el autoscript.js original incluia como `Cipher.des`.
 *
 * THIS SOFTWARE IS PROVIDED "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const BLOCK_SIZE = 8;
const SHIFTS = [0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0] as const;

interface DesTables {
  readonly sp: readonly Int32Array[];
  readonly pc2: readonly Int32Array[];
}

let tables: DesTables | undefined;

/** Las tablas se materializan en el primer uso para no penalizar a quien no usa DES. */
function getTables(): DesTables {
  tables ??= {
    sp: SP_SOURCE.map((row) => Int32Array.from(row)),
    pc2: PC2_SOURCE.map((row) => Int32Array.from(row)),
  };
  return tables;
}

function word(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] ?? 0) << 24) |
    ((bytes[offset + 1] ?? 0) << 16) |
    ((bytes[offset + 2] ?? 0) << 8) |
    (bytes[offset + 3] ?? 0)
  );
}

/** Genera las 16 subclaves de 48 bits (32 enteros) a partir de una clave de 8 bytes. */
function createKeys(key: Uint8Array): Int32Array {
  const pc2 = getTables().pc2 as [Int32Array, ...Int32Array[]];
  const p = (index: number, value: number): number => pc2[index]![value]!;
  const keys = new Int32Array(32);
  let left = word(key, 0);
  let right = word(key, 4);
  let temp = ((left >>> 4) ^ right) & 0x0f0f0f0f;
  right ^= temp;
  left ^= temp << 4;
  temp = ((right >>> 16) ^ left) & 0x0000ffff;
  left ^= temp;
  right ^= temp << 16;
  temp = ((left >>> 2) ^ right) & 0x33333333;
  right ^= temp;
  left ^= temp << 2;
  temp = ((right >>> 16) ^ left) & 0x0000ffff;
  left ^= temp;
  right ^= temp << 16;
  temp = ((left >>> 1) ^ right) & 0x55555555;
  right ^= temp;
  left ^= temp << 1;
  temp = ((right >>> 8) ^ left) & 0x00ff00ff;
  left ^= temp;
  right ^= temp << 8;
  temp = ((left >>> 1) ^ right) & 0x55555555;
  right ^= temp;
  left ^= temp << 1;
  temp = (left << 8) | ((right >>> 20) & 0x000000f0);
  left =
    (right << 24) | ((right << 8) & 0xff0000) | ((right >>> 8) & 0xff00) | ((right >>> 24) & 0xf0);
  right = temp;
  let n = 0;
  for (const shift of SHIFTS) {
    if (shift) {
      left = (left << 2) | (left >>> 26);
      right = (right << 2) | (right >>> 26);
    } else {
      left = (left << 1) | (left >>> 27);
      right = (right << 1) | (right >>> 27);
    }
    left &= -0xf;
    right &= -0xf;
    const leftTemp =
      p(0, left >>> 28) |
      p(1, (left >>> 24) & 0xf) |
      p(2, (left >>> 20) & 0xf) |
      p(3, (left >>> 16) & 0xf) |
      p(4, (left >>> 12) & 0xf) |
      p(5, (left >>> 8) & 0xf) |
      p(6, (left >>> 4) & 0xf);
    const rightTemp =
      p(7, right >>> 28) |
      p(8, (right >>> 24) & 0xf) |
      p(9, (right >>> 20) & 0xf) |
      p(10, (right >>> 16) & 0xf) |
      p(11, (right >>> 12) & 0xf) |
      p(12, (right >>> 8) & 0xf) |
      p(13, (right >>> 4) & 0xf);
    temp = ((rightTemp >>> 16) ^ leftTemp) & 0x0000ffff;
    keys[n++] = leftTemp ^ temp;
    keys[n++] = rightTemp ^ (temp << 16);
  }
  return keys;
}

function transform(key: Uint8Array, input: Uint8Array, encrypt: boolean): Uint8Array {
  if (key.length !== BLOCK_SIZE) throw new RangeError("La clave DES debe tener 8 bytes.");
  const keys = createKeys(key);
  const [s1, s2, s3, s4, s5, s6, s7, s8] = getTables().sp as [
    Int32Array,
    Int32Array,
    Int32Array,
    Int32Array,
    Int32Array,
    Int32Array,
    Int32Array,
    Int32Array,
  ];
  const start = encrypt ? 0 : 30;
  const end = encrypt ? 32 : -2;
  const step = encrypt ? 2 : -2;
  const length = Math.ceil(input.length / BLOCK_SIZE) * BLOCK_SIZE;
  const output = new Uint8Array(length);
  for (let offset = 0; offset < length; offset += BLOCK_SIZE) {
    let left = word(input, offset);
    let right = word(input, offset + 4);
    let temp = ((left >>> 4) ^ right) & 0x0f0f0f0f;
    right ^= temp;
    left ^= temp << 4;
    temp = ((left >>> 16) ^ right) & 0x0000ffff;
    right ^= temp;
    left ^= temp << 16;
    temp = ((right >>> 2) ^ left) & 0x33333333;
    left ^= temp;
    right ^= temp << 2;
    temp = ((right >>> 8) ^ left) & 0x00ff00ff;
    left ^= temp;
    right ^= temp << 8;
    temp = ((left >>> 1) ^ right) & 0x55555555;
    right ^= temp;
    left ^= temp << 1;
    left = (left << 1) | (left >>> 31);
    right = (right << 1) | (right >>> 31);
    for (let index = start; index !== end; index += step) {
      const right1 = right ^ keys[index]!;
      const right2 = ((right >>> 4) | (right << 28)) ^ keys[index + 1]!;
      temp = left;
      left = right;
      right =
        temp ^
        (s2[(right1 >>> 24) & 0x3f]! |
          s4[(right1 >>> 16) & 0x3f]! |
          s6[(right1 >>> 8) & 0x3f]! |
          s8[right1 & 0x3f]! |
          s1[(right2 >>> 24) & 0x3f]! |
          s3[(right2 >>> 16) & 0x3f]! |
          s5[(right2 >>> 8) & 0x3f]! |
          s7[right2 & 0x3f]!);
    }
    temp = left;
    left = right;
    right = temp;
    left = (left >>> 1) | (left << 31);
    right = (right >>> 1) | (right << 31);
    temp = ((left >>> 1) ^ right) & 0x55555555;
    right ^= temp;
    left ^= temp << 1;
    temp = ((right >>> 8) ^ left) & 0x00ff00ff;
    left ^= temp;
    right ^= temp << 8;
    temp = ((right >>> 2) ^ left) & 0x33333333;
    left ^= temp;
    right ^= temp << 2;
    temp = ((left >>> 16) ^ right) & 0x0000ffff;
    right ^= temp;
    left ^= temp << 16;
    temp = ((left >>> 4) ^ right) & 0x0f0f0f0f;
    right ^= temp;
    left ^= temp << 4;
    output[offset] = left >>> 24;
    output[offset + 1] = left >>> 16;
    output[offset + 2] = left >>> 8;
    output[offset + 3] = left;
    output[offset + 4] = right >>> 24;
    output[offset + 5] = right >>> 16;
    output[offset + 6] = right >>> 8;
    output[offset + 7] = right;
  }
  return output;
}

/** Cifra con DES-ECB. Los datos se completan con ceros hasta un multiplo de 8 bytes. */
export function desEncrypt(key: Uint8Array, data: Uint8Array): Uint8Array {
  return transform(key, data, true);
}

/** Descifra DES-ECB. Si la longitud no es multiplo de 8, se completa con ceros. */
export function desDecrypt(key: Uint8Array, data: Uint8Array): Uint8Array {
  return transform(key, data, false);
}

// Tablas SP (S-box + permutacion P) y PC-2 del algoritmo original, sin modificar.
const SP_SOURCE: readonly (readonly number[])[] = [
  [
    0x1010400, 0, 0x10000, 0x1010404, 0x1010004, 0x10404, 0x4, 0x10000, 0x400, 0x1010400, 0x1010404,
    0x400, 0x1000404, 0x1010004, 0x1000000, 0x4, 0x404, 0x1000400, 0x1000400, 0x10400, 0x10400,
    0x1010000, 0x1010000, 0x1000404, 0x10004, 0x1000004, 0x1000004, 0x10004, 0, 0x404, 0x10404,
    0x1000000, 0x10000, 0x1010404, 0x4, 0x1010000, 0x1010400, 0x1000000, 0x1000000, 0x400,
    0x1010004, 0x10000, 0x10400, 0x1000004, 0x400, 0x4, 0x1000404, 0x10404, 0x1010404, 0x10004,
    0x1010000, 0x1000404, 0x1000004, 0x404, 0x10404, 0x1010400, 0x404, 0x1000400, 0x1000400, 0,
    0x10004, 0x10400, 0, 0x1010004,
  ],
  [
    -0x7fef7fe0, -0x7fff8000, 0x8000, 0x108020, 0x100000, 0x20, -0x7fefffe0, -0x7fff7fe0,
    -0x7fffffe0, -0x7fef7fe0, -0x7fef8000, -0x80000000, -0x7fff8000, 0x100000, 0x20, -0x7fefffe0,
    0x108000, 0x100020, -0x7fff7fe0, 0, -0x80000000, 0x8000, 0x108020, -0x7ff00000, 0x100020,
    -0x7fffffe0, 0, 0x108000, 0x8020, -0x7fef8000, -0x7ff00000, 0x8020, 0, 0x108020, -0x7fefffe0,
    0x100000, -0x7fff7fe0, -0x7ff00000, -0x7fef8000, 0x8000, -0x7ff00000, -0x7fff8000, 0x20,
    -0x7fef7fe0, 0x108020, 0x20, 0x8000, -0x80000000, 0x8020, -0x7fef8000, 0x100000, -0x7fffffe0,
    0x100020, -0x7fff7fe0, -0x7fffffe0, 0x100020, 0x108000, 0, -0x7fff8000, 0x8020, -0x80000000,
    -0x7fefffe0, -0x7fef7fe0, 0x108000,
  ],
  [
    0x208, 0x8020200, 0, 0x8020008, 0x8000200, 0, 0x20208, 0x8000200, 0x20008, 0x8000008, 0x8000008,
    0x20000, 0x8020208, 0x20008, 0x8020000, 0x208, 0x8000000, 0x8, 0x8020200, 0x200, 0x20200,
    0x8020000, 0x8020008, 0x20208, 0x8000208, 0x20200, 0x20000, 0x8000208, 0x8, 0x8020208, 0x200,
    0x8000000, 0x8020200, 0x8000000, 0x20008, 0x208, 0x20000, 0x8020200, 0x8000200, 0, 0x200,
    0x20008, 0x8020208, 0x8000200, 0x8000008, 0x200, 0, 0x8020008, 0x8000208, 0x20000, 0x8000000,
    0x8020208, 0x8, 0x20208, 0x20200, 0x8000008, 0x8020000, 0x8000208, 0x208, 0x8020000, 0x20208,
    0x8, 0x8020008, 0x20200,
  ],
  [
    0x802001, 0x2081, 0x2081, 0x80, 0x802080, 0x800081, 0x800001, 0x2001, 0, 0x802000, 0x802000,
    0x802081, 0x81, 0, 0x800080, 0x800001, 0x1, 0x2000, 0x800000, 0x802001, 0x80, 0x800000, 0x2001,
    0x2080, 0x800081, 0x1, 0x2080, 0x800080, 0x2000, 0x802080, 0x802081, 0x81, 0x800080, 0x800001,
    0x802000, 0x802081, 0x81, 0, 0, 0x802000, 0x2080, 0x800080, 0x800081, 0x1, 0x802001, 0x2081,
    0x2081, 0x80, 0x802081, 0x81, 0x1, 0x2000, 0x800001, 0x2001, 0x802080, 0x800081, 0x2001, 0x2080,
    0x800000, 0x802001, 0x80, 0x800000, 0x2000, 0x802080,
  ],
  [
    0x100, 0x2080100, 0x2080000, 0x42000100, 0x80000, 0x100, 0x40000000, 0x2080000, 0x40080100,
    0x80000, 0x2000100, 0x40080100, 0x42000100, 0x42080000, 0x80100, 0x40000000, 0x2000000,
    0x40080000, 0x40080000, 0, 0x40000100, 0x42080100, 0x42080100, 0x2000100, 0x42080000,
    0x40000100, 0, 0x42000000, 0x2080100, 0x2000000, 0x42000000, 0x80100, 0x80000, 0x42000100,
    0x100, 0x2000000, 0x40000000, 0x2080000, 0x42000100, 0x40080100, 0x2000100, 0x40000000,
    0x42080000, 0x2080100, 0x40080100, 0x100, 0x2000000, 0x42080000, 0x42080100, 0x80100,
    0x42000000, 0x42080100, 0x2080000, 0, 0x40080000, 0x42000000, 0x80100, 0x2000100, 0x40000100,
    0x80000, 0, 0x40080000, 0x2080100, 0x40000100,
  ],
  [
    0x20000010, 0x20400000, 0x4000, 0x20404010, 0x20400000, 0x10, 0x20404010, 0x400000, 0x20004000,
    0x404010, 0x400000, 0x20000010, 0x400010, 0x20004000, 0x20000000, 0x4010, 0, 0x400010,
    0x20004010, 0x4000, 0x404000, 0x20004010, 0x10, 0x20400010, 0x20400010, 0, 0x404010, 0x20404000,
    0x4010, 0x404000, 0x20404000, 0x20000000, 0x20004000, 0x10, 0x20400010, 0x404000, 0x20404010,
    0x400000, 0x4010, 0x20000010, 0x400000, 0x20004000, 0x20000000, 0x4010, 0x20000010, 0x20404010,
    0x404000, 0x20400000, 0x404010, 0x20404000, 0, 0x20400010, 0x10, 0x4000, 0x20400000, 0x404010,
    0x4000, 0x400010, 0x20004010, 0, 0x20404000, 0x20000000, 0x400010, 0x20004010,
  ],
  [
    0x200000, 0x4200002, 0x4000802, 0, 0x800, 0x4000802, 0x200802, 0x4200800, 0x4200802, 0x200000,
    0, 0x4000002, 0x2, 0x4000000, 0x4200002, 0x802, 0x4000800, 0x200802, 0x200002, 0x4000800,
    0x4000002, 0x4200000, 0x4200800, 0x200002, 0x4200000, 0x800, 0x802, 0x4200802, 0x200800, 0x2,
    0x4000000, 0x200800, 0x4000000, 0x200800, 0x200000, 0x4000802, 0x4000802, 0x4200002, 0x4200002,
    0x2, 0x200002, 0x4000000, 0x4000800, 0x200000, 0x4200800, 0x802, 0x200802, 0x4200800, 0x802,
    0x4000002, 0x4200802, 0x4200000, 0x200800, 0, 0x2, 0x4200802, 0, 0x200802, 0x4200000, 0x800,
    0x4000002, 0x4000800, 0x800, 0x200002,
  ],
  [
    0x10001040, 0x1000, 0x40000, 0x10041040, 0x10000000, 0x10001040, 0x40, 0x10000000, 0x40040,
    0x10040000, 0x10041040, 0x41000, 0x10041000, 0x41040, 0x1000, 0x40, 0x10040000, 0x10000040,
    0x10001000, 0x1040, 0x41000, 0x40040, 0x10040040, 0x10041000, 0x1040, 0, 0, 0x10040040,
    0x10000040, 0x10001000, 0x41040, 0x40000, 0x41040, 0x40000, 0x10041000, 0x1000, 0x40,
    0x10040040, 0x1000, 0x41040, 0x10001000, 0x40, 0x10000040, 0x10040000, 0x10040040, 0x10000000,
    0x40000, 0x10001040, 0, 0x10041040, 0x40040, 0x10000040, 0x10040000, 0x10001000, 0x10001040, 0,
    0x10041040, 0x41000, 0x41000, 0x1040, 0x1040, 0x40040, 0x10000000, 0x10041000,
  ],
];

const PC2_SOURCE: readonly (readonly number[])[] = [
  [
    0, 0x4, 0x20000000, 0x20000004, 0x10000, 0x10004, 0x20010000, 0x20010004, 0x200, 0x204,
    0x20000200, 0x20000204, 0x10200, 0x10204, 0x20010200, 0x20010204,
  ],
  [
    0, 0x1, 0x100000, 0x100001, 0x4000000, 0x4000001, 0x4100000, 0x4100001, 0x100, 0x101, 0x100100,
    0x100101, 0x4000100, 0x4000101, 0x4100100, 0x4100101,
  ],
  [
    0, 0x8, 0x800, 0x808, 0x1000000, 0x1000008, 0x1000800, 0x1000808, 0, 0x8, 0x800, 0x808,
    0x1000000, 0x1000008, 0x1000800, 0x1000808,
  ],
  [
    0, 0x200000, 0x8000000, 0x8200000, 0x2000, 0x202000, 0x8002000, 0x8202000, 0x20000, 0x220000,
    0x8020000, 0x8220000, 0x22000, 0x222000, 0x8022000, 0x8222000,
  ],
  [
    0, 0x40000, 0x10, 0x40010, 0, 0x40000, 0x10, 0x40010, 0x1000, 0x41000, 0x1010, 0x41010, 0x1000,
    0x41000, 0x1010, 0x41010,
  ],
  [
    0, 0x400, 0x20, 0x420, 0, 0x400, 0x20, 0x420, 0x2000000, 0x2000400, 0x2000020, 0x2000420,
    0x2000000, 0x2000400, 0x2000020, 0x2000420,
  ],
  [
    0, 0x10000000, 0x80000, 0x10080000, 0x2, 0x10000002, 0x80002, 0x10080002, 0, 0x10000000,
    0x80000, 0x10080000, 0x2, 0x10000002, 0x80002, 0x10080002,
  ],
  [
    0, 0x10000, 0x800, 0x10800, 0x20000000, 0x20010000, 0x20000800, 0x20010800, 0x20000, 0x30000,
    0x20800, 0x30800, 0x20020000, 0x20030000, 0x20020800, 0x20030800,
  ],
  [
    0, 0x40000, 0, 0x40000, 0x2, 0x40002, 0x2, 0x40002, 0x2000000, 0x2040000, 0x2000000, 0x2040000,
    0x2000002, 0x2040002, 0x2000002, 0x2040002,
  ],
  [
    0, 0x10000000, 0x8, 0x10000008, 0, 0x10000000, 0x8, 0x10000008, 0x400, 0x10000400, 0x408,
    0x10000408, 0x400, 0x10000400, 0x408, 0x10000408,
  ],
  [
    0, 0x20, 0, 0x20, 0x100000, 0x100020, 0x100000, 0x100020, 0x2000, 0x2020, 0x2000, 0x2020,
    0x102000, 0x102020, 0x102000, 0x102020,
  ],
  [
    0, 0x1000000, 0x200, 0x1000200, 0x200000, 0x1200000, 0x200200, 0x1200200, 0x4000000, 0x5000000,
    0x4000200, 0x5000200, 0x4200000, 0x5200000, 0x4200200, 0x5200200,
  ],
  [
    0, 0x1000, 0x8000000, 0x8001000, 0x80000, 0x81000, 0x8080000, 0x8081000, 0x10, 0x1010,
    0x8000010, 0x8001010, 0x80010, 0x81010, 0x8080010, 0x8081010,
  ],
  [0, 0x4, 0x100, 0x104, 0, 0x4, 0x100, 0x104, 0x1, 0x5, 0x101, 0x105, 0x1, 0x5, 0x101, 0x105],
];
