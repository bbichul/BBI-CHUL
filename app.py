from flask import Flask, render_template, jsonify, request
app = Flask(__name__)

from pymongo import MongoClient
client = MongoClient('localhost', 27017)
db = client.dbnbc


## API 역할을 하는 부분
@app.route('/check', methods=['POST'])
def write_review():
    present_time = request.form['present_time']
    study_time = request.form['study_time']
    print(present_time, study_time)
    return jsonify({"button-text": '출근 or 퇴근',  "msg": "CHECK-IN STATUS"})

@app.route('/review', methods=['GET'])
def read_reviews():
    sample_receive = request.args.get('sample_give')
    print(sample_receive)
    return jsonify({'msg': '이 요청은 GET!'})
  
@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/wise_sy', methods=['GET'])
def read_wise_sy():
    wise = list(db.wise_sy.find({}, {'_id': False}))
    return jsonify(wise)

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)

