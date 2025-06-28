// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.visit('/auth/login')
  cy.get('[data-cy=email-input]').type(email)
  cy.get('[data-cy=password-input]').type(password)
  cy.get('[data-cy=login-button]').click()
  cy.url().should('include', '/dashboard')
})

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=user-menu]').click()
  cy.get('[data-cy=logout-button]').click()
  cy.url().should('include', '/auth/login')
})

// Custom command to mock API responses
Cypress.Commands.add('mockApiResponse', (url: string, response: any) => {
  cy.intercept('POST', url, {
    statusCode: 200,
    body: response
  }).as('apiCall')
})

// Custom command to wait for AI pipeline completion
Cypress.Commands.add('waitForAiPipeline', () => {
  // Mock successful pipeline responses
  cy.intercept('POST', '/api/ai/run-pipeline', {
    statusCode: 200,
    body: { success: true, pipelineId: 'test-pipeline-123' }
  }).as('startPipeline')

  cy.intercept('GET', '/api/ai/queue-status', {
    statusCode: 200,
    body: { status: 'completed', pipelineId: 'test-pipeline-123' }
  }).as('pipelineStatus')

  cy.intercept('GET', '/api/presentations/*', {
    statusCode: 200,
    body: {
      final_deck_json: {
        slides: [
          {
            id: 'slide-1',
            title: 'Test Slide',
            elements: {
              title: 'AI Generated Slide',
              bullets: ['Key Point 1', 'Key Point 2'],
              charts: [{
                type: 'area',
                data: [{ date: '2024-01', revenue: 100000 }],
                title: 'Revenue Chart'
              }]
            }
          }
        ]
      }
    }
  }).as('presentationData')
})