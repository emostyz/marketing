'use client';

import { useState } from 'react';
import { UltimateDeckBuilder } from '@/components/deck-builder/UltimateDeckBuilder';

export default function InternalTestPage() {
  const [testMode, setTestMode] = useState<'upload' | 'analysis'>('upload');
  
  // Mock user for testing
  const mockUser = {
    id: 'test-user-123',
    email: 'test@easydecks.ai',
    subscriptionStatus: 'pro',
    tokensRemaining: 1000000
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-4">
            🔧 Internal Test Interface - Enhanced Strategic Analysis
          </h1>
          
          <div className="grid grid-cols-2 gap-4 text-white/80 text-sm">
            <div>
              <span className="font-semibold">Status:</span> Demo Mode (No Auth Required)
            </div>
            <div>
              <span className="font-semibold">Features:</span> McKinsey-level insights, Hidden drivers, Strategic callouts
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <button
              onClick={() => setTestMode('upload')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                testMode === 'upload' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Test Upload & Analysis
            </button>
            
            <button
              onClick={() => {
                // Trigger sample data test
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (fileInput) {
                  fetch('/sample_business_data.csv')
                    .then(res => res.blob())
                    .then(blob => {
                      const file = new File([blob], 'sample_business_data.csv', { type: 'text/csv' });
                      const dataTransfer = new DataTransfer();
                      dataTransfer.items.add(file);
                      fileInput.files = dataTransfer.files;
                      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                }
              }}
              className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all"
            >
              🚀 Quick Test with Sample Data
            </button>
          </div>
        </div>

        {/* Use the actual deck builder in demo mode */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10">
          <UltimateDeckBuilder 
            demo={true}
            initialTitle="Strategic Analysis Test"
          />
        </div>

        {/* Test Data Info */}
        <div className="mt-8 bg-blue-600/20 backdrop-blur-lg rounded-xl p-6 border border-blue-600/30">
          <h3 className="text-xl font-semibold text-white mb-3">📊 Sample Data Available</h3>
          <p className="text-white/80 mb-4">
            Click "Quick Test with Sample Data" to instantly load a 24-row SaaS metrics CSV with:
          </p>
          <ul className="list-disc list-inside text-white/70 space-y-1">
            <li>Monthly revenue, user, and churn data</li>
            <li>Growth rates and conversion metrics</li>
            <li>Perfect for testing strategic insights generation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}