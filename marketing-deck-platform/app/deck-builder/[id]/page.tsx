import DeckBuilderWrapper from '@/components/deck-builder/DeckBuilderWrapper';
import { UltimateDeckBuilder } from '@/components/deck-builder/UltimateDeckBuilder';

export default function DeckBuilderPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // For demo, legacy, or new decks, use UltimateDeckBuilder
  if (id.startsWith('demo-deck') || id.startsWith('presentation') || id === 'new') {
    return <UltimateDeckBuilder />;
  }

  // For all other IDs, use the DeckBuilderWrapper (which loads the deck by ID)
  return <DeckBuilderWrapper presentationId={id} />;
} 