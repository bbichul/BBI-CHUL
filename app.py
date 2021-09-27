from flask import Flask, render_template, jsonify, request
app = Flask(__name__)

from pymongo import MongoClient
client = MongoClient('localhost', 27017)
db = client.dbsparta

## HTML을 주는 부분
@app.route('/')
def home():
    return render_template('index.html')

## API 역할을 하는 부분
@app.route('/review', methods=['POST'])
def write_review():

    name_receive = request.form['name_give']
    age_receive = request.form['age_give']
    gender_receive = request.form['gender_give']

    doc = {
        'name':name_receive,
        'age':age_receive,
        'gender':gender_receive

    }
    db.nick.insert_one(doc)

    return jsonify({'msg': '저장완료!'})


@app.route('/sign_up/check_dup', methods=['POST'])
def check_dup():
    name_receive = request.form['name_give']
    exists = bool(db.nick.find_one({"name": name_receive}))
    # print(value_receive, type_receive, exists)
    return jsonify({'result': 'success', 'exists': exists})


@app.route('/review', methods=['GET'])
def read_reviews():
    reviews = list(db.nick.find({}, {'_id':False}))
    return jsonify({'all_reviews':  reviews})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)