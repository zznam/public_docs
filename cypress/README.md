# Cypress Selectors and Concepts Guide

This guide breaks down the core concepts demonstrated in the accompanying `reference_examples.cy.js` file.

Source: <https://github.com/Bondar-Academy/cypress-playground-lessons/tree/iFrames>
Conduit: <https://github.com/Bondar-Academy/conduit-cypress-lessons/tree/master>

## 1. Locators (Selectors)

Cypress uses `cy.get()` as the primary way to find elements. It supports CSS selectors.

| Method | Example | Description |
| :--- | :--- | :--- |
| **Tag** | `cy.get('input')` | Selects by HTML tag name. |
| **ID** | `cy.get('#inputEmail1')` | Selects by `id` attribute (using `#`). Fast and usually unique. |
| **Class** | `cy.get('.input-full-width')` | Selects by `class` attribute (using `.`). |
| **Attribute** | `cy.get('[fullwidth]')` | Selects by presence of an attribute. |
| **Attr Value** | `cy.get('[placeholder="Email"]')` | Selects by specific attribute value. |
| **Data Attr** | `cy.get('[data-cy="inputEmail1"]')`| **Best Practice**: Use dedicated testing attributes (like `data-cy`, `data-testid`) that won't change with CSS/JS updates. |

## 2. Finding & Filtering

Different commands search in different scopes:

- **`cy.get(selector)`**: Always searches the **entire root DOM** of the page (document level), even if chained off a previous command.
- **`cy.find(selector)`**: Searches only for **descendants** (children, grandchildren, etc.) of the currently yielded element.
- **`cy.contains(content)`**: Searches for elements containing specific **text**.

**Example:**

```javascript
// Finds 'Sign in' anywhere on the page
cy.contains('Sign in')

// Finds 'Sign in' ONLY inside the card titled 'Horizontal form'
cy.contains('nb-card', 'Horizontal form').contains('Sign in')
```

## 3. Traversal (Moving around the DOM)

Navigate relative to an element you've already found.

- **`.parents('selector')`**: Travels up the ancestor tree until it matches the selector.
- **`.parent()`**: Travels up to the *immediate* parent only.
- **`.find('selector')`**: Travels down to find children.

## 4. Aliases & Reuse

Avoid storing Cypress elements in `const` or `var`. Instead, use Aliases or `.then()`.

### Aliases (`.as`)

Save a reference globally to use later with `@`.

```javascript
cy.get('#inputEmail1').as('emailField')
// ... later in the test
cy.get('@emailField').type('hello')
```

### The `.then()` callback

Work with the jQuery element directly.

```javascript
cy.get('#inputEmail1').then( $input => {
    // $input is a jQuery object
    const val = $input.val()
    // Wrap it back to Cypress to use Cypress commands
    cy.wrap($input).click()
})
```

## 5. Assertions

Verify that the application is in the expected state.

- **Implicit**: `.should('have.text', 'Value')`
- **Explicit**: `expect(value).to.equal('Value')` (usually inside `.then()`)

## 6. Timeouts

Cypress waits automatically (default 4000ms). You can override this per command.

```javascript
// Wait up to 10 seconds for this specific element to appear
cy.get('.delayed-element', { timeout: 10000 })
```

## 7. Advanced UI Interactions

Examples in `ui_components.cy.js`.

### Browser Dialogs

Cypress auto-accepts alerts/confirmations.

- **Verify text**: Use `cy.on('window:confirm', (str) => { ... })`.
- **Cancel/Stub**: Use `cy.stub(win, 'confirm').returns(false)`.

### Web Tables

- **Find by text**: `cy.contains('tr', 'Name')` finds the specific row.
- **Find by index**: `cy.get('tr').eq(2)` finds the 3rd row.
- **Iterate**: Use `.each((row, index) => { ... })` to loop through all rows.

### Datepickers

Picking dates often requires standard JavaScript `Date` logic to calculate future months/years, then clicking the "Next" button until the correct month is visible.

### Tooltips & Hover

Cypress uses `.trigger('mouseenter')` to simulate hovering, as there is no true "hover" state in the DOM (it's an event).

### Iframes

Requires `cypress-iframe` plugin.

1. `cy.frameLoaded('selector')` waits for frame.
2. `cy.iframe('selector').find(...)` acts inside it.
