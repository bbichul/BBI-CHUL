import jwt

from my_settings  import SECRET
from functools    import wraps
from flask 		  import request, jsonify
from pymongo       import MongoClient
from bson.objectid import ObjectId

client = MongoClient('localhost', 27017)
db = client.dbnbc

def login_required(func):
    @wraps(func)                   								# 2)
    def decorated_function(*args, **kwargs):
        access_token = request.headers.get('Authorization') 	# 3)
        if access_token:  							# 4)
            token_payload = jwt.decode(access_token, SECRET, algorithms='HS256')

            # if not User.objects.filter(id=token_payload['_id']).exists():
            #     return jsonify({'INVALID_TOKEN'})
            user_id = ObjectId(token_payload['id'])
            user = db.user.find_one({"_id": user_id})
            print(user)
            request.user = user
            return func(*args, **kwargs)

        return jsonify({'msg': "need_login"} ,status = 401) 						# 9)

    return decorated_function