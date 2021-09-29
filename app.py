from pymongo import MongoClient
from flask   import Flask, jsonify, render_template, request

app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.dbnbc


@app.route('/')
def home():
    return render_template('calender.html')


# 날짜 클릭 함수입니다.
@app.route('/click_day', methods=['POST'])
def clickedDay():
    receive_click_date = request.form['dateGive']

    date_data = db.userdata.find_one({'date': receive_click_date})

    if date_data is None:
        resend_date_memo = ""
    else:
        resend_date_memo = date_data['Memo']

    return jsonify({'resend_date_memo': resend_date_memo})
# 날짜 클릭 함수 종료


# 캘린더 메모 변경 함수
@app.route('/change_memo_text', methods=['POST'])
def changedMemo():
    receive_memo = request.form['change_memo_give']
    receive_key_class = request.form['key_class_give']

    date_data = db.userdata.find_one({'date': receive_key_class})

    if date_data is None:
        db.userdata.insert_one({'date': receive_key_class, 'Memo': receive_memo})
    else:
        db.userdata.update_one({'date': receive_key_class}, {'$set': {'Memo': receive_memo}})

    return jsonify(receive_key_class)
# 캘린더 메모 변경 함수 종료

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
