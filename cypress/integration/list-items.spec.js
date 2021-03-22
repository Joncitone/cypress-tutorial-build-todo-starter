describe('List iems', () => {
  beforeEach(() => {
    cy.seedAndVisit();
  });

  it('Properly displays completed items', () => {
    cy.get('.todo-list li')
      .filter('completed')
      .should('have.length', 1)
      .and('contain', 'Eggs')
      .find('.toggle')
      .should('be.checked');
  });

  it('Shows the correct remaining todos in the footer', () => {
    cy.get('.todo-count').should('contain', 3);
  });

  it.only('Removes a todo', () => {
    cy.route({
      url: '/api/todos/1',
      method: 'DELETE',
      status: 200,
      response: {},
    });

    //sets element as reusable reference, need due to aync nature of cypress
    cy.get('.todo-list li').as('list');

    cy.get('@list').first().find('.destroy').invoke('show').click();

    cy.get('@list').should('have.length', 3).and('not.contain', 'Milk');
  });
});
