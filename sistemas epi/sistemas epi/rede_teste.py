import socketio,cv2, pickle, time, json, imutils, pygame, threading
from utils.detector import *
from utils.socket_video.change_type_msgpack import *
import config

class DetecYolo():
    def __init__(self,endereco, name = "RECEIVING VIDEO",args=None):
        self.detector = yolov7_model(endereco)
        self.name = name
        self.epis = []
        self.epis_requeridas = [[1, 2, 3, 4], [], [], []]
        # Abre o arquivo JSON
        with open('./utils/socket_video/notes.json', 'r') as arquivo:
            # Carrega os dados do arquivo JSON
            dados = json.load(arquivo)
        
        classes = dados['categories']

        for categoria in classes:
            nome_categoria = categoria['name']
            self.epis.append(nome_categoria)

    def run(self,new_frame, id_cam=1):
        det = self.detector.processFrame(new_frame)
        print(det)

        # Converter a string JSON para objetos Python
        detections = json.loads(det)
        result = []

        # Desenhar caixas na imagem da câmera
        yellow = (0, 255, 255)

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

                if (int(relative_id)+1) in self.epis_requeridas[id_cam-1]:
                    result.append(int(class_id))
                    # Desenhar a caixa na imagem da câmera
                    cv2.rectangle(new_frame, (x1, y1), (x2, y2), color, thickness)
                    label = f"{self.epis[class_id]}"
                    cv2.putText(new_frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, thickness)
                    

        return result

class Client():
    def __init__(self, id, output: DetecYolo):
        self.socket = socketio.Client()
        self.output = output
        self.id = id
        self.cam = cv2.VideoCapture(0)

        self.cam.set(cv2.CAP_PROP_FRAME_WIDTH, 854)
        self.cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)


        self.id_detecçao = 0
        imagem_recebida = cv2.imread("imagem.jpg") # carrega a primeira imagem para a ia processar
        self.output.run(imagem_recebida) # faz a primeira detecçao pra que a ia possa carregar o modelo
        self.imagem_detecçao = imagem_recebida

        print("pronto para receber imagens")
        pygame.init()

        # Define as dimensões da janela
        self.width, self.height = 1280, 720

        # Inicializa a janela do Pygame
        self.screen = pygame.display.set_mode((self.width, self.height))
        pygame.display.set_caption("Video Player")
        
    
    def run(self):
        try:
            while True:
                self.processar_imagem()
        except KeyboardInterrupt:
            self.socket.disconnect()

    def processar_imagem(self):
        # Captura os eventos do Pygame
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                import sys
                sys.exit()
        img, frame = self.cam.read()
        print(frame.shape)

        if not img:
            import sys
            sys.exit()

        new_frame = frame
        det = self.output.run(new_frame)
        print(det)

        new_frame = cv2.cvtColor(new_frame, cv2.COLOR_BGR2RGB)

        # Converte o new_frame para uma imagem do Pygame
        var1 = int(self.cam.get(3))
        var2 = int(self.cam.get(4))
        new_frame = pygame.image.frombuffer(new_frame.tobytes(), (var1, var2), 'RGB')

        # Redimensiona o new_frame para ajustar à janela
        new_frame = pygame.transform.scale(new_frame, (self.width, self.height))

        # Exibe o new_frame na janela
        self.screen.blit(new_frame, (0, 0))
        pygame.display.flip()

Client(output = DetecYolo(endereco="classificadores/bestfinal.pt"),id='1').run()
    