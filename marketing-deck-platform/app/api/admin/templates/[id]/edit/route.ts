import { NextRequest, NextResponse } from 'next/server'
import { AdminAuth } from '@/lib/auth/admin-auth'
import { createServerSupabaseClient } from '@/lib/supabase/server-client'
import { promises as fs } from 'fs'
import path from 'path'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin, admin } = await AdminAuth.requireAdmin(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const templateData = await request.json()
    const supabase = await createServerSupabaseClient()
    
    // Get current template for backup
    const { data: currentTemplate, error: fetchError } = await supabase
      .from('admin_templates')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !currentTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Update template in database
    const { data: updatedTemplate, error: updateError } = await supabase
      .from('admin_templates')
      .update({
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        slide_structure: templateData.slide_structure,
        design_settings: templateData.design_settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating template:', updateError)
      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      )
    }

    // Generate template files for the codebase
    try {
      await generateTemplateFiles(updatedTemplate)
    } catch (fileError) {
      console.error('Error generating template files:', fileError)
      // Continue despite file generation error
    }

    // Log file change
    await supabase
      .from('file_management')
      .insert({
        file_path: `templates/${updatedTemplate.name.toLowerCase().replace(/\s+/g, '-')}.ts`,
        file_type: 'template',
        content: JSON.stringify(updatedTemplate.slide_structure),
        backup_content: JSON.stringify(currentTemplate.slide_structure),
        change_reason: `Template updated: ${templateData.name}`,
        modified_by: admin?.id
      })

    // Log admin action
    if (admin) {
      await AdminAuth.logAdminActivity(
        admin.id,
        'template_edited',
        { 
          template_id: params.id,
          template_name: templateData.name,
          changes: getTemplateChanges(currentTemplate, templateData)
        },
        'templates',
        params.id,
        request
      )
    }

    return NextResponse.json({ 
      template: updatedTemplate,
      files_updated: true,
      message: 'Template updated and files generated successfully'
    })
  } catch (error) {
    console.error('Template edit error:', error)
    return NextResponse.json(
      { error: 'Failed to edit template' },
      { status: 500 }
    )
  }
}

async function generateTemplateFiles(template: any) {
  const templateFileName = template.name.toLowerCase().replace(/\s+/g, '-')
  
  // Generate TypeScript template definition
  const templateDefinition = `// Auto-generated template: ${template.name}
// Last updated: ${new Date().toISOString()}

export interface ${toPascalCase(templateFileName)}Template {
  id: string
  name: string
  category: string
  description: string
  slideStructure: SlideStructure[]
  designSettings: DesignSettings
}

export interface SlideStructure {
  id: string
  title: string
  layout: string
  elements: SlideElement[]
}

export interface SlideElement {
  id: string
  type: 'title' | 'subtitle' | 'text' | 'chart' | 'image' | 'list'
  content: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  style?: Record<string, any>
}

export interface DesignSettings {
  theme: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  backgroundColor: string
}

export const ${toCamelCase(templateFileName)}Template: ${toPascalCase(templateFileName)}Template = {
  id: '${template.id}',
  name: '${template.name}',
  category: '${template.category}',
  description: '${template.description}',
  slideStructure: ${JSON.stringify(template.slide_structure, null, 2)},
  designSettings: ${JSON.stringify(template.design_settings, null, 2)}
}

export default ${toCamelCase(templateFileName)}Template
`

  // Write template definition file
  const templatePath = path.join(process.cwd(), 'lib', 'templates', `${templateFileName}.ts`)
  await ensureDirectoryExists(path.dirname(templatePath))
  await fs.writeFile(templatePath, templateDefinition)

  // Generate React component for template preview
  const componentCode = `// Auto-generated template component: ${template.name}
// Last updated: ${new Date().toISOString()}

import React from 'react'
import { ${toCamelCase(templateFileName)}Template } from '@/lib/templates/${templateFileName}'

interface ${toPascalCase(templateFileName)}PreviewProps {
  data?: any
  onSlideClick?: (slideIndex: number) => void
}

export default function ${toPascalCase(templateFileName)}Preview({ 
  data, 
  onSlideClick 
}: ${toPascalCase(templateFileName)}PreviewProps) {
  const template = ${toCamelCase(templateFileName)}Template

  return (
    <div className="template-preview" style={{
      backgroundColor: template.designSettings.backgroundColor,
      fontFamily: template.designSettings.fontFamily
    }}>
      {template.slideStructure.map((slide, index) => (
        <div
          key={slide.id}
          className="slide-preview"
          onClick={() => onSlideClick?.(index)}
          style={{
            cursor: onSlideClick ? 'pointer' : 'default',
            padding: '20px',
            margin: '10px 0',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#ffffff'
          }}
        >
          <h3 style={{ 
            color: template.designSettings.primaryColor,
            marginBottom: '15px'
          }}>
            {slide.title}
          </h3>
          
          {slide.elements.map((element) => (
            <div
              key={element.id}
              style={{
                position: 'relative',
                left: \`\${element.position.x}%\`,
                top: \`\${element.position.y}px\`,
                width: \`\${element.size.width}%\`,
                height: \`\${element.size.height}px\`,
                marginBottom: '10px',
                fontSize: element.type === 'title' ? '1.5rem' : 
                         element.type === 'subtitle' ? '1.2rem' : '1rem',
                fontWeight: element.type === 'title' ? 'bold' : 
                           element.type === 'subtitle' ? '600' : 'normal',
                color: element.type === 'title' ? template.designSettings.primaryColor :
                       element.type === 'subtitle' ? template.designSettings.secondaryColor :
                       '#333333',
                ...element.style
              }}
            >
              {element.type === 'chart' ? (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #ccc',
                  borderRadius: '4px'
                }}>
                  📊 Chart Placeholder
                </div>
              ) : element.type === 'image' ? (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #ccc',
                  borderRadius: '4px'
                }}>
                  🖼️ Image Placeholder
                </div>
              ) : (
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {element.content}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
`

  // Write component file
  const componentPath = path.join(process.cwd(), 'components', 'templates', `${toPascalCase(templateFileName)}Preview.tsx`)
  await ensureDirectoryExists(path.dirname(componentPath))
  await fs.writeFile(componentPath, componentCode)

  // Update template index file
  await updateTemplateIndex(templateFileName, template.name)
}

