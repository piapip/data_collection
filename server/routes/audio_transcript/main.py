#! /usr/bin/env python
# -*- coding: utf-8 -*-
# vim:fenc=utf-8
#
#
import speech.v1.cloud_speech_pb2_grpc as cloud_speech_pb2_grpc
import speech.v1.cloud_speech_pb2 as cloud_speech_pb2
import grpc
import queue
import wave
import time
import sys
import signal, os
from ftfy import fix_encoding


def connectivity_callback(c):
    pass

def state_callback(*args):
    pass


channel = grpc.insecure_channel("asr-benchmark.vais.vn:50050")
channel.subscribe(callback=connectivity_callback)

graph = "general"
api_key = "vbee-vlsp2020"

IS_STOP = False
def load_audio(fname):
    # Read and return a block of 640 frames (1280 bytes)
    fin = wave.open(fname)
    nframes = fin.getnframes()
    chunk_size = 640
    total_read = 0
    n_read = 0
    while total_read < nframes:
        n_read += 1
        nframe_left = nframes - total_read
        read_size = chunk_size if chunk_size < nframe_left else nframe_left

        data = fin.readframes(read_size)
        total_read += read_size
        yield data

def generate_message():
    audio_encode = cloud_speech_pb2.RecognitionConfig.LINEAR16
    speech_context = cloud_speech_pb2.SpeechContext(phrases=[])

    model_param = cloud_speech_pb2.ModelParam(graph=graph)

    config = cloud_speech_pb2.RecognitionConfig(encoding=audio_encode, max_alternatives=1, speech_contexts=[speech_context],
            model_param=model_param, sample_rate_hertz=16000)
    streaming_config = cloud_speech_pb2.StreamingRecognitionConfig(config=config, single_utterance=False, interim_results=True)

    request = cloud_speech_pb2.StreamingRecognizeRequest(streaming_config=streaming_config)
    yield request

    for audio in load_audio(sys.argv[1]):
        request = cloud_speech_pb2.StreamingRecognizeRequest(audio_content=audio)
        yield request

def start_asr(export_file_name):
# def start_asr():
    global IS_STOP
    stub = cloud_speech_pb2_grpc.SpeechStub(channel)
    metadata = [(b'api-key', api_key)]
    responses = stub.StreamingRecognize(generate_message(), metadata=metadata)
    for response in responses:
        if response.results:
            if response.results[0].alternatives:
                text = response.results[0].alternatives[0].transcript.strip()
                if response.results[0].is_final:
                    # print(text)
                    f = open(export_file_name, "w", encoding="utf8")
                    f.write(text)
                    f.close()
                    # print(text)
                    # print(text.encode("utf8").decode("utf8"))
                    # !!!!DELETE DOWN THERE!!!!
                    return response.results[0].is_final

def handler(signum, frame):
    global IS_STOP
    IS_STOP = True

def downsample():
    filename = sys.argv[1]
    print('args: '+ sys.argv[1])


if __name__ == "__main__":
    export_file_name = sys.argv[2]
    key = sys.argv[3]
    # print(export_file_name)
    signal.signal(signal.SIGINT, handler)
    start_asr(export_file_name)
    # start_asr()
    
    # !!!!DELETE TMP FILE HERE!!!!
    tempWavFile = './server/tmp/tmp_' + key + '.wav'
    tempMonoFile = './server/tmp/anothertmp_' + key + '.wav'

    if os.path.exists(tempWavFile):
        os.remove(tempWavFile)
    else:
        print(tempWavFile+" does not exist!")

    if os.path.exists(tempMonoFile):
        os.remove(tempMonoFile)
    else:
        print(tempMonoFile+" does not exist!")