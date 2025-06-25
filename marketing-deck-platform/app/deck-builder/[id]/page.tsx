import DeckBuilderWrapper from '@/components/deck-builder/DeckBuilderWrapper';
import { UltimateDeckBuilder } from '@/components/deck-builder/UltimateDeckBuilder';

export default function DeckBuilderPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // Only show UltimateDeckBuilder for 'new' deck creation
  if (id === 'new') {
    return <UltimateDeckBuilder />;
  }

  // For all other IDs (including demo-deck-*, presentation*, real deck IDs), 
  // use DeckBuilderWrapper to load and display the generated deck
  return <DeckBuilderWrapper presentationId={id} />;
} 