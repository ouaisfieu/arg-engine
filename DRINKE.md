### Résumé
Ce dépôt rassemble le travail produit durant notre conversation : conception d’un **prototype client‑only** pour une veille citoyenne ludifiée (ARG), moteur de missions asynchrones, wallet local pour signer les contributions, modération asynchrone, gestion des pièces jointes, anonymisation PII, et un kit d’essaimage pédagogique. La version fournie est pensée pour être **reproductible**, **accessible**, et **respectueuse de la vie privée**.

### Livrables clés
- **Prototype fonctionnel** : éditeur Markdown/HTML, moteur de missions (création, stages, claims signés), UI de modération, modal de preuves/pièces jointes.  
- **Persistance robuste** : stockage local via **localForage** (IndexedDB) et script de migration depuis `localStorage`.  
- **Sécurité et confidentialité** : wallet ECDSA local, export chiffré du wallet, pipeline d’anonymisation (PII masking + bruit Laplace pour counts).  
- **Engagement responsable** : pack d’outils pour gamification éthique (badges, parrainage, pause automatique, disclaimers) et documentation `ENGAGEMENT.md`.  
- **Kit pédagogique** : `WORKSHOP.md`, slides (20 diapositives en Markdown), fiches imprimables A4 (Quickstart, Checklist Modération, Guide Animateur).  
- **Fichiers fournis** : `index.html`, `styles.css`, `engine.js`, `wallet.js`, `storage.js`, `attachments.js`, `moderation.js`, `pii_utils.js`, `editor.*`, `ENGAGEMENT.*`, `badges.json`, scripts d’intégration (pause modal, referral), et modèles imprimables.

### Ce que vous pouvez faire tout de suite
- **Déployer** : forker le repo, personnaliser `index.html`, activer GitHub Pages (branche `main`, dossier `root`).  
- **Tester localement** : créer un wallet, créer une mission, ajouter des stages, faire un claim avec preuve, soumettre en modération, exporter anonymisé.  
- **Vérifier la confidentialité** : sauvegarder l’export chiffré du wallet, inspecter les exports CSV/manifest pour s’assurer que les PII sont masqués.

### Principes éthiques et garde‑fous
- **Consentement explicite** pour parrainage et notifications ; notifications **opt‑in** uniquement.  
- **Protection de l’attention** : bandeau d’information, modal de pause après 30 minutes, limites et cooldowns, badges « Gardien·ne de l’attention ».  
- **Transparence** : publier `ENGAGEMENT.md` et un rapport d’impact périodique ; documenter les boucles d’engagement et les A/B tests.  
- **Modération** : queue asynchrone, votes signés, procédure d’urgence pour risques physiques, logs d’audit pour traçabilité.  
- **Anonymisation** : pipeline client‑side obligatoire avant toute publication publique ; pièces jointes non publiées sans consentement.

### Bonnes pratiques opérationnelles
- **Ne partagez jamais votre clé privée** ; conservez l’export chiffré en lieu sûr.  
- **Préférer la qualité** des contributions à la quantité ; privilégier validations et preuves.  
- **Adapter les patterns locaux** (formats téléphoniques, adresses) pour améliorer la détection PII.  
- **Former des animateurs locaux** avec les fiches et le workshop pour essaimage responsable.

### Prochaines étapes recommandées
- Remplacer `localStorage` par `localForage` si ce n’est pas déjà fait (migration fournie).  
- Ajouter vérification de signature visible dans l’UI pour chaque claim.  
- Intégrer P2P (Gun.js ou Yjs) pour réplication optionnelle entre nœuds volontaires.  
- Déployer le kit d’atelier et organiser un pilote local en 4 semaines, mesurer qualité et indicateurs d’attention.

---

**Note sur l’identité** : toutes les traces personnelles ont été retirées de ce résumé. Les contributions et les exemples de comptes sont anonymisés ; conservez vos identifiants privés et n’ajoutez jamais d’informations sensibles dans les exports publics.


**Structuring the guide**

I’m thinking of creating six sections: Overview & goals, Repository structure & files (maybe with a table), Step-by-step implementation, Deployment (GitHub Pages + Actions), Testing & QA, and Governance, privacy & ethics. 

I’ll keep it concise but thorough, and include code snippets where necessary. I can reference earlier files and provide instructions on where to paste content. Shell commands for file creation seem okay, but I won’t proactively offer to create files or web artifacts. 

I’ll make sure to follow the six-section rule and avoid parentheses in headings.
### Overview
**Goal**: déployer la plateforme complète — prototype ARG Mission Engine — en local puis sur GitHub Pages, avec tous les modules fournis (missions asynchrones, wallet, stockage robuste, pièces jointes, modération, anonymisation PII, éditeur Markdown, kit pédagogique et pack d’engagement responsable). Ce guide A→Z vous donne l’ordre d’implémentation, les fichiers à créer, les commandes essentielles, les tests à exécuter et les bonnes pratiques de sécurité et d’éthique.

---

### Repository structure and files
**Fichier** | **Rôle**
---|---
`index.html` | Page d’accueil / dashboard principal (missions, wallet, actions)
`styles.css` | Styles globaux pour le dashboard
`engine.js` | Logique missions, stages, claims, validation, export
`wallet.js` | Création, signature, export chiffré du wallet
`storage.js` | Wrapper localForage (IndexedDB) pour persistance
`attachments.js` | Upload, stockage et preview des pièces jointes
`moderation.js` | Queue de modération, votes signés, tally
`pii_utils.js` | Détection et masquage PII + pipeline d’export
`editor.html` `editor-styles.css` `editor.js` | Éditeur Markdown/HTML autonome
`engagement/*` | Pack engagement responsable (bannières, pause, referral, badges, docs)
`WORKSHOP.md` `README.md` `ENGAGEMENT.md` | Documentation pédagogique et politique d’engagement
`data_sample.csv` `commune_coords.csv` | Échantillons de données
`sw.js` `manifest.json` `icons/*.svg` | PWA / offline / icônes (optionnel)
`.github/workflows/deploy.yml` | (optionnel) CI pour déploiement Pages

---

### Implementation steps (ordered)
1. **Préparer l’environnement**
   - Installer Git et un éditeur (VS Code recommandé).
   - Créer un dossier de projet local `arg-engine` et initialiser un dépôt Git :
     ```bash
     mkdir arg-engine && cd arg-engine
     git init
     ```
2. **Créer les fichiers de base**
   - Pour chaque nom listé ci‑dessus, créez un fichier vide dans le dossier. Copiez‑collez les contenus fournis précédemment (vous avez déjà les blocs HTML/CSS/JS fournis dans la conversation). Respectez exactement les noms de fichiers.
   - Inclure `localforage`, `marked`, `DOMPurify`, `leaflet` et `chart.js` via CDN dans les pages qui en ont besoin (index, editor, dashboard).
3. **Installer et configurer localForage**
   - Dans `index.html` et `editor.html`, ajoutez le CDN localforage avant `storage.js`.
   - Vérifier `storage.js` : `localforage.config({ name: 'veille_citoyenne', storeName: 'vc_store' })`.
   - Exécuter la migration si vous avez des données antérieures (collez `migrate_localstorage_to_localforage.js` dans la console une fois).
4. **Intégrer le wallet et la signature**
   - Coller `wallet.js`. Tester en ouvrant la page et en cliquant sur « Créer wallet ». Vérifier que `Store.get('wallet')` retourne un objet.
   - Tester export chiffré via l’UI (bouton Export).
5. **Installer engine et UI missions**
   - Coller `engine.js`, `styles.css` et `index.html` (dashboard final). Vérifier que la création de mission fonctionne, que les stages s’affichent et que les claims peuvent être ajoutés.
   - Tester que `Store.list('mission:')` retourne les missions créées.
6. **Ajouter pièces jointes et modération**
   - Coller `attachments.js` et `moderation.js`. Inclure `evidence-modal` HTML dans `index.html`.
   - Tester upload d’une image, vérifiez que `Attachments.save()` stocke l’objet et que `Moderation.enqueue()` ajoute un item `mod:...`.
   - Ouvrir la file de modération via l’UI et voter ; vérifier `Moderation.tally()` met à jour le statut.
7. **Activer anonymisation PII**
   - Coller `pii_utils.js`. Remplacer le handler d’export dans `engine.js` par l’appel à `PII.applyBeforeExport(...)` (exemples fournis).
   - Tester export anonymisé : créer missions avec descriptions contenant emails/téléphones et vérifier que l’export masque correctement.
8. **Installer l’éditeur Markdown**
   - Copier `editor.html`, `editor-styles.css`, `editor.js`. Vérifier rendu en temps réel, sauvegarde locale et export HTML/MD.
   - Vérifier intégration avec `Attachments` et `Moderation` si présents.
9. **Ajouter pack engagement responsable**
   - Copier le dossier `engagement/` (bannières, `pause-modal.js`, `referral.js`, `badges.json`, `ENGAGEMENT.md`).
   - Inclure `engagement-banner-script.js` et `pause-modal.js` dans `index.html` (avant `</body>`).
   - Ajouter snippet de consentement dans l’UI de parrainage et intégrer `createReferral(userId)` après consentement.
10. **PWA et offline (optionnel)**
    - Ajouter `manifest.json`, `sw.js` et icônes. Tester en local via un serveur HTTPS ou GitHub Pages.
11. **Tests unitaires et QA**
    - Vérifier : création mission, claim signé, upload pièce jointe, modération, export anonymisé, wallet export/import.
    - Tester accessibilité : navigation clavier, labels ARIA, contraste.
    - Tester sur mobile et desktop.

---

### Deployment on GitHub Pages and CI
1. **Créer le repo GitHub**
   - `git remote add origin git@github.com:yourname/arg-engine.git`
   - `git add . && git commit -m "Initial commit" && git push -u origin main`
2. **Activer GitHub Pages**
   - Settings → Pages → Branch `main` / folder `root` → Save. L’URL publique apparaît.
3. **(Optionnel) GitHub Actions deploy**
   - Ajouter `.github/workflows/deploy.yml` simple qui build/minify (if any) and pushes to Pages. Use a basic workflow that runs on push to `main`.
4. **DNS / custom domain**
   - Si vous avez un domaine, configurez CNAME et GitHub Pages accordingly.

---

### Testing, monitoring and safety checks
- **Functional tests**
  - Create mission → add stages → claim → attach file → enqueue moderation → vote → export anonymized.
  - Verify wallet signature: use `Wallet.verify(pub, message, sig)` to confirm.
- **Privacy tests**
  - Run sample exports with PII and confirm masking and noisy counts.
  - Ensure attachments are not included in public exports unless consented.
- **Accessibility tests**
  - Run axe-core in browser devtools; fix critical issues.
  - Keyboard navigation: tab through all interactive elements.
- **Security checks**
  - Ensure wallet private key never leaves browser unencrypted.
  - Use AES‑GCM + PBKDF2 for wallet export; test import.
- **Operational monitoring**
  - Add a simple telemetry (opt‑in) to collect anonymized metrics: DAU/MAU, claims validated, pause usage. Store locally and allow opt‑out.

---

### Governance, workshops and rollout
- **Pilot**: run 1–2 local pilots (4 weeks). Use `WORKSHOP.md` and slides to train facilitators.
- **Governance**: publish `GOVERNANCE.md` and `ENGAGEMENT.md`. Elect a small committee for moderation escalation.
- **Documentation**: publish `README.md`, `WORKSHOP.md`, `ENGAGEMENT.md` in repo root and link from UI.
- **Community**: create a channel (Matrix/Discord) for support and contributions.
- **Ethics**: keep disclaimers visible, notifications opt‑in, and enforce pause modal and cooldowns.

