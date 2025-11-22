import Joi from 'joi';

// Auth validators
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  full_name: Joi.string().min(2).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const sendOTPSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  new_password: Joi.string().min(6).required(),
});

// Product validators
export const productSchema = Joi.object({
  sku: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow('', null),
  category_id: Joi.string().uuid().allow(null),
  stock: Joi.number().integer().min(0).default(0),
  reorder_level: Joi.number().integer().min(0).default(0),
});

// Receipt validators
export const receiptSchema = Joi.object({
  warehouse_id: Joi.string().uuid().required(),
  supplier_name: Joi.string().allow('', null),
  receipt_date: Joi.date().default(() => new Date()),
  notes: Joi.string().allow('', null),
  items: Joi.array().items(
    Joi.object({
      product_id: Joi.string().uuid().required(),
      location_id: Joi.string().uuid().required(),
      quantity: Joi.number().integer().positive().required(),
      unit_price: Joi.number().positive().allow(null),
    })
  ).min(1).required(),
});

// Delivery validators
export const deliverySchema = Joi.object({
  warehouse_id: Joi.string().uuid().required(),
  customer_name: Joi.string().allow('', null),
  delivery_date: Joi.date().default(() => new Date()),
  notes: Joi.string().allow('', null),
  items: Joi.array().items(
    Joi.object({
      product_id: Joi.string().uuid().required(),
      location_id: Joi.string().uuid().required(),
      quantity: Joi.number().integer().positive().required(),
      unit_price: Joi.number().positive().allow(null),
    })
  ).min(1).required(),
});

// Transfer validators
export const transferSchema = Joi.object({
  from_warehouse_id: Joi.string().uuid().required(),
  to_warehouse_id: Joi.string().uuid().required(),
  transfer_date: Joi.date().default(() => new Date()),
  notes: Joi.string().allow('', null),
  items: Joi.array().items(
    Joi.object({
      product_id: Joi.string().uuid().required(),
      from_location_id: Joi.string().uuid().required(),
      to_location_id: Joi.string().uuid().required(),
      quantity: Joi.number().integer().positive().required(),
    })
  ).min(1).required(),
});

// Adjustment validators
export const adjustmentSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  location_id: Joi.string().uuid().required(),
  adjustment_type: Joi.string().valid('increase', 'decrease').required(),
  quantity: Joi.number().integer().positive().required(),
  reason: Joi.string().required(),
  adjustment_date: Joi.date().default(() => new Date()),
});

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(d => d.message),
      });
    }
    next();
  };
};

