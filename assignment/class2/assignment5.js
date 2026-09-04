/**
 * @param {import('express').Express} app
 * @param {{id: number, name: string, price: number}[]} products
 */
function registerProductRoutes(app, products) {
  app.get('/products', (req, res) => {
    // TODO: optional minPrice/maxPrice filtering, with 400s for invalid values
  });

  app.get('/products/:id', (req, res) => {
    // TODO: validate id, find product, optionally shape via ?fields=
  });
}

module.exports = { registerProductRoutes };