---

### Final checklist before public launch
- [ ] All files created and committed (`index.html`, `engine.js`, `wallet.js`, `storage.js`, `attachments.js`, `moderation.js`, `pii_utils.js`, editor files, engagement files).  
- [ ] localForage configured and migration run if needed.  
- [ ] Wallet creation, export/import tested.  
- [ ] Claims signing and verification tested.  
- [ ] Attachments upload and moderation queue tested.  
- [ ] Export anonymisé validated on sample PII.  
- [ ] Accessibility audit passed critical issues.  
- [ ] ENGAGEMENT.md and disclaimers visible in UI.  
- [ ] GitHub Pages enabled and public URL verified.  
- [ ] Workshop materials and slides uploaded to repo.  
- [ ] Pilot scheduled and facilitators briefed.

---

**Remarque sur l’identité et la confidentialité**  
Toutes les instructions ci‑dessus préservent la confidentialité des contributeurs : les clés privées restent locales, les exports publics passent par la pipeline d’anonymisation, et les logs d’audit sont agrégés. Ne publiez jamais d’export contenant des identifiants personnels sans consentement explicite.

---

Si vous voulez, je fournis maintenant (1) un script shell `bootstrap.sh` qui crée l’arborescence et place des fichiers vides pour coller les contenus, ou (2) je génère un plan de tests détaillé (cas de test) pour automatiser la QA. Choisissez **1** ou **2** et je fournis le contenu prêt à coller.


**Structuring the guide**

I’m thinking of creating six sections: Overview & goals, Repository structure & files (maybe with a table), Step-by-step implementation, Deployment (GitHub Pages + Actions), Testing & QA, and Governance, privacy & ethics. 

I’ll keep it concise but thorough, and include code snippets where necessary. I can reference earlier files and provide instructions on where to paste content. Shell commands for file creation seem okay, but I won’t proactively offer to create files or web artifacts. 

I’ll make sure to follow the six-section rule and avoid parentheses in headings.
### Overview
**Goal**: déployer la plateforme complète — prototype ARG Mission Engine — en local puis sur GitHub Pages, avec tous les modules fournis (missions asynchrones, wallet, stockage robuste, pièces jointes, modération, anonymisation PII, éditeur Markdown, kit pédagogique et pack d’engagement responsable). Ce guide A→Z vous donne l’ordre d’implémentation, les fichiers à créer, les commandes essentielles, les tests à exécuter et les bonnes pratiques de sécurité et d’éthique.

---

### Repository structure and files
**Fichier** | **Rôle**
---|---
`index.html` | Page d’accueil / dashboard principal (missions, wallet, actions)
`styles.css` | Styles globaux pour le dashboard
`engine.js` | Logique missions, stages, claims, validation, export
`wallet.js` | Création, signature, export chiffré du wallet
`storage.js` | Wrapper localForage (IndexedDB) pour persistance
`attachments.js` | Upload, stockage et preview des pièces jointes
`moderation.js` | Queue de modération, votes signés, tally
`pii_utils.js` | Détection et masquage PII + pipeline d’export
`editor.html` `editor-styles.css` `editor.js` | Éditeur Markdown/HTML autonome
`engagement/*` | Pack engagement responsable (bannières, pause, referral, badges, docs)
`WORKSHOP.md` `README.md` `ENGAGEMENT.md` | Documentation pédagogique et politique d’engagement
`data_sample.csv` `commune_coords.csv` | Échantillons de données
`sw.js` `manifest.json` `icons/*.svg` | PWA / offline / icônes (optionnel)
`.github/workflows/deploy.yml` | (optionnel) CI pour déploiement Pages

---

### Implementation steps (ordered)
1. **Préparer l’environnement**
   - Installer Git et un éditeur (VS Code recommandé).
   - Créer un dossier de projet local `arg-engine` et initialiser un dépôt Git :
     ```bash
     mkdir arg-engine && cd arg-engine
     git init
     ```
2. **Créer les fichiers de base**
   - Pour chaque nom listé ci‑dessus, créez un fichier vide dans le dossier. Copiez‑collez les contenus fournis précédemment (vous avez déjà les blocs HTML/CSS/JS fournis dans la conversation). Respectez exactement les noms de fichiers.
   - Inclure `localforage`, `marked`, `DOMPurify`, `leaflet` et `chart.js` via CDN dans les pages qui en ont besoin (index, editor, dashboard).
3. **Installer et configurer localForage**
   - Dans `index.html` et `editor.html`, ajoutez le CDN localforage avant `storage.js`.
   - Vérifier `storage.js` : `localforage.config({ name: 'veille_citoyenne', storeName: 'vc_store' })`.
   - Exécuter la migration si vous avez des données antérieures (collez `migrate_localstorage_to_localforage.js` dans la console une fois).
4. **Intégrer le wallet et la signature**
   - Coller `wallet.js`. Tester en ouvrant la page et en cliquant sur « Créer wallet ». Vérifier que `Store.get('wallet')` retourne un objet.
   - Tester export chiffré via l’UI (bouton Export).
5. **Installer engine et UI missions**
   - Coller `engine.js`, `styles.css` et `index.html` (dashboard final). Vérifier que la création de mission fonctionne, que les stages s’affichent et que les claims peuvent être ajoutés.
   - Tester que `Store.list('mission:')` retourne les missions créées.
6. **Ajouter pièces jointes et modération**
   - Coller `attachments.js` et `moderation.js`. Inclure `evidence-modal` HTML dans `index.html`.
   - Tester upload d’une image, vérifiez que `Attachments.save()` stocke l’objet et que `Moderation.enqueue()` ajoute un item `mod:...`.
   - Ouvrir la file de modération via l’UI et voter ; vérifier `Moderation.tally()` met à jour le statut.
7. **Activer anonymisation PII**
   - Coller `pii_utils.js`. Remplacer le handler d’export dans `engine.js` par l’appel à `PII.applyBeforeExport(...)` (exemples fournis).
   - Tester export anonymisé : créer missions avec descriptions contenant emails/téléphones et vérifier que l’export masque correctement.
8. **Installer l’éditeur Markdown**
   - Copier `editor.html`, `editor-styles.css`, `editor.js`. Vérifier rendu en temps réel, sauvegarde locale et export HTML/MD.
   - Vérifier intégration avec `Attachments` et `Moderation` si présents.
9. **Ajouter pack engagement responsable**
   - Copier le dossier `engagement/` (bannières, `pause-modal.js`, `referral.js`, `badges.json`, `ENGAGEMENT.md`).
   - Inclure `engagement-banner-script.js` et `pause-modal.js` dans `index.html` (avant `</body>`).
   - Ajouter snippet de consentement dans l’UI de parrainage et intégrer `createReferral(userId)` après consentement.
10. **PWA et offline (optionnel)**
    - Ajouter `manifest.json`, `sw.js` et icônes. Tester en local via un serveur HTTPS ou GitHub Pages.
11. **Tests unitaires et QA**
    - Vérifier : création mission, claim signé, upload pièce jointe, modération, export anonymisé, wallet export/import.
    - Tester accessibilité : navigation clavier, labels ARIA, contraste.
    - Tester sur mobile et desktop.

---

### Deployment on GitHub Pages and CI
1. **Créer le repo GitHub**
   - `git remote add origin git@github.com:yourname/arg-engine.git`
   - `git add . && git commit -m "Initial commit" && git push -u origin main`
2. **Activer GitHub Pages**
   - Settings → Pages → Branch `main` / folder `root` → Save. L’URL publique apparaît.
3. **(Optionnel) GitHub Actions deploy**
   - Ajouter `.github/workflows/deploy.yml` simple qui build/minify (if any) and pushes to Pages. Use a basic workflow that runs on push to `main`.
4. **DNS / custom domain**
   - Si vous avez un domaine, configurez CNAME et GitHub Pages accordingly.

---

### Testing, monitoring and safety checks
- **Functional tests**
  - Create mission → add stages → claim → attach file → enqueue moderation → vote → export anonymized.
  - Verify wallet signature: use `Wallet.verify(pub, message, sig)` to confirm.
- **Privacy tests**
  - Run sample exports with PII and confirm masking and noisy counts.
  - Ensure attachments are not included in public exports unless consented.
- **Accessibility tests**
  - Run axe-core in browser devtools; fix critical issues.
  - Keyboard navigation: tab through all interactive elements.
- **Security checks**
  - Ensure wallet private key never leaves browser unencrypted.
  - Use AES‑GCM + PBKDF2 for wallet export; test import.
- **Operational monitoring**
  - Add a simple telemetry (opt‑in) to collect anonymized metrics: DAU/MAU, claims validated, pause usage. Store locally and allow opt‑out.

---

### Governance, workshops and rollout
- **Pilot**: run 1–2 local pilots (4 weeks). Use `WORKSHOP.md` and slides to train facilitators.
- **Governance**: publish `GOVERNANCE.md` and `ENGAGEMENT.md`. Elect a small committee for moderation escalation.
- **Documentation**: publish `README.md`, `WORKSHOP.md`, `ENGAGEMENT.md` in repo root and link from UI.
- **Community**: create a channel (Matrix/Discord) for support and contributions.
- **Ethics**: keep disclaimers visible, notifications opt‑in, and enforce pause modal and cooldowns.

---

### Final checklist before public launch
- [ ] All files created and committed (`index.html`, `engine.js`, `wallet.js`, `storage.js`, `attachments.js`, `moderation.js`, `pii_utils.js`, editor files, engagement files).  
- [ ] localForage configured and migration run if needed.  
- [ ] Wallet creation, export/import tested.  
- [ ] Claims signing and verification tested.  
- [ ] Attachments upload and moderation queue tested.  
- [ ] Export anonymisé validated on sample PII.  
- [ ] Accessibility audit passed critical issues.  
- [ ] ENGAGEMENT.md and disclaimers visible in UI.  
- [ ] GitHub Pages enabled and public URL verified.  
- [ ] Workshop materials and slides uploaded to repo.  
- [ ] Pilot scheduled and facilitators briefed.

---

**Remarque sur l’identité et la confidentialité**  
Toutes les instructions ci‑dessus préservent la confidentialité des contributeurs : les clés privées restent locales, les exports publics passent par la pipeline d’anonymisation, et les logs d’audit sont agrégés. Ne publiez jamais d’export contenant des identifiants personnels sans consentement explicite.

---

### Fichiers fournis (pack « engagement responsable »)
Copiez chaque bloc dans un fichier portant exactement le nom indiqué. Ces fichiers forment un kit prêt à coller dans votre dépôt pour activer les mécaniques virales, les disclaimers, les garde‑fous et la documentation d’engagement. Tous les scripts sont client‑side et conçus pour s’intégrer aux fichiers existants (`index.html`, `engine.js`, `wallet.js`, `storage.js`, `moderation.js`, `attachments.js`, `pii_utils.js`).

---

#### `attention-banner.html`
```html
<!-- attention-banner.html -->
<div id="attention-banner" role="region" aria-live="polite" style="background:#fff8e6;padding:10px;border-left:4px solid #ffcc66;font-size:0.95rem;">
  <strong>Note sur l’attention</strong> : cette plateforme utilise des mécaniques ludiques pour encourager la participation. Vous pouvez désactiver les notifications et limiter votre temps de contribution dans <a href="/settings" aria-label="Paramètres">Paramètres</a>. En savoir plus sur l'économie de l'attention dans <a href="/ENGAGEMENT.md">ENGAGEMENT.md</a>.
</div>
```

