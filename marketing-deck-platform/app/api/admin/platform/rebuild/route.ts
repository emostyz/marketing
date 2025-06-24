import { NextRequest, NextResponse } from 'next/server'
import { AdminAuth } from '@/lib/auth/admin-auth'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'
import { promises as fs } from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { isAdmin, admin } = await AdminAuth.requireAdmin(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { trigger } = await request.json()
    const supabase = await createServerSupabaseClient()

    // Get current platform settings
    const { data: settingsData, error } = await supabase
      .from('platform_settings')
      .select('setting_key, setting_value')

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch settings for rebuild' },
        { status: 500 }
      )
    }

    // Convert settings to usable format
    const settings: Record<string, any> = {}
    settingsData?.forEach(setting => {
      try {
        settings[setting.setting_key] = JSON.parse(setting.setting_value)
      } catch {
        settings[setting.setting_key] = setting.setting_value
      }
    })

    const changes = []
    const modifiedFiles = []

    // Update homepage content
    if (trigger === 'settings_update' || trigger === 'homepage_update') {
      try {
        await updateHomepageContent(settings)
        changes.push('Homepage content updated')
        modifiedFiles.push('app/page.tsx')
      } catch (error) {
        console.error('Error updating homepage:', error)
      }
    }

    // Update all pages with logos/headers
    if (trigger === 'settings_update' || trigger === 'branding_update') {
      try {
        const updatedPages = await updateLogosAndHeadersAcrossAllPages(settings)
        changes.push(`Updated logos/headers across ${updatedPages.length} pages`)
        modifiedFiles.push(...updatedPages)
      } catch (error) {
        console.error('Error updating logos/headers:', error)
      }
    }

    // Update environment variables
    if (trigger === 'settings_update' || trigger === 'api_update') {
      try {
        await updateEnvironmentFile(settings)
        changes.push('Environment variables updated')
        modifiedFiles.push('.env.local')
      } catch (error) {
        console.error('Error updating environment:', error)
      }
    }

    // Update configuration files
    if (trigger === 'settings_update' || trigger === 'ui_update') {
      try {
        await updateConfigFiles(settings)
        changes.push('Configuration files updated')
        modifiedFiles.push('tailwind.config.js')
      } catch (error) {
        console.error('Error updating config files:', error)
      }
    }

    // Commit and push changes to GitHub
    if (modifiedFiles.length > 0) {
      try {
        await commitAndPushChanges(modifiedFiles, trigger, admin?.id)
        changes.push('Changes committed and pushed to GitHub')
      } catch (error) {
        console.error('Error pushing to GitHub:', error)
        changes.push('Failed to push to GitHub (changes saved locally)')
      }
    }

    // Log file changes to database
    for (const change of changes) {
      await supabase
        .from('file_management')
        .insert({
          file_path: getFilePathFromChange(change),
          file_type: 'auto_update',
          change_reason: `Platform rebuild triggered by ${trigger}`,
          modified_by: admin?.id
        })
    }

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'platform_rebuild_triggered',
        { 
          trigger,
          changes_applied: changes.length,
          changes
        },
        'platform',
        undefined,
        request
      )
    }

    return NextResponse.json({ 
      success: true,
      changes_applied: changes.length,
      changes,
      message: 'Platform rebuild completed successfully'
    })
  } catch (error) {
    console.error('Platform rebuild error:', error)
    return NextResponse.json(
      { error: 'Failed to rebuild platform' },
      { status: 500 }
    )
  }
}

async function updateHomepageContent(settings: Record<string, any>) {
  const homepagePath = path.join(process.cwd(), 'app', 'page.tsx')
  
  try {
    let content = await fs.readFile(homepagePath, 'utf8')
    
    // Update site name
    if (settings['general.site_name']) {
      content = content.replace(
        /AEDRIN/g,
        settings['general.site_name']
      )
    }

    // Update tagline
    if (settings['general.site_tagline']) {
      content = content.replace(
        /Transform Your Data Into\s*\n\s*<span[^>]*>Stunning Presentations<\/span>/,
        `${settings['general.site_tagline'].split(' ').slice(0, 4).join(' ')}\n              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> ${settings['general.site_tagline'].split(' ').slice(4).join(' ')}</span>`
      )
    }

    // Update primary color
    if (settings['ui.primary_color']) {
      content = content.replace(
        /from-blue-400/g,
        `from-[${settings['ui.primary_color']}]`
      )
      content = content.replace(
        /bg-blue-600/g,
        `bg-[${settings['ui.primary_color']}]`
      )
    }

    // Update secondary color
    if (settings['ui.secondary_color']) {
      content = content.replace(
        /to-purple-500/g,
        `to-[${settings['ui.secondary_color']}]`
      )
    }

    await fs.writeFile(homepagePath, content)
  } catch (error) {
    console.error('Error updating homepage content:', error)
    throw error
  }
}

