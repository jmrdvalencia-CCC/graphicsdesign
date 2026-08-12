const SECTIONS = [
  { id:'foundations-definition', label:'Definition', file:'part1a-definition.html', accent:'#e0672c', bgA:'#fbe4d5', bgB:'#f8f1e6', angle:0 },
  { id:'foundations-history',    label:'History',     file:'part1b-history.html',    accent:'#e0672c', bgA:'#fbe4d5', bgB:'#f8f1e6', angle:0 },
  { id:'properties',  label:'Wheel & Properties',  file:'part2-properties.html',  accent:'#d69a1f', bgA:'#faedcc', bgB:'#f8f2e4', angle:51  },
  { id:'harmonies',   label:'Harmonies',            file:'part3-harmonies.html',   accent:'#8a3ae8', bgA:'#ece0fb', bgB:'#f5f1f9', angle:103 },
  { id:'ratio',       label:'The 60-30-10 Rule',    file:'part4-ratio.html',       accent:'#3a6fc9', bgA:'#dbe8fb', bgB:'#f1f4f9', angle:154 },
  { id:'psychology',  label:'Psychology & Culture', file:'part5-psychology.html',  accent:'#c53a52', bgA:'#f9dde2', bgB:'#f8eeee', angle:206 },
  { id:'systems',     label:'Systems: RGB/CMYK',    file:'part6-systems.html',     accent:'#1f8f88', bgA:'#d6f0ec', bgB:'#eef6f4', angle:257 },
  { id:'activity',    label:'Activity & Summary',   file:'part7-activity.html',    accent:'#3f8a4d', bgA:'#e0f0e0', bgB:'#f0f5ee', angle:309 },
];

function hexToRgba(hex, a){
  const v = hex.replace('#','');
  const r = parseInt(v.substr(0,2),16), g = parseInt(v.substr(2,2),16), b = parseInt(v.substr(4,2),16);
  return `rgba(${r},${g},${b},${a})`;
}

function buildRail(activeId){
  const s = SECTIONS.find(x => x.id === activeId);
  if(s){
    document.documentElement.style.setProperty('--accent', s.accent);
    document.documentElement.style.setProperty('--accent-soft', hexToRgba(s.accent, 0.16));
    document.documentElement.style.setProperty('--bg-a', s.bgA);
    document.documentElement.style.setProperty('--bg-b', s.bgB);
    document.querySelector('main').style.background =
      `radial-gradient(circle at 12% -10%, ${s.bgA}, transparent 55%), ${s.bgB}`;
  }

  const wheelWrap = document.querySelector('.wheel-wrap');
  const navlist   = document.getElementById('navlist');
  const tabstrip  = document.getElementById('tabstrip');
  const centerLabel = document.getElementById('wheelCenterLabel');
  const radius = 106;

  SECTIONS.forEach((sec, i) => {
    // wheel node
    const rad = (sec.angle - 90) * Math.PI / 180;
    const x = 106 + radius * Math.cos(rad);
    const y = 106 + radius * Math.sin(rad);
    const node = document.createElement('a');
    node.className = 'wheel-node' + (sec.id === activeId ? ' active' : '');
    node.href = sec.file;
    node.style.left = x + 'px'; node.style.top = y + 'px';
    node.style.background = sec.accent;
    node.style.color = sec.accent;
    node.setAttribute('aria-label', sec.label);
    wheelWrap.appendChild(node);

    // sidebar nav
    const li  = document.createElement('li');
    const btn = document.createElement('a');
    btn.className = 'navbtn' + (sec.id === activeId ? ' active' : '');
    btn.href = sec.file;
    btn.innerHTML = `<span class="num">${String(i+1).padStart(2,'0')}</span><span class="dot" style="background:${sec.accent}"></span><span>${sec.label}</span>`;
    li.appendChild(btn);
    navlist.appendChild(li);

    // mobile tab chip
    const chip = document.createElement('a');
    chip.className = 'tabchip' + (sec.id === activeId ? ' active' : '');
    chip.href = sec.file;
    chip.innerHTML = `<span class="dot" style="background:${sec.accent}"></span>${sec.label}`;
    tabstrip.appendChild(chip);
  });

  if(s){
    const idx = SECTIONS.indexOf(s);
    // group sub-entries under the same display number
    const displayNum = String(idx + 1).padStart(2, '0');
    centerLabel.innerHTML = `${displayNum}<br>${s.label}`;
  }
}
