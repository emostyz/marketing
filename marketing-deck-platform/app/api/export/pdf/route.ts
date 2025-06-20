import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { presentationId } = await request.json()

  const { data: presentation } = await supabase
    .from('presentations')
    .select('*')
    .eq('id', presentationId)
    .single()

  if (!presentation) {
    return NextResponse.json({ error: 'Presentation not found' }, { status: 404 })
  }

  // Generate PDF using pdf-lib
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const slides = presentation.slides || []
  for (const slide of slides) {
    const page = pdfDoc.addPage([800, 600])
    page.drawText(slide.title || '', {
      x: 50, y: 550, size: 28, font, color: rgb(59/255, 130/255, 246/255)
    })
    if (slide.type === 'chart' && Array.isArray(slide.chartData)) {
      // Simple bar chart rendering
      const chart = slide.chartData
      const maxVal = Math.max(...chart.map((d: any) => d.value)) || 1
      const chartX = 80, chartY = 400, barWidth = 40, barGap = 30, chartHeight = 120
      chart.forEach((d: any, i: number) => {
        const barHeight = (d.value / maxVal) * chartHeight
        page.drawRectangle({
          x: chartX + i * (barWidth + barGap),
          y: chartY,
          width: barWidth,
          height: barHeight,
          color: rgb(59/255, 130/255, 246/255)
        })
        page.drawText(String(d.label), {
          x: chartX + i * (barWidth + barGap),
          y: chartY - 18,
          size: 12,
          font,
          color: rgb(0,0,0)
        })
        page.drawText(String(d.value), {
          x: chartX + i * (barWidth + barGap),
          y: chartY + barHeight + 4,
          size: 10,
          font,
          color: rgb(0,0,0)
        })
      })
    } else if (slide.image) {
      // Embed image if base64
      try {
        const imgBytes = Buffer.from(slide.image.split(',')[1], 'base64')
        const img = await pdfDoc.embedPng(imgBytes)
        page.drawImage(img, { x: 80, y: 320, width: 320, height: 180 })
      } catch {}
    }
    page.drawText(slide.narrative || '', {
      x: 50, y: 250, size: 16, font, color: rgb(10/255, 10/255, 11/255), maxWidth: 700, lineHeight: 22
    })
  }
  const pdfBytes = await pdfDoc.save()
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${presentation.title}.pdf"`,
      'Content-Length': pdfBytes.length.toString(),
    }
  })
} 