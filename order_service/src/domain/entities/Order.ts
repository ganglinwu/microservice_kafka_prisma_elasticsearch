import { OrderItem } from "./OrderItem.js";

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED", 
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED"
}

export class Order {
  public readonly orderID?: string;
  public readonly userID: string;
  private _status: OrderStatus;
  private _totalAmount: string;
  private _itemCount: number;
  public readonly shippingAddress: string;
  private _items: OrderItem[];
  public readonly createdAt?: Date;
  public updatedAt?: Date;

  // Business constants
  static readonly VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: []
  };

  constructor({
    orderID,
    userID,
    status = OrderStatus.PENDING,
    totalAmount = "0",
    itemCount = 0,
    shippingAddress,
    items = [],
    createdAt,
    updatedAt
  }: {
    orderID?: string;
    userID: string;
    status?: OrderStatus;
    totalAmount?: string;
    itemCount?: number;
    shippingAddress: string;
    items?: OrderItem[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.orderID = orderID;
    this.userID = userID;
    this._status = status;
    this._totalAmount = totalAmount;
    this._itemCount = itemCount;
    this.shippingAddress = shippingAddress;
    this._items = items;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Getters
  get status(): OrderStatus {
    return this._status;
  }

  get totalAmount(): string {
    return this._totalAmount;
  }

  get itemCount(): number {
    return this._itemCount;
  }

  get items(): OrderItem[] {
    return [...this._items];
  }

  // Business methods
  public addItem(item: OrderItem): void {
    this.validateNotCompleted();
    this._items.push(item);
    this.recalculateOrder();
    this.updatedAt = new Date();
  }

  public removeItem(itemID: string): void {
    this.validateNotCompleted();
    const initialLength = this._items.length;
    this._items = this._items.filter(item => item.id !== itemID);
    
    if (this._items.length === initialLength) {
      throw new Error("Order item not found");
    }
    
    this.recalculateOrder();
    this.updatedAt = new Date();
  }

  public updateItemQuantity(itemID: string, quantity: number): void {
    this.validateNotCompleted();
    
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const item = this._items.find(item => item.id === itemID);
    if (!item) {
      throw new Error("Order item not found");
    }

    item.updateQuantity(quantity);
    this.recalculateOrder();
    this.updatedAt = new Date();
  }

  public updateStatus(newStatus: OrderStatus): void {
    const validTransitions = Order.VALID_STATUS_TRANSITIONS[this._status];
    
    if (!validTransitions.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${this._status} to ${newStatus}`);
    }

    this._status = newStatus;
    this.updatedAt = new Date();
  }

  public cancel(): void {
    if (this._status === OrderStatus.DELIVERED) {
      throw new Error("Cannot cancel delivered order");
    }
    
    if (this._status === OrderStatus.CANCELLED) {
      throw new Error("Order is already cancelled");
    }

    this._status = OrderStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  public confirm(): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error("Only pending orders can be confirmed");
    }

    if (this._items.length === 0) {
      throw new Error("Cannot confirm order with no items");
    }

    this._status = OrderStatus.CONFIRMED;
    this.updatedAt = new Date();
  }

  public ship(): void {
    if (this._status !== OrderStatus.CONFIRMED) {
      throw new Error("Only confirmed orders can be shipped");
    }

    this._status = OrderStatus.SHIPPED;
    this.updatedAt = new Date();
  }

  public deliver(): void {
    if (this._status !== OrderStatus.SHIPPED) {
      throw new Error("Only shipped orders can be delivered");
    }

    this._status = OrderStatus.DELIVERED;
    this.updatedAt = new Date();
  }

  // Utility methods
  public isEmpty(): boolean {
    return this._items.length === 0;
  }

  public isCompleted(): boolean {
    return this._status === OrderStatus.DELIVERED || this._status === OrderStatus.CANCELLED;
  }

  public canBeCancelled(): boolean {
    return this._status === OrderStatus.PENDING || this._status === OrderStatus.CONFIRMED;
  }

  public getTotalPrice(): number {
    return parseFloat(this._totalAmount);
  }

  public getItems(): OrderItem[] {
    return [...this._items];
  }

  // Private helper methods
  private validateNotCompleted(): void {
    if (this.isCompleted()) {
      throw new Error("Cannot modify completed order");
    }
  }

  private recalculateOrder(): void {
    this._itemCount = this._items.length;
    const total = this._items.reduce((sum, item) => sum + item.getTotalPrice(), 0);
    this._totalAmount = total.toFixed(2);
  }
}