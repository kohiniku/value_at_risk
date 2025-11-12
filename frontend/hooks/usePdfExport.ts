'use client'

import { useCallback } from 'react'

const PX_PER_INCH = 96
const PT_PER_INCH = 72

const pxToPt = (value: number) => (value / PX_PER_INCH) * PT_PER_INCH

const resolveBackgroundColor = (node: HTMLElement) => {
  const color = window.getComputedStyle(node).backgroundColor
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
    return '#0f172a'
  }
  return color
}

export function usePdfExport() {
  return useCallback(async (target: HTMLElement, fileName: string) => {
    const [{ toPng }, { jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')])
    const width = target.scrollWidth
    const height = target.scrollHeight
    const backgroundColor = resolveBackgroundColor(target)

    const dataUrl = await toPng(target, {
      backgroundColor,
      cacheBust: true,
      pixelRatio: Math.min(2, window.devicePixelRatio || 1.5),
      width,
      height,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
      },
    })

    const pdfWidth = pxToPt(width)
    const pdfHeight = pxToPt(height)
    const orientation = pdfWidth > pdfHeight ? 'landscape' : 'portrait'
    const pdf = new jsPDF({
      orientation,
      unit: 'pt',
      format: [pdfWidth, pdfHeight],
      compress: true,
    })
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
    pdf.save(fileName)
  }, [])
}