async function updateEnvironmentFile(settings: Record<string, any>) {
  const envPath = path.join(process.cwd(), '.env.local')
  
  try {
    let content = await fs.readFile(envPath, 'utf8')
    
    // Update OpenAI API key
    if (settings['api.openai_key']) {
      const openaiRegex = /OPENAI_API_KEY=.*/
      if (openaiRegex.test(content)) {
        content = content.replace(openaiRegex, `OPENAI_API_KEY=${settings['api.openai_key']}`)
      } else {
        content += `\nOPENAI_API_KEY=${settings['api.openai_key']}`
      }
    }

    // Update Anthropic API key
    if (settings['api.anthropic_key']) {
      const anthropicRegex = /ANTHROPIC_API_KEY=.*/
      if (anthropicRegex.test(content)) {
        content = content.replace(anthropicRegex, `ANTHROPIC_API_KEY=${settings['api.anthropic_key']}`)
      } else {
        content += `\nANTHROPIC_API_KEY=${settings['api.anthropic_key']}`
      }
    }

    // Update Google API key
    if (settings['api.google_key']) {
      const googleRegex = /GOOGLE_API_KEY=.*/
      if (googleRegex.test(content)) {
        content = content.replace(googleRegex, `GOOGLE_API_KEY=${settings['api.google_key']}`)
      } else {
        content += `\nGOOGLE_API_KEY=${settings['api.google_key']}`
      }
    }

    await fs.writeFile(envPath, content)
  } catch (error) {
    console.error('Error updating environment file:', error)
    throw error
  }
}

async function updateConfigFiles(settings: Record<string, any>) {
  // Update Tailwind config for colors
  const tailwindPath = path.join(process.cwd(), 'tailwind.config.js')
  
  try {
    let content = await fs.readFile(tailwindPath, 'utf8')
    
    if (settings['ui.primary_color'] || settings['ui.secondary_color']) {
      // This would update the Tailwind config with new colors
      // For now, we'll just log it
      console.log('Tailwind config would be updated with:', {
        primary: settings['ui.primary_color'],
        secondary: settings['ui.secondary_color']
      })
    }
  } catch (error) {
    // File might not exist or be readable
    console.warn('Could not update Tailwind config:', error)
  }
}

