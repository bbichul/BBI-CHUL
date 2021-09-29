import re, bcrypt, jwt

from my_settings import SECRET
from decorator   import login_required
from flask       import Flask, render_template, jsonify, request
from pymongo     import MongoClient

app    = Flask(__name__)
client = MongoClient('localhost', 27017)
db     = client.dbnbc


@app.route('/')
def home():
    return render_template('index.html')


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
        'password': decode_password
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


# 데코레이터 테스트 (추후 삭제 예정)
@app.route('/test', methods=['POST'])
@login_required
def test():
    return jsonify({'msg': 'success decorator'})

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)