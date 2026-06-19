const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

export function initAnalytics() {
  if (!import.meta.env.PROD) return
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false })
}

export function trackPageview(path) {
  if (!window.gtag) return
  window.gtag('event', 'page_view', { page_path: path })
}