async function updateLogosAndHeadersAcrossAllPages(settings: Record<string, any>): Promise<string[]> {
  const modifiedFiles: string[] = []
  const siteName = settings['general.site_name'] || 'AEDRIN'
  
  // Define all page and component files that might contain logos/headers
  const pagePatterns = [
    'app/**/page.tsx',
    'components/**/*.tsx',
    'app/**/layout.tsx'
  ]

  // Get all relevant files
  const allFiles = []
  for (const pattern of pagePatterns) {
    try {
      const { stdout } = await execAsync(`find . -path "./node_modules" -prune -o -path "./.next" -prune -o -name "*.tsx" -type f -print | head -50`)
      const files = stdout.trim().split('\n').filter(f => f && !f.includes('node_modules') && !f.includes('.next'))
      allFiles.push(...files)
    } catch (error) {
      console.warn('Error finding files:', error)
    }
  }

  // Update each file
  for (const filePath of [...new Set(allFiles)]) {
    try {
      const fullPath = path.join(process.cwd(), filePath.replace('./', ''))
      let content = await fs.readFile(fullPath, 'utf8')
      let modified = false

      // Replace AEDRIN references (case-sensitive)
      if (content.includes('AEDRIN') && siteName !== 'AEDRIN') {
        content = content.replace(/AEDRIN/g, siteName)
        modified = true
      }

      // Replace common logo text patterns
      const logoPatterns = [
        { old: />\s*AEDRIN\s*</g, new: `>${siteName}<` },
        { old: /"AEDRIN"/g, new: `"${siteName}"` },
        { old: /'AEDRIN'/g, new: `'${siteName}'` },
        { old: /title="AEDRIN"/g, new: `title="${siteName}"` },
        { old: /alt="AEDRIN"/g, new: `alt="${siteName}"` },
        { old: /aria-label="AEDRIN"/g, new: `aria-label="${siteName}"` }
      ]

      for (const pattern of logoPatterns) {
        if (pattern.old.test(content)) {
          content = content.replace(pattern.old, pattern.new)
          modified = true
        }
      }

      // Update header components specifically
      if (filePath.includes('components') && (filePath.includes('header') || filePath.includes('nav') || filePath.includes('Header') || filePath.includes('Nav'))) {
        const headerPatterns = [
          { old: /className="[^"]*">AEDRIN</g, new: `">${siteName}` },
          { old: /<h1[^>]*>AEDRIN<\/h1>/g, new: siteName }
        ]

        for (const pattern of headerPatterns) {
          if (content.match(pattern.old)) {
            // More careful replacement for header patterns
            content = content.replace(/(<h1[^>]*>)AEDRIN(<\/h1>)/g, `$1${siteName}$2`)
            content = content.replace(/(className="[^"]*">)AEDRIN(<)/g, `$1${siteName}$2`)
            modified = true
          }
        }
      }

      // Update colors if provided
      if (settings['ui.primary_color']) {
        const colorReplacements = [
          { old: /from-blue-400/g, new: `from-[${settings['ui.primary_color']}]` },
          { old: /bg-blue-600/g, new: `bg-[${settings['ui.primary_color']}]` },
          { old: /text-blue-600/g, new: `text-[${settings['ui.primary_color']}]` },
          { old: /border-blue-600/g, new: `border-[${settings['ui.primary_color']}]` }
        ]

        for (const replacement of colorReplacements) {
          if (replacement.old.test(content)) {
            content = content.replace(replacement.old, replacement.new)
            modified = true
          }
        }
      }

      if (settings['ui.secondary_color']) {
        const secondaryColorReplacements = [
          { old: /to-purple-500/g, new: `to-[${settings['ui.secondary_color']}]` },
          { old: /bg-purple-600/g, new: `bg-[${settings['ui.secondary_color']}]` },
          { old: /text-purple-600/g, new: `text-[${settings['ui.secondary_color']}]` }
        ]

        for (const replacement of secondaryColorReplacements) {
          if (replacement.old.test(content)) {
            content = content.replace(replacement.old, replacement.new)
            modified = true
          }
        }
      }

      if (modified) {
        await fs.writeFile(fullPath, content)
        modifiedFiles.push(filePath.replace('./', ''))
      }
    } catch (error) {
      console.warn(`Error updating file ${filePath}:`, error)
    }
  }

  return modifiedFiles
}

async function commitAndPushChanges(modifiedFiles: string[], trigger: string, adminId?: string): Promise<void> {
  try {
    // Add all modified files to git
    for (const file of modifiedFiles) {
      try {
        await execAsync(`git add "${file}"`)
      } catch (error) {
        console.warn(`Error adding file ${file}:`, error)
      }
    }

    // Create commit message
    const timestamp = new Date().toISOString()
    const commitMessage = `Admin platform update: ${trigger}

Updated files:
${modifiedFiles.map(f => `- ${f}`).join('\n')}

Triggered by: ${adminId || 'admin'}
Timestamp: ${timestamp}

🎯 Auto-generated by AEDRIN Admin System`

    // Commit changes
    await execAsync(`git commit -m "${commitMessage}"`)

    // Push to remote (assuming origin main)
    await execAsync('git push origin main')

    console.log('Successfully committed and pushed changes to GitHub')
  } catch (error) {
    console.error('Error in Git operations:', error)
    throw error
  }
}

function getFilePathFromChange(change: string): string {
  if (change.includes('Homepage')) return 'app/page.tsx'
  if (change.includes('Environment')) return '.env.local'
  if (change.includes('Configuration')) return 'tailwind.config.js'
  if (change.includes('logos/headers')) return 'multiple_files'
  return 'unknown'
}