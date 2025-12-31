// storage.js - minimal wrapper using IndexedDB via simple async functions
const Store = {
  async set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  async get(key) {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  },
  async remove(key) {
    localStorage.removeItem(key);
  },
  async list(prefix) {
    const out = [];
    for (let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if (!prefix || k.startsWith(prefix)) out.push({key:k, value: JSON.parse(localStorage.getItem(k))});
    }
    return out;
  }
};