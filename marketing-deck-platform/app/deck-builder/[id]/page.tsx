'use client'

import { useSearchParams } from 'next/navigation'
import DeckBuilderWrapper from '@/components/deck-builder/DeckBuilderWrapper';
import { UltimateDeckBuilder } from '@/components/deck-builder/UltimateDeckBuilder';
import AIDeckBuilder from '@/components/deck-builder/AIDeckBuilder';

export default function DeckBuilderPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const searchParams = useSearchParams();
  const isGenerated = searchParams.get('generated') === 'true';

  // Only show UltimateDeckBuilder for 'new' deck creation
  if (id === 'new') {
    return <UltimateDeckBuilder />;
  }

  // If this is an AI-generated presentation, use AIDeckBuilder
  if (isGenerated) {
    return (
      <AIDeckBuilder 
        presentationId={id}
        onSave={async (slides) => {
          console.log('Saving AI-generated slides:', slides)
          // TODO: Save to database
        }}
        onExport={(format) => {
          console.log('Exporting as:', format)
          // TODO: Export functionality
        }}
      />
    );
  }

  // For all other IDs (including demo-deck-*, presentation*, real deck IDs), 
  // use DeckBuilderWrapper to load and display the generated deck
  return <DeckBuilderWrapper presentationId={id} />;
} 