/// <reference types="cypress" />

describe('Cypress Basics and Locator Strategies', () => {

    // Runs before every test in this block
    beforeEach('Open test application', () => {
        cy.visit('/') // Assumes baseUrl is set in cypress.config.js, or use full URL
        cy.contains('Forms').click()
        cy.contains('Form Layouts').click()
    })

    it('Hello world 1 - Basic Selectors', () => {

        // 1. Tag Name
        // Selects all <input> elements
        cy.get('input')

        // 2. ID
        // Selects element with id="inputEmail1"
        // Best practice: IDs are usually unique
        cy.get('#inputEmail1')

        // 3. Class Name
        // Selects elements with class="input-full-width"
        cy.get('.input-full-width')

        // 4. Attribute
        // Selects elements with [fullwidth] attribute
        cy.get('[fullwidth]')

        // 5. Attribute with Value
        // Specific value matching
        cy.get('[placeholder="Email"]')

        // 6. Multiple Classes
        // Note: Order matters for exact string matching of class attribute, 
        // but typically you'd use a single stable class or partial match.
        cy.get('[class="input-full-width size-medium status-basic shape-rectangle nb-transition"]')

        // 7. Combination
        // Combining tag and attribute
        cy.get('[placeholder="Email"][fullwidth]')
        cy.get('input[placeholder="Email"]')

        // 8. Custom Testing Attribute (Best Practice)
        // Highly recommended to use dedicated data attributes for testing to avoid 
        // tests breaking when CSS classes or IDs change for styling purposes.
        cy.get('[data-cy="inputEmail1"]')

    })

    it('Cypress Locator Methods', () => {
        // Theory:
        // get() - finds elements globally in the DOM
        // find() - finds elements ONLY inside a previously yielded subject (parent)
        // contains() - finds elements by text content

        cy.contains('Sign in')

        // contains can take a selector as first argument to filter
        cy.contains('[status="warning"]', 'Sign in')

        // Chaining find() after contains() restricts search to children of the found element
        cy.contains('nb-card', 'Horizontal form').find('button')

        // Chaining contains() looks for text inside the parent
        cy.contains('nb-card', 'Horizontal form').contains('Sign in')

        // WARNING: get() is always global, even if chained!
        // This will find ALL buttons on page, not just in the card.
        // To scope it, use .find()
        cy.contains('nb-card', 'Horizontal form').get('button')
    })

    it('Child Elements & Traversal', () => {

        // Chaining to drill down
        cy.contains('nb-card', 'Using the Grid').find('.row').find('button')

        // Using complex selectors directly
        cy.get('nb-card').find('nb-radio-group').contains('Option 1')

        cy.get('nb-card nb-radio-group').contains('Option 1')

        // Direct descendant selector (>)
        cy.get('nb-card > nb-card-body [placeholder="Jane Doe"]')
    })

    it('Parent Elements', () => {

        // parents() - goes up the DOM tree to find matches
        cy.get('#inputEmail1').parents('form').find('button')

        // parent() - gets the direct parent only
        cy.contains('Using the Grid').parent().find('button')

        // parentsUntil() - goes up until strict condition met
        cy.get('#inputEmail1').parentsUntil('nb-card-body').find('button')
    })

    it('Cypress Chains', () => {
        // Cypress commands run asynchronously and are chained

        cy.get('#inputEmail1')
            .parents('form')
            .find('button')
            .click()

        cy.get('#inputEmail1')
            .parents('form')
            .find('nb-radio')
            .first()
            .should('have.text', 'Option 1')
    })

    it('Reusing Locators (Aliases & wrapping)', () => {

        // DON'T DO THIS:
        // const input = cy.get('#input') // Returns specific object, not the element immediately
        // input.click()

        // 1. Alias (.as)
        // Saves the subject for later use with @
        cy.get('#inputEmail1').as('inputEmail1')
        cy.get('@inputEmail1').parents('form').find('button')
        cy.get('@inputEmail1').parents('form').find('nb-radio')

        // 2. .then()
        // Work with the yielded subject directly (jQuery object)
        cy.get('#inputEmail1').then(inputEmail => {
            // inside .then() we are in JavaScript land, but can wrap back to Cypress
            cy.wrap(inputEmail).parents('form').find('button')
            cy.wrap(inputEmail).parents('form').find('nb-radio')

            // Checking arbitrary values
            cy.wrap('Hello').should('equal', 'Hello')

            // Aliasing inside then
            cy.wrap(inputEmail).as('inputEmail2')
        })

        cy.get('@inputEmail2').click()

    })

    it('Extracting Values', () => {
        // 1. JQuery .text()
        cy.get('[for="exampleInputEmail1"]').then(label => {
            const emailLabel = label.text()
            console.log(emailLabel) // Logs to hitting console
            cy.log(emailLabel)      // Logs to Cypress Command Log
        })

        // 2. .invoke()
        // Invokes a function on the yielded subject
        cy.get('[for="exampleInputEmail1"]').invoke('text').then(emailLabel => {
            console.log(emailLabel)
        })

        // Alias the result of invoke
        cy.get('[for="exampleInputEmail1"]').invoke('text').as('emailLabel')
        cy.get('[for="exampleInputEmail1"]').should('contain', 'Email address')

        // 3. Invoke attributes
        cy.get('#exampleInputEmail1').invoke('attr', 'class').then(classValue => {
            console.log(classValue)
        })

        // Assertion on attribute
        cy.get('#exampleInputEmail1').should('have.attr', 'class', 'input-full-width size-medium status-basic shape-rectangle nb-transition')

        // 4. Properties (value of input)
        // .type() enters text
        cy.get('#exampleInputEmail1').type('hello@test.com')
        // 'value' is a property, not attribute, for current input state
        cy.get('#exampleInputEmail1').invoke('prop', 'value').then(value => {
            console.log(value)
        })
    })

    it('Assertions', () => {

        // Implicit Assertion (should)
        cy.get('[for="exampleInputEmail1"]').should('have.text', 'Email address')

        // Explicit Assertion (expect) - often used inside .then()
        cy.get('[for="exampleInputEmail1"]').then(label => {
            expect(label).to.have.text('Email address')
        })

        // Using invoke + assertion
        cy.get('[for="exampleInputEmail1"]').invoke('text').then(emailLabel => {
            expect(emailLabel).to.equal('Email address')
            cy.wrap(emailLabel).should('equal', 'Email address')
        })

    })

    it('Timeouts', () => {
        // Cypress waits 4s by default. You can increase this.

        cy.contains('Modal & Overlays').click()
        cy.contains('Dialog').click()

        cy.contains('Open with delay 10 seconds').click()

        // Override timeout for specific command
        cy.get('nb-dialog-container nb-card-header', { timeout: 11000 })
            .should('have.text', 'Friendly reminder')
    })

})
