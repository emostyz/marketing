import { getDatasetById } from './dataset-storage';

/**
 * Retrieve processed dataset for presentation generation
 */
export async function getDatasetForPresentation(datasetId: string) {
  try {
    const dataset = await getDatasetById(datasetId);
    
    return {
      id: dataset.id,
      name: dataset.name,
      data: dataset.processedData as any[],
      columns: dataset.columns.map(col => ({
        name: col.columnName,
        type: col.dataType,
        sampleValues: col.sampleValues,
        statistics: col.statistics
      })),
      metadata: dataset.metadata as any,
      createdAt: dataset.createdAt
    };
  } catch (error) {
    console.error('❌ Error retrieving dataset:', error);
    throw new Error(`Failed to retrieve dataset: ${error}`);
  }
}

/**
 * Get multiple datasets by IDs
 */
export async function getDatasetsForPresentation(datasetIds: string[]) {
  try {
    const datasets = await Promise.all(
      datasetIds.map(id => getDatasetForPresentation(id))
    );
    
    // Combine all data into a single array for analysis
    const combinedData = datasets.reduce((acc, dataset) => {
      return acc.concat(dataset.data);
    }, [] as any[]);
    
    return {
      datasets,
      combinedData,
      totalRows: combinedData.length,
      datasetCount: datasets.length
    };
  } catch (error) {
    console.error('❌ Error retrieving datasets:', error);
    throw new Error(`Failed to retrieve datasets: ${error}`);
  }
}

/**
 * Find datasets from session data (used when dataset IDs are passed in requests)
 */
export function extractDatasetIdsFromSession(sessionData: any): string[] {
  const datasetIds: string[] = [];
  
  if (sessionData?.datasets) {
    sessionData.datasets.forEach((dataset: any) => {
      if (dataset.id && !dataset.id.startsWith('demo-')) {
        datasetIds.push(dataset.id);
      }
    });
  }
  
  if (sessionData?.files) {
    sessionData.files.forEach((file: any) => {
      if (file.id && !file.id.startsWith('demo-')) {
        datasetIds.push(file.id);
      }
    });
  }
  
  return datasetIds;
}