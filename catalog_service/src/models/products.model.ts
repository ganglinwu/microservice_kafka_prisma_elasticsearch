export class Product {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly images: string[],
    public readonly id?: string,
  ) {}
}
