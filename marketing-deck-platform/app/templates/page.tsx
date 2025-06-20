// File: app/templates/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

const templates = [
  {
    id: 'executive-summary',
    name: 'Executive Performance Summary',
    description: 'High-level overview with KPIs, trends, and strategic recommendations.',
    slides: 6,
    tags: ['C-suite ready', 'AI narratives'],
    purpose: 'Story: Executive summary, big picture, strategic insights',
    visual: 'Clean, modern, blue gradients',
    preview: '/template-previews/executive-summary.png',
  },
  {
    id: 'campaign-analysis',
    name: 'Campaign ROI Analysis',
    description: 'Detailed campaign performance with channel breakdown and optimization insights.',
    slides: 8,
    tags: ['Deep dive', 'Action items'],
    purpose: 'Story: Campaign breakdown, ROI, optimization',
    visual: 'Bold, dark, neon highlights',
    preview: '/template-previews/campaign-analysis.png',
  },
  {
    id: 'monthly-report',
    name: 'Monthly Performance Report',
    description: 'Comprehensive monthly review with trends, comparisons, and forecasts.',
    slides: 10,
    tags: ['Full metrics', 'Trends'],
    purpose: 'Story: Month-over-month, trends, forecasts',
    visual: 'Light, glassmorphic, animated stats',
    preview: '/template-previews/monthly-report.png',
  },
  {
    id: 'quarterly-business-review',
    name: 'Quarterly Business Review',
    description: 'QBR template with performance summary, learnings, and next quarter plans.',
    slides: 12,
    tags: ['Strategic', 'Planning'],
    purpose: 'Story: QBR, learnings, next steps',
    visual: 'Professional, purple gradients, glass cards',
    preview: '/template-previews/qbr.png',
  },
]

export default async function TemplatesPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-grotesk font-bold mb-2 text-white">AEDRIN Templates</h1>
          <p className="text-blue-200 text-lg mb-2">Choose a template by <span className="font-semibold">story/purpose</span> or <span className="font-semibold">visual style</span> to start your executive-ready deck.</p>
          <p className="text-blue-400 text-sm">All templates are designed for AEDRIN (aedrin.ai) and optimized for AI-powered narratives and beautiful charts.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="transition-transform hover:scale-[1.03] hover:shadow-[0_0_40px_#3B82F6]"
            >
              <Card className="cursor-pointer border-2 border-white/20 hover:border-blue-500 transition-all">
                <div className="mb-3">
                  <div className="w-full h-32 mb-2 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {tpl.name} Preview
                  </div>
                  <div className="font-grotesk text-lg text-white mb-1">{tpl.name}</div>
                  <div className="text-blue-200 text-sm mb-2">{tpl.description}</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tpl.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-blue-900/40 text-blue-200 rounded text-xs">{tag}</span>
                    ))}
                  </div>
                  <div className="text-xs text-blue-400 mb-1">{tpl.slides} slides</div>
                  <div className="text-xs text-blue-300 mb-1">{tpl.purpose}</div>
                  <div className="text-xs text-blue-300">{tpl.visual}</div>
                </div>
                <Button variant="default" className="w-full mt-2">Use This Template</Button>
              </Card>
            </div>
          ))}
        </div>
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need a Custom Template?</h2>
          <p className="mb-6">
            AEDRIN can create custom templates tailored to your brand and specific reporting needs.<br />
            <span className="text-blue-200">Contact us at <a href="mailto:hello@aedrin.ai" className="underline">hello@aedrin.ai</a></span>
          </p>
          <Button variant="secondary" className="px-8">Contact AEDRIN</Button>
        </div>
      </div>
    </div>
  )
}