from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, jsonify, send_from_directory, redirect, request
from helper import SearchSession, SessionManager
from pytube import YouTube
from spleeter.separator import Separator
import ffmpy
from typing import List


load_dotenv()

app = Flask(__name__)
path = app.root_path
public_path = "public/"
outfile_path = "media/"
separator = Separator('spleeter:2stems')

search_manager = SessionManager()

@app.route('/')
def index():
    return redirect('/app.html')

@app.route('/<path:path>')
def send_static(path):
    return send_from_directory(public_path, path)

@app.route('/v/<vid>')
def youtube(vid):
    import os, sys
    from os.path import exists
    filename = vid+".mp4"
    if not exists(public_path + outfile_path + filename):
        yt = YouTube('http://youtube.com/watch?v='+vid)
        print("== Download " + vid + "==")
        downloadStart = datetime.now()
        yt.streams.get_audio_only().download(public_path + outfile_path, filename)
        print((datetime.now() - downloadStart).total_seconds(), "s")

    if not exists(public_path + outfile_path + vid + "/" + "accompaniment.wav"):
        print("== spleet " + vid + "==")
        spleetStart = datetime.now()
        separator.separate_to_file(public_path + outfile_path + filename, public_path + outfile_path)
        print((datetime.now() - spleetStart).total_seconds(), "s")
    
    if not exists(public_path + outfile_path + vid + "/" + "accompaniment.webm"):
        print("== convert webm " + vid + "==")
        convert_bg = ffmpy.FFmpeg(inputs={public_path + outfile_path + vid + "/" + "accompaniment.wav": None},outputs={public_path + outfile_path + vid + "/" + "accompaniment.webm": None})
        convert_vocals = ffmpy.FFmpeg(inputs={public_path + outfile_path+ vid + "/" + "vocals.wav": None}, outputs={public_path + outfile_path+ vid + "/" + "vocals.webm": None})
        convertStart = datetime.now()
        convert_bg.run()
        print((datetime.now() - convertStart).total_seconds(), "s")
        convertStart = datetime.now()
        convert_vocals.run()
        print((datetime.now() - convertStart).total_seconds(), "s")
        os.unlink(public_path + outfile_path+ vid + "/" + "accompaniment.wav")
        os.unlink(public_path + outfile_path+ vid + "/" + "vocals.wav")
        os.unlink(public_path + outfile_path + filename)


    return jsonify({
        "vocals": "/" + outfile_path + vid + "/" + "vocals.webm",
        "bg": "/" + outfile_path + vid + "/" + "accompaniment.webm"
    })

@app.route('/q/<query>')
def search(query):
    search_session : SearchSession = None
    if request.args.get("id"):
        search_session = search_manager.get(request.args.get("id"))
    if not search_session:
        search_session = SearchSession(query)
        search_manager.add(search_session)

    if request.args.get("next"):
        search_session.search.get_next_results()
    
    result = []
    for item in search_session.search.results:
        result.append({
            "vid": item.video_id,
            "author":item.author,
            "channel_id": item.channel_id,
            "thumbnail_url": item.thumbnail_url,
            "title": item.title
        })

    return jsonify({
        "search_id":search_session.id,
        "data":result
    })

if __name__ == "__main__":
    app.run()

