import { useEffect } from 'react'

const SPRITE_W = 150
const SPRITE_H = 256

export default function PickleField() {
  useEffect(() => {
    const canvas = document.getElementById('pickle-field')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, dpr = 1, pickles = [], raf = 0

    const img = new Image()
    img.src = '/pickle-sprite.png'

    function rand(a, b) { return a + Math.random() * (b - a) }

    function spawn() {
      const count = Math.max(10, Math.min(26, Math.round((w * h) / 62000)))
      pickles = Array.from({ length: count }).map(() => {
        const scale = rand(0.13, 0.32)
        const depth = (scale - 0.13) / 0.19
        return {
          x: rand(0, w), y: rand(0, h), scale,
          vx: rand(-0.5, 0.5) * (0.5 + depth), vy: rand(-0.42, 0.42) * (0.5 + depth),
          ang: rand(0, Math.PI * 2), va: rand(-0.012, 0.012),
          bob: rand(0, Math.PI * 2), bobAmp: rand(3, 10),
          alpha: 0.4 + depth * 0.5,
        }
      })
      if (reduce) pickles.forEach(p => { p.vx = 0; p.vy = 0; p.va = 0 })
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth; h = window.innerHeight
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      spawn()
    }

    function drawPickle(p, t) {
      const pw = SPRITE_W * p.scale
      const ph = SPRITE_H * p.scale
      ctx.save()
      ctx.translate(p.x, p.y + Math.sin(p.bob + t * 0.0015) * p.bobAmp)
      ctx.rotate(p.ang)
      ctx.globalAlpha = p.alpha
      ctx.drawImage(img, -pw / 2, -ph / 2, pw, ph)
      ctx.restore()
    }

    function frame(t) {
      ctx.clearRect(0, 0, w, h)
      const m = SPRITE_H * 0.35
      for (const p of pickles) {
        if (!reduce) {
          p.x += p.vx; p.y += p.vy; p.ang += p.va
          if (p.x < -m) p.x = w + m; if (p.x > w + m) p.x = -m
          if (p.y < -m) p.y = h + m; if (p.y > h + m) p.y = -m
        }
        drawPickle(p, t)
      }
      if (!reduce) raf = requestAnimationFrame(frame)
    }

    function start() {
      resize()
      window.addEventListener('resize', resize)
      if (reduce) { frame(0) } else { raf = requestAnimationFrame(frame) }
    }

    if (img.complete) { start() } else { img.onload = start }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas id="pickle-field" aria-hidden="true" />
}
