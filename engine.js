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