import requests
import os

BACKEND_URL = 'http://localhost:5000'
TRANSCRIPT_FOLDER = './server/transcript'

# get all file in the folder
for filename in os.listdir(TRANSCRIPT_FOLDER):
    audioID = filename.replace(".txt", "")
    with open(os.path.join(TRANSCRIPT_FOLDER, filename), 'r', encoding='utf-8') as f:
        transcript = f.read()
        api = BACKEND_URL + "/api/audio/" + audioID
        r = requests.put(api, data = {'transcript': transcript})
        print(r.status_code == 200)
        # if 200 delete the transcript with that audioID given up there

        # if 404 say not found, hold the transcript.

        # if 500 say sorry, hold the transcript.



# r = requests.put(api, data = {'transcript': transcript})
# print(r.status_code == 200)