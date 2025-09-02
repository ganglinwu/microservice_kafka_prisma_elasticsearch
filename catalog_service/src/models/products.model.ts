export class Product {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly id?: string,
  ) {}
}
