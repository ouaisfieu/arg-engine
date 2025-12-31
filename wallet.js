// wallet.js - minimal keypair + sign/verify using ECDSA P-256
const Wallet = {
  async create() {
    const kp = await crypto.subtle.generateKey({name:'ECDSA', namedCurve:'P-256'}, true, ['sign','verify']);
    const pub = await crypto.subtle.exportKey('spki', kp.publicKey);
    const priv = await crypto.subtle.exportKey('pkcs8', kp.privateKey);
    const id = btoa(String.fromCharCode(...new Uint8Array(pub))).slice(0,12);
    const obj = {id, pub: arrayBufferToBase64(pub), priv: arrayBufferToBase64(priv)};
    await Store.set('wallet', obj);
    return obj;
  },
  async load() {
    return await Store.get('wallet');
  },
  async sign(message) {
    const w = await Wallet.load();
    if (!w) throw new Error('wallet missing');
    const priv = base64ToArrayBuffer(w.priv);
    const key = await crypto.subtle.importKey('pkcs8', priv, {name:'ECDSA', namedCurve:'P-256'}, false, ['sign']);
    const sig = await crypto.subtle.sign({name:'ECDSA', hash:'SHA-256'}, key, new TextEncoder().encode(message));
    return arrayBufferToBase64(sig);
  }
};

// helpers
function arrayBufferToBase64(buf){ return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function base64ToArrayBuffer(b64){ const s = atob(b64); const arr = new Uint8Array(s.length); for(let i=0;i<s.length;i++) arr[i]=s.charCodeAt(i); return arr.buffer; }