from dotenv import load_dotenv
from flask import Flask, send_file
from spleeter.separator import Separator
from pytube import YouTube
from os.path import exists
import uuid

load_dotenv()

app = Flask(__name__)
path = app.root_path
separator = Separator('spleeter:2stems')

def run():
    output_path = path + '/tmp/output'
    separator.separate_to_file(path + '/tmp/45-60.mp3', output_path)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/<vid>')
def youtube(vid):
    folder = "files/"
    filename = vid+".mp4"
    if not exists(folder+filename):
        yt = YouTube('http://youtube.com/watch?v='+vid)
        yt.streams.get_audio_only().download(folder, filename)

    if not exists(folder + vid + "/" + "accompaniment.wav"):
        separator.separate_to_file(folder + filename, folder)

    return send_file(folder + vid + "/" + "accompaniment.wav")


app.run()