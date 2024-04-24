import conexao from "../conexao.js";
import { io } from 'socket.io-client';
import dotenv from 'dotenv'

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();
const ip = process.env.IP;
const port = process.env.PORT;


// Controlador para lidar com as operações relacionadas ao Supervisor
const supervisorController = {
  // Operação para listar todos os Supervisores
  listarSupervisor (req, res) {
    const sql = "SELECT * FROM supervisor"
    conexao.query(sql, (error, result) => {
      if (error) {
        console.log(error)
        res.status(404).json({ 'Erro ao listar os Supervisores': error})
      } else {
        res.status(200).json(result)
      }
    })
  },

  // Operação para inserir um novo Supervisor
  inserirSupervisor (req, res) {
    const {id, nome, senha, setor_locado} = req.body
    const sqlInsert = "INSERT INTO supervisor (id, nome, senha, setor_locado) VALUES (?, ?, ?, ?)"
    conexao.query(sqlInsert, [id, nome, senha, setor_locado], (error, result) => {
      if (error) {
        console.log(error)
        res.status(500).json({ error: 'Erro ao inserir novo Supervisor' })
      } else {
        console.log('Inserção de supervisor realizada com sucesso')
        res.status(200).json({ sucess: 'ok' })
      }
    })
  },

  // Operação para listar um Supervisor específico de acordo com seu ID
  listarSupervisorPorId (req, res) {
    const id = req.params.id
    const sql = "SELECT * FROM supervisor WHERE id=?;"
    conexao.query(sql, id, (error, result) => {
      if (error) {
        console.log(error)
        res.status(404).json({ 'Erro ao listar Supervisor': error })
      } else {
        res.status(200).json(result[0])
      }
    })
  },

  // Operação para editar os dados de um Supervisor
  editarSupervisor (req, res) {
    const id = req.params.id;
    const { nome, senha, setor } = req.body;
    const sqlUpdate = "UPDATE supervisor SET nome=?, senha=?, setor=? WHERE id=?";
    conexao.query(sqlUpdate, [nome, senha, setor, id], (error, result) => {
      if (error) {
        console.log(error);
        res.status(500).json({ 'Erro ao atualizar o Supervisor': error });
      } else {
        console.log('Edição de Supervisor concluída com sucesso')
        res.status(200).json({ sucess: 'ok' })
      }
    });
  },

  // Operação para excluir um Supervisor
  deletarSupervisor (req, res) {
    const id = req.params.id
    const sqlDel = "DELETE FROM supervisor WHERE id=?"
    conexao.query(sqlDel, [id], (errorDel, resultDel) => {
      if (errorDel) {
        console.log(errorDel)
        res.status(404).json({ 'Erro ao excluir Supervisor': error })
      } else {
        // Mandar as informações de exclusão
        try {
          const socket = io(`http://${ip}:${port}`);
          socket.on('connect', () => {
            console.log("conectado com o server");
            socket.emit("deletar_foto", id);
            socket.disconnect();
          });
          console.log("a conexao com o servidor 1 deu certo")
        } catch (error) {
          console.log("erro na conexao socket do servidor 1", error)
        };
        console.log('Supervisor excluído com sucesso')
        res.status(200).json({ message: 'Os dados foram excluídos'})
      }
    })
  },
}

export default supervisorController;
