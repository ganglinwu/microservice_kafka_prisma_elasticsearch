export class cartItem {
  private readonly _productID: string;
  public createdAt?: Date;
  constructor(
    productID: string,
    public quantity: number,
    public price: number,
  ) {
    this._productID = productID;
    this.quantity = quantity;
    this.price = price;
  }
}

export class Cart {
  public cartID?: string;
  public userID?: string;
  private _products: cartItem[];
  private _totalPrice: number;
  public createdAt?: Date;
  public updatedAt?: Date;
  constructor(products: cartItem[]) {
    this._products = products;
    this._totalPrice = this.updateTotalPrice();
  }

  updateTotalPrice(): number {
    let accumulatedPrice = 0;
    this._products.forEach((product) => {
      accumulatedPrice += product.quantity * product.price;
    });
    return accumulatedPrice;
  }

  get totalPrice(): number {
    return this._totalPrice;
  }

  set totalPrice(price: number) {
    if (price < 0) {
      console.error("Price cannot be negative. debug price:", price);
      return;
    }
    this._totalPrice = price;
  }

  get products(): cartItem[] {
    return this._products;
  }

  set products(products: cartItem[]) {
    this._products = products;
    this._totalPrice = this.updateTotalPrice();
  }
}
