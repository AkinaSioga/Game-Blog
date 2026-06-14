(() => {
  // 达妮娅动态指针：把 Windows .ani 拆出的 .cur 帧按角色循环写入 CSS 变量。
  const manifestUrl = '/cursors/denia/manifest.json';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const timers = [];

  const roleVars = {
    Normal: '--denia-cursor-normal',
    Link: '--denia-cursor-link',
    Text: '--denia-cursor-text',
    Help: '--denia-cursor-help',
    Working: '--denia-cursor-working',
    Busy: '--denia-cursor-busy',
    Precision: '--denia-cursor-precision',
    Unavailable: '--denia-cursor-unavailable',
    Handwriting: '--denia-cursor-handwriting',
    Move: '--denia-cursor-move',
    Vertical: '--denia-cursor-vertical',
    Horizontal: '--denia-cursor-horizontal',
    Diagonal1: '--denia-cursor-diagonal-1',
    Diagonal2: '--denia-cursor-diagonal-2',
    Alternate: '--denia-cursor-alternate',
    Pin: '--denia-cursor-pin',
    Person: '--denia-cursor-person',
  };

  // 统一把 .cur 帧转成同源绝对 URL，避免相对路径在子页面或代理层被重定向规则误解析。
  function cursorFrameUrl(basePath, frame) {
    const normalizedBasePath = String(basePath || '/cursors/denia').replace(/\/+$/, '');
    const normalizedFrame = String(frame || '').replace(/^\/+/, '');
    return new URL(`${normalizedBasePath}/${normalizedFrame}`, window.location.origin).href;
  }

  function cursorValue(basePath, cursor, frameIndex) {
    const frame = cursor.frames[frameIndex % cursor.frames.length];
    return `url("${cursorFrameUrl(basePath, frame)}") ${cursor.hotX} ${cursor.hotY}, auto`;
  }

  function setRole(basePath, name, cursor, frameIndex) {
    const variable = roleVars[name];
    if (!variable || !cursor.frames.length) return;
    root.style.setProperty(variable, cursorValue(basePath, cursor, frameIndex));
  }

  function startCursor(manifest) {
    Object.entries(manifest.cursors).forEach(([name, cursor]) => {
      let frameIndex = 0;
      setRole(manifest.basePath, name, cursor, frameIndex);

      if (reducedMotion.matches || cursor.frames.length < 2) return;
      const timer = window.setInterval(() => {
        if (document.hidden) return;
        frameIndex = (frameIndex + 1) % cursor.frames.length;
        setRole(manifest.basePath, name, cursor, frameIndex);
      }, cursor.delayMs || 100);
      timers.push(timer);
    });

    root.classList.add('denia-cursor-ready');
  }

  fetch(manifestUrl)
    .then((response) => response.ok ? response.json() : Promise.reject(response))
    .then(startCursor)
    .catch((error) => {
      console.warn('Denia cursor failed to load', error);
      timers.forEach((timer) => window.clearInterval(timer));
    });
})();
