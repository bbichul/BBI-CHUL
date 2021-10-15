import jwt
import os

from my_settings import SECRET
from functools import wraps
from flask import request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId

# SECRET = (os.environ.get("SECRET"))
# client = MongoClient(os.environ.get("MONGO_DB_PATH"))
client = MongoClient('localhost', 27017)
db = client.bbichulDB


def login_required(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        try:
            access_token = request.headers.get('Authorization')

            # 로그인한 사용자
            if access_token:
                token_payload = jwt.decode(access_token, SECRET, algorithms='HS256')

                # request.user 에 로그인한 사용자 정보 생성
                user_id = ObjectId(token_payload['id'])
                user = db.user.find_one({"_id": user_id})
                # team = db.team.find_one({"_id": team_id})
                request.user = user
                # request.team = team

                return func(*args, **kwargs)

            # 로그인 하지 않은 사용자
            return jsonify({'msg': "need_login"})

        # 정상적이지 않은 토큰이 들오올시
        except jwt.DecodeError:
            return jsonify({'msg': "need_login"})

    return decorated_function