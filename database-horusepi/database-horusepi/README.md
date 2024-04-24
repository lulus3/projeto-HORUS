# Database da Horus EPI

API em Node para a conexão da database e a manipulação dos dados do Sistema EPI_CONTROL_TECH.

## Instruções

Para a database é preciso ter o MySQL em sua máquina para o armazenamento do Banco de Dados.  
O código em sql que é preciso para ter a database epicontroltech está armazenado no arquivo: database.sql.  

Para estabelecer a conexão com a database no MySQL é preciso configurar o arquivo conexao.js:  
host: '',  
port: '',  
user: '',  
password: '',  
database: 'EPICONTROLTECH'  

Para iniciar a API em Node, é preciso executar o comando: npm init -y.  
Após isso deve ser feita a instalação de todas as dependências necessárias.  
Com as dependências instaladas basta iniciar o servidor com o comando:  
node .\app.js  

## Requerimentos e Instalação

Node.js  -  https://nodejs.org/en/download/current   
axios  -  npm install axios@1.6.7  
body_parser  -  npm install body-parser@1.20.2  
cors  -  npm install cors@2.8.5  
dotenv  -  npm install dotenv@16.4.5  
ejs  -  npm install ejs@3.1.9  
express  -  npm install express@4.18.2  
mysql  -  npm install mysql@2.18.1  
mysql2  -  npm install mysql2@3.6.5  
node-cron  -  npm install node-cron@3.0.3  
nodemon  -  npm install nodemon@3.0.1 (opcional)  
path  -  npm install path@0.12.7  
socket.io-client  -  npm install socket.io-client@4.7.5  
socket.io  -  npm install socket.io@4.7.5  

## Observações

Durante o desenvolvimento da API, foi utilizada a ferramenta **nodemon** para monitorar as mudanças feitas nos arquivos do sistema e reiniciar o servidor automaticamente quando detectava alterações sem precisar reiniciar o servidor manualmente.  
Usar o nodemon é **opcional**.  
Para iniciar o servidor com o nodemon é preciso instalar sua dependência e especificar no arquivo package.json na parte de scripts, o arquivo que será usado pelo nodemon (no caso dessa API, o arquivo executado é o app.js; ficando "dev": "nodemon app.js" no package.json).  
Após a alteração basta executar o comando:  
npm run dev  

Algumas operações do sistema fazem a conexão com a API das câmeras recebendo ou mandando informações para ela. Para isso, foi especificado o IP e a Porta que essa API utiliza no arquivo .env. Para que não dê erro no sistema, insira o IP e a Porta correpondente da API das câmeras no arquivo .env  
