import { Order } from "../domain/entities/Order.js";
import { OrderItem } from "../domain/entities/OrderItem.js";

export interface IOrderRepository {
  // Order CRUD operations
  createOrder(order: Order): Promise<Order>;
  findOrderByID(orderID: string): Promise<Order | null>;
  findOrdersByUserID(userID: string): Promise<Order[]>;
  updateOrderStatus(orderID: string, status: string): Promise<void>;
  deleteOrder(orderID: string): Promise<void>;
  
  // Order item operations
  addOrderItem(orderID: string, item: OrderItem): Promise<OrderItem>;
  findOrderItemsByOrderID(orderID: string): Promise<OrderItem[]>;
  updateOrderItem(itemID: string, quantity: number, unitPrice: string): Promise<void>;
  removeOrderItem(itemID: string): Promise<void>;
  
  // Aggregate operations
  updateOrderTotals(orderID: string, totalAmount: string, itemCount: number): Promise<void>;
}