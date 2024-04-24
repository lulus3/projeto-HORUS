import conexao from '../conexao.js';
import { io } from 'socket.io-client';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();
const ip = process.env.IP;
const port = process.env.PORT;

// Controlador para lidar com as operações relacionadas com os Administradores
const administradorController = {
  // Operação para listar todos os Administradores
  listarAdministradores (req, res) {
    const sql = "SELECT * FROM administrador;";
    conexao.query(sql, (error, result) => {
      if(error){
      console.log(error);
      response.status(404).json({ 'Erro ao listar os Administradores': error});
      } else{
      res.status(200).json(result);
      }
    })
  },

  // Operação para inserir um novo Administrador
  inserirAdministrador (req, res) {
    const {id, nome, senha} = req.body;
    const sqlInsert = "INSERT INTO administrador (id, nome, senha) VALUES (?, ?, ?)";
    conexao.query(sqlInsert, [id, nome, senha], (error, result) => {
      if (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao inserir novo Administrador' });
      } else {
        console.log('Inserção de Administrador realizada com sucesso');
        res.status(200).json({ sucess: 'ok' });
      }
    })
  },

  // Operação para listar um Administrador específico de acordo com seu ID
  listarAdministradorPorId (req, res) {
    const id = req.params.id;
    const sql = "SELECT * FROM administrador WHERE id=?;";
    conexao.query(sql, id, (error, result) => {
      if (error) {
      console.log(error);
      res.status(404).json({ 'Erro ao listar o Administrador': error});
      } else {
      res.status(200).json(result[0]);
      }
    });
  },

  // Operação para editar os dados de um Administrador
  editarAdministrador (req, res) {
    const id = req.params.id;
    const { nome, senha } = req.body;
    const sqlUpdate = "UPDATE administrador SET nome=?, senha=? WHERE id=?";
    conexao.query(sqlUpdate, [nome, senha, id], (error, result) => {
      if (error) {
        console.log(error);
        res.status(500).json({ 'Erro ao atualizar o Administrador': error });
      } else {
        console.log('Edição de Administrador concluída com sucesso');
        res.status(200).json({ sucess: 'ok' });
      }
    });
  },

  // Operação para excluir um Administrador
  deletarAdministrador (req, res) {
    const id = req.params.id;
    const sqlDel = "DELETE FROM administrador WHERE id=?";
    conexao.query(sqlDel, [id], (errorDel, resultDel) => {
      if (errorDel) {
        console.log(errorDel);
        res.status(404).json({ 'Erro ao excluir Administrador': error });
      } else {
        // Mandar as informações de exclusão
        try {
          const socket = io(`http://${ip}:${port}`);
          socket.on('connect', () => {
            console.log("Conectado com o server");
            socket.emit("deletar_foto", id);
            socket.disconnect();
          });
          console.log("A conexao com o servidor 1 deu certo")
        } catch (error) {
          console.log("Erro na conexao socket do servidor 1", error);
        };
        console.log('O Administrador foi excluído com sucesso');
        res.status(200).json({ sucess: 'ok' });
      }
    });
  }
};

export default administradorController;
