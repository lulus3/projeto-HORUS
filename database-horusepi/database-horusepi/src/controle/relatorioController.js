import conexao from '../conexao.js';

// Controlador para lidar com as operações relacionadas aos Relatórios
const relatorioController = {
  // Operação para listar todos os Relatórios
  listarRelatorio (req, res) {
    const sql= "SELECT * FROM relatório;"
    const sqlEpi = "SELECT * FROM epis_ocorrência;"
    conexao.query(sql, (error, result) => {
      if(error){
        console.log(error)
        res.status(404).json({ 'Erro ao listar os Relatórios': error})
      } else{
        res.status(200).json(result)
      }
    })
  },

  // Operação para fazer um novo Relatório
  fazerRelatorio(req, res) {
    const { id_cam, data_ocorrencia, horario_inicio, horario_fim, tipo, epis } = req.body;
    const sqlInsertRelatorio = "INSERT INTO relatório (id_cam, data_ocorrencia, horário_inicio, horário_fim, tipo) VALUES (?, ?, ?, ?, ?);";
    const sqlInsertEpis = "INSERT INTO epis_ocorrência (id_ocorrencia, id_epi) VALUES (?, ?);";
    
    // Iniciar uma transação
    conexao.beginTransaction((error) => {
      if (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao iniciar transação' });
      }

      // Inserir os dados do relatório
      conexao.query(sqlInsertRelatorio, [id_cam, data_ocorrencia, horario_inicio, horario_fim, tipo], (error, result) => {
        if (error) {
          console.log(error);
          res.status(500).json({ error: 'Erro ao inserir ocorrência' });
        }
        
        const id_ocorrencia = result.insertId;
  
        // Inserir os EPIs do Relatório
        epis.forEach((id_epi) => {
          conexao.query(sqlInsertEpis, [id_ocorrencia, id_epi], (error, result) => {
            if (error) {
              console.log(error);
              res.status(500).json({ error: 'Erro ao inserir epis da ocorrência' });
            }
          });
        });

        // Commit se todas as operações forem bem-sucedidas
        conexao.commit((error) => {
          if (error) {
            console.log(error);
            res.status(500).json({ error: 'Erro ao confirmar transação' });
          } else {
            console.log(`Inserção do Relatório (${tipo}) realizada com sucesso`);
            res.status(200).json({ success: 'ok' });
          }
        });
      });
    });
  },

  // Operação paralitar um Relatório específico de acordocom seu ID
  listarRelatorioPorId(req, res) {
    const id = req.params.id
    const tipo = req.params.tipo
    const sql = "SELECT * FROM relatório WHERE id=?"

    // Determinar se o video guardado é de 30 ou de 5 minutos
    if (tipo == 1) {
      sqlRelatorio += "AND tipo = 1;"
    } else if (tipo == 2) {
      sqlRelatorio += "AND tipo = 2;"
    }

    conexao.query(sql, id, (error, result) => {
      if (error) {
      console.log(error)
      res.status(404).json({ 'Erro ao listar o Relatório': error})
      } else {
      res.status(200).json(result[0])
      }
    })
  },

  // Operação para excluir um Relatorio
  deletarRelatorio(req, res) {
    const id = req.params.id;
    const tipo = req.params.tipo
    const sqlEpiCam = "DELETE FROM epis_ocorrência WHERE id_ocorrencia = ?";
    const sqlRelatorio = "DELETE FROM relatório WHERE = ?";

    // Determinar se o video guardado é de 30 ou de 5 minutos    
    if (tipo == 1) {
      sqlRelatorio += "AND tipo = 1;"
    } else if (tipo == 2) {
      sqlRelatorio += "AND tipo = 2;"
    }

    // Iniciar uma transação
    conexao.beginTransaction(error => {
      if (error) {
          console.log('Erro ao iniciar transação:', error);
          res.status(500).json({ erro: 'Erro interno do servidor' });
          return;
      }

      // Deletar da tabela relatorio
      conexao.query(sqlEpiCam, [id], (error, result) => {
        if (error) {
          console.log('Erro ao deletar a epi da ocorrencia:', error);
          conexao.rollback(() => {
            res.status(500).json({ erro: 'Erro interno do servidor' });
          });
          return;
        }

        // Deletar da epi_ocorrencia
        conexao.query(sqlRelatorio, [id], (error, result) => {
          if (error) {
            console.log('Erro ao deletar relatorio:', error);
            conexao.rollback(() => {
              res.status(500).json({ erro: 'Erro interno do servidor' });
            });
            return;
          }

          // Commit se todas as operações forem bem-sucedidas
          conexao.commit(errorCommit => {
            if (errorCommit) {
              console.log('Erro ao confirmar transação:', errorCommit);
              conexao.rollback(() => {
                res.status(500).json({ erro: 'Erro interno do servidor' });
              });
            } else {
              console.log('Relatório excluído com sucesso');
              res.status(200).json({ sucesso: 'Ok' });
            }
          });
        });
      });
    });
  }
};

export default relatorioController;
