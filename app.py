import re, bcrypt, jwt, pymongo

from datetime import datetime, date, timedelta
from my_settings import SECRET
from decorator import login_required
from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient

app    = Flask(__name__)
client = MongoClient('localhost', 27017)
db     = client.dbnbc

# 시작페이자
@app.route('/')
def index():
    return render_template('start_page.html')


# 메인페이지
@app.route('/main')
def main():
    return render_template('main_page.html')


# 캘린더페이지
@app.route('/calender')
def calender():
    return render_template('calender_page.html')


# 마이페이지
@app.route('/my-page')
def my_page():
    return render_template('my_page.html')

# 팀페이지
@app.route('/team-page')
def team_page():
    return render_template('team_page.html')

# 체크인
@app.route('/check-in', methods=['POST'])
@login_required
def check_in():
    start_time = request.form['start_time']
    status     = request.form['status']
    # year       = request.form['year']
    # month      = request.form['month']
    # day        = request.form['day']
    # week       = request.form['week']

    user_nickname = request.user['nick_name']
    today = date.today()

    # 만약 time 콜렉션에 값이 없으면
    if db.time.find_one({
        'nick_name': user_nickname,
        'year': today.year,
        'month': today.month,
        'day': today.day,
        'weekday': today.weekday()
    }) is None:
        doc = {
            'nick_name': user_nickname,
            'year': today.year,
            'month': today.month,
            'day': today.day,
            'weekday': today.weekday(),
            'status': status,
        }
        db.time.insert_one(doc)

    else:
        db.time.update_one({
            'nick_name': user_nickname,
            'year': today.year,
            'month': today.month,
            'day': today.day,
            'weekday': today.weekday()},
            {'$set': {
            'status': status
        }})
    return jsonify({"msg": f'{start_time}에 {status} 하셨습니다'})


# 체크아웃
@app.route('/check-out', methods=['POST'])
@login_required
def check_out():
    year       = request.form['year']
    month      = request.form['month']
    day        = request.form['day']
    week       = request.form['week']
    stop_time  = request.form['stop_time']
    status     = request.form['status']
    study_time = request.form['study_time'][:8]

    user_nickname = request.user['nick_name']
    today = date.today()

    # 만약 time 콜렉션에 값이 없으면
    db.time.update_one({
        'nick_name': user_nickname,
        'year': today.year,
        'month': today.month,
        'day': today.day,
        'weekday': today.weekday()},
        {'$set': {
            'status': status,
            'study_time': study_time,
        }})
    return jsonify({"msg": f'오늘 총 {study_time} 동안 업무를 진행하셨습니다.'})


# 명언 랜덤 제공 GET
@app.route('/wise', methods=['GET'])
def read_wise_sy():
    wise = list(db.wise_sy.find({}, {'_id': False}))
    return jsonify(wise)


# 회원가입
@app.route('/sign-up', methods=['POST'])
def sign_up():
    nick_name           = request.form['nick_name']
    password            = request.form['password']
    password_validation = re.compile('^[a-zA-Z0-9]{6,}$')

    # 닉네임 중복확인
    if db.user.find_one({'nick_name': nick_name}) is not None:
        return jsonify({'msg': '중복된 닉네임'})

    # 비밀번호 중복확인
    if not password_validation.match(password):
        return jsonify({"msg": "영어 또는 숫자로 6글자 이상으로 작성해주세요"})

    # 비밀번호 암호화
    byte_password   = password.encode("utf-8")
    encode_password = bcrypt.hashpw(byte_password, bcrypt.gensalt())
    decode_password = encode_password.decode("utf-8")
    doc = {
        'nick_name': nick_name,
        'password': decode_password,
        'team': None
    }
    db.user.insert_one(doc)
    return jsonify({'msg': '저장완료'})


# 로그인
@app.route('/login', methods=['POST'])
def login():
    nick_name = request.form['nick_name']
    password  = request.form['password']

    # 닉네임 확인
    user = db.user.find_one({'nick_name': nick_name})
    if user is None:
        return jsonify({"msg": "INVALID_NICKNAME"})

    # 비밀번호 확인
    if not bcrypt.checkpw(password.encode("utf-8"), user['password'].encode("utf-8")):
        return jsonify({"msg": "INVALID_PASSWORD"})

    # JWT 토큰 발행
    access_token = jwt.encode({"id": str(user['_id'])}, SECRET, algorithm="HS256")
    return jsonify({"msg": "SUCCESS", "access_token": access_token}), 201


# 닉네임 중복체크
@app.route('/nickname', methods=['POST'])
def nickname_check():
    nick_name = request.form['nick_name']

    user = db.user.find_one({'nick_name': nick_name})
    if user is None:
        return jsonify({"msg": "사용할 수 있는 닉네임입니다."})
    return jsonify({'msg': '중복되는 닉네임입니다. 다시 입력해주세요.'})


# 날짜 클릭
@app.route('/click_day', methods=['POST'])
@login_required
def clickedDay():
    user_nickname      = request.user['nick_name']
    receive_click_date = request.form['date_give']

    user_data = db.calender.find_one({'nick_name': user_nickname})
    try:
        date_data = user_data['date'][receive_click_date]

        resend_date_memo = date_data

        return jsonify({'resend_date_memo': resend_date_memo})
    except KeyError:
        resend_date_memo = ""
        return jsonify({'resend_date_memo': resend_date_memo})


# 캘린더 메모 변경
@app.route('/change_memo_text', methods=['POST'])
@login_required
def changedMemo():
    user_nickname     = request.user['nick_name']
    receive_memo      = request.form['change_memo_give']
    receive_key_class = request.form['key_class_give']

    user_data = db.calender.find_one({'nick_name': user_nickname})

    if user_data is None:
        db.calender.insert_one({'nick_name': user_nickname})
        db.calender.update_one({'nick_name': user_nickname}, {
            '$set': {f'date.{receive_key_class}': receive_memo}})
    else:
        db.calender.update_one({'nick_name': user_nickname},{
            '$set': {f'date.{receive_key_class}': receive_memo}})
    return jsonify(receive_key_class)

# 팀페이지

# 소속 체크
@app.route('/team', methods=['GET'])
@login_required
def team_check():
    user_nickname = request.user['nick_name']
    user = list(db.user.find({'nick_name': user_nickname}, {'_id': False}))
    return jsonify({'user_data': user})
    # team = db.user.find({'team': {$exists: false}})
    # print(team)
    # if team is not None:
    #     print('b')
    #     return jsonify(team)
    # else:
    #     print('c')
    #     return None

# # 팀 만들기
# @app.route('/create-team', methods=['POST'])
# @login_required
# def create_team():
#     team_name = request.form['team_name']
#
#     # 팀이름 중복확인
#     if db.team.find_one({'team_name': team_name}) is not None:
#         return jsonify({'msg': '중복된 팀명'})
#
#     doc = {
#         'team_name': team_name
#     }
#     db.team.insert_one(doc)
#     return jsonify({'msg': '저장완료'})
#
# # 팀명 중복체크
# @app.route('/teamname', methods=['POST'])
# @login_required
# def teamname_check():
#     team_name = request.form['team_name']
#     team = db.team.find_one({'team_name': team_name})
#     if team is None:
#         return jsonify({"msg": "사용할 수 있는 팀명입니다."})
#     return jsonify({'msg': '중복되는 팀명입니다. 다시 입력해주세요.'})
#

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
