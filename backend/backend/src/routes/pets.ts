import { Router } from 'express';
import * as pets from '../controllers/petsController';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

router.get('/',     verifyToken, pets.getMyPets);
router.post('/',    verifyToken, pets.createPet);
router.put('/:id',  verifyToken, pets.updatePet);
router.delete('/:id', verifyToken, pets.deletePet);

export default router;
