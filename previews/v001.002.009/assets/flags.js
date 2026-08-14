<script>
(async () => {
  try {
    const res = await fetch('/z...PL...ZZ47E2A1...9C63...4F0D...8E5A...71C29B6F3D84/previews/v001.002.009/features.json', { cache: 'no-store' });
    if (!res.ok) return;
    const cfg = await res.json();
    if (!cfg?.nav) return;

    // Find the container that holds the three blocks
    const parent = document.querySelector('.catalogue-menu-wrapper');
    if (!parent) return;

    // Map logical keys → actual elements
    // Adjust selectors only if your classes differ.
    const mapping = {
      look_up:   parent.querySelector('.nav-links-block-2._1'),
      create:    parent.querySelector('.nav-links-block-2._2'),
      validate:  parent.querySelector('.nav-links-block-2.no-border._3')
    };

    // Remove disabled ones; collect enabled for reordering
    const enabled = [];
    for (const key of Object.keys(mapping)) {
      const el = mapping[key];
      if (!el) continue;
      if (cfg.nav[key] === false) {
        el.remove();                 // collapses the gap automatically
      } else {
        enabled.push([key, el]);
      }
    }

    // Re-append in the configured order so the first enabled block takes the first slot
    const order = Array.isArray(cfg.nav.order) ? cfg.nav.order : enabled.map(([k]) => k);
    enabled
      .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
      .forEach(([, el]) => parent.appendChild(el));

  } catch (e) {
    // fail safe: do nothing if config is missing
    console.warn('flags.js:', e);
  }
})();
</script>
