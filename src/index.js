import express, { json } from "express"
import  cors  from "cors"
import dotenv from 'dotenv';
import { SignIn, SignUp } from "./controllers/authControllers.js";
import { AddCredit, AddDebit, DeleteWalletValues, GetWalletValues, Logout } from "./controllers/userControllers.js";

dotenv.config();
const app = express()

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(json());

// authCOntrollers

app.post("/signup", SignUp)
app.post("/login", SignIn)

//userCntrollers

app.post('/addcredit', AddCredit) 
app.post('/adddebit', AddDebit)
app.get('/wallet', GetWalletValues)
app.delete('/wallet', Logout)
app.delete('/wallet/:id', DeleteWalletValues) 

const PORT = process.env.PORT;
app.listen(PORT ,  () => console.log(`server running - port ${PORT}`));