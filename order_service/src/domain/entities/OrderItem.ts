export class OrderItem {
  public readonly id?: string;
  public readonly productID: string;
  private _quantity: number;
  private _unitPrice: string;
  private _totalPrice: string;
  public readonly createdAt?: Date;
  public updatedAt?: Date;

  constructor({
    id,
    productID,
    quantity,
    unitPrice,
    totalPrice,
    createdAt,
    updatedAt
  }: {
    id?: string;
    productID: string;
    quantity: number;
    unitPrice: string;
    totalPrice?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = id;
    this.productID = productID;
    this._quantity = quantity;
    this._unitPrice = unitPrice;
    this._totalPrice = totalPrice || this.calculateTotalPrice();
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Getters
  get quantity(): number {
    return this._quantity;
  }

  get unitPrice(): string {
    return this._unitPrice;
  }

  get totalPrice(): string {
    return this._totalPrice;
  }

  // Business methods
  public updateQuantity(newQuantity: number): void {
    if (newQuantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
    
    this._quantity = newQuantity;
    this._totalPrice = this.calculateTotalPrice();
    this.updatedAt = new Date();
  }

  public updateUnitPrice(newPrice: string): void {
    this._unitPrice = newPrice;
    this._totalPrice = this.calculateTotalPrice();
    this.updatedAt = new Date();
  }

  public getTotalPrice(): number {
    return parseFloat(this._totalPrice);
  }

  public getUnitPrice(): number {
    return parseFloat(this._unitPrice);
  }

  // Private helper methods
  private calculateTotalPrice(): string {
    const total = this._quantity * parseFloat(this._unitPrice);
    return total.toFixed(2);
  }
}