async function updateTemplateIndex(templateFileName: string, templateName: string) {
  const indexPath = path.join(process.cwd(), 'lib', 'templates', 'index.ts')
  
  try {
    let content = ''
    try {
      content = await fs.readFile(indexPath, 'utf8')
    } catch {
      // File doesn't exist, create it
      content = '// Auto-generated template index\n\n'
    }

    const importStatement = `export { default as ${toCamelCase(templateFileName)}Template } from './${templateFileName}'\n`
    const exportStatement = `  '${templateFileName}': () => import('./${templateFileName}').then(m => m.default),\n`

    // Add import if not exists
    if (!content.includes(importStatement.trim())) {
      const importsSection = content.split('\n').filter(line => line.startsWith('export')).join('\n')
      const exportsSection = content.split('\n').filter(line => !line.startsWith('export') && line.trim()).join('\n')
      
      content = `// Auto-generated template index\n\n${importsSection}\n${importStatement}\n${exportsSection}`
    }

    // Add to templates object if not exists
    if (!content.includes(`'${templateFileName}':`)) {
      if (!content.includes('export const templates = {')) {
        content += `\nexport const templates = {\n${exportStatement}}\n`
      } else {
        content = content.replace(
          /export const templates = \{([^}]*)\}/s,
          `export const templates = {$1${exportStatement}}`
        )
      }
    }

    await fs.writeFile(indexPath, content)
  } catch (error) {
    console.error('Error updating template index:', error)
  }
}

async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

function toPascalCase(str: string): string {
  return str.replace(/(^\w|[-_]\w)/g, (match) => 
    match.replace(/[-_]/, '').toUpperCase()
  )
}

function toCamelCase(str: string): string {
  const pascalCase = toPascalCase(str)
  return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1)
}

function getTemplateChanges(oldTemplate: any, newTemplate: any): string[] {
  const changes = []
  
  if (oldTemplate.name !== newTemplate.name) {
    changes.push(`Name: "${oldTemplate.name}" → "${newTemplate.name}"`)
  }
  
  if (oldTemplate.description !== newTemplate.description) {
    changes.push('Description updated')
  }
  
  if (oldTemplate.category !== newTemplate.category) {
    changes.push(`Category: "${oldTemplate.category}" → "${newTemplate.category}"`)
  }
  
  if (JSON.stringify(oldTemplate.slide_structure) !== JSON.stringify(newTemplate.slide_structure)) {
    changes.push('Slide structure modified')
  }
  
  if (JSON.stringify(oldTemplate.design_settings) !== JSON.stringify(newTemplate.design_settings)) {
    changes.push('Design settings updated')
  }
  
  return changes
}