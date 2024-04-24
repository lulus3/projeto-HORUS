import numpy as np
import cv2 as cv

import msgpack


def ndarray_to_msgpack(image: np.ndarray) -> str:
    # Converte o quadro em uma representação de bytes usando o OpenCV
    _, frame_encoded = cv.imencode('.jpg', image)

    frame_data = frame_encoded.tobytes()

    # Serializa o frame usando MessagePack
    frame_serializado = msgpack.packb(frame_data, use_bin_type=True)

    return frame_serializado


def msgpack_to_ndarray(frame_serializado: str) -> np.ndarray:
    # Deserializa o frame usando MessagePack
    frame_data = msgpack.unpackb(frame_serializado, raw=False)

    # Converte os dados de imagem em uma matriz NumPy
    frame_array = np.frombuffer(frame_data, dtype=np.uint8)

    # Reconstrói a imagem usando o OpenCV
    frame = cv.imdecode(frame_array, cv.IMREAD_COLOR)

    return frame

def dados_to_msgpack(dados):
    
    dados_serializados = msgpack.packb(dados, use_bin_type=True)

    return dados_serializados