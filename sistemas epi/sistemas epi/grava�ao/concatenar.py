import cv2, os, imutils

def concatenar_videos(lista_videos: list):
    nome_video_principal = lista_videos[0]
    nome_ultimo_video = ''
    video_principal = cv2.VideoCapture(nome_video_principal)
    temporario_path = 'temp.mp4'
    video_concatenado = cv2.VideoWriter(temporario_path, cv2.VideoWriter_fourcc(*'mp4v'), 10, (640, 360)) # Cria um video temporario
    if video_concatenado.isOpened():
        print("temporario aberto")
    lista_videos.pop(0)

    # Lê e grava os quadros do primeiro vídeo
    if video_principal.isOpened():
        print("abriu o video principal")
    while video_principal.isOpened():
        ret1, frame1 = video_principal.read()
        if not ret1:
            break
        new_frame1 = imutils.resize(frame1, width=640, height=360)
        video_concatenado.write(new_frame1)
    
    video_principal.release()

    for video_name in lista_videos:
        # Abre os vídeos secundarios
        video_secundario = cv2.VideoCapture(video_name)

        # Lê e grava os quadros de cada video secundario no primeiro
        if video_secundario.isOpened():
            print("aabriu o video secundario")
        while video_secundario.isOpened():
            ret2, frame2 = video_secundario.read()
            if not ret2:
                video_secundario.release()
                break
            new_frame2 = imutils.resize(frame2, width=640, height=360)
            video_concatenado.write(new_frame2)
        
        nome_ultimo_video = video_name

    # Libera os recursos
    video_concatenado.release()
    cv2.destroyAllWindows()

    #  # Remove o vídeo principal original
    # os.remove(nome_video_principal)
    # os.remove(nome_ultimo_video)

    # # Renomeia o vídeo temporário para o nome do vídeo principal
    # os.rename(temporario_path, nome_video_principal)

    print("Vídeos concatenados com sucesso.")