import { Order, OrderStatus } from "../domain/entities/Order.js";
import { OrderItem } from "../domain/entities/OrderItem.js";
import { IOrderRepository } from "../interface/orderRepository.interface.js";
import { CartItem } from "../domain/entities/CartItem.js";

export class OrderService {
  private _order: Order;
  private repository: IOrderRepository;

  constructor(order: Order, repository: IOrderRepository) {
    this._order = order;
    this.repository = repository;
  }

  // Factory methods
  static async createFromCart(
    userID: string,
    cartItems: CartItem[],
    shippingAddress: string,
    repository: IOrderRepository
  ): Promise<OrderService> {
    if (cartItems.length === 0) {
      throw new Error("Cannot create order from empty cart");
    }

    // Convert cart items to order items
    const orderItems = cartItems.map(cartItem => 
      new OrderItem({
        productID: cartItem.productID,
        quantity: cartItem.quantity,
        unitPrice: cartItem.price,
      })
    );

    // Create order with calculated totals
    const totalAmount = orderItems
      .reduce((sum, item) => sum + item.getTotalPrice(), 0)
      .toFixed(2);

    const order = new Order({
      userID,
      shippingAddress,
      totalAmount,
      itemCount: orderItems.length,
      items: orderItems,
    });

    // Save order to database
    const savedOrder = await repository.createOrder(order);

    // Add order items to database
    for (const item of orderItems) {
      await repository.addOrderItem(savedOrder.orderID!, item);
    }

    // Reload order with items from database
    const completeOrder = await repository.findOrderByID(savedOrder.orderID!);
    if (!completeOrder) {
      throw new Error("Failed to create order");
    }

    return new OrderService(completeOrder, repository);
  }

  static async loadExistingOrder(
    orderID: string,
    repository: IOrderRepository
  ): Promise<OrderService | null> {
    const order = await repository.findOrderByID(orderID);
    if (!order) {
      return null;
    }

    return new OrderService(order, repository);
  }

  static async findOrdersByUser(
    userID: string,
    repository: IOrderRepository
  ): Promise<OrderService[]> {
    const orders = await repository.findOrdersByUserID(userID);
    return orders.map(order => new OrderService(order, repository));
  }

  // Getters
  get orderID(): string | undefined {
    return this._order.orderID;
  }

  get userID(): string {
    return this._order.userID;
  }

  get status(): OrderStatus {
    return this._order.status;
  }

  get totalAmount(): string {
    return this._order.totalAmount;
  }

  get itemCount(): number {
    return this._order.itemCount;
  }

  get shippingAddress(): string {
    return this._order.shippingAddress;
  }

  // Business operations
  async confirmOrder(): Promise<void> {
    this._order.confirm();
    await this.repository.updateOrderStatus(this._order.orderID!, this._order.status);
    await this.refreshOrder();
  }

  async cancelOrder(): Promise<void> {
    this._order.cancel();
    await this.repository.updateOrderStatus(this._order.orderID!, this._order.status);
    await this.refreshOrder();
  }

  async shipOrder(): Promise<void> {
    this._order.ship();
    await this.repository.updateOrderStatus(this._order.orderID!, this._order.status);
    await this.refreshOrder();
  }

  async deliverOrder(): Promise<void> {
    this._order.deliver();
    await this.repository.updateOrderStatus(this._order.orderID!, this._order.status);
    await this.refreshOrder();
  }

  async addItem(productID: string, quantity: number, unitPrice: string): Promise<OrderItem> {
    const orderItem = new OrderItem({
      productID,
      quantity,
      unitPrice,
    });

    this._order.addItem(orderItem);
    
    // Save to database
    const savedItem = await this.repository.addOrderItem(this._order.orderID!, orderItem);
    
    // Update order totals
    await this.repository.updateOrderTotals(
      this._order.orderID!,
      this._order.totalAmount,
      this._order.itemCount
    );

    await this.refreshOrder();
    return savedItem;
  }

  async removeItem(itemID: string): Promise<void> {
    this._order.removeItem(itemID);
    
    // Remove from database
    await this.repository.removeOrderItem(itemID);
    
    // Update order totals
    await this.repository.updateOrderTotals(
      this._order.orderID!,
      this._order.totalAmount,
      this._order.itemCount
    );

    await this.refreshOrder();
  }

  async updateItemQuantity(itemID: string, quantity: number): Promise<void> {
    // Find the item to get its unit price
    const item = this._order.items.find(item => item.id === itemID);
    if (!item) {
      throw new Error("Order item not found");
    }

    this._order.updateItemQuantity(itemID, quantity);
    
    // Update in database
    await this.repository.updateOrderItem(itemID, quantity, item.unitPrice);
    
    // Update order totals
    await this.repository.updateOrderTotals(
      this._order.orderID!,
      this._order.totalAmount,
      this._order.itemCount
    );

    await this.refreshOrder();
  }

  // Utility methods
  async getOrder(): Promise<Order> {
    await this.refreshOrder();
    return this._order;
  }

  getTotalPrice(): number {
    return this._order.getTotalPrice();
  }

  isEmpty(): boolean {
    return this._order.isEmpty();
  }

  isCompleted(): boolean {
    return this._order.isCompleted();
  }

  canBeCancelled(): boolean {
    return this._order.canBeCancelled();
  }

  getItems(): OrderItem[] {
    return this._order.items;
  }

  // Private helper methods
  private async refreshOrder(): Promise<void> {
    if (!this._order.orderID) {
      throw new Error("Cannot refresh order without ID");
    }

    const refreshedOrder = await this.repository.findOrderByID(this._order.orderID);
    if (!refreshedOrder) {
      throw new Error("Order no longer exists");
    }

    this._order = refreshedOrder;
  }
}