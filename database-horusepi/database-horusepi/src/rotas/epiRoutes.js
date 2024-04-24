import express from 'express';
import epiController from '../controle/epiController.js';

// Criar instância do roteador do Express
const router = express.Router();

// Definindo rotas para manipulação dos dados dos EPIs
router.get('/', epiController.listarEPI);
router.post('/submit', epiController.inserirEPI);
router.get('/:id', epiController.listarEpiPorId);
router.post('/update/:id', epiController.editarEPI);
router.get('/delete/:id', epiController.deletarEPI);

export default router;
