import os
import re
import bcrypt
import jwt

# from flask_cors import CORS
from datetime import datetime, date, timedelta
from decorator import login_required
from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
from my_settings import SECRET

# SECRET = (os.environ.get("SECRET"))
# client = MongoClient(os.environ.get("MONGO_DB_PATH"))
client = MongoClient('localhost', 27017)
db = client.bbichulDB

application = Flask(__name__)
# cors = CORS(application, resources={r"/*": {"origins": "*"}})


# 시작페이지
@application.route('/')
def index():
    return render_template('start_page.html')


# 메인페이지
@application.route('/main')
def main():
    return render_template('main_page.html')


# 캘린더페이지
@application.route('/calender')
def calender():
    return render_template('calender_page.html')


# 마이페이지
@application.route('/my-page')
def my_page():
    return render_template('my_page.html')


# 팀페이지
@application.route('/team-page')
def team_page():
    return render_template('team_page.html')


# 체크인
@application.route('/check-in', methods=['POST'])
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
@application.route('/check-out', methods=['POST'])
@login_required
def check_out():
    status = request.form['status']
    study_time = request.form['study_time'][:8]

    user_nickname = request.user['nick_name']
    today = date.today()

    db.user.update_one({'nick_name': user_nickname}, {'$set': {'status': status}})

    study_hour = int(study_time.split(':')[0])
    study_min = int(study_time.split(':')[1])
    study_sec = int(study_time.split(':')[2])
    total_sec = study_hour * 60 * 60 + study_min * 60 + study_sec

    # 만약 time 콜렉션에 값이 없으면
    db.time.update_one({
        'nick_name': user_nickname,
        'year': today.year,
        'month': today.month,
        'day': today.day,
        'weekday': today.weekday()},
        {'$inc': {
            'study_time': total_sec,
        }})

    return jsonify({"msg": f'오늘 총 {study_time} 동안 업무를 진행하셨습니다.'})


# 명언 랜덤 제공 GET
@application.route('/wise', methods=['GET'])
def read_wise_sy():
    wise = list(db.wise_sy.find({}, {'_id': False}))
    return jsonify(wise)


# 회원가입
@application.route('/sign-up', methods=['POST'])
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
        'status': "퇴근",
        'team': None,
        'string_start_date': None,
        'string_end_date': None,
        'goal_hour': 0
    }
    db.user.insert_one(doc)
    return jsonify({'msg': '저장완료'})


# 로그인
@application.route('/login', methods=['POST'])
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
@application.route('/nickname', methods=['POST'])
def nickname_check():
    nick_name = request.form['nick_name']

    user = db.user.find_one({'nick_name': nick_name})
    if user is None:
        return jsonify({"msg": "사용할 수 있는 닉네임입니다."})
    return jsonify({'msg': '중복되는 닉네임입니다. 다시 입력해주세요.'})


# 캘린더 페이지 진입 시 개인정보를 가져옴.
@application.route('/get-info', methods=['GET'])
@login_required
def get_info():
    login_user = request.user['nick_name']

    find_user_id = db.user.find_one({'nick_name': login_user})

    is_include_team = 0
    nick_name = find_user_id.get('nick_name')  # 유저 이름을 검색합니다.
    team_name = find_user_id.get('team')  # 팀 이름을 검색합니다.

    user_info = {
        'nick_name': nick_name
    }

    # 유저 정보로 캘린더 검색
    find_cal_private = db.calender.find_one({'nick_name': nick_name})
    find_cal_team = db.calenderTeam.find_one({'team_name': team_name})
    # 개인캘린더가 없을 시 하나 추가
    if find_cal_private is None:
        db.calender.insert_one({'nick_name': nick_name, 'calender_count': 1, 'private_cal1': {}})

    # 유저정보에 팀이 없다면 개인 캘린더만 가짐
    if team_name is None:
        user_info['is_include_team'] = is_include_team
    else:
        # 유저정보에 팀이 있다면 넘겨줄 유저 인포에 팀 이름을 추가함
        is_include_team = 1
        user_info['is_include_team'] = is_include_team
        user_info['team_name'] = team_name
        # 해당 팀 이름으로 팀 캘린더 목록을 찾아서 없으면 캘린더를 하나 생성함.
        if find_cal_team is None:
            db.calenderTeam.insert_one({'team_name': team_name, 'calender_count': 1, 'team_cal1': {}})
            find_cal_team = db.calenderTeam.find_one({'team_name': team_name})

    # 캘린더 DB에 정보가 있는지 검색
    calender_info = []
    for index_cal_private in find_cal_private:
        if 'private_cal' in index_cal_private:
            calender_info.append(index_cal_private)

    if team_name is not None:
        for index_cal_team in find_cal_team:
            if 'team_cal' in index_cal_team:
                calender_info.append(index_cal_team)

    user_info['calender_info'] = calender_info

    return jsonify(user_info)


