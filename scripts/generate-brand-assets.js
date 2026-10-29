const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ -1) >>> 0;
}

function writeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function createPng(width, height, renderPixel) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = writeChunk('IHDR', ihdrData);

  const raw = Buffer.alloc((width * 4 + 1) * height);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    raw[pos++] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = renderPixel(x, y, width, height);
      raw[pos++] = r;
      raw[pos++] = g;
      raw[pos++] = b;
      raw[pos++] = a;
    }
  }

  const idat = writeChunk('IDAT', zlib.deflateSync(raw));
  const iend = writeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

function renderLogoPixel(x, y, w, h) {

  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;

  const GOLD = [253, 185, 19, 255];
  const LIGHT_GOLD = [255, 210, 69, 255];
  const DARK_GOLD = [216, 152, 0, 255];
  const BLACK = [9, 9, 11, 255];
  const SURFACE = [19, 19, 22, 255];
  const TRANSPARENT = [0, 0, 0, 0];

  const rSquircle = Math.pow(Math.abs(nx), 3.2) + Math.pow(Math.abs(ny), 3.2);
  if (rSquircle > 0.88) {
    return TRANSPARENT;
  }

  if (rSquircle >= 0.76 && rSquircle <= 0.87) {

    return ny < 0 ? LIGHT_GOLD : GOLD;
  }

  if (rSquircle > 0.72) {
    return BLACK;
  }

  const inS_Region = nx >= -0.62 && nx <= -0.06 && ny >= -0.52 && ny <= 0.52;
  let isS = false;
  if (inS_Region) {

    if (ny >= -0.52 && ny <= -0.34 && nx <= -0.08) isS = true;

    if (ny >= -0.52 && ny <= 0.05 && nx >= -0.62 && nx <= -0.42) isS = true;

    if (ny >= -0.09 && ny <= 0.09 && nx >= -0.58 && nx <= -0.10) isS = true;

    if (ny >= -0.05 && ny <= 0.52 && nx >= -0.26 && nx <= -0.06) isS = true;

    if (ny >= 0.34 && ny <= 0.52 && nx >= -0.60 && nx <= -0.06) isS = true;
  }

  const inC_Region = nx >= 0.06 && nx <= 0.62 && ny >= -0.52 && ny <= 0.52;
  let isC = false;
  if (inC_Region) {

    if (ny >= -0.52 && ny <= -0.34 && nx >= 0.08) isC = true;

    if (ny >= -0.52 && ny <= 0.52 && nx >= 0.06 && nx <= 0.26) isC = true;

    if (ny >= 0.34 && ny <= 0.52 && nx >= 0.08) isC = true;
  }

  let isBolt = false;
  if (Math.abs(nx) < 0.16 && Math.abs(ny) < 0.40) {

    if (ny >= -0.35 && ny <= 0.02) {
      const boltX = -ny * 0.35 + 0.02;
      if (Math.abs(nx - boltX) < 0.05) isBolt = true;
    }

    if (ny >= -0.02 && ny <= 0.35) {
      const boltX = -ny * 0.35 - 0.02;
      if (Math.abs(nx - boltX) < 0.05) isBolt = true;
    }

    if (Math.abs(ny) < 0.08 && Math.abs(nx) < 0.12) {
      isBolt = true;
    }
  }

  if (isBolt) {
    return LIGHT_GOLD;
  }

  if (isS || isC) {

    return nx + ny < 0 ? LIGHT_GOLD : GOLD;
  }

  return SURFACE;
}

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

console.log('Generating CSK SC Brand Assets...');

fs.writeFileSync(path.join(assetsDir, 'icon.png'), createPng(256, 256, renderLogoPixel));

fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), createPng(256, 256, renderLogoPixel));

fs.writeFileSync(path.join(assetsDir, 'splash-icon.png'), createPng(256, 256, renderLogoPixel));

fs.writeFileSync(path.join(assetsDir, 'favicon.png'), createPng(64, 64, renderLogoPixel));

fs.writeFileSync(path.join(assetsDir, 'logo.png'), createPng(512, 512, renderLogoPixel));

console.log('Successfully generated all brand assets in assets/ folder!');
