import { Router } from "express"
import * as handlers from "./handlers.js"

const router = Router();

router.get('/', (_, response) => {
    response.json({ message: 'Welcome to house Lannister!' })
})

router.get('/ping', handlers.getPing);

router.post('/fees', handlers.SetupFeesSpec);

export default router;