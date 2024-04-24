import express from 'express';
import administradorController from '../controle/administradorController.js';

// Criar instância do roteador do Express
const router = express.Router();

// Definindo rotas para manipulação dos dados dos Administradores
router.get('/', administradorController.listarAdministradores);
router.post('/submit', administradorController.inserirAdministrador);
router.get('/:id', administradorController.listarAdministradorPorId);
router.post('/update/:id', administradorController.editarAdministrador);
router.get('/delete/:id', administradorController.deletarAdministrador);

export default router;
