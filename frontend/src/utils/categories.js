export function extractCategories(products) {
  const map = new Map()

  products.forEach((product) => {
    if (product.category && product.category_name) {
      map.set(product.category, product.category_name)
    }
  })

  return Array.from(map.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