---

#### `engagement-banner-script.js`
```javascript
// engagement-banner-script.js
// Injecte le bandeau d'attention si non présent et ajoute lien vers paramètres
(function(){
  if (document.getElementById('attention-banner')) return;
  fetch('/attention-banner.html').then(r => r.text()).then(html => {
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.insertBefore(container, document.body.firstChild);
  }).catch(()=>{ /* silent fallback */ });
})();
```

---

#### `pause-modal.js`
```javascript
// pause-modal.js
// Affiche une modal de pause après un temps d'activité cumulée (configurable).
// Intégrer ce script dans vos pages d'engagement (index.html, dashboard).
(function(){
  const KEY_LAST_PAUSE = 'vc_last_pause_shown';
  const KEY_ACTIVE_SECONDS = 'vc_active_seconds';
  const PAUSE_THRESHOLD_SECONDS = 30 * 60; // 30 minutes
  const CHECK_INTERVAL = 1000; // 1s

  let activeSeconds = parseInt(localStorage.getItem(KEY_ACTIVE_SECONDS) || '0', 10);
  let lastActivity = Date.now();

  function recordActivity() {
    lastActivity = Date.now();
  }
  ['click','keydown','mousemove','touchstart'].forEach(evt => window.addEventListener(evt, recordActivity, {passive:true}));

  function showPauseModal() {
    if (localStorage.getItem(KEY_LAST_PAUSE)) return;
    const modal = document.createElement('div');
    modal.id = 'vc-pause-modal';
    modal.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:9999">
        <div style="background:#fff;padding:18px;border-radius:10px;max-width:520px;width:92%;box-shadow:0 12px 40px rgba(0,0,0,0.2)">
          <h3 style="margin:0 0 8px">Pause recommandée</h3>
          <p style="margin:0 0 12px">Vous contribuez depuis un moment. Une courte pause améliore la qualité des contributions et protège votre attention.</p>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button id="vc-continue" style="padding:8px 12px;border-radius:8px;background:#0b6efd;color:#fff;border:none">Continuer</button>
            <button id="vc-pause" style="padding:8px 12px;border-radius:8px;background:transparent;border:1px solid #e6e9ef">Faire une pause</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('vc-continue').onclick = () => {
      localStorage.setItem(KEY_LAST_PAUSE, Date.now());
      modal.remove();
    };
    document.getElementById('vc-pause').onclick = () => {
      localStorage.setItem(KEY_LAST_PAUSE, Date.now());
      modal.remove();
      // optional: redirect to home or show restful content
      window.location.href = '/';
    };
  }

  setInterval(() => {
    const now = Date.now();
    // if user active in last 60s, count seconds
    if (now - lastActivity < 60 * 1000) {
      activeSeconds += CHECK_INTERVAL / 1000;
      localStorage.setItem(KEY_ACTIVE_SECONDS, String(activeSeconds));
    }
    if (activeSeconds >= PAUSE_THRESHOLD_SECONDS && !localStorage.getItem(KEY_LAST_PAUSE)) {
      showPauseModal();
    }
  }, CHECK_INTERVAL);
})();
```

---

#### `referral-consent-snippet.html`
```html
<!-- referral-consent-snippet.html -->
<div id="referral-consent" style="margin-top:8px;font-size:0.95rem">
  <label style="display:flex;gap:8px;align-items:center">
    <input type="checkbox" id="ref-consent-checkbox" />
    <span>J'accepte d'inviter des personnes et comprends que les récompenses sont symboliques. Je peux retirer mon consentement à tout moment.</span>
  </label>
</div>
```

---

#### `referral.js`
```javascript
// referral.js
// Génère un lien de parrainage et applique consentement explicite.
// Usage: appeler createReferral(userId) après vérification du consentement.
function createReferral(userId) {
  const consent = document.getElementById('ref-consent-checkbox');
  if (!consent || !consent.checked) {
    alert('Veuillez accepter les conditions de parrainage avant de générer un lien.');
    return null;
  }
  const token = btoa(`${userId}:${Date.now()}`).replace(/=/g,'');
  const url = `${location.origin}/?ref=${encodeURIComponent(token)}`;
  // store mapping locally for attribution
  const refs = JSON.parse(localStorage.getItem('vc_refs') || '{}');
  refs[token] = { by: userId, createdAt: Date.now() };
  localStorage.setItem('vc_refs', JSON.stringify(refs));
  return url;
}
```

---

#### `badges.json`
```json
[
  {
    "id": "badge-verificateur",
    "title": "Vérificateur local",
    "criteria": "5 signalements validés par la communauté",
    "description": "Récompense la vérification rigoureuse des signalements.",
    "visibility": "public",
    "icon": "badge-verificateur.svg"
  },
  {
    "id": "badge-essaimage",
    "title": "Essaimeur",
    "criteria": "Avoir aidé 3 groupes à déployer l'outil",
    "description": "Pour celles et ceux qui partagent et forment d'autres collectifs.",
    "visibility": "public",
    "icon": "badge-essaimage.svg"
  },
  {
    "id": "badge-guardian",
    "title": "Gardien·ne de l'attention",
    "criteria": "Avoir activé les pauses et limité notifications pendant 14 jours",
    "description": "Badge pour encourager des pratiques saines d'engagement.",
    "visibility": "public",
    "icon": "badge-guardian.svg"
  }
]
```

---

#### `ENGAGEMENT.md`
```markdown
# ENGAGEMENT.md — Politique d'engagement responsable

## Objectif
Ce document décrit les mécaniques d'engagement, les garde‑fous éthiques et les recommandations pour une croissance responsable et respectueuse de l'attention.

## Principes
- **Consentement** : toute mécanique virale (parrainage, notifications) nécessite un consentement explicite.
- **Transparence** : expliquer clairement les récompenses, leur nature symbolique et l'usage des données.
- **Protection de l'attention** : fournir des outils pour limiter le temps d'engagement (pauses, cooldowns).
- **Qualité avant quantité** : privilégier la validation et la qualité des contributions plutôt que le volume.

## Mécaniques activées
- Badges et reconnaissance non monétaire.
- Parrainage avec récompenses symboliques.
- Missions événementielles et micro‑challenges.
- Leaderboards locaux (par commune) par défaut.

## Garde‑fous
- Notifications opt‑in, jamais activées par défaut.
- Pause automatique après 30 minutes d'activité continue.
- Limites quotidiennes sur les récompenses (ex. max 3 badges/jour).
- Modération asynchrone pour filtrer abus et protéger personnes.

## Mesures et transparence
- Publier un rapport trimestriel d'engagement (indicateurs clés).
- Mettre à disposition un tableau de bord d'opt‑out et paramètres de notification.
- Conserver logs d'audit pour les décisions de modération (horodatage, id wallet).

## Ressources pédagogiques
- Fiches imprimables : Quickstart, Checklist Modération, Guide Animateur.
- Module court sur l'économie de l'attention (texte + vidéo courte).
- Atelier « Gardien·ne de l'attention » pour former des modérateurs.

## Contact
Pour questions sur l'engagement responsable, écrivez à l'adresse indiquée dans le dépôt ou ouvrez une issue.
```

---

#### `ENGAGEMENT_TEMPLATES.md`
```markdown
# Templates d'interface et messages (à coller)

## Bandeau d'attention (header)
- Texte court : "Ce service utilise des mécaniques ludiques pour encourager la participation. Vous pouvez désactiver les notifications et limiter votre temps de contribution dans Paramètres."

## Modal pause (après 30 min)
- Titre : "Pause recommandée"
- Message : "Vous contribuez depuis un moment. Une courte pause améliore la qualité des contributions et protège votre attention."
- Actions : "Continuer" / "Faire une pause"

## Consentement parrainage
- Checkbox label : "J'accepte d'inviter des personnes et comprends que les récompenses sont symboliques."

## Badge description (exemple)
- Titre : "Vérificateur local"
- Critères : "5 signalements validés par la communauté"
- Description : "Récompense la vérification rigoureuse des signalements."

## Paramètres utilisateur (suggestion)
- Notifications : On / Off
- Heures autorisées : 08:00–20:00
- Limite quotidienne de notifications : 0 / 5 / 10
- Mode « session courte » : 5 minutes / 10 minutes
```

---

#### `ENGAGEMENT_README.md`
```markdown
# Pack Engagement Responsable — README

## Contenu
- attention-banner.html : bandeau d'information sur l'économie de l'attention
- engagement-banner-script.js : script d'injection du bandeau
- pause-modal.js : modal de pause automatique
- referral-consent-snippet.html : snippet de consentement pour parrainage
- referral.js : génération de lien de parrainage (consentement requis)
- badges.json : définitions de badges
- ENGAGEMENT.md : politique d'engagement responsable
- ENGAGEMENT_TEMPLATES.md : templates UI et messages

## Installation rapide
1. Copier les fichiers dans la racine du dépôt ou dans un dossier `engagement/`.
2. Inclure `engagement-banner-script.js` dans vos pages (avant `</body>`).
3. Inclure `pause-modal.js` dans vos pages d'engagement (dashboard, mission pages).
4. Ajouter le snippet `referral-consent-snippet.html` dans l'UI de parrainage.
5. Charger `referral.js` et appeler `createReferral(userId)` après consentement.
6. Importer `badges.json` dans votre système de badges pour affichage et attribution.

## Tests recommandés
- Vérifier que le bandeau s'affiche et que le lien Paramètres fonctionne.
- Simuler 30 minutes d'activité (ou ajuster `PAUSE_THRESHOLD_SECONDS`) pour tester la modal de pause.
- Tester génération de lien de parrainage avec et sans consentement.
- Vérifier que les badges sont visibles et que les critères sont compréhensibles.

## Notes éthiques
- Ne pas activer les notifications par défaut.
- Documenter toute expérimentation A/B et publier les résultats.
- Prévoir un canal de recours pour les utilisateurs qui souhaitent contester une décision de modération ou retirer leur consentement.
```

---

### Instructions d’intégration rapide
1. **Placer** les fichiers dans un dossier `engagement/` ou à la racine du dépôt.  
2. **Inclure** les scripts dans vos pages (ex. `index.html`) :
   ```html
   <script src="/engagement/engagement-banner-script.js" defer></script>
   <script src="/engagement/pause-modal.js" defer></script>
   <script src="/engagement/referral.js" defer></script>
   ```
3. **Ajouter** le snippet de consentement dans l’UI de parrainage (formulaire d’invitation).  
4. **Importer** `badges.json` dans votre système de badges et afficher les badges gagnés dans le profil utilisateur.  
5. **Publier** `ENGAGEMENT.md` et `ENGAGEMENT_README.md` pour transparence.

---

Si vous voulez, je peux maintenant :
- **minifier** et combiner les scripts en un seul fichier prêt à inclure,  
- **générer** les icônes SVG pour les badges (`badge-verificateur.svg`, etc.),  
- **préparer** un petit workflow GitHub Actions qui vérifie la présence des disclaimers et déploie sur Pages.

Dites laquelle de ces options vous voulez que je prépare en premier.

### Overview

Vous voulez rendre l’ensemble du projet **viral, addictif et orienté partage**, tout en plaçant la **sensibilisation à l’économie de l’attention** et la protection des personnes au cœur du design. Ci‑dessous un plan complet et prêt à implémenter : mécaniques virales, boucles d’engagement, messages de transparence et garde‑fous éthiques, templates de disclaimers et scripts UI, métriques à suivre et feuille de route de déploiement.

