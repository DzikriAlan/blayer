;(function () {
  var currentScript = document.currentScript
  if (!currentScript) return

  var agentId = currentScript.getAttribute('data-agent-id') || ''
  var origin = new URL(currentScript.src).origin
  var accentColor = currentScript.getAttribute('data-color') || '#111827'

  var isOpen = false
  var isMobile = function () { return window.innerWidth <= 480 }

  var style = document.createElement('style')
  style.textContent = [
    '#chaplin-widget-button{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;',
    'background:' + accentColor + ';border:none;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.2);',
    'display:flex;align-items:center;justify-content:center;z-index:2147483000;transition:transform .15s ease;',
    'overflow:hidden;padding:0;}',
    '#chaplin-widget-button:hover{transform:scale(1.06);}',
    '#chaplin-widget-button img{width:100%;height:100%;object-fit:cover;display:block;}',
    '#chaplin-widget-panel{position:fixed;bottom:92px;right:24px;width:380px;height:600px;max-height:calc(100vh - 120px);',
    'border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.25);z-index:2147483000;',
    'display:none;background:#fff;border:1px solid rgba(0,0,0,.08);}',
    '#chaplin-widget-panel.chaplin-open{display:block;}',
    '#chaplin-widget-panel iframe{width:100%;height:100%;border:none;display:block;}',
    '@media (max-width:480px){',
    '#chaplin-widget-panel{right:12px;left:12px;bottom:88px;width:auto;height:calc(100vh - 120px);}',
    '#chaplin-widget-button{bottom:16px;right:16px;}',
    '}',
  ].join('')
  document.head.appendChild(style)

  var defaultIcon =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>'

  var button = document.createElement('button')
  button.id = 'chaplin-widget-button'
  button.type = 'button'
  button.setAttribute('aria-label', 'Chat')
  button.innerHTML = defaultIcon

  var panel = document.createElement('div')
  panel.id = 'chaplin-widget-panel'

  var iframe = document.createElement('iframe')
  var iframeLoaded = false
  iframe.title = 'Chat widget'
  iframe.allow = 'clipboard-write'

  function ensureIframeLoaded() {
    if (iframeLoaded) return
    iframeLoaded = true
    var src = origin + '/embed/chat' + (agentId ? '?agent=' + encodeURIComponent(agentId) : '')
    iframe.src = src
  }

  panel.appendChild(iframe)

  function setOpen(next) {
    isOpen = next
    if (isOpen) {
      ensureIframeLoaded()
      panel.classList.add('chaplin-open')
    } else {
      panel.classList.remove('chaplin-open')
    }
  }

  button.addEventListener('click', function () {
    setOpen(!isOpen)
  })

  window.addEventListener('message', function (event) {
    if (event.origin !== origin) return
    if (event.data && event.data.type === 'chaplin:close') setOpen(false)
  })

  document.body.appendChild(panel)
  document.body.appendChild(button)

  var tooltip = null
  if (!isMobile()) {
    tooltip = document.createElement('div')
    tooltip.textContent = 'Chat dengan kami'
    tooltip.style.cssText = [
      'position:fixed;bottom:38px;right:88px;background:#111827;color:#fff;padding:6px 12px;',
      'border-radius:8px;font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
      'z-index:2147483000;opacity:0;pointer-events:none;transition:opacity .15s ease;white-space:nowrap;',
    ].join('')
    document.body.appendChild(tooltip)
    button.addEventListener('mouseenter', function () { if (!isOpen) tooltip.style.opacity = '1' })
    button.addEventListener('mouseleave', function () { tooltip.style.opacity = '0' })
    button.addEventListener('click', function () { tooltip.style.opacity = '0' })
  }

  if (agentId) {
    fetch(origin + '/api/agent/public?id=' + encodeURIComponent(agentId))
      .then(function (res) { return res.ok ? res.json() : null })
      .then(function (json) {
        var info = json && json.data
        if (!info) return
        if (info.image) {
          var img = document.createElement('img')
          img.src = info.image
          img.alt = info.name || 'Chat'
          button.innerHTML = ''
          button.appendChild(img)
        }
        if (info.name && tooltip) tooltip.textContent = 'Chat dengan ' + info.name
      })
      .catch(function () {})
  }
})()
