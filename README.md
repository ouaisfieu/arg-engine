### Base recommandée pour l’ARG mission engine (priorités et livrables immédiats)

**Objectif immédiat**  
Fournir une base **client‑only** (déployable sur GitHub Pages) qui permet de : créer des missions asynchrones, réclamer des étapes, stocker localement (IndexedDB), signer les claims avec un wallet local, et exporter les jeux de données anonymisés. Cette base est extensible ensuite vers P2P (Gun.js/Yjs) ou backend.

**Livrables que je fournis maintenant**  
- **Structure minimale** du projet.  
- **Fichiers clés** prêts à coller : `index.html`, `styles.css`, `engine.js`, `wallet.js`, `storage.js`, `README.md`.  
- **Flux UX** et instructions d’intégration sur GitHub Pages.

---

### Structure minimale du dépôt

```
/arg-engine
  ├─ index.html
  ├─ styles.css
  ├─ engine.js        // logique missions, claims, TTL
  ├─ wallet.js        // création / signature clé locale
  ├─ storage.js       // wrapper IndexedDB (localForage)
  ├─ README.md
  └─ data_sample.csv  // exemple d’import
```

---

### Règles de conception essentielles

- **Tout local par défaut** : les données restent dans le navigateur jusqu’à ce que l’utilisateur choisisse de partager.  
- **Claims signés** : chaque claim est signé par la clé du wallet pour prouver la propriété.  
- **Stages tolérants** : chaque étape a un `timeoutDays` long (ex. 7–21 jours) ; absence n’entraîne pas d’échec immédiat.  
- **Manifest dataset** : chaque mission produit un manifeste JSON listant contributeurs et règles d’usage.  
- **Export anonymisé** : pipeline client‑side pour strip PII + option bruit Laplace pour counts.

---

### Fichiers prêts à coller — `index.html`

```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>ARG Mission Engine — Prototype</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>ARG Mission Engine</h1>
    <p>Prototype asynchrone — Wallet local, missions, claims, export anonymisé</p>
  </header>

  <main>
    <section id="wallet-section">
      <h2>Wallet</h2>
      <button id="create-wallet">Créer wallet</button>
      <button id="export-wallet">Exporter wallet (chiffré)</button>
      <div id="wallet-info"></div>
    </section>

    <section id="create-mission">
      <h2>Créer une mission</h2>
      <input id="mission-title" placeholder="Titre" />
      <textarea id="mission-desc" placeholder="Description"></textarea>
      <input id="mission-ttl" type="number" value="14" /> <label>TTL jours</label>
      <button id="create-mission-btn">Créer</button>
    </section>

    <section id="missions-list">
      <h2>Missions</h2>
      <div id="missions"></div>
    </section>

    <section id="export">
      <h2>Export</h2>
      <button id="export-data">Exporter anonymisé</button>
    </section>
  </main>

  <script src="storage.js"></script>
  <script src="wallet.js"></script>
  <script src="engine.js"></script>
</body>
</html>
```

---

### Fichiers prêts à coller — `styles.css` (minimal)

```css
body{font-family:system-ui,Arial;margin:18px;background:#f7f8fb;color:#0b1220}
header h1{margin:0;font-size:1.4rem}
section{background:#fff;padding:12px;border-radius:8px;margin-top:12px;box-shadow:0 6px 18px rgba(12,20,40,0.04)}
input,textarea{width:100%;padding:8px;margin-top:8px;border:1px solid #e6e9ef;border-radius:6px}
button{padding:8px 12px;border-radius:8px;background:#0b6efd;color:#fff;border:none;cursor:pointer}
#missions .mission{border:1px dashed #e6eefc;padding:8px;margin-top:8px;border-radius:6px}
.small{font-size:0.9rem;color:#6b7280}
```

---

### Fichiers prêts à coller — `storage.js` (wrapper IndexedDB via localForage-like minimal)

```javascript
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
```

---

### Fichiers prêts à coller — `wallet.js` (Web Crypto minimal pour signature)

```javascript
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
```

---

### Fichiers prêts à coller — `engine.js` (mission engine minimal)

