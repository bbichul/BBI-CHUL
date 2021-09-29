from pymongo import MongoClient
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.dbnbc


@app.route('/')
def home():
    return render_template('calender.html')


# 날짜 클릭 함수입니다.
@app.route('/clickDay', methods=['POST'])
def clickedDay():
    receive_clickDate = request.form['dateGive']

    dateData = db.userdata.find_one({'date': receive_clickDate})

    if dateData is None:
        resendDateMemo = ""
    else:
        resendDateMemo = dateData['Memo']

    print(resendDateMemo)

    return jsonify({'resendDateMemo': resendDateMemo})

    # 날짜 클릭 함수 종료


# 캘린더 메모 변경 함수
@app.route('/changeMemoText', methods=['POST'])
def changedMemo():
    receive_memo = request.form['changeMemoGive']
    receive_keyClass = request.form['keyClassGive']

    dateData = db.userdata.find_one({'date': receive_keyClass})

    if dateData is None:
        db.userdata.insert_one({'date': receive_keyClass, 'Memo': receive_memo})
    else:
        db.userdata.update_one({'date': receive_keyClass}, {'$set': {'Memo': receive_memo}})

    return jsonify(receive_keyClass)


# 캘린더 메모 변경 함수 종료

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