# 달력 추가하기 함수
@application.route('/add-calender', methods=['POST'])
@login_required
def add_calender():
    is_private = request.form['isPrivate_give']
    login_user = request.user['nick_name']

    # 로그인 DB 확인하여 아이디와, 팀명 조회
    find_db_id = db.user.find_one({'nick_name': login_user})

    nick_name = find_db_id['nick_name']
    team_name = find_db_id['team']

    # JS로부터 넘겨받은 is_private가 1이면 개인 달력 추가
    if is_private == '1':
        find_private = db.calender.find_one({'nick_name': nick_name})
        calender_count = find_private['calender_count'] + 1

        db.calender.update_one({'nick_name': nick_name}, {
            '$set': {'calender_count': calender_count, f'private_cal{calender_count}': {}}})
    elif is_private == '0':
        # is_private가 0이면 개인 달력 추가
        find_team = db.calenderTeam.find_one({'team_name': team_name})
        calender_count = find_team['calender_count'] + 1

        db.calenderTeam.update_one({'team_name': team_name}, {
            '$set': {'calender_count': calender_count, f'team_cal{calender_count}': {}}})

    return jsonify({'msg': '캘린더가 추가 되었습니다.'})


# 메모 가져와서 달력과 메모 연동.
@application.route('/take-memo', methods=['POST'])
@login_required
def get_calender_memo():
    # 캘린더 타입 받아옴.
    calender_type = request.form['select_cal_give'][:1]
    calender_num = request.form['select_cal_give'][1:2]

    login_user = request.user['nick_name']

    # 로그인 DB 확인하여 아이디와, 팀명 조회
    find_db_id = db.user.find_one({'nick_name': login_user})

    nick_name = find_db_id['nick_name']
    team_name = find_db_id['team']

    # 유저 정보로 캘린더 검색
    find_cal_private = db.calender.find_one({'nick_name': nick_name})
    find_cal_team = db.calenderTeam.find_one({'team_name': team_name})

    content_text = ''
    if calender_type == 'T':
        calender_name = "team_cal" + calender_num
        content_text = find_cal_team[calender_name]
    elif calender_type == 'P':
        calender_name = "private_cal" + calender_num
        content_text = find_cal_private[calender_name]

    return jsonify({'give_text': content_text})


# 날짜 클릭
@application.route('/click-day', methods=['POST'])
@login_required
def clicked_day():
    # 캘린더 타입 받아옴.
    calender_type = request.form['select_cal_give'][:1]
    calender_num = request.form['select_cal_give'][1:2]
    receive_click_date = request.form['date_give']

    login_user = request.user['nick_name']

    # 로그인 DB 확인하여 아이디와, 팀명 조회
    find_db_id = db.user.find_one({'nick_name': login_user})

    nick_name = find_db_id['nick_name']
    team_name = find_db_id['team']

    # 유저 정보로 캘린더 검색
    find_cal_private = db.calender.find_one({'nick_name': nick_name})
    find_cal_team = db.calenderTeam.find_one({'team_name': team_name})

    if calender_type == 'T':
        calender_name = "team_cal" + calender_num
        content_text = find_cal_team[calender_name]
    elif calender_type == 'P':
        calender_name = "private_cal" + calender_num
        content_text = find_cal_private[calender_name]

    if receive_click_date not in content_text:
        resend_date_memo = ""
    else:
        resend_date_memo = content_text.get(receive_click_date)
    return jsonify({'resend_date_memo': resend_date_memo})


# 캘린더 메모 변경
@application.route('/change-memo-text', methods=['POST'])
@login_required
def changed_memo():
    calender_type = request.form['select_cal_give'][:1]
    calender_num = request.form['select_cal_give'][1:2]

    receive_memo = request.form['change_memo_give']
    receive_key_class = request.form['key_class_give']
    login_user = request.user['nick_name']

    # 로그인 DB 확인하여 아이디와, 팀명 조회
    find_db_id = db.user.find_one({'nick_name': login_user})

    nick_name = find_db_id['nick_name']
    team_name = find_db_id['team']

    if calender_type == 'T':
        calender_name = "team_cal" + calender_num
        db.calenderTeam.update_one({'team_name': team_name}, {
            '$set': {f'{calender_name}.{receive_key_class}': receive_memo}})
    elif calender_type == 'P':
        calender_name = "private_cal" + calender_num
        db.calender.update_one({'nick_name': nick_name}, {
            '$set': {f'{calender_name}.{receive_key_class}': receive_memo}})

    return jsonify({'msg' : '메모가 저장 되었습니다.'})


