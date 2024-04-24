import conexao from "./conexao.js";
import cron from 'node-cron';

// Função para excluir os relatórios com uma permanência maior que um dia
function excluirRelatorios() {
  // Comandos sql para verificar e excluir relatórios com mais de 24 horas
  const sqlDeleteRels = "DELETE FROM relatório WHERE tipo != 0 AND TIMESTAMPDIFF(HOUR, CONCAT(data_ocorrencia, ' ', horário_inicio), NOW()) >= 168;";
  const sqlSelectRels = "SELECT id FROM relatório WHERE tipo != 0 AND TIMESTAMPDIFF(HOUR, CONCAT(data_ocorrencia, ' ', horário_inicio), NOW()) >= 168;";
  const sqlDeleteEpis = "DELETE FROM epis_ocorrência WHERE id_ocorrencia = ?;";

  // Iniciar uma transação
  conexao.beginTransaction(error => {
    if (error) {
      console.log('Erro ao iniciar transação:', error);
      return;
    }

    // Selecionar relatórios que serão excluídos
    conexao.query(sqlSelectRels, (error, resultados) => {
      if (error) {
        console.log('Erro ao selecionar relatórios para exclusão:', error);
        conexao.rollback(() => {
          console.log('Rollback realizado devido a erro ao selecionar relatórios para exclusão');
        });
        return;
      }

      // Indicar os relatórios que serão excluídos e excluir os seus epis associados
      resultados.forEach(resultado => {
        const idRelatorio = resultado.id;

        // Excluir os epis associados ao relatório
        conexao.query(sqlDeleteEpis, [idRelatorio], (error, result) => {
          if (error) {
            console.log('Erro ao excluir epis associados ao relatório:', error);
            conexao.rollback(() => {
              console.log('Rollback realizado devido a erro ao excluir epis associados ao relatório');
            });
            return;
          }
        });
      });

      // Excluir os relatórios
      conexao.query(sqlDeleteRels, (error, result) => {
        if (error) {
          console.log('Erro ao excluir relatórios:', error);
          conexao.rollback(() => {
            console.log('Rollback realizado devido a erro ao excluir relatórios');
          });
          return;
        }

        // Commit se todas as operações forem bem-sucedidas e finalizar a transação
        conexao.commit(errorCommit => {
          if (errorCommit) {
            console.log('Erro ao confirmar transação:', errorCommit);
            conexao.rollback(() => {
              console.log('Rollback realizado devido a erro ao confirmar transação');
            });
          } else {
            console.log('Relatorios antigos excluídos com sucesso');
          }
        });
      });
    });
  });
};

// Função para excluir os relatórios do tipo 1 a cada meia hora
function excluirRelatoriosDe5() {
  // Comando SQL para excluir relatórios do tipo 1
  const sqlDeleteRelsTipo1 = "DELETE FROM relatório WHERE tipo = 1;";

  // Executar o comando SQL para excluir os relatórios do tipo 1
  conexao.query(sqlDeleteRelsTipo1, (error, result) => {
    if (error) {
      console.log('Erro ao excluir relatórios do tipo 1:', error);
      return;
    }
    console.log('Relatórios de 5 minutos excluídos');
  });
}

// Agendar a execução da função a cada meia hora
cron.schedule('0 */30 * * * *', () => {
  excluirRelatoriosDe5();
});

export default excluirRelatorios;
