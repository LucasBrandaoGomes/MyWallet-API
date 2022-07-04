import { AddCredit, AddDebit, DeleteWalletValues, GetWalletValues, Logout } from "../controllers/userControllers.js";
import { Router } from "express";

const userRoutes = Router()

userRoutes.post('/addcredit', AddCredit) 
userRoutes.post('/adddebit', AddDebit)
userRoutes.get('/wallet', GetWalletValues)
userRoutes.delete('/wallet', Logout)
userRoutes.delete('/wallet/:id', DeleteWalletValues) 

export default userRoutes;