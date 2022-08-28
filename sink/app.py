from dotenv import load_dotenv
from flask import Flask, jsonify, send_from_directory
from spleeter.separator import Separator
from pytube import YouTube
from os.path import exists
import uuid

load_dotenv()

app = Flask(__name__)
path = app.root_path
outfile_path = "public/"
separator = Separator('spleeter:2stems')

@app.route('/<path:path>')
def send_static(path):
    return send_from_directory(outfile_path, path)

@app.route('/v/<vid>')
def youtube(vid):
    filename = vid+".mp4"
    if not exists(outfile_path+filename):
        yt = YouTube('http://youtube.com/watch?v='+vid)
        yt.streams.get_audio_only().download(outfile_path, filename)

    if not exists(outfile_path + vid + "/" + "accompaniment.wav"):
        separator.separate_to_file(outfile_path + filename, outfile_path)
    
    return jsonify({
        "vocals": "/" + vid + "/" + "vocals.wav",
        "bg": "/" + vid + "/" + "accompaniment.wav"
    })


app.run()