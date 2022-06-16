# -*- coding: utf-8 -*-
# yumo.wym Alibaba 2022
import logging,os
from flask import Flask, render_template, request, jsonify
from flask import send_from_directory
from markupsafe import Markup
app = Flask(__name__)
logging.basicConfig(format='%(asctime)s %(levelname)-8s %(message)s',
    level=logging.INFO,
    datefmt='%Y-%m-%d %H:%M:%S')

from be import BE
be = BE()
be.load("data/demo.json")
app.logger.info("ready")

@app.route('/', methods=['GET', 'POST'])
def index():        
    return render_template('index.html')

@app.route('/favicon.ico') 
def favicon(): 
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico')

@app.post('/load')
def load():
    filename = Markup(request.get_json().get("filename")).striptags()
    be.load(filename)


@app.post('/next')
def next():
    # index = int(Markup(request.get_json().get("index")).striptags())
    sample = be.get_sample()
    # app.logger.info(f"{sample}")
    return jsonify(sample)

@app.post('/get_sample')
def get_sample():
    index = int(Markup(request.get_json().get("index")).striptags())
    sample = be.get_sample(index)
    # app.logger.info(f"{sample}")
    return jsonify(sample)

@app.post('/get_page')
def get_page():
    index = int(Markup(request.get_json().get("index")).striptags())
    end = int(Markup(request.get_json().get("end")).striptags())
    page = be.get_sample(index,end)
    # app.logger.info(f"{page}")
    return jsonify(page)

@app.post('/submit')
def submit():
    label = Markup(request.get_json().get("label")).striptags()
    index = int(Markup(request.get_json().get("index")).striptags())
    # app.logger.info(f"{index}:{label}")
    be.label(index, label)
    return jsonify({})

@app.post("/converse")
def converse():
    text = Markup(request.get_json().get("message")).striptags()
    response = get_response(text)
    app.logger.info("chat: %s - %s", text, response)
    message = {"answer": response}
    return jsonify(message)


