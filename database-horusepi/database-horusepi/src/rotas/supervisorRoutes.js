import express from 'express'
import supervisorController from '../controle/supervisorController.js'

// Criar instância do roteador do Express
const router = express.Router();

// Definindo rotas para manipulação dos dados dos Supervisores
router.get('/', supervisorController.listarSupervisor);
router.post('/submit', supervisorController.inserirSupervisor);
router.get('/:id', supervisorController.listarSupervisorPorId);
router.post('/update/:id', supervisorController.editarSupervisor);
router.get('/delete/:id', supervisorController.deletarSupervisor);

export default router;
