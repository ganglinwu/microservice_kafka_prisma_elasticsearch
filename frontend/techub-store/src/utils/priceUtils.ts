function priceRounding(price: number): string {
  return price.toFixed(2);
}

function calculateTax(price: number): string {
  //9% GST
  return (price * 0.09).toFixed(2);
}

function calculateTotalWithTax(price: number): string {
  return (price * 1.09).toFixed(2);
}

// discount should be in percentage.. e.g. 10% or 20% discount
function applyDiscount(price: number, discount: number): string {
  return ((price * (100 - discount)) / 100).toFixed(2);
}

export { priceRounding, calculateTax, calculateTotalWithTax, applyDiscount };
