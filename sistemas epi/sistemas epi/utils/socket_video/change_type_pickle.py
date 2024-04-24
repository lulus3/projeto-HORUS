import numpy as np
import cv2 as cv

import pickle


def ndarray_to_pickle(image: np.ndarray) -> str:
    # Converte o quadro em uma representação de bytes usando o OpenCV
    _, frame_encoded = cv.imencode('.jpg', image)
    frame_data = frame_encoded.tobytes()

    # Serializa o frame usando Pickle
    frame_serializado = pickle.dumps(frame_data)

    return frame_serializado


def pickle_to_ndarray(frame_serializado: str) -> np.ndarray:
    # Deserializa o frame usando Pickle
    frame_data = pickle.loads(frame_serializado)

    # Converte os dados de imagem em uma matriz NumPy
    frame_array = np.frombuffer(frame_data, dtype=np.uint8)

    # Reconstrói a imagem usando o OpenCV
    frame = cv.imdecode(frame_array, cv.IMREAD_COLOR)

    return frame