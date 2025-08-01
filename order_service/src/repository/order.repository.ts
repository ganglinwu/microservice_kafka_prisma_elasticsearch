import { eq, and } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { ordersTable, orderItemsTable } from "../db/schema.js";
import { Order, OrderStatus } from "../domain/entities/Order.js";
import { OrderItem } from "../domain/entities/OrderItem.js";
import { IOrderRepository } from "../interface/orderRepository.interface.js";

export class OrderRepository implements IOrderRepository {
  constructor(private db: NodePgDatabase<any>) {}

  // Order CRUD operations
  async createOrder(order: Order): Promise<Order> {
    const [insertedOrder] = await this.db
      .insert(ordersTable)
      .values({
        userID: order.userID,
        status: order.status,
        totalAmount: order.totalAmount,
        itemCount: order.itemCount,
        shippingAddress: order.shippingAddress,
      })
      .returning();

    return this.mapToOrderDomain(insertedOrder, []);
  }

  async findOrderByID(orderID: string): Promise<Order | null> {
    const orderResult = await this.db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.orderID, orderID))
      .limit(1);

    if (orderResult.length === 0) {
      return null;
    }

    const items = await this.findOrderItemsByOrderID(orderID);
    return this.mapToOrderDomain(orderResult[0], items);
  }

  async findOrdersByUserID(userID: string): Promise<Order[]> {
    const ordersResult = await this.db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userID, userID));

    const orders: Order[] = [];
    for (const orderData of ordersResult) {
      const items = await this.findOrderItemsByOrderID(orderData.orderID);
      orders.push(this.mapToOrderDomain(orderData, items));
    }

    return orders;
  }

  async updateOrderStatus(orderID: string, status: string): Promise<void> {
    await this.db
      .update(ordersTable)
      .set({ 
        status: status as any,
        updatedAt: new Date()
      })
      .where(eq(ordersTable.orderID, orderID));
  }

  async deleteOrder(orderID: string): Promise<void> {
    // Order items are deleted automatically due to cascade
    await this.db
      .delete(ordersTable)
      .where(eq(ordersTable.orderID, orderID));
  }

  // Order item operations
  async addOrderItem(orderID: string, item: OrderItem): Promise<OrderItem> {
    const [insertedItem] = await this.db
      .insert(orderItemsTable)
      .values({
        orderID,
        productID: item.productID,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })
      .returning();

    return this.mapToOrderItemDomain(insertedItem);
  }

  async findOrderItemsByOrderID(orderID: string): Promise<OrderItem[]> {
    const items = await this.db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderID, orderID));

    return items.map(item => this.mapToOrderItemDomain(item));
  }

  async updateOrderItem(itemID: string, quantity: number, unitPrice: string): Promise<void> {
    const totalPrice = (quantity * parseFloat(unitPrice)).toFixed(2);
    
    await this.db
      .update(orderItemsTable)
      .set({ 
        quantity,
        unitPrice,
        totalPrice
      })
      .where(eq(orderItemsTable.id, itemID));
  }

  async removeOrderItem(itemID: string): Promise<void> {
    await this.db
      .delete(orderItemsTable)
      .where(eq(orderItemsTable.id, itemID));
  }

  // Aggregate operations
  async updateOrderTotals(orderID: string, totalAmount: string, itemCount: number): Promise<void> {
    await this.db
      .update(ordersTable)
      .set({ 
        totalAmount,
        itemCount,
        updatedAt: new Date()
      })
      .where(eq(ordersTable.orderID, orderID));
  }

  // Domain mapping methods
  private mapToOrderDomain(orderData: any, items: OrderItem[]): Order {
    return new Order({
      orderID: orderData.orderID,
      userID: orderData.userID,
      status: orderData.status as OrderStatus,
      totalAmount: orderData.totalAmount,
      itemCount: orderData.itemCount,
      shippingAddress: orderData.shippingAddress,
      items,
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt,
    });
  }

  private mapToOrderItemDomain(itemData: any): OrderItem {
    return new OrderItem({
      id: itemData.id,
      productID: itemData.productID,
      quantity: itemData.quantity,
      unitPrice: itemData.unitPrice,
      totalPrice: itemData.totalPrice,
      createdAt: itemData.createdAt,
    });
  }
}