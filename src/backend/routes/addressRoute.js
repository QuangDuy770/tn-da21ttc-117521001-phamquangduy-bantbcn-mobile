import express from 'express';
import { setAddress, getAddress, removeAddress } from '../controllers/addressController.js';

const addressRouter = express.Router();

addressRouter.post('/set', setAddress);
addressRouter.post('/get', getAddress);
addressRouter.post('/remove', removeAddress);

export default addressRouter;