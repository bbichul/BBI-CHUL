from flask import Flask, render_template, jsonify
from pymongo import MongoClient

client = MongoClient('localhost', 27017)  # mongoDB는 27017 포트로 돌아갑니다.
db = client.dbnbc

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/wise_sy', methods=['GET'])
def read_wise_sy():
    wise = list(db.wise_sy.find({}, {'_id': False}))
    return jsonify(wise)

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
