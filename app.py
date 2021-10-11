
import re, bcrypt, jwt, pymongo
import time

import re
import bcrypt
import jwt
import pymongo


from datetime import datetime, date, timedelta
from my_settings import SECRET
from decorator import login_required
from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
import sys
import schedule



app = Flask(__name__)
client = MongoClient('localhost', 27017)
db = client.dbnbc


# 시작페이지
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


# 체크인
@app.route('/check-in', methods=['POST'])
@login_required
def check_in():
    start_time = request.form['start_time']
    status = request.form['status']

    user_nickname = request.user['nick_name']
    today = date.today()

    db.user.update_one({'nick_name': user_nickname}, {'$set': {'status': status}})

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
            'study_time': 0
        }
        db.time.insert_one(doc)

    return jsonify({"msg": f'{start_time}에 {status} 하셨습니다'})


# 체크아웃
@app.route('/check-out', methods=['POST'])
@login_required
def check_out():

    status = request.form['status']
    study_time = request.form['study_time'][:8]

    user_nickname = request.user['nick_name']
    today = date.today()

    db.user.update_one({'nick_name': user_nickname}, {'$set': {'status': status}})

    # study_time.split(':')
    study_hour = int(study_time.split(':')[0])
    study_min = int(study_time.split(':')[1])
    study_sec = int(study_time.split(':')[2])
    total_sec = study_hour*60*60 + study_min*60 + study_sec

    # 만약 time 콜렉션에 값이 없으면

    db.time.update_one({
        'nick_name': user_nickname,
        'year': today.year,
        'month': today.month,
        'day': today.day,
        'weekday': today.weekday()},
        {'$inc': {

            'study_time':  total_sec,
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
    nick_name = request.form['nick_name']
    password = request.form['password']
    password_validation = re.compile('^[a-zA-Z0-9]{6,}$')

    # 닉네임 중복확인
    if db.user.find_one({'nick_name': nick_name}) is not None:
        return jsonify({'msg': '중복된 닉네임'})

    # 비밀번호 중복확인
    if not password_validation.match(password):
        return jsonify({"msg": "영어 또는 숫자로 6글자 이상으로 작성해주세요"})

    # 비밀번호 암호화
    byte_password = password.encode("utf-8")
    encode_password = bcrypt.hashpw(byte_password, bcrypt.gensalt())
    decode_password = encode_password.decode("utf-8")
    doc = {
        'nick_name': nick_name,
        'password': decode_password,
        'status': None,
        'string_start_date': None,
        'string_end_date': None,
        'goal_hour': 0
    }
    db.user.insert_one(doc)
    return jsonify({'msg': '저장완료'})


# 로그인
@app.route('/login', methods=['POST'])
def login():
    nick_name = request.form['nick_name']
    password = request.form['password']

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
    user_nickname = request.user['nick_name']
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
    user_nickname = request.user['nick_name']
    receive_memo = request.form['change_memo_give']
    receive_key_class = request.form['key_class_give']

    user_data = db.calender.find_one({'nick_name': user_nickname})

    if user_data is None:
        db.calender.insert_one({'nick_name': user_nickname})
        db.calender.update_one({'nick_name': user_nickname}, {
            '$set': {f'date.{receive_key_class}': receive_memo}})
    else:
        db.calender.update_one({'nick_name': user_nickname}, {
            '$set': {f'date.{receive_key_class}': receive_memo}})
    return jsonify(receive_key_class)



# 스케쥴러 종료
# def exit():
#     print("function exit")
#     sys.exit()

# 00시 기준 시간 자동 저장
@app.route('/midnight', methods=['POST'])
@login_required
def midnight():
    user_nickname = request.user['nick_name']
    yesterday_study_time = request.form['yesterday_study_time'][:8]
    total_study_time = request.form['total_study_time'][:8]
    status = request.form['status']

    today = date.today()
    yesterday = today - timedelta(days=1)

    yesterday_study_time_list = yesterday_study_time.split(':')
    yesterday_study_time_hour = int(yesterday_study_time_list[0])
    yesterday_study_time_minute = int(yesterday_study_time_list[1])
    yesterday_study_time_second = int(yesterday_study_time_list[2])

    total_study_time_list = total_study_time.split(':')
    today_study_time_hour = int(total_study_time_list[0])
    today_study_time_minute = int(total_study_time_list[1])
    today_study_time_second = int(total_study_time_list[2])

    yesterday_second = (yesterday_study_time_hour * 60 * 60) + \
                       (yesterday_study_time_minute * 60) + yesterday_study_time_second
    total_second = (today_study_time_hour * 60 * 60) + \
                   (today_study_time_minute * 60) + today_study_time_second
    today_second = total_second - yesterday_second

    if db.time.find_one({
        'nick_name': user_nickname,
        'year': yesterday.year,
        'month': yesterday.month,
        'day': yesterday.day,
        'weekday': yesterday.weekday()
    }) is None:
        doc = {
            'nick_name': user_nickname,
            'year': yesterday.year,
            'month': yesterday.month,
            'day': yesterday.day,
            'weekday': yesterday.weekday(),
            'study_time': yesterday_second,
        }
        db.time.insert_one(doc)
        db.user.update_one({'nick_name': user_nickname}, {'$set': {'status': status}})
    else:
        db.time.update_one({
            'nick_name': user_nickname,
            'year': yesterday.year,
            'month': yesterday.month,
            'day': yesterday.day,
            'weekday': yesterday.weekday()},
            {'$inc': {
                'study_time': yesterday_second,
            }})
        db.user.update_one({'nick_name': user_nickname}, {'$set': {'status': status}})

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
            'study_time': today_second,
        }
        db.time.insert_one(doc)
        db.user.update_one({'nick_name': user_nickname}, {'$set': {'status': status}})
    else:
        db.time.update_one({
            'nick_name': user_nickname,
            'year': today.year,
            'month': today.month,
            'day': today.day,
            'weekday': today.weekday()},
            {'$inc': {
                'study_time': today_second,
            }})
        db.user.update_one({'nick_name': user_nickname}, {'$set': {'status': status}})

    return jsonify({'msg': f'success'})

# 10초에 한번씩 실행
# schedule.every(5).seconds.do(job)


# 스케줄러

# while True:
#     schedule.run_pending()
#     time.sleep(1)



# 마이페이지
@app.route('/my-info', methods=['GET'])
@login_required
def get_my_info():
    user_nickname = request.user['nick_name']
    user_data = list(db.time.find({'nick_name': user_nickname}, {'_id': False}))

    sum_study_time = 0
    time_date = 0
    for user_day_data in user_data:
        day_study_time = user_day_data['study_time']
        temp = day_study_time
        sum_study_time += temp
        time_date += 1

    ss = (sum_study_time / time_date)
    study_hours = ss // 3600
    ss = ss - study_hours*3600
    study_minutes = ss // 60
    ss = ss - study_minutes*60
    study_seconds = ss

    avg_study_time = f'{int(study_hours)}시간 {int(study_minutes)}분 {int(study_seconds)}초'

    return jsonify({
        'avg_study_time': avg_study_time,
    })


# 월별 시간그래프
@app.route('/line-graph', methods=['POST'])
@login_required
def post_study_time_graph():
    user_nickname = request.user['nick_name']
    year = int(request.form['year'])
    month = int(request.form['month'])

    monthly_user_data = list(db.time.find({
        'nick_name': user_nickname,
        'year': year,
        'month': month}, {'_id': False}).sort("day", 1))

    # 만약 데이터가 없는 날짜는 0으로 처리한다.
    day_list = []
    day_time_list = []
    for i in range(31):
        day_list.append(i)
        day_time_list.append(0)

    for day in monthly_user_data:
        day_time_list[day['day']] = day['study_time']
    return jsonify({'day_list': day_list, 'day_time_list': day_time_list})


# 요일별평균 공부시간 그래프
@app.route('/bar-graph', methods=['POST'])
@login_required
def post_weekly_avg_graph():
    user_nickname = request.user['nick_name']
    year = int(request.form['year'])
    month = int(request.form['month'])

    weekday_avg_study_time_list = []
    for i in range(7):
        weekday_user_data = list(db.time.find({
            'nick_name': user_nickname,
            'year': year,
            'month': month,
            'weekday': i}, {'_id': False}))

        # 만약 데이터가 없는 날짜는 0으로 처리한다.
        weekday_avg_study_time_list.append(0)

        # 평균구하기
        weekday_sum = 0
        day_count = 0
        for day in weekday_user_data:
            weekday_sum += int(day['study_time'])
            day_count += 1

        try:
            weekday_avg_study_time = weekday_sum // day_count
        except ZeroDivisionError:
            weekday_avg_study_time = 0
        weekday_avg_study_time_list[i] = weekday_avg_study_time

    return jsonify({
        'monday': weekday_avg_study_time_list[0],
        'tuesday': weekday_avg_study_time_list[1],
        'wednesday': weekday_avg_study_time_list[2],
        'thursday': weekday_avg_study_time_list[3],
        'friday': weekday_avg_study_time_list[4],
        'saturday': weekday_avg_study_time_list[5],
        'sunday': weekday_avg_study_time_list[6],
    })


# 공부목표시간 데이터 받기
@app.route('/goal', methods=['POST'])
@login_required
def post_goal_modal():
    user_nickname = request.user['nick_name']
    string_start_date = request.form['string_start_date']
    string_end_date = request.form['string_end_date']
    goal_hour = int(request.form['goal_hour'])

    db.user.update_one({'nick_name': user_nickname}, {'$set': {
        'string_start_date': string_start_date,
        'string_end_date': string_end_date,
        'goal_hour': goal_hour
    }})

    return jsonify({'msg': '성공'})


# 공부목표시간 데이터 보내주기
@app.route('/goal', methods=['GET'])
@login_required
def get_goal_modal():
    user_nickname = request.user['nick_name']
    user_data = db.user.find_one({'nick_name': user_nickname})

    string_start_date = user_data['string_start_date']
    string_end_date = user_data['string_end_date']
    goal_hour = user_data['goal_hour']

    # 그사이에 있는 날짜들을 불러와야됨
    start_date = datetime.strptime(string_start_date, "%Y-%m-%d")
    end_date = datetime.strptime(string_end_date, "%Y-%m-%d")
    dates = [(start_date + timedelta(days=i)).strftime("%Y-%m-%d") for i in range((end_date-start_date).days+1)]

    study_time_sum = 0
    for i in dates:
        data_split_list = i.split('-')
        year = int(data_split_list[0])
        month = int(data_split_list[1])
        day = int(data_split_list[2])

        user_time_data = db.time.find_one({
            'nick_name': user_nickname,
            'year': year,
            'month': month,
            'day': day})

        if user_time_data is None:
            continue

        study_time_sum += user_time_data['study_time']
    done_hour = study_time_sum // 3600

    return jsonify({
        'string_start_date': string_start_date,
        'string_end_date': string_end_date,
        'goal_hour': goal_hour,
        'done_hour': done_hour
    })


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)

