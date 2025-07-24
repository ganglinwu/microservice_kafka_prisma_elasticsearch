import { IsNotEmpty, IsNumber, IsString, Min, IsUUID } from "class-validator";

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
  @IsUUID()
  id!: string;
}

export class PatchProductRequest {
  @IsUUID()
  id!: string;

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
  @IsUUID()
  id!: string;
}
