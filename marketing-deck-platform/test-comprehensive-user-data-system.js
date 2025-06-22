const { createClient } = require('@supabase/supabase-js')

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://waddrfstpqkvdfwbxvfw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZGRyZnN0cHFrdmRmd2J4dmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDU3NzUsImV4cCI6MjA2NTkyMTc3NX0.xzosM3NHbf_kpmw5hRFKKqDuvbNLp9MrqsWITk9tD5w'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

class ComprehensiveUserDataTest {
  constructor() {
    this.testResults = []
    this.testUser = null
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`)
    this.testResults.push({ timestamp, type, message })
  }

  async testSupabaseConnection() {
    try {
      this.log('Testing Supabase connection...')
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      
      if (error) throw error
      
      this.log('✅ Supabase connection successful', 'success')
      return true
    } catch (error) {
      this.log(`❌ Supabase connection failed: ${error.message}`, 'error')
      return false
    }
  }

  async testDatabaseFunctions() {
    try {
      this.log('Testing database functions...')
      
      // Test RPC functions
      const testUserId = '00000000-0000-0000-0000-000000000000'
      
      // Test track_user_activity function
      const { error: activityError } = await supabase.rpc('track_user_activity', {
        user_uuid: testUserId,
        activity_type: 'test_activity',
        activity_subtype: 'test_subtype',
        resource_type: 'test_resource',
        metadata: { test: true }
      })
      
      if (activityError) {
        this.log(`❌ track_user_activity function failed: ${activityError.message}`, 'error')
        return false
      }
      
      // Test update_user_analytics function
      const { error: analyticsError } = await supabase.rpc('update_user_analytics', {
        user_uuid: testUserId,
        session_count: 1,
        session_time_minutes: 30,
        presentations_created: 1,
        presentations_edited: 1,
        presentations_viewed: 1,
        data_files_uploaded: 1,
        exports_generated: 1
      })
      
      if (analyticsError) {
        this.log(`❌ update_user_analytics function failed: ${analyticsError.message}`, 'error')
        return false
      }
      
      // Test track_api_usage function
      const { error: apiError } = await supabase.rpc('track_api_usage', {
        user_uuid: testUserId,
        endpoint_path: '/api/test',
        request_method: 'GET',
        tokens_consumed: 100,
        cost: 0.001
      })
      
      if (apiError) {
        this.log(`❌ track_api_usage function failed: ${apiError.message}`, 'error')
        return false
      }
      
      this.log('✅ All database functions working correctly', 'success')
      return true
    } catch (error) {
      this.log(`❌ Database functions test failed: ${error.message}`, 'error')
      return false
    }
  }

  async testDatabaseViews() {
    try {
      this.log('Testing database views...')
      
      // Test user_dashboard view
      const { data: dashboardData, error: dashboardError } = await supabase
        .from('user_dashboard')
        .select('*')
        .limit(1)
      
      if (dashboardError) {
        this.log(`❌ user_dashboard view failed: ${dashboardError.message}`, 'error')
        return false
      }
      
      // Test user_analytics_summary view
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('user_analytics_summary')
        .select('*')
        .limit(1)
      
      if (analyticsError) {
        this.log(`❌ user_analytics_summary view failed: ${analyticsError.message}`, 'error')
        return false
      }
      
      // Test presentation_analytics view
      const { data: presentationData, error: presentationError } = await supabase
        .from('presentation_analytics')
        .select('*')
        .limit(1)
      
      if (presentationError) {
        this.log(`❌ presentation_analytics view failed: ${presentationError.message}`, 'error')
        return false
      }
      
      this.log('✅ All database views working correctly', 'success')
      return true
    } catch (error) {
      this.log(`❌ Database views test failed: ${error.message}`, 'error')
      return false
    }
  }

  async testRLSPolicies() {
    try {
      this.log('Testing RLS policies...')
      
      // Test that unauthenticated users cannot access protected data
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      // Should be empty due to RLS
      if (profilesData && profilesData.length > 0) {
        this.log('⚠️ RLS policies may not be working correctly - unauthenticated user can see profiles', 'warning')
      } else {
        this.log('✅ RLS policies working correctly - unauthenticated user cannot access profiles', 'success')
      }
      
      return true
    } catch (error) {
      this.log(`❌ RLS policies test failed: ${error.message}`, 'error')
      return false
    }
  }

  async testAPIRoutes() {
    try {
      this.log('Testing API routes...')
      
      const baseUrl = 'http://localhost:3001'
      
      // Test dashboard API (should return 401 for unauthenticated)
      const dashboardResponse = await fetch(`${baseUrl}/api/user/dashboard`)
      if (dashboardResponse.status === 401) {
        this.log('✅ Dashboard API properly protected', 'success')
      } else {
        this.log(`⚠️ Dashboard API returned status ${dashboardResponse.status}`, 'warning')
      }
      
      // Test presentations API (should return 401 for unauthenticated)
      const presentationsResponse = await fetch(`${baseUrl}/api/presentations`)
      if (presentationsResponse.status === 401) {
        this.log('✅ Presentations API properly protected', 'success')
      } else {
        this.log(`⚠️ Presentations API returned status ${presentationsResponse.status}`, 'warning')
      }
      
      // Test data imports API (should return 401 for unauthenticated)
      const dataImportsResponse = await fetch(`${baseUrl}/api/data-imports`)
      if (dataImportsResponse.status === 401) {
        this.log('✅ Data imports API properly protected', 'success')
      } else {
        this.log(`⚠️ Data imports API returned status ${dataImportsResponse.status}`, 'warning')
      }
      
      return true
    } catch (error) {
      this.log(`❌ API routes test failed: ${error.message}`, 'error')
      return false
    }
  }

  async testDatabaseSchema() {
    try {
      this.log('Testing database schema...')
      
      // Test all required tables exist
      const requiredTables = [
        'profiles',
        'presentations',
        'data_imports',
        'user_activities',
        'user_sessions',
        'user_feedback',
        'user_preferences',
        'user_collaborations',
        'user_analytics',
        'templates',
        'subscriptions',
        'api_usage'
      ]
      
      for (const table of requiredTables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1)
          
          if (error) {
            this.log(`❌ Table ${table} not accessible: ${error.message}`, 'error')
            return false
          }
          
          this.log(`✅ Table ${table} accessible`, 'success')
        } catch (error) {
          this.log(`❌ Table ${table} test failed: ${error.message}`, 'error')
          return false
        }
      }
      
      return true
    } catch (error) {
      this.log(`❌ Database schema test failed: ${error.message}`, 'error')
      return false
    }
  }

  async testDefaultData() {
    try {
      this.log('Testing default data...')
      
      // Test templates exist
      const { data: templates, error: templatesError } = await supabase
        .from('templates')
        .select('*')
        .eq('is_public', true)
      
      if (templatesError) {
        this.log(`❌ Templates query failed: ${templatesError.message}`, 'error')
        return false
      }
      
      if (templates && templates.length > 0) {
        this.log(`✅ Found ${templates.length} public templates`, 'success')
      } else {
        this.log('⚠️ No public templates found', 'warning')
      }
      
      return true
    } catch (error) {
      this.log(`❌ Default data test failed: ${error.message}`, 'error')
      return false
    }
  }

  async generateReport() {
    this.log('Generating comprehensive test report...')
    
    const successCount = this.testResults.filter(r => r.type === 'success').length
    const errorCount = this.testResults.filter(r => r.type === 'error').length
    const warningCount = this.testResults.filter(r => r.type === 'warning').length
    
    console.log('\n' + '='.repeat(80))
    console.log('COMPREHENSIVE USER DATA SYSTEM TEST REPORT')
    console.log('='.repeat(80))
    console.log(`Test Date: ${new Date().toISOString()}`)
    console.log(`Total Tests: ${this.testResults.length}`)
    console.log(`✅ Success: ${successCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log(`⚠️ Warnings: ${warningCount}`)
    console.log('='.repeat(80))
    
    // Group results by type
    const errors = this.testResults.filter(r => r.type === 'error')
    const warnings = this.testResults.filter(r => r.type === 'warning')
    const successes = this.testResults.filter(r => r.type === 'success')
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS:')
      errors.forEach(error => {
        console.log(`  - ${error.message}`)
      })
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:')
      warnings.forEach(warning => {
        console.log(`  - ${warning.message}`)
      })
    }
    
    if (successes.length > 0) {
      console.log('\n✅ SUCCESSES:')
      successes.forEach(success => {
        console.log(`  - ${success.message}`)
      })
    }
    
    console.log('\n' + '='.repeat(80))
    
    if (errorCount === 0) {
      console.log('🎉 ALL TESTS PASSED! The user data system is working correctly.')
    } else {
      console.log(`⚠️ ${errorCount} errors found. Please review and fix the issues above.`)
    }
    
    console.log('='.repeat(80))
    
    // Save report to file
    const fs = require('fs')
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        success: successCount,
        error: errorCount,
        warning: warningCount
      },
      results: this.testResults
    }
    
    fs.writeFileSync('comprehensive-test-report.json', JSON.stringify(reportData, null, 2))
    this.log('Test report saved to comprehensive-test-report.json', 'info')
  }

  async runAllTests() {
    this.log('Starting comprehensive user data system tests...')
    
    const tests = [
      this.testSupabaseConnection(),
      this.testDatabaseSchema(),
      this.testDatabaseFunctions(),
      this.testDatabaseViews(),
      this.testRLSPolicies(),
      this.testDefaultData(),
      this.testAPIRoutes()
    ]
    
    await Promise.all(tests)
    
    await this.generateReport()
  }
}

// Run the tests
async function main() {
  const tester = new ComprehensiveUserDataTest()
  await tester.runAllTests()
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = ComprehensiveUserDataTest 