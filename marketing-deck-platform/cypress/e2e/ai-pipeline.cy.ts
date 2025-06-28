describe('AI Pipeline Integration Tests', () => {
  beforeEach(() => {
    // Setup test environment
    cy.visit('/')
  })

  describe('Happy Path - Generate Slides Flow', () => {
    it('should successfully generate slides from presentation dashboard', () => {
      // Mock user authentication
      cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'test-user', email: 'test@example.com' }
        }))
      })

      // Navigate to presentations page
      cy.visit('/presentations')
      
      // Verify presentations are loaded
      cy.get('[data-cy=presentation-card]').should('have.length.at.least', 1)
      
      // Setup API mocks for successful pipeline
      cy.waitForAiPipeline()
      
      // Click Generate Slides button
      cy.get('[data-cy=generate-slides-button]').first().click()
      
      // Verify loading state
      cy.get('[data-cy=generate-slides-button]').should('contain', 'Generate Slides')
      cy.get('.animate-spin').should('be.visible')
      
      // Wait for pipeline to start
      cy.wait('@startPipeline')
      
      // Verify success toast
      cy.contains('Pipeline started! Generating slides...').should('be.visible')
      
      // Wait for status polling
      cy.wait('@pipelineStatus')
      
      // Wait for presentation data fetch
      cy.wait('@presentationData')
      
      // Verify navigation to deck builder
      cy.url().should('include', '/deck-builder/')
      cy.url().should('include', 'generated=true')
      
      // Verify deck builder loads with AI data
      cy.get('[data-cy=ai-deck-builder]').should('be.visible')
      cy.get('[data-cy=slide-title]').should('contain', 'AI Generated Slide')
      cy.get('[data-cy=slide-bullets]').should('contain', 'Key Point 1')
      
      // Verify chart rendering
      cy.get('[data-cy=tremor-chart]').should('be.visible')
      
      // Test slide navigation
      cy.get('[data-cy=next-slide-button]').should('be.disabled') // Only one slide
      cy.get('[data-cy=previous-slide-button]').should('be.disabled')
      
      // Test slide thumbnails
      cy.get('[data-cy=slide-thumbnail]').should('have.length', 1)
      
      // Test save functionality
      cy.get('[data-cy=save-button]').click()
      cy.contains('Saving AI-generated slides').should('be.visible')
      
      // Test export functionality
      cy.get('[data-cy=export-button]').click()
      cy.contains('Exporting as: pdf').should('be.visible')
    })

    it('should render slide elements correctly according to AI JSON schema', () => {
      // Mock presentation data with complex elements
      cy.intercept('GET', '/api/presentations/test-presentation', {
        statusCode: 200,
        body: {
          final_deck_json: {
            slides: [
              {
                id: 'slide-1',
                title: 'Revenue Analysis',
                elements: {
                  title: 'Q4 Revenue Performance',
                  bullets: [
                    'Revenue increased 25% YoY',
                    'Strong performance in EMEA',
                    'Digital channels driving growth'
                  ],
                  charts: [{
                    type: 'area',
                    data: [
                      { date: '2024-01', revenue: 100000, target: 95000 },
                      { date: '2024-02', revenue: 110000, target: 100000 },
                      { date: '2024-03', revenue: 125000, target: 105000 }
                    ],
                    title: 'Revenue vs Target'
                  }]
                }
              },
              {
                id: 'slide-2',
                title: 'Market Expansion',
                elements: {
                  title: 'Geographic Growth',
                  bullets: [
                    'Entered 3 new markets',
                    'Local partnerships established',
                    'Regulatory approvals secured'
                  ],
                  charts: [{
                    type: 'bar',
                    data: [
                      { region: 'North America', growth: 15 },
                      { region: 'Europe', growth: 28 },
                      { region: 'Asia Pacific', growth: 42 }
                    ],
                    title: 'Growth by Region'
                  }]
                }
              }
            ]
          }
        }
      }).as('complexPresentationData')

      cy.visit('/deck-builder/test-presentation?generated=true')
      
      cy.wait('@complexPresentationData')
      
      // Verify first slide elements
      cy.get('[data-cy=slide-title]').should('contain', 'Q4 Revenue Performance')
      cy.get('[data-cy=slide-bullets]').within(() => {
        cy.contains('Revenue increased 25% YoY').should('be.visible')
        cy.contains('Strong performance in EMEA').should('be.visible')
        cy.contains('Digital channels driving growth').should('be.visible')
      })
      
      // Verify chart positioning and rendering
      cy.get('[data-cy=tremor-chart]').should('be.visible')
      cy.get('[data-cy=tremor-chart]').should('have.attr', 'style').and('include', 'position: absolute')
      
      // Navigate to second slide
      cy.get('[data-cy=next-slide-button]').click()
      
      // Verify second slide content
      cy.get('[data-cy=slide-title]').should('contain', 'Geographic Growth')
      cy.get('[data-cy=slide-bullets]').within(() => {
        cy.contains('Entered 3 new markets').should('be.visible')
        cy.contains('Local partnerships established').should('be.visible')
      })
      
      // Verify chart type change
      cy.get('[data-cy=tremor-chart]').should('be.visible')
      
      // Test slide thumbnail navigation
      cy.get('[data-cy=slide-thumbnail]').should('have.length', 2)
      cy.get('[data-cy=slide-thumbnail]').first().click()
      cy.get('[data-cy=slide-title]').should('contain', 'Q4 Revenue Performance')
    })
  })

  describe('Error Path - Schema Validation Failures', () => {
    it('should handle Agent3 schema validation errors and show in QA dashboard', () => {
      // Mock pipeline failure with schema error
      cy.intercept('POST', '/api/ai/run-pipeline', {
        statusCode: 200,
        body: { success: true, pipelineId: 'test-pipeline-fail-123' }
      }).as('startFailedPipeline')

      cy.intercept('GET', '/api/ai/queue-status', {
        statusCode: 200,
        body: { 
          status: 'failed', 
          pipelineId: 'test-pipeline-fail-123',
          error: 'Schema validation failed in Agent3: Missing required field "confidence" in insights array'
        }
      }).as('failedPipelineStatus')

      cy.visit('/presentations')
      
      // Click Generate Slides button
      cy.get('[data-cy=generate-slides-button]').first().click()
      
      cy.wait('@startFailedPipeline')
      cy.wait('@failedPipelineStatus')
      
      // Verify error toast
      cy.contains('Pipeline failed').should('be.visible')
      
      // Navigate to QA Dashboard
      cy.visit('/qa')
      
      // Verify failed pipeline run is displayed
      cy.get('[data-cy=pipeline-run-card]').should('contain', 'failed')
      cy.get('[data-cy=error-message]').should('contain', 'Schema validation failed in Agent3')
      cy.get('[data-cy=error-message]').should('contain', 'Missing required field "confidence"')
      
      // Test retry functionality
      cy.get('[data-cy=retry-button]').click()
      cy.contains('Retrying pipeline...').should('be.visible')
      
      // Verify new running pipeline appears
      cy.get('[data-cy=pipeline-run-card]').first().should('contain', 'running')
    })

    it('should display comprehensive pipeline debugging information', () => {
      // Mock failed pipeline with detailed step information
      cy.intercept('GET', '/api/ai/pipeline-runs', {
        statusCode: 200,
        body: [
          {
            id: 'run-debug-1',
            presentationId: 'pres-debug',
            status: 'failed',
            startedAt: '2024-06-28T11:00:00Z',
            completedAt: '2024-06-28T11:02:30Z',
            duration: 150,
            errorMessage: 'Schema validation failed in Agent3: Missing required field "confidence" in insights array',
            steps: {
              dataUpload: { status: 'completed', timestamp: '2024-06-28T11:00:20Z' },
              insights: { status: 'completed', timestamp: '2024-06-28T11:01:45Z' },
              narrative: { status: 'completed', timestamp: '2024-06-28T11:02:10Z' },
              structure: { 
                status: 'failed', 
                timestamp: '2024-06-28T11:02:30Z', 
                error: 'Schema validation failed: Missing required field "confidence"' 
              },
              finalDeck: { status: 'pending' }
            },
            outputs: {
              insights_json: {
                insights: [
                  { title: 'Cost Analysis', description: 'Operating costs increased' } // Missing confidence field
                ]
              },
              narrative_json: {
                theme: 'Cost Management',
                keyMessages: ['Costs under review'],
                narrative: 'Quarterly cost analysis reveals optimization opportunities'
              }
            }
          }
        ]
      }).as('debugPipelineRuns')

      cy.visit('/qa')
      cy.wait('@debugPipelineRuns')
      
      // Verify pipeline run card displays
      cy.get('[data-cy=pipeline-run-card]').should('be.visible')
      
      // Test expanding details
      cy.get('[data-cy=show-details-button]').click()
      
      // Verify step status indicators
      cy.get('[data-cy=step-status]').should('have.length', 5)
      cy.get('[data-cy=step-dataUpload]').should('contain', 'completed')
      cy.get('[data-cy=step-structure]').should('contain', 'failed')
      
      // Test JSON viewers
      cy.get('[data-cy=json-viewer-insights]').click()
      cy.get('[data-cy=json-content]').should('contain', 'Cost Analysis')
      cy.get('[data-cy=json-content]').should('not.contain', 'confidence') // Verify missing field
      
      // Test copy to clipboard
      cy.get('[data-cy=copy-json-button]').click()
      cy.contains('Copied to clipboard').should('be.visible')
      
      // Test view presentation link
      cy.get('[data-cy=view-presentation-button]').should('have.attr', 'href').and('include', '/deck-builder/pres-debug')
      
      // Test filters
      cy.get('[data-cy=filter-failed]').click()
      cy.get('[data-cy=pipeline-run-card]').should('have.length', 1)
      
      cy.get('[data-cy=filter-completed]').click()
      cy.get('[data-cy=pipeline-run-card]').should('have.length', 0)
      cy.contains('No pipeline runs match the current filter').should('be.visible')
    })
  })

  describe('Performance and Load Testing', () => {
    it('should handle multiple concurrent pipeline requests', () => {
      // Mock multiple presentations
      cy.intercept('GET', '/presentations', {
        statusCode: 200,
        body: {
          presentations: [
            { id: 'pres-1', title: 'Presentation 1', slides: 5 },
            { id: 'pres-2', title: 'Presentation 2', slides: 8 },
            { id: 'pres-3', title: 'Presentation 3', slides: 12 }
          ]
        }
      })

      // Mock staggered pipeline responses
      cy.intercept('POST', '/api/ai/run-pipeline', (req) => {
        const delay = Math.random() * 2000 + 1000 // 1-3 second delay
        req.reply({ delay, statusCode: 200, body: { success: true } })
      }).as('concurrentPipelines')

      cy.visit('/presentations')
      
      // Trigger multiple pipelines quickly
      cy.get('[data-cy=generate-slides-button]').each(($btn, index) => {
        cy.wrap($btn).click()
        cy.wait(500) // Small delay between clicks
      })
      
      // Verify all pipelines started
      cy.get('@concurrentPipelines.all').should('have.length', 3)
      
      // Verify loading states
      cy.get('.animate-spin').should('have.length.at.least', 1)
    })

    it('should gracefully handle API timeouts and network errors', () => {
      // Mock network timeout
      cy.intercept('POST', '/api/ai/run-pipeline', { forceNetworkError: true }).as('networkError')
      
      cy.visit('/presentations')
      cy.get('[data-cy=generate-slides-button]').first().click()
      
      cy.wait('@networkError')
      cy.contains('Failed to start pipeline').should('be.visible')
      
      // Mock slow API response
      cy.intercept('POST', '/api/ai/run-pipeline', { 
        delay: 15000, // 15 second delay
        statusCode: 200, 
        body: { success: true } 
      }).as('slowResponse')
      
      cy.get('[data-cy=generate-slides-button]').first().click()
      
      // Should show loading state
      cy.get('.animate-spin').should('be.visible')
      
      // Cancel the slow request by navigating away
      cy.visit('/dashboard')
      cy.visit('/presentations')
      
      // Verify no orphaned loading states
      cy.get('.animate-spin').should('not.exist')
    })
  })

  describe('QA Dashboard Functionality', () => {
    it('should display real-time pipeline monitoring', () => {
      cy.visit('/qa')
      
      // Verify stats cards
      cy.get('[data-cy=stats-total]').should('contain', '3')
      cy.get('[data-cy=stats-running]').should('contain', '1')
      cy.get('[data-cy=stats-completed]').should('contain', '1')
      cy.get('[data-cy=stats-failed]').should('contain', '1')
      
      // Test refresh functionality
      cy.get('[data-cy=refresh-button]').click()
      cy.get('.animate-spin').should('be.visible')
      
      // Test real-time updates (mock WebSocket or polling)
      cy.window().then((win) => {
        // Simulate real-time pipeline status update
        win.dispatchEvent(new CustomEvent('pipeline-status-update', {
          detail: {
            runId: 'run-3',
            status: 'completed',
            completedAt: new Date().toISOString()
          }
        }))
      })
      
      // Verify stats update
      cy.get('[data-cy=stats-running]').should('contain', '0')
      cy.get('[data-cy=stats-completed]').should('contain', '2')
    })

    it('should support advanced filtering and search', () => {
      cy.visit('/qa')
      
      // Test status filters
      cy.get('[data-cy=filter-all]').should('have.class', 'bg-blue-600') // Active filter
      
      cy.get('[data-cy=filter-failed]').click()
      cy.get('[data-cy=pipeline-run-card]').should('have.length', 1)
      cy.get('[data-cy=pipeline-run-card]').should('contain', 'failed')
      
      // Test date range filtering (if implemented)
      // cy.get('[data-cy=date-filter]').type('2024-06-28')
      
      // Test search functionality (if implemented)
      // cy.get('[data-cy=search-input]').type('Schema validation')
      // cy.get('[data-cy=pipeline-run-card]').should('have.length', 1)
    })
  })
})