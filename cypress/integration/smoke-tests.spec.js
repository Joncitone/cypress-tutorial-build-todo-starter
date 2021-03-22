describe('Smoke tests', () => {
  beforeEach(() => {
    cy.request('GET', '/api/todos')
      .its('body')
      .each((todo) => cy.request('DELETE', `/api/todos/${todo.id}`));
  });
  context('with no todos', () => {
    it('Saves new todos', () => {
      const items = [
        { text: 'Buy Milk', expectedLength: 1 },
        { text: 'Buy Eggs', expectedLength: 2 },
        { text: 'Buy Bread', expectedLength: 3 },
      ];
      cy.visit('/');
      cy.server();
      cy.route('POST', '/api/todos').as('create');

      cy.wrap(items).each((todo) => {
        cy.focused().type(todo.text).type('{enter}');

        cy.wait('@create');

        cy.get('.todo-list li').should('have.length', todo.expectedLength);
      });
    });
  });

  context('with active todos', () => {
    beforeEach(() => {
      cy.fixture('todos').each((todo) => {
        const newTodo = Cypress._.merge(todo, { isComplete: false });
        cy.request('POST', '/api/todos', newTodo);
      });
      cy.visit('/');
    });
    it('loads existing data from the DB', () => {
      cy.get('.todo-list li').should('have.length', 4);
    });
    it('deletes todos', () => {
      cy.server();
      cy.route('DELETE', '/api/todos/*').as('delete');

      cy.get('.todo-list li')
        .each((elem) => {
          cy.wrap(elem).find('.destroy').invoke('show').click();
          cy.wait('@delete');
        })
        .should('not.exist');
    });

    it('toggles todos', () => {
      const clickAndWait = (elem) => {
        cy.wrap(elem).as('item').find('.toggle').click();
        cy.wait('@update');
      };
      cy.server();
      cy.route('PUT', 'api/todos/*').as('update');

      cy.get('.todo-list li')
        .each((elem) => {
          clickAndWait(elem);
          cy.get('@item').should('have.class', 'complete');
        })
        .each((elem) => {
          clickAndWait(elem);
          cy.get('@item').should('not.have.class', 'complete');
        });
    });
  });
});