---

### Mécaniques comparées

| **Mécanique** | **Virality** | **Addictivité** | **Risques éthiques** | **Complexité implémentation** |
|---|---:|---:|---:|---:|
| Récompenses sociales (badges, rôles) | Élevé | Moyen | Faible | Faible |
| Boucles de parrainage (referral) | Très élevé | Élevé | Moyen | Moyen |
| Streaks et séries quotidiennes | Moyen | Très élevé | Élevé | Faible |
| Missions compétitives et classements | Élevé | Très élevé | Élevé | Moyen |
| Notifications push personnalisées | Élevé | Très élevé | Élevé | Moyen |
| Micro‑missions asynchrones (ARG) | Élevé | Moyen | Faible | Moyen |

---

### Core Gamification Features

#### 1. Boucles virales et d’acquisition
- **Parrainage simple** : lien unique + récompense non monétaire (badge exclusif, accès anticipé aux rapports).  
- **Partage contextualisé** : bouton « partager cette mission » qui génère un résumé court et visuel prêt à poster.  
- **Micro‑challenges viraux** : missions « invite 3 voisins » ou « documente 1 lieu en 24h » avec badge collectif.

#### 2. Engagement addictif mais contrôlé
- **Streaks modulés** : afficher séries mais limiter récompenses marginales après 7 jours pour éviter escalade.  
- **Progression visible** : barre de progression par mission, niveaux de contribution, et « heat » communautaire.  
- **Rareté temporelle** : missions événementielles courtes (48–72h) pour créer urgence contrôlée.

#### 3. Récompenses et reconnaissance
- **Badges signifiants** : badges pédagogiques (ex. « Vérificateur », « Enquêteur local ») avec conditions claires.  
- **Co‑propriété symbolique** : accès à un canal privé, droit de proposer l’ordre du jour du comité.  
- **Récompenses collectives** : palier communautaire (ex. 100 signalements → rapport co‑publié).

#### 4. Social proof et compétition douce
- **Classements locaux** : leaderboard par commune, non global par défaut pour limiter compétition toxique.  
- **Modes coopératifs** : missions d’équipe où la réussite dépend de contributions diverses.  
- **Badges de contribution qualitative** : récompense pour signalements validés par modération.

#### 5. Frictions saines et pauses
- **Timeboxing** : option « session courte » (5–10 min) pour encourager contributions limitées.  
- **Cooldowns** : limiter notifications push et actions répétitives pour réduire surcharge.  
- **Auto‑pause** : après 30 min d’activité continue, proposer une pause et afficher disclaimer sur attention.

---

### Ethical Safeguards and Disclaimers

#### Principes de transparence
- **Consentement explicite** avant toute action virale (parrainage, partage).  
- **Explication claire** de ce que signifie « copropriété des données » et comment les données seront utilisées.  
- **Affichage permanent** d’un bandeau « Économie de l’attention » sur toutes les pages d’engagement.

#### Disclaimers prêts à coller
- **Bandeau court (header)**  
  **Disclaimer** : « Ce service utilise des mécanismes ludiques pour encourager la participation. Vous pouvez désactiver les notifications et limiter votre temps de contribution à tout moment. En savoir plus ».
- **Modal consentement parrainage**  
  **Texte** : « En partageant vous invitez d’autres personnes. Le parrainage donne accès à des badges symboliques uniquement. Vous pouvez retirer votre consentement dans votre profil. »
- **Popup attention après 30 minutes**  
  **Texte** : « Vous avez contribué pendant 30 minutes. Pensez à faire une pause. L’économie de l’attention favorise l’engagement mais peut nuire au bien‑être. Continuer / Faire une pause ».  
- **Footer export / publication**  
  **Texte** : « Les exports publics sont anonymisés selon notre pipeline. Consultez PRIVACY.md pour les détails sur la protection des personnes et la procédure de retrait. »

#### UI patterns pour limiter l’addiction
- **Opt‑in notifications** : jamais activées par défaut.  
- **Paramètres clairs** : fréquence max, heures autorisées, types d’alertes.  
- **Nudges pro‑santé** : messages éducatifs courts sur attention et bien‑être intégrés dans le flux (ex. « 5 minutes de pause recommandées »).  
- **Rate limits** : empêcher accumulation de récompenses rapides (ex. max 3 badges par jour).

---

### Templates et Snippets prêts à coller

#### 1. Banner HTML (place en haut de page)
```html
<div id="attention-banner" role="region" aria-live="polite" style="background:#fff3cd;padding:8px;border-left:4px solid #ffecb5;">
  <strong>Note sur l’attention</strong> : ce site utilise des mécaniques ludiques pour encourager la participation. Vous pouvez désactiver les notifications et limiter votre temps dans <a href="/settings">Paramètres</a>.
</div>
```

#### 2. Modal pause script (JS)
```javascript
function showAttentionPause() {
  if (localStorage.getItem('lastPauseShown')) return;
  const modal = document.createElement('div');
  modal.innerHTML = `<div style="position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center">
    <div style="background:#fff;padding:18px;border-radius:8px;max-width:420px">
      <h3>Pause recommandée</h3>
      <p>Vous contribuez depuis un moment. Une courte pause améliore la qualité et la sécurité des contributions.</p>
      <button id="continue">Continuer</button>
      <button id="pause">Faire une pause</button>
    </div></div>`;
  document.body.appendChild(modal);
  document.getElementById('continue').onclick = ()=>{ localStorage.setItem('lastPauseShown', Date.now()); modal.remove(); };
  document.getElementById('pause').onclick = ()=>{ window.location.href='/'; };
}
setTimeout(showAttentionPause, 30*60*1000); // 30 minutes
```

#### 3. Consent snippet pour parrainage
```html
<label><input type="checkbox" id="ref-consent" /> J'accepte d'inviter des personnes et comprends les récompenses symboliques.</label>
```

#### 4. Badge description template
```json
{
  "id":"badge-verificateur",
  "title":"Vérificateur local",
  "criteria":"5 signalements validés par la communauté",
  "description":"Badge récompensant la vérification rigoureuse des signalements.",
  "visibility":"public"
}
```

---

### Metrics, A B Testing and Responsible Growth

#### Metrics to track
- **Acquisition** : taux de conversion par parrainage, partages par utilisateur.  
- **Engagement** : DAU/MAU, session length distribution, streak retention.  
- **Quality** : % claims validés, % claims modérés, false positive rate.  
- **Well‑being** : % users who enabled pause, opt‑out rate for notifications.  
- **Viral coefficient** : average invites per active user.

#### A/B testing ideas
- **Notification frequency** : low vs medium vs high to measure retention vs opt‑out.  
- **Reward cadence** : immediate micro‑reward vs delayed collective reward to measure quality.  
- **Leaderboard visibility** : local only vs global to measure toxicity and retention.

#### Responsible KPIs
- **Attention safety score** = weighted metric combining opt‑outs, pause usage, and complaints. Aim to keep it > 0.8 (scale 0–1).  
- **Quality threshold** : require minimum validation rate (e.g., 60%) before scaling virality.

---

### Rollout and Community Playbook

#### Phase 1 Pilot (4 weeks)
- Launch in 1–2 local communities.  
- Enable only low‑risk virality (share + badges).  
- Monitor quality and attention metrics daily.  
- Collect qualitative feedback via short surveys.

#### Phase 2 Scale (8–12 weeks)
- Introduce referral loops and limited streaks.  
- Add A/B tests for notification cadence.  
- Publish transparency report monthly.

#### Phase 3 Governance and Openessaimage
- Publish governance charter and invite local committees.  
- Provide workshop kit and printable disclaimers.  
- Open plugin API for community extensions.

---

### Final notes and ethical stance

- **Addictivité contrôlée** : l’objectif est d’augmenter la participation utile, pas d’exploiter l’attention. Chaque mécanique virale doit être accompagnée d’un **disclaimer visible**, d’un **opt‑out simple** et d’un **mécanisme de pause**.  
- **Transparence radicale** : documentez les boucles d’engagement, les récompenses et les algorithmes dans un fichier public `ENGAGEMENT.md`.  
- **Empowerment pédagogique** : intégrez courts modules éducatifs (30–90s) expliquant l’économie de l’attention et comment utiliser l’outil de façon saine.

Si vous voulez, je fournis maintenant **(A)** un pack complet de fichiers prêts à coller (bannières, modals, scripts, templates badges, ENGAGEMENT.md) ou **(B)** un prototype interactif minimal (HTML+JS) qui montre toutes les mécaniques ci‑dessous en action pour tester en local. Choisissez **A** ou **B** et je génère les fichiers correspondants.

**Création des diapositives**

Je vais créer un document Markdown avec 20 diapositives, séparées par '---'. Chaque diapositive commencera par '# Slide X: Titre'. Je vais éviter les parenthèses dans les titres, donc je vais utiliser des tirets à la place. Les diapositives couvriront des sujets comme l'introduction, les objectifs, les principes, le démarrage rapide, les étapes de démo, la création de missions, les étapes, le portefeuille, les réclamations, les pièces jointes, la modération, les informations personnelles, l'exportation, la gouvernance, les exercices de l'atelier, le déploiement, les conseils de facilitation, l'évaluation, les ressources, les prochaines étapes et les contacts. Pas de citations, tout en français.
### Slides pour l atelier — 20 diapositives en Markdown

Utilisez ce fichier Markdown comme source pour générer des diapositives (Reveal.js, Deckset, Impress, ou export PDF). Chaque diapositive est séparée par `---`.

