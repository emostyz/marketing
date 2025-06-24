import { db } from '@/lib/db/drizzle';
import { datasets, dataColumns } from '@/lib/db/schema';
import type { NewDataset, NewDataColumn } from '@/lib/db/schema';
import type { ProcessedDataset } from './enhanced-file-processor';
import { eq, desc, count } from 'drizzle-orm';

/**
 * Store processed dataset in database
 */
export async function storeDataset(
  userId: string,
  processedData: ProcessedDataset,
  projectName: string = 'Uncategorized'
): Promise<string> {
  try {
    // Create dataset record
    const datasetData: NewDataset = {
      userId,
      name: processedData.fileName,
      processedData: processedData.data,
      metadata: {
        fileType: processedData.fileType,
        fileSize: processedData.fileSize,
        rowCount: processedData.rowCount,
        processingTime: processedData.metadata.processingTime,
        projectName,
        uploadedAt: new Date().toISOString()
      }
    };

    const [dataset] = await db.insert(datasets).values(datasetData).returning();
    
    // Create column records
    const columnData: NewDataColumn[] = processedData.columns.map(column => ({
      datasetId: dataset.id,
      columnName: column.name,
      dataType: column.type,
      sampleValues: column.sampleValues,
      statistics: column.statistics
    }));

    if (columnData.length > 0) {
      await db.insert(dataColumns).values(columnData);
    }

    console.log('✅ Dataset stored successfully:', {
      datasetId: dataset.id,
      fileName: processedData.fileName,
      rowCount: processedData.rowCount,
      columns: processedData.columns.length
    });

    return dataset.id;
  } catch (error) {
    console.error('❌ Error storing dataset:', error);
    throw new Error(`Failed to store dataset: ${error}`);
  }
}

/**
 * Retrieve dataset by ID with columns
 */
export async function getDatasetById(datasetId: string) {
  try {
    const [dataset] = await db
      .select()
      .from(datasets)
      .where(eq(datasets.id, datasetId));

    if (!dataset) {
      throw new Error('Dataset not found');
    }

    const columns = await db
      .select()
      .from(dataColumns)
      .where(eq(dataColumns.datasetId, datasetId));

    return {
      ...dataset,
      columns
    };
  } catch (error) {
    console.error('❌ Error retrieving dataset:', error);
    throw new Error(`Failed to retrieve dataset: ${error}`);
  }
}

/**
 * Get all datasets for a user
 */
export async function getUserDatasets(userId: string) {
  try {
    const userDatasets = await db
      .select()
      .from(datasets)
      .where(eq(datasets.userId, userId))
      .orderBy(desc(datasets.createdAt));

    // Get column counts for each dataset
    const datasetsWithCounts = await Promise.all(
      userDatasets.map(async (dataset) => {
        const columnCount = await db
          .select({ count: count() })
          .from(dataColumns)
          .where(eq(dataColumns.datasetId, dataset.id));

        return {
          ...dataset,
          columnCount: columnCount[0]?.count || 0
        };
      })
    );

    return datasetsWithCounts;
  } catch (error) {
    console.error('❌ Error retrieving user datasets:', error);
    throw new Error(`Failed to retrieve user datasets: ${error}`);
  }
}