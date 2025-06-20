import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const templates = [
  {
    id: 'exec-summary',
    name: 'Executive Summary',
    description: 'Concise, high-level overview for C-suite with KPIs, trends, and strategic recommendations.',
    slides: 6,
    tags: ['C-suite', 'Strategy', 'KPIs'],
    purpose: 'Story: Executive summary, big picture, strategic insights',
    visual: 'Clean, modern, blue gradients',
    preview: '/template-previews/exec-summary.png',
  },
  {
    id: 'marketing-performance',
    name: 'Marketing Performance',
    description: 'Comprehensive marketing review with channel breakdown, ROI, and optimization insights.',
    slides: 8,
    tags: ['Marketing', 'ROI', 'Channels'],
    purpose: 'Story: Channel performance, ROI, optimization',
    visual: 'Bold, dark, neon highlights',
    preview: '/template-previews/marketing-performance.png',
  },
  {
    id: 'sales-review',
    name: 'Sales Review',
    description: 'Sales pipeline, conversion rates, and revenue analysis for sales leadership.',
    slides: 7,
    tags: ['Sales', 'Pipeline', 'Revenue'],
    purpose: 'Story: Sales funnel, conversion, revenue',
    visual: 'Vibrant, green accents, glassmorphic',
    preview: '/template-previews/sales-review.png',
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Go-to-market plan, milestones, and launch metrics for new products.',
    slides: 9,
    tags: ['Product', 'Launch', 'Go-to-market'],
    purpose: 'Story: Launch plan, milestones, metrics',
    visual: 'Purple gradients, modern icons',
    preview: '/template-previews/product-launch.png',
  },
  {
    id: 'finance-update',
    name: 'Finance Update',
    description: 'Financial performance, forecasts, and budget analysis for finance teams.',
    slides: 8,
    tags: ['Finance', 'Forecast', 'Budget'],
    purpose: 'Story: Financials, forecasts, budget',
    visual: 'Blue/gray, minimal, data-driven',
    preview: '/template-previews/finance-update.png',
  },
  {
    id: 'quarterly-business-review',
    name: 'Quarterly Business Review',
    description: 'QBR with performance summary, learnings, and next quarter plans.',
    slides: 12,
    tags: ['QBR', 'Strategy', 'Planning'],
    purpose: 'Story: QBR, learnings, next steps',
    visual: 'Professional, purple gradients, glass cards',
    preview: '/template-previews/qbr.png',
  },
  {
    id: 'customer-insights',
    name: 'Customer Insights',
    description: 'Customer segmentation, satisfaction, and NPS analysis for CX teams.',
    slides: 7,
    tags: ['Customer', 'NPS', 'Segmentation'],
    purpose: 'Story: Customer insights, NPS, segmentation',
    visual: 'Orange/teal, playful, infographic',
    preview: '/template-previews/customer-insights.png',
  },
  {
    id: 'monthly-report',
    name: 'Monthly Report',
    description: 'Comprehensive monthly review with trends, comparisons, and forecasts.',
    slides: 10,
    tags: ['Monthly', 'Trends', 'Forecasts'],
    purpose: 'Story: Month-over-month, trends, forecasts',
    visual: 'Light, glassmorphic, animated stats',
    preview: '/template-previews/monthly-report.png',
  },
];

interface TemplateSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
}

export default function TemplateSelectModal({ open, onClose, onSelect }: TemplateSelectModalProps) {
  const [selected, setSelected] = useState<string | null>(null);

  function handleContinue() {
    if (selected) onSelect(selected);
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[540px]">
        <h2 className="text-2xl font-grotesk mb-2">Choose a Presentation Template</h2>
        <div className="text-blue-200 text-sm mb-4">
          <div className="mb-1 font-semibold">How to choose:</div>
          <ul className="list-disc list-inside text-xs text-blue-100 mb-2">
            <li><span className="font-semibold">Visual style:</span> Pick a look that fits your brand or audience (see preview images).</li>
            <li><span className="font-semibold">Story/purpose:</span> Each template is designed for a specific narrative (see tags and descriptions).</li>
          </ul>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {templates.map((tpl) => (
            <motion.div
              key={tpl.id}
              whileHover={{ scale: 1.03, boxShadow: '0 0 40px #3B82F6' }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <Card
                className={`cursor-pointer border-2 transition-all ${selected === tpl.id ? 'border-blue-500 shadow-[0_0_40px_#3B82F6]' : 'border-white/20'}`}
                onClick={() => setSelected(tpl.id)}
              >
                <div className="mb-3">
                  <div className="w-full h-28 relative mb-2 rounded-lg overflow-hidden">
                    <Image src={tpl.preview} alt={tpl.name} fill className="object-cover rounded-lg" />
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
              </Card>
            </motion.div>
          ))}
        </div>
        <Button variant="default" disabled={!selected} onClick={handleContinue} className="w-full">Continue</Button>
      </div>
    </Modal>
  );
} 