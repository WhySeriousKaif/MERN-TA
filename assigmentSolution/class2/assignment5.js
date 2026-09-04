/**
 * @param {import('express').Express} app
 * @param {{id: number, name: string, price: number}[]} products
 */
function registerProductRoutes(app, products) {

  // GET /products
  app.get('/products', (req, res) => {
    let result = products;

    if (req.query.minPrice !== undefined) {
      const minPrice = Number(req.query.minPrice);

      if (!Number.isFinite(minPrice)) {
        return res.status(400).json({
          error: 'Invalid minPrice'
        });
      }

      result = result.filter(
        product => product.price >= minPrice
      );
    }

    if (req.query.maxPrice !== undefined) {
      const maxPrice = Number(req.query.maxPrice);

      if (!Number.isFinite(maxPrice)) {
        return res.status(400).json({
          error: 'Invalid maxPrice'
        });
      }

      result = result.filter(
        product => product.price <= maxPrice
      );
    }

    return res.status(200).json(result);
  });


  // GET /products/:id
  app.get('/products/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({
        error: 'Invalid product id'
      });
    }

    const product = products.find(
      product => product.id === id
    );

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    // ?fields=name,price
    if (req.query.fields !== undefined) {
      const fields = req.query.fields.split(',');

      const result = {
        id: product.id
      };

      for (const field of fields) {
        if (field in product && field !== 'id') {
          result[field] = product[field];
        }
      }

      return res.status(200).json(result);
    }

    return res.status(200).json(product);
  });
}

module.exports = { registerProductRoutes };