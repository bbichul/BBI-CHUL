from flask import Flask, render_template, jsonify, request
app = Flask(__name__)

from pymongo import MongoClient
client = MongoClient('localhost', 27017)
db = client.dbnbc

# API 역할을 하는 부분
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/check-in', methods=['POST'])
def check_in():
    start_time = request.form['start_time']
    status = request.form['status']
    year = request.form['year']
    month = request.form['month']
    day = request.form['day']
    week = request.form['week']
    # doc = {'name': 'bobby'}
    # db.user.insert_one(doc)
    # print(year, month, day, week)

    # 바꾸기 - 예시
    db.user.update_one({'name': 'bobby'}, {'$set': {
        'status': status,
        # f'{date[:4]}.{date[5]}.start_time': start_time
        'date.year': year,
        'date.month': month,
        'date.week': week,
        'date.day': day,
        'date.start_time': start_time,
    }})

    return jsonify({"msg": f'{start_time}에 {status} 하셨습니다'})

@app.route('/check-out', methods=['POST'])
def check_out():
    stop_time = request.form['stop_time']
    status = request.form['status']
    study_time = request.form['study_time'][:8]
    # date = request.form['date']
    # date = db.user.find_one({'name':'bobby'})[]

    db.user.update_one({'name': 'bobby'}, {'$set': {
        'status': status,
        'date.stop_time': stop_time,
        'date.study_time': study_time
    }})
    return jsonify({"msg": f'오늘 총 {study_time} 동안 업무를 진행하셨습니다.'})

@app.route('/review', methods=['GET'])
def read_reviews():
    sample_receive = request.args.get('sample_give')
    print(sample_receive)
    return jsonify({'msg': '이 요청은 GET!'})

@app.route('/wise', methods=['GET'])
def read_wise_sy():
    wise = list(db.wise_sy.find({}, {'_id': False}))
    return jsonify(wise)

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)