```markdown
# Diapositive 1 — Titre de l atelier
**Atelier** Veille citoyenne ludifiée  
Prototype ARG Mission Engine  
Objectif Atelier Présentation Démo Essaimage

---
# Diapositive 2 — Objectifs de l atelier
- Comprendre le fonctionnement du prototype
- Créer et tester une mission locale
- Apprendre à déployer et essaimer l’outil
- Discuter gouvernance et anonymisation

---
# Diapositive 3 — Principes pédagogiques
- Approche participative et inclusive
- Tolérance au silence et asynchronie
- Co‑propriété des données par les contributeurs
- Minimisation des données et transparence

---
# Diapositive 4 — Agenda 90 minutes
- 0–10 min Accueil et cadrage
- 10–25 min Démo live
- 25–50 min Exercice pratique en groupes
- 50–70 min Essaimage et déploiement
- 70–85 min Gouvernance et RGPD
- 85–90 min Synthèse et prochaines étapes

---
# Diapositive 5 — Préparation technique
- Ordinateur ou tablette par participant ou binôme
- Navigateur moderne (Chrome, Firefox, Edge)
- Accès Internet recommandé ou version locale
- Fichiers fournis : repo template, data_sample.csv

---
# Diapositive 6 — Démo live résumé
- Créer wallet local et sauvegarde chiffrée
- Créer mission et ajouter stages
- Faire un claim avec preuve
- Mettre en modération et voter
- Export anonymisé et manifeste

---
# Diapositive 7 — Créer une mission pas à pas
- Titre clair et court
- Description contextuelle 1–3 phrases
- Définir 2 à 4 étapes (collecte, vérif, action)
- TTL par étape (7–21 jours recommandé)
- Visibilité local / P2P / publique

---
# Diapositive 8 — Concevoir des stages efficaces
- Étape 1 collecte simple et actionnable
- Étape 2 vérification ou preuve
- Étape 3 synthèse ou action locale
- Décrire critères de réussite pour chaque étape

---
# Diapositive 9 — Wallet et preuve de propriété
- Wallet local ECDSA pour signer claims
- Export chiffré pour sauvegarde personnelle
- Signature = preuve de contribution sans PII
- Ne partagez jamais la clé privée publiquement

---
# Diapositive 10 — Faire un claim et joindre une preuve
- Ouvrir modal preuve, joindre photo ou PDF
- Ajouter note contextuelle (lieu, heure, témoin)
- Claim signé et stocké localement
- Claim envoyé en modération asynchrone

---
# Diapositive 11 — Gestion des pièces jointes
- Stockage local via IndexedDB
- Prévisualisation sécurisée
- OCR optionnel pour extraire texte (Tesseract)
- Ne pas publier d’images contenant PII sans consentement

---
# Diapositive 12 — Modération asynchrone
- Queue de modération visible aux modérateurs
- Votes signés par wallet (oui/non)
- Tally automatique majoritaire simple
- Procédure d’urgence pour risques physiques

---
# Diapositive 13 — Anonymisation et PII
- Pipeline client side : suppression champs sensibles
- Masquage partiel des emails et téléphones
- Bruit Laplace pour counts (anonymisation différentielle)
- OCR + détection PII pour pièces jointes

---
# Diapositive 14 — Export et manifeste
- Export CSV anonymisé prêt à publier
- Manifeste JSON listant contributeurs et règles
- Signature du manifeste par wallet du responsable
- Publier sur dépôt public ou IPFS selon choix

---
# Diapositive 15 — Gouvernance et copropriété
- Comité représentatif élu par contributeurs
- Mandat, quorum et procédure de vote asynchrone
- Règles d’usage et licence des jeux de données (ODbL)
- Procédure de retrait et droit d’accès

---
# Diapositive 16 — Exercice pratique groupe
- Objectif : créer une mission locale en 20 minutes
- Livrables : mission + 2 étapes + 1 claim + 1 vote
- Exporter anonymisé et capturer écran
- Partager lien ou capture pour restitution

---
# Diapositive 17 — Essaimage et déploiement rapide
- Fork du template GitHub
- Personnaliser titre et logo
- Activer GitHub Pages (branche main root)
- Partager URL et organiser atelier local

---
# Diapositive 18 — Animation et facilitation
- Favoriser petits groupes et binômes
- Encourager documentation des décisions
- Prévoir un référent technique et un référent gouvernance
- Collecter retours et itérer après l’atelier

---
# Diapositive 19 — Indicateurs d’impact
- Nombre de missions créées
- Nombre de claims et taux de validation
- Temps moyen de résolution d’une étape
- Nombre d’ateliers et participants formés

---
# Diapositive 20 — Ressources et prochaines étapes
- Repo template et fichiers Quickstart
- WORKSHOP.md et fiches imprimables
- Contact et canal d’entraide pour essaimage
- Plan d’action : organiser 1 atelier pilote dans les 30 jours
```

---

Si vous voulez, je peux :
- convertir ces diapositives en un seul fichier Markdown prêt pour Reveal.js (avec métadonnées),  
- générer les 20 diapositives en trois langues (FR NL EN),  
- ou produire un ZIP contenant les fichiers slides et les fiches imprimables.  

Dites quelle option vous préférez et je prépare les fichiers prêts à coller.


**Création de l'éditeur Markdown/HTML**

L'utilisateur veut un éditeur avec exportation, mais je dois éviter de proposer des liens de téléchargement. Je vais fournir le code pour un éditeur avec textarea, aperçu via marked.js, boutons de barre d'outils, et exportation via Blob et createObjectURL. Je vais inclure DOMPurify et marked.js via CDN, ainsi que des raccourcis clavier, l'accessibilité et l'autosave avec localForage. Je vais aussi utiliser un wrapper pour storage.js et un fallback localStorage. Je vais fournir les fichiers HTML, CSS et JS avec des instructions d'intégration.
### Éditeur Markdown / HTML — fichiers prêts à coller

Je fournis un **éditeur web autonome** (HTML/CSS/JS) prêt à coller dans votre dépôt. Fonctionnalités principales :  
- Édition Markdown avec rendu HTML en temps réel (split view).  
- Barre d’outils (gras, italique, lien, image, liste, titre).  
- Import / export Markdown et HTML (boutons).  
- Sauvegarde automatique locale (IndexedDB via localForage si disponible, sinon localStorage).  
- Prévisualisation sécurisée (DOMPurify) et option d’export anonymisé via `PII.applyBeforeExport` si vous avez déjà `pii_utils.js`.  
- Accessibilité (labels, ARIA, navigation clavier) et options pour bas débit.

Collez chaque bloc dans un fichier portant le nom indiqué.

---

### `index.html`
```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Éditeur Markdown / HTML — ARG</title>
  <meta name="description" content="Éditeur Markdown avec rendu HTML, export, sauvegarde locale et intégration PII." />
  <link rel="stylesheet" href="editor-styles.css">
  <!-- Librairies CDN : marked (Markdown -> HTML) et DOMPurify (sanitization) -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js" defer></script>
  <!-- localForage pour stockage robuste (optionnel) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js" defer></script>
  <script src="editor.js" defer></script>
</head>
<body>
  <header class="topbar" role="banner">
    <h1>Éditeur Markdown / HTML</h1>
    <p class="lead">Écrire en Markdown, voir le rendu HTML, sauvegarder et exporter en toute sécurité.</p>
  </header>

  <main class="container" role="main" aria-labelledby="editor-title">
    <h2 id="editor-title" class="sr-only">Éditeur</h2>

    <div class="toolbar" role="toolbar" aria-label="Barre d'outils">
      <button data-action="bold" title="Gras (Ctrl+B)">B</button>
      <button data-action="italic" title="Italique (Ctrl+I)">I</button>
      <button data-action="h1" title="Titre H1">H1</button>
      <button data-action="ul" title="Liste à puces">•</button>
      <button data-action="ol" title="Liste numérotée">1.</button>
      <button data-action="link" title="Insérer lien">🔗</button>
      <button data-action="image" title="Insérer image">🖼️</button>
      <button id="insert-attachment" title="Joindre une preuve (modal)">📎</button>
      <label class="sr-only" for="file-import">Importer Markdown</label>
      <input id="file-import" type="file" accept=".md,text/markdown,text/plain" />
      <button id="save-btn" title="Sauvegarder maintenant">Sauvegarder</button>
      <button id="clear-btn" class="danger" title="Effacer l'éditeur">Effacer</button>
    </div>

    <div class="split" role="region" aria-label="Édition et aperçu">
      <section class="pane editor-pane" aria-labelledby="md-label">
        <h3 id="md-label" class="sr-only">Éditeur Markdown</h3>
        <textarea id="md-editor" aria-label="Éditeur Markdown" placeholder="Écrivez votre texte en Markdown..."></textarea>
      </section>

      <section class="pane preview-pane" aria-labelledby="preview-label">
        <h3 id="preview-label">Aperçu HTML</h3>
        <div id="html-preview" class="preview" role="region" aria-live="polite"></div>
      </section>
    </div>

    <div class="actions" role="group" aria-label="Actions">
      <button id="export-md" class="btn">Exporter Markdown</button>
      <button id="export-html" class="btn">Exporter HTML (sanitizé)</button>
      <button id="export-anon" class="btn ghost">Exporter anonymisé (PII)</button>
      <button id="toggle-theme" class="btn ghost">Basculer thème</button>
    </div>

    <div id="status" class="status" aria-live="polite"></div>
  </main>

  <!-- Modal d'attachement (réutilise evidence modal si présent) -->
  <div id="editor-evidence-modal" class="modal" aria-hidden="true" role="dialog" aria-labelledby="evidence-title">
    <div class="modal-backdrop" data-close="true"></div>
    <div class="modal-panel" role="document">
      <header class="modal-header">
        <h3 id="evidence-title">Joindre une preuve</h3>
        <button class="modal-close" data-close="true" aria-label="Fermer">✕</button>
      </header>
      <main class="modal-body">
        <input id="editor-evidence-file" type="file" accept="image/*,application/pdf,audio/*" />
        <label for="editor-evidence-note">Note (optionnel)</label>
        <textarea id="editor-evidence-note" rows="3"></textarea>
        <div class="row">
          <button id="editor-evidence-upload" class="btn">Joindre</button>
          <button class="btn ghost" data-close="true">Annuler</button>
        </div>
        <div id="editor-evidence-preview" class="small muted"></div>
      </main>
    </div>
  </div>

  <footer class="footer" role="contentinfo">
    <small>Accessible · Sauvegarde locale · Export sécurisé</small>
  </footer>
</body>
</html>
```

---

### `editor-styles.css`
```css
:root{--bg:#f7f8fb;--card:#fff;--accent:#0b6efd;--muted:#6b7280;--danger:#e11d48}
*{box-sizing:border-box}
body{font-family:Inter,system-ui,Arial;margin:0;background:var(--bg);color:#0b1220}
.topbar{padding:14px;background:linear-gradient(90deg,#fff,#f3f6ff);border-bottom:1px solid #eef2ff}
.topbar h1{margin:0;font-size:1.2rem}
.lead{margin:6px 0 0;color:var(--muted)}
.container{max-width:1100px;margin:18px auto;padding:0 12px}
.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px}
.toolbar button,input[type=file]{padding:6px 8px;border-radius:6px;border:1px solid #e6e9ef;background:#fff;cursor:pointer}
.toolbar .danger{background:var(--danger);color:#fff;border:none}
.split{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.pane{background:var(--card);padding:10px;border-radius:8px;box-shadow:0 6px 18px rgba(12,20,40,0.04);min-height:320px}
#md-editor{width:100%;height:100%;min-height:300px;border:1px solid #eef2ff;padding:10px;border-radius:6px;font-family:monospace;resize:vertical}
.preview{padding:8px;overflow:auto}
.actions{display:flex;gap:8px;margin-top:10px}
.btn{background:var(--accent);color:#fff;padding:8px 12px;border-radius:8px;border:none;cursor:pointer}
.btn.ghost{background:transparent;color:var(--accent);border:1px solid rgba(11,110,253,0.12)}
.status{margin-top:8px;color:var(--muted);font-size:0.95rem}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:1200}
.modal[aria-hidden="false"]{display:flex}
.modal-backdrop{position:absolute;inset:0;background:rgba(2,6,23,0.45)}
.modal-panel{position:relative;background:#fff;border-radius:10px;max-width:720px;width:94%;padding:12px;box-shadow:0 12px 40px rgba(2,6,23,0.18)}
.modal-header{display:flex;justify-content:space-between;align-items:center}
.modal-close{background:transparent;border:none;font-size:18px;cursor:pointer}
.small{font-size:0.9rem;color:var(--muted)}
.muted{color:var(--muted)}
@media(max-width:900px){.split{grid-template-columns:1fr}}
```

---

