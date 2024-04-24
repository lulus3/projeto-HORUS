const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const http = require("http");
const msgpack = require("msgpack-lite");
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  compress: true,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e8,
});

app.use(express.static("public"));

app.get('/', (req, res) =>{
  res.sendFile("login.html", { root: 'public' });
});
app.get('/home', (req, res) => {
  res.sendFile("home.html", { root: 'public' });
});
app.get('/intruso', (req, res) => {
  res.sendFile("intruso.html", { root: 'public' });
});
app.get('/cameras', (req, res) => {
  res.sendFile("cameras.html", { root: 'public' });
});

const servidor_web = new Set();
const pagina_face = new Set();
const servidor_cameras = new Set();
const gravaçao = new Set();
const registro = new Set();
let lista_epis = [];

// realiza a aquisiçao ao servidor de banco de dados recebendo quais epis cada camera deve detectar
async function atualizar_epis(io = null) {
  const ip = process.env.HOST_IP_SERVER_BD;
  const port = process.env.PORT_SERVER_BD;
  const urlepicam = `http://${ip}:${port}/epicam`;
  try {
      const response = await axios.get(urlepicam);
      const data = response.data;
      lista_epis = [];
      console.log('Dados recebidos: ', data);
      let ids_cameras = Object.keys(data);
      ids_cameras.forEach((id_camera) => {
          let epis = data[id_camera].join(' ');
          lista_epis.push(`${id_camera}:${epis}`);
      });
      console.log(lista_epis);

      if (io !== null) {
          let lista = lista_epis.join('#');
          console.log(lista);
          servidor_cameras.forEach((socket_id) => {
              io.to(socket_id).emit("epis_requeridas", lista);
          });
      }
  } catch (error) {
      console.error('Erro:', error);
  }
}

io.on("connection", (socket) => {
  socket.on("conexao", (msg) => {
    // adiciona a cada conjunto seus repectivos tipos de clientes (servidores, gravadores, registradores)
    mensagem = msg.split("#")[0];
    tipo = parseInt(msg.split("#")[1]);
    console.log(mensagem);
    if (tipo == 0)
      servidor_web.add(socket.id);
    if (tipo == 1)
      pagina_face.add(socket.id);
    if (tipo == 2){
      servidor_cameras.add(socket.id);
      atualizar_epis(io);
    }
    if (tipo == 3)
      gravaçao.add(socket.id);
    if (tipo == 4)
      registro.add(socket.id);
  })

  socket.on("server_server", (frame) => {
    // envia os frames e dados para os conjuntos dos quais os necessitam
    const dados = msgpack.decode(frame);
    const id = dados.id;
    const status = dados.status;
    const data = dados.data;
    const horario = dados.horario;
    // retira os frames antes de enviar aos registradores para diminuir o consumo de banda
    const new_dados = { id, status, data, horario };
    console.log(new_dados)

    servidor_web.forEach((socket_id) => {
      io.to(socket_id).emit("server_web", frame);
    })
    gravaçao.forEach((socket_id) => {
      io.to(socket_id).emit("gravacao", frame);
    })
    registro.forEach((socket_id) => {
      io.to(socket_id).emit("registrar", new_dados);
    })
  })

  socket.on("face_server", (frame) => {
    servidor_cameras.forEach((socket_id) => {
      // guarda a identificaçao da conexao socket para voltar a mesma pagina pela qual veio individualizando o resultado da verificaçao de rosto
      const dados = [socket.id, frame];
      const dados_enviar = msgpack.encode(dados);
      io.to(socket_id).emit("face_server", dados_enviar);
    })
  })

  socket.on("face_web", (resultado) => {
    const resultado_det = msgpack.decode(resultado);
    // retorna os resultados para a pagina de verificação de rosto usando a identificaçao do socket pelo qual veio
    const socket_id = resultado_det[0];
    const mensagem = resultado_det[1];
    io.to(socket_id).emit("face_web", mensagem);
  })

  socket.on("registrar_ocorrencia", (registro) => {
    const dados = msgpack.decode(registro);
    const ip = process.env.HOST_IP_SERVER_BD;
    const port = process.env.PORT_SERVER_BD;
    console.log('Dados recebidos:', dados);

    // envia os dados para serem amazenados para o servidor de banco de dados
    const url = `http://${ip}:${port}/relatorio/submit`;
    axios.post(url, dados, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then((response) => {
        console.log('Resposta da API:', response.data);
        // Enviar uma resposta de volta para o cliente Socket.IO, se necessário
    })
    .catch((error) => {
        console.error('Erro na chamada da API:', error);
        // Trate o erro, se necessário
    });
  });

  socket.on("atualizar_epis", () => {
    console.log("tentativa de atualizaçao");
    atualizar_epis(io);
  });

  socket.on("image_data", (imagem) => {
    // mensagem recebida no cadastramento da imagem
    console.log(imagem);
    servidor_cameras.forEach((socket_id) => {
      io.to(socket_id).emit("image_data", imagem);
    });
  });

  socket.on("deletar_foto", (id) => {
    servidor_cameras.forEach((socket_id) => {
      io.to(socket_id).emit("deletar_foto", id);
    });
  });

  socket.on('disconnect', () => {
    // ao desconectar a identificaçao do socket de cada conexao é retirar dos conjuntos
    servidor_web.delete(socket.id);
    pagina_face.delete(socket.id);
    servidor_cameras.delete(socket.id);
    gravaçao.delete(socket.id);
    registro.delete(socket.id);
    console.log("cliente desconectado");
  });
});

let porta = process.env.PORT_SERVER1
server.listen(porta, function(){
  console.log("o servidor foi iniciado em http://localhost:" + porta);
  atualizar_epis(io);
});
