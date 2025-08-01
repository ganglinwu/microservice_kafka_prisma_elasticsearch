import express from "express";

// Basic validation helper functions (routes layer)
export const validateUserID = (userID: any): string | null => {
  if (!userID || typeof userID !== 'string' || userID.trim() === '') {
    return 'Valid userID is required';
  }
  return null;
};

export const validateProductID = (productID: any): string | null => {
  if (!productID || typeof productID !== 'string' || productID.trim() === '') {
    return 'Valid productID is required';
  }
  return null;
};

export const validateQuantity = (quantity: any): string | null => {
  if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
    return 'Valid quantity (positive number) is required';
  }
  return null;
};

export const validatePrice = (price: any): string | null => {
  if (!price || typeof price !== 'string' || price.trim() === '') {
    return 'Valid price is required';
  }
  return null;
};

export const validateQuantityUpdate = (quantity: any): string | null => {
  if (typeof quantity !== 'number' || quantity < 0) {
    return 'Valid quantity (non-negative number) is required';
  }
  return null;
};

// Middleware factories
export const createUserIDValidator = () => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { userID } = req.params;
    const error = validateUserID(userID);
    if (error) {
      return res.status(400).json({ error });
    }
    next();
  };
};

export const createAddItemValidator = () => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { productID, quantity, price } = req.body;
    
    const productError = validateProductID(productID);
    if (productError) {
      return res.status(400).json({ error: productError });
    }
    
    const quantityError = validateQuantity(quantity);
    if (quantityError) {
      return res.status(400).json({ error: quantityError });
    }
    
    const priceError = validatePrice(price);
    if (priceError) {
      return res.status(400).json({ error: priceError });
    }
    
    next();
  };
};

export const createQuantityUpdateValidator = () => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { quantity } = req.body;
    
    const error = validateQuantityUpdate(quantity);
    if (error) {
      return res.status(400).json({ error });
    }
    
    next();
  };
};