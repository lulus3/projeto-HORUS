import express from 'express';
import setorController from '../controle/setorController.js';

// Criar instância do roteador do Express
const router = express.Router();

// Definindo rotas para manipulação dos dados dos Setores
router.get('/', setorController.listarSetor);
router.post('/submit', setorController.inserirSetor);
router.get('/:id', setorController.listarSetorPorId);
router.post('/update/:id', setorController.editarSetor);
router.get('/delete/:id', setorController.deletarSetor);

export default router;