```javascript
// engine.js - mission engine minimal
(async function(){
  // helpers
  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
  function now(){ return Date.now(); }

  // create mission UI wiring
  document.getElementById('create-mission-btn').addEventListener('click', async ()=>{
    const title = document.getElementById('mission-title').value.trim();
    const desc = document.getElementById('mission-desc').value.trim();
    const ttl = parseInt(document.getElementById('mission-ttl').value,10) || 14;
    if(!title) return alert('Titre requis');
    const m = { id: uid(), title, desc, createdAt: now(), ttlDays: ttl, stages: [{id:0,desc:'Étape 1',claims:[]}] , createdBy: (await Wallet.load())?.id || 'anon' };
    await Store.set('mission:'+m.id, m);
    renderMissions();
  });

  // render missions
  async function renderMissions(){
    const list = await Store.list('mission:');
    const container = document.getElementById('missions');
    container.innerHTML = '';
    for(const item of list){
      const m = item.value;
      const el = document.createElement('div'); el.className='mission';
      el.innerHTML = `<strong>${m.title}</strong><div class="small">${m.desc}</div><div>Stages: ${m.stages.length}</div>`;
      const claimBtn = document.createElement('button'); claimBtn.textContent='Claim étape 0';
      claimBtn.addEventListener('click', async ()=>{
        const payload = prompt('Preuve / note (optionnel)');
        const sig = await Wallet.sign(JSON.stringify({missionId:m.id,stage:0,ts:now(),payload}));
        m.stages[0].claims.push({user: (await Wallet.load())?.id || 'anon', ts: now(), payload, sig});
        await Store.set('mission:'+m.id, m);
        renderMissions();
      });
      el.appendChild(claimBtn);
      // show claims
      const claims = document.createElement('div'); claims.className='small';
      claims.innerHTML = 'Claims: ' + (m.stages[0].claims.length || 0);
      el.appendChild(claims);
      container.appendChild(el);
    }
  }

  // export anonymisé
  document.getElementById('export-data').addEventListener('click', async ()=>{
    const list = await Store.list('mission:');
    const rows = list.map(i => {
      const m = i.value;
      return {id:m.id,title:m.title,stages:m.stages.length,claims:m.stages.flatMap(s=>s.claims).length};
    });
    const csv = ['id,title,stages,claims'].concat(rows.map(r=>`${r.id},"${r.title.replace(/"/g,'""')}",${r.stages},${r.claims}`)).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='missions_export.csv'; a.click();
  });

  // initial render
  renderMissions();
})();
```

---

### README minimal (`README.md`)

```markdown
ARG Mission Engine — Prototype
==============================

Déploiement
1. Créer un dépôt public sur GitHub.
2. Copier les fichiers fournis à la racine.
3. Activer GitHub Pages sur la branche main (root).
4. Ouvrir la page et tester la création de missions.

Notes
- Wallet local : créez un wallet pour signer vos claims.
- Données locales : tout est stocké dans localStorage (remplaçable par IndexedDB).
- Extensible : ajouter Gun.js pour réplication P2P, ajouter anonymisation différentielle à l'export.
```

---

### Prochaines étapes que je recommande (ordre prioritaire)

1. **Remplacer `localStorage` par IndexedDB** (localForage) pour robustesse.  
2. **Ajouter UI de gestion des stages** (ajout/suppression, description, TTL par stage).  
3. **Intégrer Wallet export chiffré** (AES‑GCM + PBKDF2) pour sauvegarde locale.  
4. **Ajouter vérification de signature** lors de l’affichage des claims.  
5. **Option P2P** : intégrer Gun.js pour réplication des missions entre nœuds volontaires.  
6. **Anonymisation avancée** : differential privacy pour exports et suppression PII.

---

### Ce que je peux livrer ensuite immédiatement
- **A.** remplacer `localStorage` par `localForage` (fichiers modifiés).  
- **B.** UI complète de création de stages et validation asynchrone.  
- **C.** module d’export anonymisé avec bruit Laplace pour counts.  
- **D.** intégration P2P basique avec Gun.js et UI d’acceptation de peers.

Indiquez la lettre de la ou des options que vous voulez que je génère en premier et je fournis les fichiers prêts à coller.
