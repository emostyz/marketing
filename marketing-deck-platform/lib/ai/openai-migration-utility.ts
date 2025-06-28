/**
 * Utility to help migrate existing OpenAI API calls to use the enhanced wrapper
 * This script identifies files that need to be updated and provides migration guidance
 */

import { promises as fs } from 'fs'
import path from 'path'

interface OpenAICallLocation {
  file: string
  line: number
  content: string
  needsUpdate: boolean
  recommendation: string
}

class OpenAIMigrationUtility {
  private projectRoot: string
  private excludeDirs = ['node_modules', '.git', '.next', 'dist', 'build']
  private includeExtensions = ['.ts', '.tsx', '.js', '.jsx']

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
  }

  /**
   * Scan all files for OpenAI API calls that need migration
   */
  async scanForOpenAICalls(): Promise<OpenAICallLocation[]> {
    const locations: OpenAICallLocation[] = []
    
    await this.scanDirectory(this.projectRoot, locations)
    
    return locations
  }

  private async scanDirectory(dir: string, locations: OpenAICallLocation[]): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        if (entry.isDirectory()) {
          if (!this.excludeDirs.includes(entry.name)) {
            await this.scanDirectory(fullPath, locations)
          }
        } else if (entry.isFile()) {
          if (this.includeExtensions.includes(path.extname(entry.name))) {
            await this.scanFile(fullPath, locations)
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error)
    }
  }

  private async scanFile(filePath: string, locations: OpenAICallLocation[]): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const lines = content.split('\n')
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineNumber = i + 1
        
        // Check for direct OpenAI API calls
        if (this.containsOpenAICall(line)) {
          const location: OpenAICallLocation = {
            file: path.relative(this.projectRoot, filePath),
            line: lineNumber,
            content: line.trim(),
            needsUpdate: !this.isAlreadyMigrated(line),
            recommendation: this.getRecommendation(line)
          }
          
          locations.push(location)
        }
      }
    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error)
    }
  }

  private containsOpenAICall(line: string): boolean {
    const patterns = [
      /openai\.chat\.completions\.create/,
      /\.chat\.completions\.create/,
      /response_format.*json_object/,
      /OpenAI.*create/
    ]
    
    return patterns.some(pattern => pattern.test(line))
  }

  private isAlreadyMigrated(line: string): boolean {
    return line.includes('openAIWrapper.call') || 
           line.includes('EnhancedOpenAIWrapper') ||
           line.includes('safeOpenAIJSONCall')
  }

  private getRecommendation(line: string): string {
    if (line.includes('response_format') && line.includes('json_object')) {
      return 'Replace with openAIWrapper.call() with requireJSON: true'
    }
    if (line.includes('openai.chat.completions.create')) {
      return 'Replace with openAIWrapper.call() method'
    }
    if (line.includes('JSON.parse') && line.includes('response')) {
      return 'Remove manual JSON parsing - wrapper handles this'
    }
    return 'Consider migrating to enhanced wrapper for better error handling'
  }

  /**
   * Generate a migration report
   */
  async generateMigrationReport(): Promise<string> {
    const locations = await this.scanForOpenAICalls()
    
    const needsUpdate = locations.filter(loc => loc.needsUpdate)
    const alreadyMigrated = locations.filter(loc => !loc.needsUpdate)
    
    let report = `# OpenAI API Migration Report\n\n`
    report += `Generated: ${new Date().toISOString()}\n\n`
    report += `## Summary\n`
    report += `- Total OpenAI calls found: ${locations.length}\n`
    report += `- Already migrated: ${alreadyMigrated.length}\n`
    report += `- Needs migration: ${needsUpdate.length}\n\n`
    
    if (needsUpdate.length > 0) {
      report += `## Files Requiring Migration\n\n`
      
      const fileGroups = this.groupByFile(needsUpdate)
      
      for (const [file, calls] of Object.entries(fileGroups)) {
        report += `### ${file}\n\n`
        
        for (const call of calls) {
          report += `**Line ${call.line}:**\n`
          report += `\`\`\`typescript\n${call.content}\n\`\`\`\n`
          report += `*Recommendation:* ${call.recommendation}\n\n`
        }
      }
      
      report += `## Migration Guide\n\n`
      report += `1. Import the enhanced wrapper:\n`
      report += `\`\`\`typescript\n`
      report += `import { openAIWrapper } from '@/lib/ai/enhanced-openai-wrapper'\n`
      report += `\`\`\`\n\n`
      
      report += `2. Replace direct OpenAI calls:\n`
      report += `\`\`\`typescript\n`
      report += `// Before\n`
      report += `const response = await openai.chat.completions.create({\n`
      report += `  model: "gpt-4-turbo-preview",\n`
      report += `  messages,\n`
      report += `  response_format: { type: "json_object" },\n`
      report += `  temperature: 0.3\n`
      report += `})\n\n`
      
      report += `// After\n`
      report += `const response = await openAIWrapper.call({\n`
      report += `  model: "gpt-4-turbo-preview",\n`
      report += `  messages,\n`
      report += `  requireJSON: true,\n`
      report += `  temperature: 0.3\n`
      report += `})\n`
      report += `\`\`\`\n\n`
      
      report += `3. Update error handling:\n`
      report += `\`\`\`typescript\n`
      report += `if (!response.success) {\n`
      report += `  console.error('OpenAI call failed:', response.error)\n`
      report += `  // Handle error\n`
      report += `  return\n`
      report += `}\n\n`
      report += `const data = response.data // Already parsed JSON\n`
      report += `\`\`\`\n\n`
    }
    
    if (alreadyMigrated.length > 0) {
      report += `## Already Migrated Files\n\n`
      
      const migratedFiles = this.groupByFile(alreadyMigrated)
      for (const file of Object.keys(migratedFiles)) {
        report += `- ${file}\n`
      }
      report += `\n`
    }
    
    return report
  }

  private groupByFile(locations: OpenAICallLocation[]): Record<string, OpenAICallLocation[]> {
    return locations.reduce((groups, location) => {
      if (!groups[location.file]) {
        groups[location.file] = []
      }
      groups[location.file].push(location)
      return groups
    }, {} as Record<string, OpenAICallLocation[]>)
  }

  /**
   * Auto-migrate simple cases (experimental)
   */
  async autoMigrate(filePath: string, dryRun: boolean = true): Promise<string> {
    const fullPath = path.join(this.projectRoot, filePath)
    const content = await fs.readFile(fullPath, 'utf-8')
    
    let modified = content
    
    // Add import if not present
    if (!modified.includes('openAIWrapper') && !modified.includes('EnhancedOpenAIWrapper')) {
      const importLine = `import { openAIWrapper } from '@/lib/ai/enhanced-openai-wrapper'\n`
      
      // Find existing imports
      const lines = modified.split('\n')
      let insertIndex = 0
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          insertIndex = i + 1
        } else if (lines[i].trim() === '' && insertIndex > 0) {
          break
        }
      }
      
      lines.splice(insertIndex, 0, importLine)
      modified = lines.join('\n')
    }
    
    // Replace simple OpenAI calls
    modified = modified.replace(
      /await\s+(\w+\.)?openai\.chat\.completions\.create\s*\(\s*\{([^}]+)\}\s*\)/g,
      (match, prefix, params) => {
        // Parse parameters
        const hasResponseFormat = params.includes('response_format')
        const hasJsonObject = params.includes('json_object')
        
        if (hasResponseFormat && hasJsonObject) {
          // Replace response_format with requireJSON
          const newParams = params
            .replace(/response_format:\s*\{\s*type:\s*['""]json_object['"']\s*\}[,\s]*/g, 'requireJSON: true,')
          
          return `await openAIWrapper.call({ ${newParams.trim()} })`
        }
        
        return match // Don't modify if not JSON format
      }
    )
    
    if (!dryRun) {
      await fs.writeFile(fullPath, modified, 'utf-8')
    }
    
    return modified
  }
}

export { OpenAIMigrationUtility, type OpenAICallLocation }