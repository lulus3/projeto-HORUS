import cv2
import numpy as np
import os
import face_recognition

class DetectionFaces():
    def __init__(self):
        self.rostos = []
        self.nomes =[]
        self.face_code()
    
    def face_code(self):
        path = 'C:/Users/lucas/sistemas epi/Rostos/'
        #Para cada arquivo encontra na pasta
        for filename in os.listdir(path):
            #Realiza a leitura do arquivo e codificação do rosto
            rosto = cv2.imread(path + filename)
            rosto = cv2.cvtColor(rosto, cv2.COLOR_BGR2RGB)
            rosto = face_recognition.face_encodings(rosto)
            if len(rosto) > 0:
                rosto = rosto[0]
            else:
                continue

            #Identifica o nome da pessoa
            nome, _ = filename.split('.')

            #Adiciona na base de dados
            self.rostos.append(rosto)
            self.nomes.append(nome)
        print("pronto para receber imagens")

    def run(self, frame):
        #frame = cv2.imread(path)
        #Captura da imagem
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        nome = 'desconhecido'

        # Encontra os rostos na imagem e codifica cada um deles
        face_locations = face_recognition.face_locations(frame)
        face_encodings = face_recognition.face_encodings(frame, face_locations)

        # Para cada rosto encontrado
        if len(face_encodings) == 0 or len(face_encodings) > 1:
            return (False, nome)
        
        for face_encoding in face_encodings:
            # Compara o rosto com a base de dados de rostos conhecidos
            matches = face_recognition.compare_faces(self.rostos, face_encoding)

            nome = 'desconhecido'
            distancias = face_recognition.face_distance(self.rostos, face_encoding)
            indice = np.argmin(distancias)
            if matches[indice]:
                nome = self.nomes[indice].split("_")[0]

            if True in matches:
                return (True, nome)
            
            return (False, nome)
