const crypto = require("crypto");

// Algoritmi AES-256-GCM: enkriptim simetrik me autentifikim te integruar
const ALGORITHM = "aes-256-gcm";

// Çelesi duhet te jete 32 bytes (64 karaktere hex) - ruhet ne .env si MESSAGE_ENCRYPTION_KEY
function getKey() {
  const key = process.env.MESSAGE_ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error("MESSAGE_ENCRYPTION_KEY must be a 64-character hex string in .env");
  }
  return Buffer.from(key, "hex");
}

// Enkripton tekstin e mesazhit dhe kthen nje string te koduar per ruajtje ne databaze
// Formati: iv:authTag:encryptedContent (te ndara me ":")
function encryptMessage(plaintext) {
  const key = getKey();
  const iv  = crypto.randomBytes(12); // 12 bytes IV per AES-GCM

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag   = cipher.getAuthTag();

  // Bashko te gjitha pjeset ne nje string te vetëm per ruajtje
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

// Dekripton stringun e ruajtur nga databaza dhe kthen tekstin origjinal
function decryptMessage(encryptedString) {
  try {
    const key = getKey();
    const [ivHex, authTagHex, encryptedHex] = encryptedString.split(":");

    const iv        = Buffer.from(ivHex, "hex");
    const authTag   = Buffer.from(authTagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    // Nese dekriptimi deshtoi, kthe nje mesazh te sigurt per UI
    return "[encrypted message]";
  }
}

module.exports = { encryptMessage, decryptMessage };