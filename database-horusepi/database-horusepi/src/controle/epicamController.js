import conexao from '../conexao.js';
import { io } from 'socket.io-client';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();
const ip = process.env.IP;
const port = process.env.PORT;

// Controlador para lidar com as operações relacionadas com as EPIs das Câmeras
const epicamController = {
  // Operação para listar todas as EPIs das Câmeras
  listarEpiCam(req, res) {
    const sql = "SELECT id_cam, GROUP_CONCAT(id_epi) AS epis FROM epis_câmeras GROUP BY id_cam;";
    conexao.query(sql, (error, result) => {
        if (error) {
            console.log(error);
            res.status(404).json({ 'Erro ao litar as EPIs das Câmeras': error });
        } else {
            const formattedData = {};
            result.forEach(row => {
                formattedData[row.id_cam] = row.epis.split(',').map(Number);
            });
            res.status(200).json(formattedData);
        }
    });
  },

  // Operação para inserir uma nova EPIs de uma Câmera específica
  inserirEpiCamera(req, res) {
    const { id_cam, selectedEPIs } = req.body;
    const sqlInsert = "INSERT INTO epis_câmeras (id_cam, id_epi) VALUES (?, ?)";
  
    if (!Array.isArray(selectedEPIs)) {
      console.error('A variável selecionada não é um array');
      res.status(400).json({ error: 'A variável selecionada não é um array' });
      return;
    }
  
    // Use um loop assíncrono para lidar com as inserções
    (async () => {
      for (const id_epi of selectedEPIs) {
        try {
          await new Promise((resolve, reject) => {
            conexao.query(sqlInsert, [id_cam, id_epi], (error, result) => {
              if (error) {
                console.error(error);
                reject(error);
              } else {
                console.log('Inserção de EPI de uma Câmera realizada com sucesso');
                resolve(result);
              }
            });
          });
        } catch (error) {
          res.status(500).json({ error: 'Erro ao inserir EPI na câmera' });
          return;
        }
      }
  
      // Quando todas as inserções são concluídas, envie a resposta
      console.log("Todas as inserções das EPIs foram realizadas");
      res.status(200).json({ success: 'ok' });
    })();
  },

  // Operação para listar uma EPI de uma Câmera específica de acordo com seu ID
  listarEpiCamPorId (req, res) {
    const id_cam = req.params.id
    const sql = "SELECT * FROM epis_câmeras WHERE id_cam=?"
    conexao.query(sql, id_cam, (error, result) => {
      if (error) {
      console.log(error)
      res.status(404).json({ error: "Erro ao listar EPI da Câmera"})
      } else {
      res.status(200).json(result[0])
      }
    })
  },
  
  // Operação para editar uma EPI de uma Câmera de acordo com o ID da Câmera
  editarEpiCam(req, res) {
    const id_cam = req.params.id;
    const { id_epis } = req.body;
  
    const sqlDel = "DELETE FROM epis_câmeras WHERE id_cam=?";
    const sqlInsert = "INSERT INTO epis_câmeras (id_cam, id_epi) VALUES (?, ?)";
  
    conexao.beginTransaction((error) => {
      console.log("Transação iniciada");
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Erro ao iniciar a transação' });
      }
  
      conexao.query(sqlDel, [id_cam], (errorDel, resultDel) => {
        if (errorDel) {
          console.log(errorDel);
          conexao.rollback(() => {
            res.status(500).json({ error: 'Erro ao excluir registros das EPIs antigos' });
          });
        } else {
          console.log('Registros antigos das EPIs da Câmera excluídos com sucesso');
  
          // Use um loop assíncrono para lidar com as inserções
          (async () => {
            for (const id_epi of id_epis) {
              try {
                await new Promise((resolve, reject) => {
                  conexao.query(sqlInsert, [id_cam, id_epi], (errorInsert, resultInsert) => {
                    if (errorInsert) {
                      console.error(errorInsert);
                      reject(errorInsert);
                    } else {
                      console.log('Inserção de nova EPI da Câmera realizada com sucesso');
                      resolve(resultInsert);
                    }
                  });
                });
              } catch (error) {
                res.status(500).json({ error: 'Erro ao inserir EPI na câmera.' });
                return;
              }
            }
  
            // Quando todas as inserções são concluídas, commit da transação
            conexao.commit((errorCommit) => {
              if (errorCommit) {
                console.log(errorCommit);
                res.status(500).json({ error: 'Erro ao realizar commit da transação' });
              } else {
                // Mandar as informações da edição das EPIs de determinada câmera para a API da IA
                try {
                  const socket = io(`http://${ip}:${port}`);
                  socket.on('connect', () => {
                    console.log("conectado com o server");
                    socket.emit("atualizar_epis");
                    socket.disconnect();
                  });
                  console.log("a conexao com o servidor 1 deu certo")
                } catch (error) {
                  console.log("erro na conexao socket do servidor 1", error);
                };
                console.log('Transação bem-sucedida');
                res.status(200).json({ success: 'ok' });
              };
            });
          })();
        }
      });
    });
  },

  // Operação para excluir uma EPI de uma Câmera
  deletarEpiCam (req, res) {
    const id = req.params.id
    const sqlDel = "DELETE FROM epis_câmeras WHERE id=?"
    conexao.query(sqlDel, [id], (errorDel, resultDel) => {
      if (errorDel) {
        console.log(errorDel)
        res.status(404).json({ error: 'Erro ao excluir a EPI da Câmera' })
      } else {
        console.log('EPI da Câmera excluída com sucesso')
        res.status(200).json({ DadosExcluidos, message: 'Os dados foram excluídos'})
      }
    })
  }
};

export default epicamController;
