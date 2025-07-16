import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

// without the assertion(!) ts will complain that the fields will potentially be undefined
//
// since we know this is a DTO,
// (i.e. it will be populated during request parsing),
// it's better to assert this.
//
// alternatively we can initialize some values, however this is considered unsafe
// as this might cause bad request to slip through @IsNotEmpty validations

export class CreateProductRequest {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(0)
  stock!: number;
}

export class GetProductsRequest {
  @IsNumber()
  @Min(0)
  limit!: number;

  @IsNumber()
  @Min(0)
  offset!: number;
}

export class GetProductID {
  @IsNumber()
  @Min(1)
  id!: number;
}

export class PatchProductRequest {
  @IsNumber()
  @Min(1)
  id!: number;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(0)
  stock!: number;
}
export class DeleteProductID {
  @IsNumber()
  @Min(1)
  id!: number;
}
