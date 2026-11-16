import PptxGenJS from 'pptxgenjs'
import type { ChartDef, Stat, buildSummary } from '@/data/wellbeing'

type Summary = NonNullable<ReturnType<typeof buildSummary>>

export type PptSlide =
  | { kind: 'title' }
  | { kind: 'summary' }
  | { kind: 'chart'; section: string; chart: ChartDef }
  | { kind: 'stats'; section: string; stats: Stat[] }

interface Figure {
  label: string
  value: number
  color?: string
  pct: string
}

interface ExportOptions {
  summary: Summary
  slides: PptSlide[]
  keyFigures: (chart: ChartDef) => Figure[]
  logos?: string[]
}

const TEAL = '0E8F8A'
const GRAY = '6B7280'
const hex = (c?: string) => (c ?? TEAL).replace('#', '')

export async function exportDashboardPpt({ summary, slides, keyFigures, logos = [] }: ExportOptions) {
  const pptx = new PptxGenJS()

  pptx.layout = 'LAYOUT_WIDE' // 13.33 x 7.5 in

  const heading = (s: PptxGenJS.Slide, text: string, y = 0.4, size = 30) =>
    s.addText(text, { x: 0.6, y, w: 12.1, h: 0.8, fontSize: size, bold: true, color: TEAL })

  for (const slide of slides) {
    const s = pptx.addSlide()

    // ---------- Title ----------
    if (slide.kind === 'title') {
      logos.forEach((path, i) => {
        s.addImage({ path, x: 6.67 - (logos.length * 1.7) / 2 + i * 1.7, y: 0.9, w: 1.5, h: 1.5 })
      })
      s.addText(summary.title, {
        x: 0.6, y: 2.8, w: 12.1, h: 1.2, fontSize: 40, bold: true, color: TEAL, align: 'center',
      })
      s.addText(String(summary.year), {
        x: 0.6, y: 4.0, w: 12.1, h: 0.8, fontSize: 28, color: GRAY, align: 'center',
      })
    }

    // ---------- Summary ----------
    else if (slide.kind === 'summary') {
      heading(s, `Total regular employees: ${summary.totalRegular}`)

      const n = summary.divisions.length || 1
      const gap = 0.25
      const w = Math.min((12.1 - gap * (n - 1)) / n, 2.6)
      const startX = 6.67 - (w * n + gap * (n - 1)) / 2

      summary.divisions.forEach((d, i) => {
        const x = startX + i * (w + gap)

        s.addShape(pptx.ShapeType.roundRect, {
          x, y: 2.4, w, h: 2.4, fill: { color: 'F3F4F6' }, line: { color: 'E5E7EB' }, rectRadius: 0.1,
        })
        s.addText(String(d.count), {
          x, y: 2.6, w, h: 1.2, fontSize: 44, bold: true, align: 'center', color: '111827',
        })
        s.addText(d.code, { x, y: 3.8, w, h: 0.7, fontSize: 20, align: 'center', color: GRAY })
      })
    }

    // ---------- Stats ----------
    else if (slide.kind === 'stats') {
      heading(s, slide.section)

      const n = slide.stats.length || 1
      const gap = 0.3
      const w = Math.min((12.1 - gap * (n - 1)) / n, 3.8)
      const startX = 6.67 - (w * n + gap * (n - 1)) / 2

      slide.stats.forEach((st, i) => {
        const x = startX + i * (w + gap)

        s.addShape(pptx.ShapeType.roundRect, {
          x, y: 2.3, w, h: 2.8, fill: { color: 'F3F4F6' }, line: { color: 'E5E7EB' }, rectRadius: 0.1,
        })
        s.addText(String(st.value), {
          x, y: 2.5, w, h: 1.4, fontSize: 54, bold: true, align: 'center', color: hex(st.color),
        })
        s.addText(st.label, { x, y: 3.9, w, h: 0.9, fontSize: 18, align: 'center', color: '111827' })
      })
    }

    // ---------- Chart ----------
    else {
      const { chart } = slide
      const figures = keyFigures(chart)
      const colors = (chart.colors ?? []).map(hex)

      s.addText(slide.section, { x: 0.6, y: 0.25, w: 12.1, h: 0.4, fontSize: 14, color: GRAY })
      heading(s, chart.title, 0.6, 28)

      const data = chart.series
        ? chart.series.map(sr => ({ name: sr.name, labels: chart.labels, values: sr.values }))
        : [{ name: chart.title, labels: chart.labels, values: chart.values ?? [] }]

      const hasValues = data.some(d => d.values.some(v => v > 0))

      if (!hasValues) {
        s.addText('No data yet', {
          x: 0.6, y: 3, w: 12.1, h: 1, fontSize: 24, align: 'center', color: GRAY,
        })
      }
      else if (chart.type === 'pie') {
        s.addChart(pptx.charts.PIE, data, {
          x: 0.5,
          y: 1.6,
          w: 7.2,
          h: 5.2,
          chartColors: colors,
          showLegend: true,
          legendPos: 'b',
          showPercent: true,
          showValue: false,
        })
      }
      else {
        s.addChart(pptx.charts.BAR, data, {
          x: 0.5,
          y: 1.6,
          w: 7.2,
          h: 5.2,
          barDir: 'col',
          barGrouping: chart.series ? 'stacked' : 'clustered',
          chartColors: colors,
          showValue: true,
          showLegend: !!chart.series,
          legendPos: 'b',
        })
      }

      // Key figures (right side)
      const runs: PptxGenJS.TextProps[] = []

      figures.forEach(f => {
        runs.push({ text: '● ', options: { color: hex(f.color), fontSize: 18 } })
        runs.push({ text: `${f.label}: `, options: { fontSize: 18, color: '111827' } })
        runs.push({ text: `${f.value}${f.pct}`, options: { fontSize: 18, bold: true, color: '111827', breakLine: true } })
      })
      s.addText(runs, { x: 8.0, y: 1.8, w: 4.8, h: 3.6, valign: 'top', paraSpaceAfter: 8 })

      if (chart.note)
        s.addText(chart.note, { x: 8.0, y: 5.5, w: 4.8, h: 1.2, fontSize: 13, color: GRAY, valign: 'top' })
    }
  }

  await pptx.writeFile({ fileName: `Wellbeing-Report-${summary.year}.pptx` })
}
