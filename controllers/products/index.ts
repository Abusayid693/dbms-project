import { Request, Response, NextFunction } from "express";
import db from "../../db.config";
import { v4 as uuidv4 } from 'uuid';
import * as errorResponse from "../../utils/errorResponse";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.query(
      `select * from dbms_project_products;
       `
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const order = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
 
  const userId = 1;
  const { totalAmount, items, addressId } = req.body;

  if (!totalAmount || !items || !addressId) {
    return next(
      new errorResponse.ErrorResponse("Required fields not provided", 400)
    );
  }

  const orderId = uuidv4().toString();

  let command_1 = `insert into dbms_project_orders values ("${orderId}", ${Number(userId)}, ${Number(addressId)}, ${Number(
    totalAmount
  )});`;
  let command_2 = `insert into dbms_project_order_items (orderId, userId, productId) values `;

  items.forEach(
    (item: any) => (command_2 += `("${orderId}", ${Number(userId)}, ${Number(item.id)}),`)
  );

  command_2 = command_2.substring(0, command_2.length - 1) + ";";


  try {
    await db.manager.transaction(async (transactionalEntityManager) => {
       await transactionalEntityManager.query(command_1);
       await transactionalEntityManager.query(command_2);
    });
    res.status(200).json({
      success: true,
      data: `Order with id:${orderId} successfully placed `,
    });
  } catch (error) {
    next(error);
  }
};
