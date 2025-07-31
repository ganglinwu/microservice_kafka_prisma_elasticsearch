export class CartItem {
  public readonly productID: string;
  public quantity: number;
  public price: string;
  public readonly id?: string;
  public readonly createdAt?: Date;
  public updatedAt?: Date;

  constructor({
    productID,
    quantity,
    price,
    id,
    createdAt,
    updatedAt
  }: {
    productID: string;
    quantity: number;
    price: string;
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.productID = productID;
    this.quantity = quantity;
    this.price = price;
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  updateQuantity(newQuantity: number): void {
    if (newQuantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
    this.quantity = newQuantity;
    this.updatedAt = new Date();
  }

  updatePrice(newPrice: string): void {
    this.price = newPrice;
    this.updatedAt = new Date();
  }

  getTotalPrice(): number {
    return parseFloat(this.price) * this.quantity;
  }
}