# 00시 기준 시간 자동 저장 및 전날 공부시간 유무로 db 저장 변경
@application.route('/midnight', methods=['POST'])
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


# 마이페이지
@application.route('/my-info', methods=['GET'])
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
    ss = ss - study_hours * 3600
    study_minutes = ss // 60
    ss = ss - study_minutes * 60
    study_seconds = ss

    avg_study_time = f'{int(study_hours)}시간 {int(study_minutes)}분 {int(study_seconds)}초'

    return jsonify({
        'avg_study_time': avg_study_time,
    })


# 월별 시간그래프
@application.route('/line-graph', methods=['POST'])
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
@application.route('/bar-graph', methods=['POST'])
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
@application.route('/goal', methods=['POST'])
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
@application.route('/goal', methods=['GET'])
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
    dates = [(start_date + timedelta(days=i)).strftime("%Y-%m-%d") for i in range((end_date - start_date).days + 1)]

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


# 팀페이지
# 소속 체크
@application.route('/team', methods=['GET'])
@login_required
def team_check():
    user_nickname = request.user['nick_name']
    user = list(db.user.find({'nick_name': user_nickname}, {'_id': False}))
    return jsonify({'user_data': user})


# 팀 만들기
@application.route('/create-team', methods=['POST'])
@login_required
def create_team():
    user_nickname = request.user['nick_name']
    team_name = request.form['team']
    # 팀이름 중복확인
    if db.team.find_one({'team': team_name}) is not None:
        return jsonify({'msg': '중복된 팀이름입니다.'})

    doc = {
        'team': team_name,
        'user': user_nickname,
        'position': "팀장"
    }
    db.team.insert_one(doc)
    db.user.update_one({'nick_name': user_nickname}, {'$set': {'team': team_name}})

    return jsonify({'msg': '팀 만들기 완료'})

# 팀명 중복체크
@application.route('/teamname', methods=['POST'])
@login_required
def team_name_check():
    team_name = request.form['team']
    team = db.user.find_one({'team': team_name})

    if team is None:
        return jsonify({"msg": '사용할 수 있는 팀 이름입니다.'})

    return jsonify({'msg': '중복되는 팀 이름입니다. 다시 입력해주세요.'})

# 팀에 초대됐을 때
@application.route('/invite-team', methods=['POST'])
@login_required
def invite_team():
    user_nickname = request.user['nick_name']
    team_name = request.form['team']

    if db.user.find_one({'team': team_name}) is not None:
        doc = {
            'team': team_name,
            'user': user_nickname,
            'position': "팀원"
        }
        db.team.insert_one(doc)
        db.user.update_one({'nick_name': user_nickname}, {'$set': {'team': team_name}})
        return jsonify({"msg": '초대받은 팀에 가입되었습니다.'})

    return jsonify({'msg': '존재하지 않는 팀입니다. 팀 이름을 확인해주세요.'})

# 유저 소속팀 이름 가져오기
@application.route('/get-teamname', methods=['GET'])
@login_required
def get_team_name():
    user_nickname = request.user['nick_name']
    user = list(db.user.find({'nick_name': user_nickname}, {'_id': False}))
    return jsonify({'user_data': user})


# 할 일 저장
@application.route('/team-todo', methods=['POST'])
@login_required
def save_task():
    team_name = request.form['team']
    task = request.form['task']

    doc = {
        'team': team_name,
        'task': task,
        'done': 'false'
    }

    db.team_task.insert_one(doc)

    return jsonify({'msg': 'task 저장 완료'})


# 할 일 보여주기
@application.route('/task-show', methods=['GET'])
@login_required
def show_task():
    teamname = request.user['team']
    tasks = list(db.team_task.find({'team': teamname}, {'_id': False}))
    return jsonify({"tasks": tasks})


# 할 일 삭제
@application.route('/task-delete', methods=['POST'])
@login_required
def delete_task():
    team = request.form['team']
    task = request.form['task']
    db.team_task.delete_one({'team': team, 'task': task})
    return {"result": "success"}


# 할 일 완료
@application.route('/change-done', methods=['POST'])
@login_required
def change_done():
    team = request.form['team']
    task = request.form['task']
    done = request.form['done']
    if done == "false":
        db.team_task.update({'team': team, 'task': task}, {'$set': {'done': "true"}})
    else:
        db.team_task.update({'team': team, 'task': task}, {'$set': {'done': "false"}})

    return {"result": "success"}


# 출결 상태 확인
@application.route('/check-status', methods=['GET'])
@login_required
def check_status():
    team = request.user['team']
    user = list(db.user.find({'team': team}, {'_id': False}))
    return jsonify({'user_data': user})


if __name__ == '__main__':
    application.run('0.0.0.0', port=5000, debug=True)
