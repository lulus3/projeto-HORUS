import socketio, config, msgpack, time, sys

class Registrador():
    def __init__(self) -> None:
        self.socket = socketio.Client()
        self.fila = []
        self.limitador = 5
        self.qtd_cameras = config.quantidade_cameras
        self.positivos = []
        self.negativos = []
        self.estado_ocorrencia = []
        self.epis_detectados = []
        self.temporizador = []
        self.dados_recebido = []

        for _ in range(self.qtd_cameras):
            self.temporizador.append(time.time())
            self.positivos.append([])
            self.negativos.append([])
            self.estado_ocorrencia.append(0)
            self.epis_detectados.append([])
            self.dados_recebido.append(False)

        try:
            self.socket.connect(f"http://{config.ip_server1}:{str(config.port_server1)}")
            self.socket.emit("conexao", "o registrador de ocorrencias foi conectado #4")
            self.socket.on("registrar", self.receive)
            self.socket.on("disconnect", self.desconectado)
            print("pronto pra receber os dados")
        except Exception as e:
            print(f"nao foi possivel se conectar: {e}")
            sys.exit()
        
    def run(self):
        try:
            while True:
                self.verificar_ocorrencia()
                self.verificar_temporizador()
        except KeyboardInterrupt:
            self.socket.disconnect()

    def desconectado(self):
        # caso o codigo se desconecte e tente se reconectar tera suas variaveis zeradas
        for i in range(self.qtd_cameras):
            self.temporizador[i] = time.time()
            self.positivos[i] = []
            self.negativos[i] = []
            self.estado_ocorrencia[i] = 0
            self.epis_detectados[i] = []
            self.dados_recebido[i] = False
        print("o codigo foi desconectado")

    def receive(self, dados):
        # recebe os dados e adiciona a uma fila de processamento
        self.fila.append(dados)

    def armazenar_ocorrencia(self, id):
        # a infração é registrada se houver mais que 40 frames, em torno de 5 segundos
        if len(self.positivos[id]) > 40:
            dados_inicio = self.positivos[id][0]
            dados_fim = self.positivos[id][-1]
            dados = {
                'id_cam': int(dados_inicio['id']),
                'epis': self.epis_detectados[id],
                'data_ocorrencia': dados_inicio['data'],
                'horario_inicio': dados_inicio['horario'],
                'horario_fim': dados_fim['horario'],
                'tipo': 0
            }
            dados_enviar = msgpack.packb(dados)
            self.socket.emit("registrar_ocorrencia", dados_enviar)
            print('ocorrencia registrada: ', dados)
        self.positivos[id].clear()
        self.negativos[id].clear()
        self.epis_detectados[id].clear()
        

    def verificar_ocorrencia(self):
        # realiza a verificaçao dos frames pegando os dados da fila de processamento FIFO para evitar problemas de concorrencia
        if len(self.fila) > 0:
            dados = self.fila[0]
            id = (int(dados['id']) - 1)
            status = dados['status']
            data = dados['data']
            horario = dados['horario']
            self.fila.pop(0)
            self.temporizador[id] = time.time()
            self.dados_recebido[id] = True

            # no estado '0' nao esta acontecendo uma infração e o algoritmo esta a espera do reconhecimento de uma infração
            if (self.estado_ocorrencia[id] == 0):
                ocorrencia = False
                for classe_epi in status:
                    # as infrações tem o numero da classe maiores ou iguais a 4, indo de 4 a 7
                    if int(classe_epi) >= 4:
                        ocorrencia = True
                        if (int(classe_epi) - 3) not in self.epis_detectados[id]:
                            self.epis_detectados[id].append(int(classe_epi) - 3)
                if ocorrencia:
                    self.positivos[id].append(dados)
                    # o algoritmo muda seu estado no momento que encontra um determinado numero de frames seguidos contendo a identificação de infraçoes
                    if len(self.positivos[id]) >= self.limitador:
                        self.estado_ocorrencia[id] = 1
                else:
                    self.positivos[id].clear()
            
            # no estado '1' esta ocorrendo a infração e o algoritimo esta a espera do reconhecimento do fim desta infração
            if (self.estado_ocorrencia[id] == 1):
                ocorrencia = False
                for classe_epi in status:
                    if int(classe_epi) >= 4:
                        ocorrencia = True
                        if (int(classe_epi) - 3) not in self.epis_detectados[id]:
                            self.epis_detectados[id].append(int(classe_epi) - 3)
                if ocorrencia:
                    self.positivos[id].append(dados)
                    self.negativos[id].clear()
                else:
                    self.negativos[id].append(dados)
                    # o algoritmo muda seu estado no momento que encontra um determinado numero de frames seguindos sem a identificaçao de infraçoes 
                    if len(self.negativos[id]) >= self.limitador:
                        self.estado_ocorrencia[id] = 0
                        self.armazenar_ocorrencia(id)

    def verificar_temporizador(self):
        # se houver um tempo de 10 segundos de intervalo na entrega dos frames o algortimo fecha quaisquer infração que esteja acontecendo e armazena
        tempo_atual = time.time()
        for id in range(self.qtd_cameras):
            if tempo_atual - self.temporizador[id] > 10 and self.dados_recebido[id]:
                print(f"houver um delay grande na espera dos framees da camera {id+1}")
                self.dados_recebido[id] = False
                self.armazenar_ocorrencia(id)


reg = Registrador()
reg.run()