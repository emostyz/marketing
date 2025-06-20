export function validateData(data: any[], questionnaire: {
  description: string
  keyVariables: string
  context: string
  goal: string
  keyPoint: string
}): { inScope: boolean; reason?: string } {
  // Example: Only allow data with at least 2 columns and 10 rows
  if (!data || data.length < 10) {
    return { inScope: false, reason: 'Not enough data rows (min 10 required).' };
  }
  if (Object.keys(data[0] || {}).length < 2) {
    return { inScope: false, reason: 'Not enough columns (min 2 required).' };
  }
  // Check for missing values in key columns
  const keyVars = questionnaire.keyVariables.split(',').map(k => k.trim()).filter(Boolean)
  for (const row of data) {
    for (const key of keyVars) {
      if (row[key] === undefined || row[key] === null || row[key] === '') {
        return { inScope: false, reason: `Missing value for key variable: ${key}` }
      }
    }
  }
  // Check for numeric columns (if key variable is expected numeric)
  for (const key of keyVars) {
    if (data.some(row => typeof row[key] === 'string' && !isNaN(Number(row[key])))) {
      if (data.some(row => isNaN(Number(row[key])))) {
        return { inScope: false, reason: `Non-numeric value found in numeric key variable: ${key}` }
      }
    }
  }
  // TODO: Add more sophisticated checks based on questionnaire
  return { inScope: true };
} 