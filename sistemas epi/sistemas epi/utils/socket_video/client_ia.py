import socketio,cv2, pickle, time, json
from utils.detector import *
from utils.socket_video.change_type_msgpack import *
import config

class DetecYolo():
    def __init__(self,endereco, name = "RECEIVING VIDEO",args=None):
        self.detector = yolov7_model(endereco)
        self.name = name
        self.epis = []
        self.epis_requeridas = []
        for _ in range(config.quantidade_cameras):
            self.epis_requeridas.append([])
        # Abre o arquivo JSON
        with open('./utils/socket_video/notes.json', 'r') as arquivo:
            # Carrega os dados do arquivo JSON
            dados = json.load(arquivo)
        
        classes = dados['categories']

        for categoria in classes:
            nome_categoria = categoria['name']
            self.epis.append(nome_categoria)

    def run(self,frame, id_cam, horario):
        det = self.detector.processFrame(frame)

        # Converter a string JSON para objetos Python
        detections = json.loads(det)
        result = []

        # Desenhar caixas na imagem da câmera
        yellow = (0, 255, 255)
        cv2.putText(frame, horario, (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 1.0, yellow, 2)

        for _, boxes in detections.items():
            for box in boxes:
                relative_id = 99
                x1, y1, x2, y2, score, class_id = map(int, box[:6])
                if class_id <= (len(self.epis)/2)-1 :
                    relative_id = class_id
                    color = (0, 255, 0)  # Cor da caixa (verde no formato BGR)
                else:
                    color = (0, 0, 255)  # Cor da caixa (vermelho no formato BGR)
                    relative_id = class_id - (len(self.epis)/2)
                thickness = 2  # Espessura da linha da caixa

                if (relative_id +1) in self.epis_requeridas[id_cam-1]:
                    result.append(class_id)
                    # Desenhar a caixa na imagem da câmera
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)
                    label = f"{self.epis[class_id]}"
                    cv2.putText(frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 1.7, color, thickness)
                    

        return result

class Client():
    def __init__(self, id, output: DetecYolo):
        self.socket = socketio.Client()
        self.output = output
        self.recv = False
        self.dado_atual = None
        self.fila = []
        self.id = id
        self.horario_atual = ""

        self.id_detecçao = 1
        imagem_carregada = cv2.imread("imagem.jpg") # carrega a primeira imagem para a ia processar
        self.output.run(imagem_carregada, self.id_detecçao, self.horario_atual) # faz a primeira detecçao pra que a ia possa carregar o modelo
        self.imagem_detecçao = imagem_carregada

        self.socket.connect("http://" + config.ip_server2 + ":" + str(config.port_server2))
        self.socket.on("server_ia", self.receive)
        self.socket.on("epis_requeridas", self.change_epis)
        self.socket.emit("conexao", f"a Ia {self.id} das cameras foi conectada #1")

        print("pronto para receber imagens")
    
    def run(self):
        try:
            while True:
                self.processar_imagem()
        except KeyboardInterrupt:
            self.socket.disconnect()

    def change_epis(self, mensagem):
        print("troca de epi solicitadas")
        ids_cameras = []
        for i in range(config.quantidade_cameras):
            ids_cameras.append(i+1)
        lista = mensagem.split("#")
        for n in lista:
            id_camera, epis = n.split(":")
            if int(id_camera) in ids_cameras:
                ids_cameras.remove(int(id_camera))
            id_epis = epis.split()
            lista_epis = []
            for id in id_epis:
                lista_epis.append(int(id))
            self.output.epis_requeridas[int(id_camera)-1] = lista_epis
            
        
        for id in ids_cameras:
            self.output.epis_requeridas[id-1] = []
        
        print(self.output.epis_requeridas)
        

    def receive(self, dados_serializado):
        dado_recebido = pickle.loads(dados_serializado)
        self.fila.append(dado_recebido)  # coloca a imagem recebida em uma fila de processamento FIFO

    def processar_imagem(self):
        # processa as imagens recebidas de acordo com a fila de processamentos evitando concorrencia
        if len(self.fila) > 0:
            self.imagem_detecçao = self.fila[0]['imagem']
            self.id_detecçao = int(self.fila[0]['id'])
            self.horario_atual = f"{self.fila[0]['data']} {self.fila[0]['horario']}"
            self.recv = True

        inicio = time.time()
        # enquanto nao tiver imagens a serem processadas ele processa a ultima imagem para nao ficar em estado ocioso
        status = self.output.run(self.imagem_detecçao, self.id_detecçao, self.horario_atual)  
        fim = time.time()

        if self.recv:
            print(f"tempo de processamento: {(fim-inicio):.5f}")
            self.recv = False

            self.dado_atual = self.fila[0]
            self.imagem_detecçao = cv2.resize(self.imagem_detecçao, (854, 480))
            self.dado_atual['imagem'] = ndarray_to_msgpack(self.imagem_detecçao)
            self.dado_atual['id'] = str(self.id_detecçao)
            self.dado_atual['status'] = status

            dado_serializado = dados_to_msgpack(self.dado_atual)
            self.socket.emit("ia_server", dado_serializado)
            self.fila.pop(0)
        return
    