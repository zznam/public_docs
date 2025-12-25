/// <reference types="cypress" />

describe('Advanced UI Components', () => {

    beforeEach('Open application', () => {
        cy.visit('/')
    })

    it('Input Fields & Basic Interaction', () => {
        cy.contains('Forms').click()
        cy.contains('Form Layouts').click()

        const name = 'Artem'

        // Chaining clear() and type()
        // 'delay' slows down typing to mimic real user speed or help with debugging
        cy.get('#inputEmail1').type('hello@test.com', { delay: 50 }).clear().type('hello').clear()

        // Using Template Literals for dynamic data
        cy.contains('nb-card', 'Using the Grid').contains('Email').type(`${name}@test.com`)

        // Asserting value before action
        cy.get('#inputEmail1').should('not.have.value', '').clear().type('test@bondaracademy.com')
            // Simulating special keys like TAB
            .press(Cypress.Keyboard.Keys.TAB)

        cy.contains('Auth').click()
        cy.contains('Login').click()

        // Typing special keys directly in string ({enter})
        cy.get('#input-email').type('test@bondaracademy.com')
        cy.get('#input-password').type('Welcome{enter}')
    })

    it('Radio Buttons', () => {
        cy.contains('Forms').click()
        cy.contains('Form Layouts').click()

        // .check() is specifically for radio buttons and checkboxes
        // 'force: true' allows interacting with hidden elements (often used in modern UI frameworks where actual input is hidden)

        cy.contains('nb-card', 'Using the Grid').find('[type="radio"]').then(allRadioButtons => {
            // Selecting by index using .eq()
            cy.wrap(allRadioButtons).eq(0).check({ force: true }).should('be.checked')

            cy.wrap(allRadioButtons).eq(1).check({ force: true })

            // Verifying the first one is now unchecked (radio behavior)
            cy.wrap(allRadioButtons).eq(0).should('not.be.checked')

            // Verifying disabled state
            cy.wrap(allRadioButtons).eq(2).should('be.disabled')
        })
    })

    it('Checkboxes', () => {
        cy.contains('Modal & Overlays').click()
        cy.contains('Toastr').click()

        // check() can select multiple elements at once if the selector matches multiple
        // uncheck() to unselect
        cy.get('[type="checkbox"]').check({ force: true })
        cy.get('[type="checkbox"]').should('be.checked')
    })

    it('Lists and Dropdowns', () => {
        cy.contains('Modal & Overlays').click()
        cy.contains('Toastr').click()

        // 1. Standard HTML <select> tag
        // Use .select() to choose by value or text
        cy.contains('div', 'Toast type:').find('select').select('info').should('have.value', 'info')

        // 2. Custom Dropdowns (not <select> tags)
        // You must click to open, then click the option
        cy.contains('div', 'Position:').find('nb-select').click()
        cy.get('.option-list').contains('bottom-right').click()
        cy.contains('div', 'Position:').find('nb-select').should('have.text', 'bottom-right')

        // 3. Loop through all options in a dropdown to test them
        cy.contains('div', 'Position:').find('nb-select').then(dropdown => {
            cy.wrap(dropdown).click()

            // .each() allows iterating through a list of found elements
            cy.get('.option-list nb-option').each((option, index, list) => {
                // Click the option
                cy.wrap(option).click()

                // Re-open the dropdown for the next iteration (unless it's the last one)
                if (index < list.length - 1)
                    cy.wrap(dropdown).click()
            })
        })
    })

    it('Tooltips', () => {
        cy.contains('Modal & Overlays').click()
        cy.contains('Tooltip').click()

        // Tooltips often appear on hover. Cypress doesn't have a real 'hover',
        // but .trigger('mouseenter') simulates it.
        cy.contains('button', 'Top').trigger('mouseenter')
        cy.get('nb-tooltip').should('have.text', 'This is a tooltip')
    })

    it('Dialog Boxes (Browser Alerts)', () => {
        cy.contains('Tables & Data').click()
        cy.contains('Smart Table').click()

        // Browser alerts (window.confirm) are auto-accepted by Cypress.
        // We verify the text using an event listener.

        // 1. Verify text of a confirmation dialog
        cy.get('.nb-trash').first().click()
        cy.on('window:confirm', confirm => {
            expect(confirm).to.equal('Are you sure you want to delete?')
        })

        // 2. Control the dialog (e.g., click Cancel instead of OK)
        // We must Stub the window object before the event happens.
        cy.window().then(win => {
            // Stub 'confirm' to return false (Simulate Cancel)
            cy.stub(win, 'confirm').as('dialogBox').returns(false)
        })

        cy.get('.nb-trash').first().click()

        // Verify our stub was called
        cy.get('@dialogBox').should('be.calledWith', 'Are you sure you want to delete?')
    })

    it('Web Tables', () => {
        cy.contains('Tables & Data').click()
        cy.contains('Smart Table').click()

        // 1. Find a row by Text, then edit that specific row
        cy.get('tbody').contains('tr', 'Larry').then(tableRow => {
            cy.wrap(tableRow).find('.nb-edit').click()
            cy.wrap(tableRow).find('[placeholder="Age"]').clear().type('35')
            cy.wrap(tableRow).find('.nb-checkmark').click()
            // Verify the update
            cy.wrap(tableRow).find('td').last().should('have.text', '35')
        })

        // 2. Find a row by Index
        cy.get('.nb-plus').click()
        cy.get('thead tr').eq(2).then(tableRow => {
            cy.wrap(tableRow).find('[placeholder="First Name"]').type('John')
            cy.wrap(tableRow).find('[placeholder="Last Name"]').type('Smith')
            cy.wrap(tableRow).find('.nb-checkmark').click()
        })

        // Verify the new row was added at the top
        cy.get('tbody tr').first().find('td').then(tableColumns => {
            cy.wrap(tableColumns).eq(2).should('have.text', 'John')
            cy.wrap(tableColumns).eq(3).should('have.text', 'Smith')
        })

        // 3. Loop through rows and filter
        const ages = [20, 30, 40, 200]

        cy.wrap(ages).each(age => {
            cy.get('[placeholder="Age"]').clear().type(age)
            cy.wait(500) // Small wait for table filter update (use carefully)

            cy.get('tbody tr').each(tableRows => {
                if (age == 200) {
                    cy.wrap(tableRows).should('contain.text', 'No data found')
                } else {
                    cy.wrap(tableRows).find('td').last().should('have.text', age)
                }
            })
        })
    })

    it('Datepickers (Advanced Logic)', () => {
        cy.contains('Forms').click()
        cy.contains('Datepicker').click()

        // Function to select a dynamic date in the future
        function selectDateFromCurrentDay(day) {
            let date = new Date()
            date.setDate(date.getDate() + day) // Add 'day' days to current date

            let futureDay = date.getDate()
            let futureMonthLong = date.toLocaleDateString('en-US', { month: 'long' })
            let futureYear = date.getFullYear()
            let dateToAssert = `${date.toLocaleDateString('en-US', { month: 'short' })} ${futureDay}, ${futureYear}`

            cy.get('nb-calendar-view-mode').invoke('text').then(calendarMonthAndYear => {
                // Navigate to correct month/year if needed
                if (!calendarMonthAndYear.includes(futureMonthLong) || !calendarMonthAndYear.includes(futureYear)) {
                    cy.get('[data-name="chevron-right"]').click()
                    selectDateFromCurrentDay(day) // Recursive call
                } else {
                    // Choose the day (excluding days from prev/next months that might be visible)
                    cy.get('.day-cell').not('.bounding-month').contains(futureDay).click()
                }
            })
            return dateToAssert
        }

        cy.get('[placeholder="Form Picker"]').then(input => {
            cy.wrap(input).click()
            // Select date 20 days from now
            const dateToAssert = selectDateFromCurrentDay(20)

            // Verify input value
            cy.wrap(input).should('have.value', dateToAssert)
        })
    })

    it('Sliders', () => {
        // Some sliders are SVG or custom elements. 
        // We can cheat by invoking regular attributes if dragging is hard.
        cy.get('[tabtitle="Temperature"] circle')
            .invoke('attr', 'cx', '38.66') // Calculated position
            .invoke('attr', 'cy', '57.75')
            .click()

        cy.get('[class="value temperature h1"]').should('contain.text', '18')
    })

    it('Drag and Drop', () => {
        cy.contains('Extra Components').click()
        cy.contains('Drag & Drop').click()

        // Trigger events to simulate drag
        cy.get('#todo-list div').first().trigger('dragstart')
        cy.get('#drop-list').trigger('drop')
    })

    // NOTE: Requires 'npm install -D cypress-iframe' and import in support/commands.js
    it.only('Iframes', () => {
        cy.contains('Modal & Overlays').click()
        cy.contains('Dialog').click()

        cy.contains('Open Dialog with esc close').click()
        cy.contains('Dismiss Dialog').click()

        // NOTE: This part assumes you have 'cypress-iframe' plugin installed.
        /*
        // 1. Load the frame
        cy.frameLoaded('[data-cy="esc-close-iframe"]')

        // 2. Interact inside the frame
        cy.iframe('[data-cy="esc-close-iframe"]').contains('Open Dialog with esc close').click()
        
        // 3. Back to main window
        cy.contains('Dismiss Dialog').click()
        */
    })

})
