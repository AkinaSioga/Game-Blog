(function () {
  "use strict";

  // CS2 状态接口与刷新间隔集中放在顶部，方便之后替换后端地址。
  var DEFAULT_API_URL = "https://api.akinasuki.love/api/cs2/servers";
  var REFRESH_INTERVAL_MS = 60000;

  var root = document.querySelector("[data-cs2-status]");
  if (!root) {
    return;
  }

  var apiUrl = root.getAttribute("data-api-url") || DEFAULT_API_URL;
  var grid = root.querySelector("[data-cs2-grid]");
  var message = root.querySelector("[data-cs2-message]");
  var summary = root.querySelector("[data-cs2-summary]");
  var refreshButton = root.querySelector("[data-cs2-refresh]");
  var latestData = null;
  var requestController = null;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function formatTime(value) {
    if (!value) {
      return "暂未更新";
    }

    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(date);
  }

  function serverAddress(server) {
    var explicitAddress = server.address || server.endpoint || "";
    if (explicitAddress) {
      var addressText = String(explicitAddress);
      return addressText.indexOf(":") === -1 && server.port ? addressText + ":" + server.port : addressText;
    }

    var host = server.ip || server.host || "";
    if (host && String(host).indexOf(":") !== -1) {
      return String(host);
    }

    if (host && server.port) {
      return host + ":" + server.port;
    }

    var legacyConnect = String(server.connect || "");
    var legacyMatch = legacyConnect.match(/^steam:\/\/connect\/([^/?#]+)$/i);
    if (legacyMatch) {
      return legacyMatch[1];
    }

    return "";
  }

  function toJoinUrl(server) {
    var address = serverAddress(server);
    if (!address) {
      return "";
    }

    // Steam rungameid 需要用双斜杠分隔启动参数，否则可能被当作重新启动 CS2 的请求。
    return "steam://rungameid/730//+connect%20" + encodeURIComponent(address).replace(/%3A/gi, ":");
  }

  // 兼容后端字段缺失或离线服务器，只把页面需要的字段规整成稳定结构。
  function normalizeServer(server) {
    var maxPlayers = Number(server.maxPlayers);
    var players = Number(server.players);
    var online = server.online === true;
    var address = serverAddress(server);
    var connect = toJoinUrl(server);

    return {
      id: server.id || connect || server.name || "unknown",
      group: server.group || "未分组",
      name: server.name || server.serverName || "未命名服务器",
      serverName: server.serverName || "",
      host: server.host || "",
      port: server.port || "",
      online: online,
      map: server.map || "未知地图",
      players: Number.isFinite(players) ? players : 0,
      maxPlayers: Number.isFinite(maxPlayers) && maxPlayers > 0 ? maxPlayers : 0,
      bots: Number.isFinite(Number(server.bots)) ? Number(server.bots) : 0,
      error: server.error || "",
      connect: connect,
      address: address,
      mode: server.mode || server.difficulty || server.tag || "",
      image: server.image || server.thumbnail || server.mapImage || ""
    };
  }

  // 根据在线、满员、离线状态返回不同卡片类名，交给 CSS 控制视觉强调。
  function cardClass(server) {
    if (!server.online) {
      return "cs2-server-card is-offline";
    }

    if (server.maxPlayers > 0 && server.players >= server.maxPlayers) {
      return "cs2-server-card is-full";
    }

    return "cs2-server-card is-online";
  }

  // 渲染单个服务器卡片，保持布局接近参考图的标题、地图、进度条与操作区。
  function renderServerCard(server) {
    var percent = server.maxPlayers > 0 ? clamp((server.players / server.maxPlayers) * 100, 0, 100) : 0;
    var statusText = server.online ? "在线" : "离线";
    var statusDetail = server.online ? (server.mode || "暂无译名") : (server.error || "查询异常");
    var playerText = server.maxPlayers > 0 ? server.players + " / " + server.maxPlayers + " 人" : "人数未知";
    var connectDisabled = server.connect ? "" : " disabled";
    var connectHref = server.connect ? escapeHtml(server.connect) : "#";
    var imageStyle = server.image ? ' style="--cs2-card-image: url(\'' + escapeHtml(server.image) + '\')"' : "";
    var title = "【" + server.group + "】 " + server.name;

    return [
      '<article class="' + cardClass(server) + '"' + imageStyle + ' data-server-id="' + escapeHtml(server.id) + '">',
      '  <div class="cs2-server-overlay"></div>',
      '  <div class="cs2-server-content">',
      '    <header class="cs2-server-header">',
      '      <div class="cs2-server-title-row">',
      '        <span class="cs2-server-star" aria-hidden="true">★</span>',
      '        <h3>' + escapeHtml(title) + '</h3>',
      '      </div>',
      '      <button type="button" class="cs2-card-refresh" data-cs2-card-refresh aria-label="刷新服务器状态">↻</button>',
      '    </header>',
      '    <div class="cs2-server-name">' + escapeHtml(server.serverName || server.host || "暂无服务器名称") + '</div>',
      '    <div class="cs2-server-map-row"><span aria-hidden="true">地图</span><strong>' + escapeHtml(server.map) + '</strong></div>',
      '    <div class="cs2-server-mode-row"><span>' + escapeHtml(statusDetail) + '</span><em class="cs2-status-pill">' + escapeHtml(statusText) + '</em></div>',
      '    <div class="cs2-player-bar" aria-label="玩家占用比例">',
      '      <span style="width: ' + percent.toFixed(2) + '%"></span>',
      '    </div>',
      '    <div class="cs2-player-row">',
      '      <span class="cs2-player-count">' + escapeHtml(playerText) + '</span>',
      '      <span class="cs2-status-detail">' + escapeHtml(server.address) + '</span>',
      '    </div>',
      '    <footer class="cs2-server-actions">',
      '      <button type="button" class="cs2-copy-button" data-cs2-copy="' + escapeHtml(server.connect) + '"' + connectDisabled + '>复制连接</button>',
      '      <a class="cs2-join-button' + (server.connect ? "" : " is-disabled") + '" href="' + connectHref + '">加入服务器</a>',
      '    </footer>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function setLoading(isLoading) {
    root.classList.toggle("is-loading", isLoading);
    if (refreshButton) {
      refreshButton.disabled = isLoading;
      refreshButton.textContent = isLoading ? "刷新中..." : "刷新状态";
    }
  }

  function setMessage(text, type) {
    message.textContent = text || "";
    message.className = "cs2-status-message" + (type ? " is-" + type : "");
  }

  function renderEmpty() {
    grid.innerHTML = '<div class="cs2-empty-state">暂时没有可展示的服务器。</div>';
  }

  function renderData(data) {
    var servers = Array.isArray(data.servers) ? data.servers.map(normalizeServer) : [];
    var onlineCount = servers.filter(function (server) { return server.online; }).length;
    var updatedAt = formatTime(data.updatedAt);

    latestData = data;
    summary.textContent = "最后更新：" + updatedAt + "，在线 " + onlineCount + " / " + servers.length + " 台";
    setMessage(data.cached ? "当前显示缓存状态，页面会每 60 秒自动刷新。" : "状态已更新。", data.cached ? "muted" : "success");

    if (!servers.length) {
      renderEmpty();
      return;
    }

    grid.innerHTML = servers.map(renderServerCard).join("");
  }

  // 接口失败时保留已有数据；首次加载失败时显示友好空状态，避免页面白屏。
  function renderFailure(error) {
    var hint = "服务器状态接口暂时不可用，请稍后再试。";
    setMessage(hint + (error && error.message ? "（" + error.message + "）" : ""), "error");

    if (!latestData) {
      summary.textContent = "状态读取失败";
      grid.innerHTML = '<div class="cs2-empty-state is-error">' + hint + '</div>';
    }
  }

  // 所有刷新按钮都复用同一次列表请求，避免对后端产生过多请求。
  function loadServers() {
    if (requestController) {
      requestController.abort();
    }

    requestController = new AbortController();
    setLoading(true);
    setMessage("正在刷新服务器状态...", "muted");

    return fetch(apiUrl, {
      cache: "no-store",
      signal: requestController.signal
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }

        return response.json();
      })
      .then(renderData)
      .catch(function (error) {
        if (error.name !== "AbortError") {
          renderFailure(error);
        }
      })
      .finally(function () {
        setLoading(false);
      });
  }

  // 优先使用 Clipboard API，旧浏览器降级到临时 input 复制。
  function copyText(text) {
    if (!text) {
      return Promise.reject(new Error("没有可复制的连接"));
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    var input = document.createElement("input");
    input.value = text;
    input.setAttribute("readonly", "readonly");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();

    try {
      document.execCommand("copy");
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    } finally {
      document.body.removeChild(input);
    }
  }

  // 使用事件委托绑定动态渲染的复制按钮和卡片刷新按钮。
  root.addEventListener("click", function (event) {
    var refreshTarget = event.target.closest("[data-cs2-refresh], [data-cs2-card-refresh]");
    var copyTarget = event.target.closest("[data-cs2-copy]");

    if (refreshTarget) {
      loadServers();
      return;
    }

    if (copyTarget) {
      copyText(copyTarget.getAttribute("data-cs2-copy"))
        .then(function () {
          setMessage("服务器连接已复制。", "success");
        })
        .catch(function () {
          setMessage("复制失败，请手动复制连接。", "error");
        });
    }
  });

  loadServers();
  window.setInterval(loadServers, REFRESH_INTERVAL_MS);
})();