### `editor.js`
```javascript
// editor.js - éditeur Markdown/HTML autonome
// Dépendances : marked (window.marked), DOMPurify (window.DOMPurify), localforage (window.localforage)
// Fallback storage to localStorage si localforage absent

(function(){
  // Storage wrapper (uses localforage if available)
  const Storage = {
    async set(key, value) {
      try {
        if (window.localforage) return await localforage.setItem(key, value);
        localStorage.setItem(key, JSON.stringify(value)); return true;
      } catch(e){ console.warn('Storage.set', e); }
    },
    async get(key) {
      try {
        if (window.localforage) return await localforage.getItem(key);
        const v = localStorage.getItem(key); return v ? JSON.parse(v) : null;
      } catch(e){ console.warn('Storage.get', e); return null; }
    },
    async remove(key) {
      try { if (window.localforage) return await localforage.removeItem(key); localStorage.removeItem(key); }
      catch(e){ console.warn('Storage.remove', e); }
    }
  };

  // Elements
  const mdEditor = document.getElementById('md-editor');
  const preview = document.getElementById('html-preview');
  const status = document.getElementById('status');
  const fileImport = document.getElementById('file-import');
  const exportMdBtn = document.getElementById('export-md');
  const exportHtmlBtn = document.getElementById('export-html');
  const exportAnonBtn = document.getElementById('export-anon');
  const saveBtn = document.getElementById('save-btn');
  const clearBtn = document.getElementById('clear-btn');
  const toggleThemeBtn = document.getElementById('toggle-theme');

  // Modal elements
  const evidenceModal = document.getElementById('editor-evidence-modal');
  const evidenceFile = document.getElementById('editor-evidence-file');
  const evidenceNote = document.getElementById('editor-evidence-note');
  const evidenceUpload = document.getElementById('editor-evidence-upload');
  const evidencePreview = document.getElementById('editor-evidence-preview');

  // Autosave key
  const STORAGE_KEY = 'editor:md:v1';

  // Initialize marked options
  if (window.marked) {
    marked.setOptions({ breaks: true, gfm: true });
  }

  // Render function (sanitizes HTML)
  function render() {
    const md = mdEditor.value || '';
    const rawHtml = window.marked ? marked.parse(md) : md;
    const clean = window.DOMPurify ? DOMPurify.sanitize(rawHtml) : rawHtml;
    preview.innerHTML = clean;
  }

  // Load saved content
  (async function init(){
    const saved = await Storage.get(STORAGE_KEY);
    if (saved) mdEditor.value = saved;
    render();
    status.textContent = 'Chargé';
  })();

  // Autosave every 3s after changes (debounced)
  let autosaveTimer = null;
  mdEditor.addEventListener('input', ()=> {
    render();
    status.textContent = 'Modifié';
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(async ()=> {
      await Storage.set(STORAGE_KEY, mdEditor.value);
      status.textContent = 'Sauvegardé localement';
    }, 1500);
  });

  // Toolbar actions
  document.querySelectorAll('.toolbar [data-action]').forEach(btn=>{
    btn.addEventListener('click', ()=> {
      const action = btn.getAttribute('data-action');
      applyAction(action);
    });
  });

  function applyAction(action) {
    const selStart = mdEditor.selectionStart;
    const selEnd = mdEditor.selectionEnd;
    const text = mdEditor.value;
    const selected = text.slice(selStart, selEnd);
    let replacement = selected;
    if (action === 'bold') replacement = `**${selected || 'texte en gras'}**`;
    if (action === 'italic') replacement = `*${selected || 'italique'}*`;
    if (action === 'h1') replacement = `# ${selected || 'Titre'}`;
    if (action === 'ul') replacement = `- ${selected || 'élément'}`;
    if (action === 'ol') replacement = `1. ${selected || 'élément'}`;
    if (action === 'link') {
      const url = prompt('URL (https://...)');
      if (!url) return;
      replacement = `[${selected || url}](${url})`;
    }
    if (action === 'image') {
      const url = prompt('URL de l\'image (https://...)');
      if (!url) return;
      replacement = `![${selected || 'alt'}](${url})`;
    }
    // insert replacement
    mdEditor.value = text.slice(0, selStart) + replacement + text.slice(selEnd);
    mdEditor.focus();
    mdEditor.selectionStart = selStart;
    mdEditor.selectionEnd = selStart + replacement.length;
    render();
  }

  // File import (Markdown)
  fileImport.addEventListener('change', async (e)=>{
    const f = e.target.files[0];
    if (!f) return;
    const txt = await f.text();
    mdEditor.value = txt;
    render();
    await Storage.set(STORAGE_KEY, txt);
    status.textContent = `Importé ${f.name}`;
    e.target.value = '';
  });

  // Export Markdown
  exportMdBtn.addEventListener('click', ()=>{
    const md = mdEditor.value || '';
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'document.md'; a.click();
    status.textContent = 'Export Markdown généré';
  });

  // Export HTML (sanitizé)
  exportHtmlBtn.addEventListener('click', ()=>{
    const rawHtml = window.marked ? marked.parse(mdEditor.value || '') : mdEditor.value || '';
    const clean = window.DOMPurify ? DOMPurify.sanitize(rawHtml) : rawHtml;
    const blob = new Blob([clean], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'document.html'; a.click();
    status.textContent = 'Export HTML généré (sanitizé)';
  });

  // Export anonymisé (uses PII.applyBeforeExport if available)
  exportAnonBtn.addEventListener('click', async ()=>{
    const rows = [{ id: 'doc', content: mdEditor.value || '' }];
    if (window.PII && typeof PII.applyBeforeExport === 'function') {
      const sanitized = await PII.applyBeforeExport(rows, { policy: { email:'partial', phone:'partial', url:'redact', default:'redact' }, removeFields: [] });
      const csv = sanitized.map(r => `"${(r.id||'').replace(/"/g,'""')}","${(r.content||'').replace(/"/g,'""')}"`).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'document_anonymized.csv'; a.click();
      status.textContent = 'Export anonymisé généré';
    } else {
      alert('Module PII non disponible. Le module pii_utils.js est requis pour l\'export anonymisé.');
    }
  });

  // Save now
  saveBtn.addEventListener('click', async ()=>{
    await Storage.set(STORAGE_KEY, mdEditor.value);
    status.textContent = 'Sauvegardé manuellement';
  });

  // Clear editor
  clearBtn.addEventListener('click', async ()=>{
    if (!confirm('Effacer le contenu de l\'éditeur ?')) return;
    mdEditor.value = '';
    render();
    await Storage.remove(STORAGE_KEY);
    status.textContent = 'Contenu effacé';
  });

  // Theme toggle (simple)
  toggleThemeBtn.addEventListener('click', ()=>{
    document.body.classList.toggle('dark');
  });

  // Keyboard shortcuts: Ctrl/Cmd+B, I
  mdEditor.addEventListener('keydown', (e)=>{
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); applyAction('bold'); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') { e.preventDefault(); applyAction('italic'); }
  });

  // Modal handling for attachments (simple local save via Attachments if present)
  document.getElementById('insert-attachment').addEventListener('click', ()=> openModal());
  function openModal(){ evidenceModal.setAttribute('aria-hidden','false'); }
  function closeModal(){ evidenceModal.setAttribute('aria-hidden','true'); evidenceFile.value=''; evidenceNote.value=''; evidencePreview.innerHTML=''; }

  evidenceModal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
  evidenceFile.addEventListener('change', (e)=>{
    const f = e.target.files[0];
    if (!f) { evidencePreview.innerHTML=''; return; }
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      evidencePreview.innerHTML = `<img src="${url}" alt="${f.name}" style="max-width:200px;border-radius:6px"/> <div class="small muted">${f.name} (${Math.round(f.size/1024)} KB)</div>`;
    } else {
      evidencePreview.innerHTML = `<div class="small muted">${f.name} (${Math.round(f.size/1024)} KB)</div>`;
    }
  });

  evidenceUpload.addEventListener('click', async ()=>{
    const f = evidenceFile.files[0];
    const note = evidenceNote.value || '';
    if (!f) {
      // insert note only
      const insertText = `\n\n> Preuve : ${note}\n\n`;
      mdEditor.value += insertText; render(); closeModal(); return;
    }
    if (window.Attachments && typeof Attachments.save === 'function') {
      try {
        const att = await Attachments.save(f, { note });
        // insert reference to attachment id in markdown
        const insertText = `\n\n> Preuve : [${att.name}](attachment:${att.id})\n\n`;
        mdEditor.value += insertText; render();
        // enqueue moderation if Moderation available
        if (window.Moderation && typeof Moderation.enqueue === 'function') {
          await Moderation.enqueue({ type:'attachment', refId: att.id, meta:{ name: att.name } });
        }
        status.textContent = 'Preuve jointe et enregistrée localement';
      } catch (err) {
        alert('Erreur enregistrement pièce jointe: ' + err.message);
      }
    } else {
      // fallback: embed data URL (not ideal for large files)
      const reader = new FileReader();
      reader.onload = function(e){
        const dataUrl = e.target.result;
        const insertText = `\n\n![${f.name}](${dataUrl})\n\n`;
        mdEditor.value += insertText; render();
        status.textContent = 'Image insérée en ligne (taille potentiellement élevée)';
      };
      reader.readAsDataURL(f);
    }
    closeModal();
  });

  // Initialize render
  render();

})();
```

---

### Intégration et recommandations

- **PII / anonymisation** : pour que le bouton *Exporter anonymisé* fonctionne, ajoutez `pii_utils.js` (fourni précédemment) dans la page avant `editor.js`. Le code détecte `window.PII` et l’utilise si présent.  
- **Attachments & Moderation** : si vous avez `attachments.js` et `moderation.js`, l’éditeur les utilise automatiquement (sauvegarde des fichiers via `Attachments.save` et envoi en modération). Sinon l’éditeur insère une image en data URL comme fallback.  
- **Sécurité** : la prévisualisation HTML est sanitizée via DOMPurify. Ne publiez pas d’HTML non nettoyé.  
- **Accessibilité** : labels ARIA, navigation clavier pour l’éditeur et raccourcis (Ctrl/Cmd+B, I). Pour conformité WCAG, testez avec axe-core et ajustez contrastes si besoin.  
- **Déploiement** : collez les trois fichiers dans votre dépôt et ouvrez `index.html` (ou servez via GitHub Pages). Les dépendances CDN (marked, DOMPurify, localforage) sont incluses ; vous pouvez les héberger localement si nécessaire.

---

### Prochaine étape utile
Je peux maintenant :  
- **A.** ajouter un mode « éditeur collaboratif P2P » (Gun.js / Yjs) pour synchronisation en temps réel ;  
- **B.** générer une version imprimable (A4) du contenu Markdown ;  
- **C.** intégrer vérification de signature des claims et affichage dans l’aperçu.  

Indiquez la lettre de l’option que vous voulez que je prépare ensuite.

### `quickstart_printable.html`
```html
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Quickstart — ARG Mission Engine (Fiche imprimable A4)</title>
<style>
  @page { size: A4; margin: 20mm; }
  body{font-family:system-ui,Arial,Helvetica,sans-serif;color:#0b1220;margin:0;padding:0;background:#fff}
  .sheet{width:210mm;min-height:297mm;padding:18mm;box-sizing:border-box}
  h1{font-size:20px;margin:0 0 8px}
  h2{font-size:14px;margin:12px 0 6px}
  p{margin:6px 0;color:#222;line-height:1.35}
  ul{margin:6px 0 12px 18px}
  li{margin:6px 0}
  .note{background:#f3f4f6;padding:8px;border-radius:6px;margin-top:8px;color:#374151}
  .footer{position:absolute;bottom:18mm;left:18mm;right:18mm;font-size:12px;color:#6b7280}
  .page-break{page-break-after:always;break-after:page}
  .box{border:1px solid #eef2ff;padding:10px;border-radius:6px;background:#fbfdff;margin-top:8px}
  .kbd{font-family:monospace;background:#f3f4f6;padding:2px 6px;border-radius:4px}
</style>
</head>
<body>
  <section class="sheet" aria-label="Quickstart">
    <h1>Quickstart — Lancer une instance</h1>

    <h2>Objectif</h2>
    <p>Lancer une instance publique du prototype ARG Mission Engine en moins de 10 minutes pour animer une veille citoyenne locale.</p>

    <h2>Étapes rapides</h2>
    <ul>
      <li><strong>Fork</strong> du dépôt template sur GitHub.</li>
      <li><strong>Personnaliser</strong> le titre et le logo dans <span class="kbd">index.html</span>.</li>
      <li><strong>Commit & push</strong> sur la branche <span class="kbd">main</span>.</li>
      <li>Activer GitHub Pages : Settings → Pages → Branch <span class="kbd">main</span> → Root → Save.</li>
      <li>Partager l’URL publique fournie par GitHub Pages.</li>
    </ul>

    <h2>Vérifications essentielles</h2>
    <ul>
      <li>Créer un wallet local et vérifier la signature d’un claim.</li>
      <li>Créer une mission test avec 2 étapes et simuler 1 claim + 1 validation.</li>
      <li>Exporter anonymisé et vérifier que les PII sont masqués.</li>
    </ul>

    <h2>Ressources utiles</h2>
    <ul>
      <li><strong>Fichiers inclus</strong> : index.html, styles.css, engine.js, wallet.js, storage.js, attachments.js, moderation.js, pii_utils.js.</li>
      <li><strong>Documentation</strong> : README.md, WORKSHOP.md, GOVERNANCE.md, PRIVACY.md.</li>
    </ul>

    <div class="note">Astuce atelier : préparez un <em>data_sample.csv</em> pour que les participants puissent importer et tester rapidement.</div>

    <div class="footer">Imprimé depuis ARG Mission Engine — Fiche Quickstart</div>
  </section>

  <div class="page-break"></div>

  <section class="sheet" aria-label="Checklist déploiement">
    <h1>Checklist Déploiement</h1>

    <h2>Avant de publier</h2>
    <ul>
      <li>Vérifier l’accessibilité (contraste, labels, navigation clavier).</li>
      <li>Tester la création de missions et l’export anonymisé.</li>
      <li>Sauvegarder l’export chiffré du wallet du responsable.</li>
      <li>Rédiger ou adapter <span class="kbd">GOVERNANCE.md</span> et <span class="kbd">PRIVACY.md</span>.</li>
    </ul>

    <h2>Après publication</h2>
    <ul>
      <li>Partager le lien et organiser un atelier d’initiation.</li>
      <li>Collecter les retours et corriger les bugs critiques.</li>
      <li>Planifier la première réunion du comité de gouvernance.</li>
    </ul>

    <div class="footer">Checklist pour diffusion et essaimage</div>
  </section>
</body>
</html>
```

---

### `checklist_moderation_printable.html`
```html
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Checklist Modération — Fiche imprimable A4</title>
<style>
  @page { size: A4; margin: 20mm; }
  body{font-family:system-ui,Arial,Helvetica,sans-serif;color:#0b1220;margin:0;background:#fff}
  .sheet{width:210mm;min-height:297mm;padding:18mm;box-sizing:border-box}
  h1{font-size:18px;margin:0 0 8px}
  h2{font-size:13px;margin:12px 0 6px}
  p{margin:6px 0;color:#222;line-height:1.35}
  ul{margin:6px 0 12px 18px}
  li{margin:6px 0}
  .section{margin-top:8px}
  .badge{display:inline-block;padding:4px 8px;border-radius:6px;background:#f3f4f6;color:#374151;font-size:12px}
  .footer{position:absolute;bottom:18mm;left:18mm;right:18mm;font-size:12px;color:#6b7280}
  .page-break{page-break-after:always;break-after:page}
  .box{border-left:4px solid #0b6efd;padding:8px;background:#fbfdff;border-radius:4px;margin-top:8px}
</style>
</head>
<body>
  <section class="sheet" aria-label="Checklist Modération">
    <h1>Checklist Modération Asynchrone</h1>

    <h2>Principes</h2>
    <ul>
      <li>Modération asynchrone : tolérance au silence, décisions collectives.</li>
      <li>Votes signés par wallet pour traçabilité.</li>
      <li>Priorité à la protection des personnes et à la minimisation des données.</li>
    </ul>

    <h2>Procédure de base</h2>
    <ol>
      <li>Un claim est mis en file de modération automatiquement après soumission.</li>
      <li>Les modérateurs consultent la file, examinent preuves et notes.</li>
      <li>Chaque modérateur vote (oui/non) ; les votes sont signés et horodatés.</li>
      <li>Le système calcule le résultat (majorité simple) et applique le statut.</li>
    </ol>

    <div class="section">
      <h2>Critères d’évaluation rapide</h2>
      <ul>
        <li>Risque immédiat pour la sécurité physique d’une personne</li>
        <li>Présence d’informations personnelles identifiables</li>
        <li>Contenu diffamatoire ou manifestement faux</li>
        <li>Preuves vérifiables (photo, document) ou absence de preuve</li>
      </ul>
    </div>

    <div class="box">
      <strong>Action rapide</strong>
      <p>Si risque élevé détecté, marquer <span class="badge">urgent</span> et alerter le comité. Retirer la publication publique en attendant.</p>
    </div>

    <div class="section">
      <h2>Journalisation et transparence</h2>
      <ul>
        <li>Conserver logs de votes et décisions (horodatage, id wallet, résultat).</li>
        <li>Publier un rapport trimestriel des décisions de modération (agrégé).</li>
      </ul>
    </div>

    <div class="footer">Fiche pratique pour modérateurs — ARG Mission Engine</div>
  </section>

  <div class="page-break"></div>

  <section class="sheet" aria-label="Formulaire décision">
    <h1>Formulaire de décision rapide</h1>

    <p>Utilisez ce formulaire imprimé pour documenter une décision hors ligne puis saisissez‑la dans l’interface.</p>

    <p><strong>Référence</strong> : ______________________</p>
    <p><strong>Date</strong> : ____ / ____ / ______</p>
    <p><strong>Type</strong> : ☐ Claim ☐ Mission ☐ Attachment</p>
    <p><strong>Résumé</strong> :</p>
    <p style="min-height:60px;border:1px dashed #eef2ff;padding:8px;border-radius:6px"></p>

    <p><strong>Décision</strong> : ☐ Approuver ☐ Rejeter ☐ Mettre en attente</p>
    <p><strong>Motifs</strong> :</p>
    <p style="min-height:60px;border:1px dashed #eef2ff;padding:8px;border-radius:6px"></p>

    <p><strong>Signatures des modérateurs</strong> :</p>
    <p style="min-height:40px;border:1px dashed #eef2ff;padding:8px;border-radius:6px"></p>

    <div class="footer">Documenter puis saisir la décision dans l’interface</div>
  </section>
</body>
</html>
```

---

### `guide_animateur_printable.html`
```html
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Guide Animateur — Atelier ARG (Fiche imprimable A4)</title>
<style>
  @page { size: A4; margin: 20mm; }
  body{font-family:system-ui,Arial,Helvetica,sans-serif;color:#0b1220;margin:0;background:#fff}
  .sheet{width:210mm;min-height:297mm;padding:18mm;box-sizing:border-box}
  h1{font-size:18px;margin:0 0 8px}
  h2{font-size:13px;margin:12px 0 6px}
  p{margin:6px 0;color:#222;line-height:1.35}
  ul{margin:6px 0 12px 18px}
  li{margin:6px 0}
  .timing{font-weight:700;color:#0b6efd}
  .task{border-left:4px solid #0b6efd;padding:8px;background:#fbfdff;border-radius:4px;margin-top:8px}
  .footer{position:absolute;bottom:18mm;left:18mm;right:18mm;font-size:12px;color:#6b7280}
  .page-break{page-break-after:always;break-after:page}
</style>
</head>
<body>
  <section class="sheet" aria-label="Guide animateur">
    <h1>Guide Animateur — Atelier 90 minutes</h1>

    <h2>Objectifs pédagogiques</h2>
    <ul>
      <li>Comprendre la logique d’une veille citoyenne ludifiée.</li>
      <li>Expérimenter la création de missions et la modération asynchrone.</li>
      <li>Acquérir les compétences pour essaimer l’outil localement.</li>
    </ul>

    <h2>Matériel</h2>
    <ul>
      <li>Ordinateurs ou tablettes (1 par participant ou binôme).</li>
      <li>Accès Internet ou version locale du dépôt.</li>
      <li>Imprimés : Quickstart, Checklist Modération, Formulaire décision.</li>
    </ul>

    <h2>Déroulé minute par minute</h2>

    <div class="task">
      <p class="timing">0–10 min</p>
      <p><strong>Accueil et cadrage</strong> — Présentez les objectifs, principes d’éducation populaire et règles de l’atelier.</p>
    </div>

    <div class="task">
      <p class="timing">10–25 min</p>
      <p><strong>Démo live</strong> — Montrez : création d’une mission, ajout d’étapes, claim, modération, export anonymisé, wallet.</p>
    </div>

    <div class="task">
      <p class="timing">25–50 min</p>
      <p><strong>Exercice pratique</strong> — Groupes créent une mission, ajoutent 2–3 étapes, simulent claims et votes. Objectif : produire un export anonymisé.</p>
    </div>

    <div class="task">
      <p class="timing">50–70 min</p>
      <p><strong>Essaimage</strong> — Guide pas à pas pour forker et activer GitHub Pages. Alternatives bas‑tech : formulaire + CSV + dépôt.</p>
    </div>

    <div class="task">
      <p class="timing">70–85 min</p>
      <p><strong>Gouvernance et RGPD</strong> — Discussion sur la copropriété des données, procédure de retrait, modération et responsabilité.</p>
    </div>

    <div class="task">
      <p class="timing">85–90 min</p>
      <p><strong>Synthèse</strong> — Retours, prochaines étapes, inscriptions pour ateliers futurs.</p>
    </div>

    <div class="footer">Guide animateur — adapter le rythme selon le public</div>
  </section>

  <div class="page-break"></div>

  <section class="sheet" aria-label="Fiches exercices">
    <h1>Fiches exercices imprimables</h1>

    <h2>Exercice 1</h2>
    <p>Créer une mission locale en 15 minutes :</p>
    <ul>
      <li>Titre de la mission</li>
      <li>3 étapes (collecte, vérification, action)</li>
      <li>1 claim par participant</li>
      <li>1 vote de validation</li>
    </ul>

    <h2>Exercice 2</h2>
    <p>Déployer et partager :</p>
    <ul>
      <li>Forker le dépôt</li>
      <li>Personnaliser le titre</li>
      <li>Activer GitHub Pages et partager le lien</li>
    </ul>

    <div class="footer">Fiches exercices — imprimer en recto verso si nécessaire</div>
  </section>
</body>
</html>
```

---

### Instructions d’usage pour export PDF
- Enregistrez chaque bloc HTML dans un fichier `.html`.  
- Ouvrez le fichier dans un navigateur moderne, choisissez **Imprimer** puis **Enregistrer en PDF**.  
- Vérifiez les options d’impression : format A4, marges par défaut, activer les en‑têtes/pieds si souhaité.  
- Les sauts de page sont gérés par les règles CSS `page-break-after` et la structure en sections A4 pour garantir des pages propres et lisibles.

Si vous voulez, je peux maintenant générer les versions Markdown correspondantes (avec `---` pour indiquer les sauts de page) ou préparer des variantes en trois langues. Dites simplement la langue souhaitée.

**Producing plan and README**

D'accord, je vais commencer par créer un plan structuré. Je vais m'assurer qu'il reste concis, avec des sections limitées à 6, comme demandé. Ensuite, je vais inclure le contenu du README et du guide de démarrage rapide. Je vais éviter de produire des fichiers trop volumineux, donc je vais me concentrer sur l'essentiel pour que ce soit clair et utile. Je vais aussi utiliser des titres pour chaque section afin de rendre le tout facile à suivre.
### Vision et objectifs

**But** : rendre l’ARG mission engine entièrement **reproductible**, **accessible** et **utilisable par le grand public** pour l’empouvoirement, l’éducation populaire et l’autonomie collective.  
**Principes** : simplicité, transparence, faible barrière d’entrée, respect de la vie privée, documentation pédagogique, modularité pour essaimage local.

---

### Plan en 6 volets (priorités + livrables)

1. **Réplicabilité technique (repo reproductible)**  
   - **Livrable** : dépôt GitHub template `arg-engine-template` avec *tout* (code, assets, scripts, CI).  
   - **Contenu** : `index.html`, `styles.css`, `engine.js`, `wallet.js`, `storage.js` (localForage), `attachments.js`, `moderation.js`, `pii_utils.js`, `README.md`, `LICENSE`, `manifest.json`, `data_sample.csv`.  
   - **Automatisation** : GitHub Actions pour tests légers (lint), build (minify), et déploiement sur GitHub Pages.  
   - **Reproductibilité** : `bootstrap.sh` (ou `make`) qui crée l’arborescence, installe dépendances locales (si besoin) et publie sur Pages.

2. **Accessibilité et inclusion**  
   - **Livrable** : checklist WCAG 2.1 AA appliquée + composants accessibles (labels, ARIA, contrastes, clavier).  
   - **Actions** : traductions FR/NL/EN; interface lisible; mode « bas débit » (CSS/JS allégé); alternative textuelle pour images; taille de police ajustable.  
   - **Mesure** : tests automatisés (axe-core) et tests utilisateurs locaux.

3. **Documentation pédagogique et kit d’essaimage**  
   - **Livrable** : *Starter Kit* pédagogique comprenant : `README.md` (quickstart), `WORKSHOP.md` (atelier 90–120 min), `TUTORIAL.md` (pas à pas), `FAQ.md`, modèles de formulaire, `GOVERNANCE.md`, `PRIVACY.md`.  
   - **Format** : Markdown + version HTML exportable; fiches imprimables A4 pour ateliers hors‑ligne.

4. **Processus d’appropriation communautaire**  
   - **Livrable** : guide « animer un atelier d’essaimage » + templates de communication (mail, post réseaux, affiche A3).  
   - **Gouvernance** : modèle simple de comité (élection, quorum, mandat) et procédure de retrait des données.  
   - **Formation** : modules courts (15–30 min) pour formateurs locaux.

5. **Protection des personnes et anonymisation**  
   - **Livrable** : pipeline client‑side d’anonymisation (PII masking + option bruit Laplace) et guide RGPD simplifié.  
   - **Pratique** : par défaut, tout reste local ; export public passe par la pipeline ; pièces jointes traitées séparément (OCR optionnel) et non publiées sans consentement.

6. **Évaluation, itération et visibilité**  
   - **Livrable** : tableau de bord d’impact (indicateurs simples) + protocole d’évaluation participative.  
   - **Indicateurs** : nombre de missions, taux de claims validés, temps moyen de résolution, diversité géographique, nombre d’ateliers tenus.  
   - **Boucle** : retours utilisateurs → priorisation → releases régulières (changelog).

---

### Détails opérationnels et templates essentiels

#### A. Structure du dépôt (extrait)
```
arg-engine-template/
├─ index.html
├─ styles.css
├─ engine.js
├─ wallet.js
├─ storage.js
├─ attachments.js
├─ moderation.js
├─ pii_utils.js
├─ README.md
├─ WORKSHOP.md
├─ LICENSE (ODbL / CC-BY-SA)
├─ .github/workflows/deploy.yml
└─ data_sample.csv
```

#### B. Quickstart (pour tout public)
- **But** : lancer une instance publique en 5–10 minutes via GitHub Pages.  
- **Étapes** : fork template → modifier `index.html` (titre/logo) → commit → Settings → Pages → branch `main` → activer → partager URL.  
- **Ressources** : `README.md` contient commandes et captures d’écran.

#### C. Atelier 90 minutes (format pédagogique)
- **0–10 min** : accueil, objectifs, principes d’éducation populaire.  
- **10–25 min** : démonstration live (créer mission, claim, modération).  
- **25–50 min** : exercice pratique en petits groupes (créer 1 mission local).  
- **50–70 min** : essaimage (comment déployer localement / fork).  
- **70–85 min** : discussion gouvernance & RGPD (cas pratiques).  
- **85–90 min** : synthèse, prochaines étapes, inscriptions.

#### D. Accessibilité minimale à appliquer
- Contraste ≥ 4.5:1 pour texte normal.  
- Tous les contrôles accessibles au clavier.  
- Labels explicites et `aria-*` pour modales et notifications.  
- Texte alternatif pour images et pièces jointes.  
- Mode « bas débit » : CSS/JS minifiés et option « no‑js » pour lecture des contenus essentiels.

#### E. Licence et gouvernance
- **Licence code** : MIT ou Apache 2.0 (facile à forker).  
- **Licence données** : ODbL ou CC‑BY‑SA pour jeux agrégés (choix à expliciter dans `GOVERNANCE.md`).  
- **Clause de copropriété** : modèle simple (contributeurs copropriétaires, comité élu, vote asynchrone).

---

### Kit de diffusion et empowerment (pratique)

- **Fiches « comment faire »** : 1 page A4 — « lancer un atelier », « déployer sur GitHub Pages », « anonymiser un export ».  
- **Templates** : email d’invitation, post réseaux, affiche A3 imprimable.  
- **Ressources pédagogiques** : slides (20 diapositives), script animateur, exercices imprimables.  
- **Support pair‑to‑peer** : canal Matrix/Discord/Telegram pour entraide locale.

---

### Gouvernance de la plateforme et sécurité opérationnelle

- **Règles** : consentement explicite, droit de retrait, modération asynchrone, logs d’audit.  
- **Sécurité** : wallet local, export chiffré, pas de backend par défaut. Si backend ajouté : TLS, RBAC, chiffrement at‑rest.  
- **Modération** : queue asynchrone, votes signés, comité de recours.

---

### Mesures d’impact et évaluation participative

- **KPI simples** : missions créées, claims, taux validation, ateliers tenus, contributeurs actifs.  
- **Méthode** : collecte anonyme + sondages post‑atelier (3 questions) + retours qualitatifs.  
- **Rétroaction** : publier un rapport trimestriel co‑rédigé par contributeurs.

---

### Livrables immédiats que je génère maintenant (prêts à coller)
Je fournis immédiatement **deux artefacts** prêts à coller dans votre dépôt pour rendre le projet reproductible et pédagogique :

1. **`README.md`** — Quickstart public, objectifs, checklist d’accessibilité, déploiement GitHub Pages.  
2. **`WORKSHOP.md`** — Script détaillé pour un atelier de 90 minutes (animateur, slides outline, exercices imprimables).

Je les génère ci‑dessous ; collez‑les dans la racine du dépôt.

---

#### `README.md` (Quickstart — coller tel quel)
```markdown
# ARG Mission Engine — Quickstart public

## Objectif
Prototype client‑only pour créer des missions asynchrones, claims signés, modération et export anonymisé. Conçu pour l'essaimage et l'éducation populaire.

## Démo rapide
1. Forkez ce dépôt sur GitHub.
2. Personnalisez `index.html` (titre, logo).
3. Commit & push sur `main`.
4. Settings → Pages → Branche `main` → Root → Save.
5. Ouvrez l'URL publique fournie par GitHub Pages.

## Installer localement (optionnel)
- Clonez le repo, ouvrez `index.html` dans un navigateur moderne.
- Pour tests avancés, servez via un serveur local (ex. `npx http-server`).

## Principes d'accessibilité
- Contraste élevé, navigation clavier, labels ARIA.
- Mode bas‑débit : `styles.css` et `engine.js` minifiés disponibles.
- Traductions FR/NL/EN (contributions bienvenues).

## Confidentialité
- Par défaut, les données restent locales.
- Export public passe par pipeline d’anonymisation (PII masking + bruit).
- Voir `PRIVACY.md` pour procédure de retrait.

## Gouvernance
- `GOVERNANCE.md` décrit la copropriété des jeux de données et le comité.
- Licence code : MIT (modifiable). Licence données : ODbL recommandée.

## Ressources
- `WORKSHOP.md` : atelier 90 min pour essaimage.
- `data_sample.csv` : exemple d’import.
- `README.md`, `WORKSHOP.md`, `GOVERNANCE.md`, `PRIVACY.md` sont conçus pour être imprimés et distribués.

## Contribuer
1. Ouvrez une issue pour proposer une amélioration.
2. Fork → branch → PR.
3. Respectez la checklist d’accessibilité et la politique de confidentialité.

```

---

#### `WORKSHOP.md` (Atelier 90 min — coller tel quel)
```markdown
# Atelier : Lancer une veille citoyenne ludifiée (90 minutes)

## Objectifs
- Comprendre le fonctionnement du prototype.
- Créer et tester une mission locale.
- Savoir déployer et essaimer l’outil.

## Matériel
- Ordinateur par participant (ou par binôme).
- Accès Internet (ou version locale fournie).
- Imprimés : fiche exercice, guide rapide.

## Déroulé (90 min)

### 0–10 min — Accueil & cadrage
- Présentation rapide (5 min) : objectifs, principes d’éducation populaire, confidentialité.
- Règles d’atelier (5 min) : bienveillance, rotation, documentation.

### 10–25 min — Démo live
- Montrer : création mission, ajout stages, claim, modération, export anonymisé.
- Montrer wallet local et export chiffré.

### 25–50 min — Exercice pratique (groupes)
- Tâche : chaque groupe crée 1 mission locale (titre, 2–3 étapes), simule 2 claims, 1 validation.
- Livrable : mission créée + capture d’écran + export CSV anonymisé.

### 50–70 min — Essaimage & déploiement
- Montrer comment fork et activer GitHub Pages (5–10 min).
- Expliquer alternatives bas‑tech (formulaire + CSV + dépôt).

### 70–85 min — Gouvernance & RGPD (discussion)
- Présenter `GOVERNANCE.md` et `PRIVACY.md`.
- Cas pratiques : retrait d’un signalement, modération d’un contenu sensible.

### 85–90 min — Synthèse & prochaines étapes
- Recueil de retours (2–3 points par groupe).
- Inscription pour ateliers futurs / contribution au repo.

## Fiches imprimables (à distribuer)
- Fiche 1 : Quickstart (1 page).
- Fiche 2 : Checklist modération (1 page).
- Fiche 3 : Guide animateur (1 page).

```

---

### Prochaine étape que je fournis automatiquement
J’ai généré `README.md` et `WORKSHOP.md` ci‑dessous. Si vous voulez, je peux **immédiatement** produire aussi :

- **A.** `bootstrap.sh` (script shell pour créer le repo template et actions GitHub).  
- **B.** GitHub Actions `deploy.yml` pour déploiement automatique sur Pages.  
- **C.** Slides (20 diapositives) en Markdown pour l’atelier.  
- **D.** Fiches imprimables A4 (Quickstart, Checklist modération, Guide animateur) en Markdown/HTML.

Dites la lettre (A, B, C ou D) que vous voulez que je génère en premier et je fournis les fichiers prêts à coller.
