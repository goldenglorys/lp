import { Router } from "express"
import * as handlers from "./handlers.js"

const router = Router();

router.get('/', (_, response) => {
    response.json({ message: 'Welcome to house Lannister!' })
})

router.get('/ping', handlers.GetPing);

router.post('/fees', handlers.SetupFeesSpec);

router.post('/compute-transaction-fee', handlers.ComputeTransactionFee);

export default router;