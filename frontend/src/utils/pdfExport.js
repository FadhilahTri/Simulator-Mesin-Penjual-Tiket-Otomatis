/**
 * pdfExport.js — PDF and PNG export utilities for SmartTicket.
 */
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Export a DOM element as a PNG image.
 * @param {string} elementId - The ID of the DOM element to capture.
 * @param {string} filename - Output filename (without extension).
 */
export async function exportToPNG(elementId, filename = 'smartticket-diagram') {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`Element #${elementId} not found`)
    return
  }
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#060b18',
      scale: 2,
      useCORS: true,
    })
    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (err) {
    console.error('PNG export failed:', err)
    throw err
  }
}

/**
 * Export simulation result as a PDF document.
 * @param {Object} data - Simulation result data.
 * @param {string} moduleName - Module name (DFA, NFA, CFG, etc.)
 * @param {string} filename - Output filename (without extension).
 */
export async function exportToPDF(data, moduleName = 'Simulation', filename = 'smartticket-result') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const margin = 20

  // Header
  doc.setFillColor(6, 11, 24)
  doc.rect(0, 0, pageW, 40, 'F')

  doc.setTextColor(99, 102, 241)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('SmartTicket', margin, 18)

  doc.setTextColor(148, 163, 184)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Simulation Report — ${moduleName}`, margin, 28)

  doc.setTextColor(71, 85, 105)
  doc.setFontSize(9)
  doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, margin, 36)

  // Status Badge
  const status = data.accepted !== undefined
    ? (data.accepted ? 'ACCEPTED' : 'REJECTED')
    : 'SUCCESS'
  const statusColor = data.accepted === true ? [16, 185, 129] :
                       data.accepted === false ? [244, 63, 94] : [99, 102, 241]

  doc.setFillColor(...statusColor)
  doc.roundedRect(pageW - margin - 35, 12, 35, 12, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(status, pageW - margin - 17.5, 20, { align: 'center' })

  // Content
  let y = 55
  doc.setTextColor(30, 41, 59)

  const addSection = (title, content) => {
    if (y > 260) {
      doc.addPage()
      y = 20
    }
    doc.setFillColor(240, 244, 255)
    doc.rect(margin, y - 4, pageW - 2 * margin, 8, 'F')
    doc.setTextColor(99, 102, 241)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin + 2, y + 1)
    y += 12

    doc.setTextColor(30, 41, 59)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    if (typeof content === 'string') {
      const lines = doc.splitTextToSize(content, pageW - 2 * margin)
      lines.forEach(line => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.text(line, margin, y)
        y += 5
      })
    } else if (Array.isArray(content)) {
      content.forEach((item, idx) => {
        if (y > 270) { doc.addPage(); y = 20 }
        const text = typeof item === 'object' ? JSON.stringify(item) : String(item)
        const lines = doc.splitTextToSize(`${idx + 1}. ${text}`, pageW - 2 * margin - 5)
        lines.forEach(line => {
          if (y > 270) { doc.addPage(); y = 20 }
          doc.text(line, margin + 3, y)
          y += 5
        })
      })
    }
    y += 6
  }

  // Input
  if (data.input_string || data.input) {
    addSection('Input', data.input_string || data.input || '-')
  }

  // Trace steps
  if (data.trace && Array.isArray(data.trace)) {
    addSection(
      'Execution Trace',
      data.trace.map(t => t.description || JSON.stringify(t))
    )
  }

  if (data.steps && Array.isArray(data.steps)) {
    addSection(
      'Derivation Steps',
      data.steps
    )
  }

  if (data.stack_trace && Array.isArray(data.stack_trace)) {
    addSection(
      'Stack Trace',
      data.stack_trace.map(s => `Step ${s.step}: Stack=[${s.stack?.join(', ')}] | ${s.action}`)
    )
  }

  // Footer
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(
      `SmartTicket — Capstone Project | Page ${i}/${totalPages}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    )
  }

  doc.save(`${filename}.pdf`)
}
