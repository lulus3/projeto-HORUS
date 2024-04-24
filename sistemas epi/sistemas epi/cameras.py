import time, socketio, cv2, pickle, msgpack, datetime, sys
import config


class Camera():
    def __init__(self) -> None:
        # ao rodar o codigo das cameras lembre-se sempre de verificar o parametro do video capture para se adequar ao seu sistema
        self.cam = cv2.VideoCapture(1)
        self.socket_camera = socketio.Client()
        # ao rodar o codigo das cameras lembre-se sempre de verificar os ids das cameras, eles devem ir de 1 ate a quatidade de cameras suportadas
        self.id = '1'
        self.cam.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        self.cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        if not(self.cam.isOpened()):
            sys.exit()

        try:
            self.socket_camera.connect("http://" + config.ip_server2 + ":" + str(config.port_server2))
            print(f"Conectado ao servidor como câmera {self.id}")
        except Exception as e:
            print(f"Erro ao conectar à câmera {self.id}: {e}")
            sys.exit()
        self.socket_camera.emit("conexao", f"a camera {self.id} foi conectada #0")
    
    def run(self):
        try:
            while True:
                self.process_camera(0.1)
        except KeyboardInterrupt:
            self.socket_camera.disconnect()

    def process_camera(self, delay):
        time.sleep(delay)
        try:
            img, frame = self.cam.read()
            if not img:
                sys.exit()
        except Exception as e:
            print(f"erro ao pegar imagem da webcam: {e}")
            frame = cv2.imread('imagem.jpg')
        data_atual = datetime.datetime.now()
        dados = {
            'id': self.id,
            'imagem': frame,
            'status': [],
            'data': f"{data_atual.year}-{data_atual.month}-{data_atual.day}",
            'horario': f"{data_atual.hour}:{data_atual.minute}:{data_atual.second}"
        }
        dados_serializado1 = pickle.dumps(dados)
        lista = [self.id, dados_serializado1]
        dados_serializado2 = msgpack.packb(lista)
        self.socket_camera.emit("camera_server", dados_serializado2)
        print("imagem enviada")

process = Camera()

process.run()