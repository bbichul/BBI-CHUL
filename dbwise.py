from pymongo import MongoClient
from bs4 import BeautifulSoup
import requests

client = MongoClient('localhost', 27017)  # mongoDB는 27017 포트로 돌아갑니다.
db = client.dbnbc


headers = {'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'}
data = requests.get('https://search.naver.com/search.naver?where=nexearch&sm=tab_etc&mra=blMy&qvt=0&query=%EA%B3%B5%EB%B6%80%20%EB%AA%85%EC%96%B8',headers=headers)

soup = BeautifulSoup(data.text, 'html.parser')

wise_sy = soup.select('#main_pack > section.sc_new.cs_famous > div > div.api_cs_wrap._famous_saying > div.cnt_box > ul')

for wise_syg in wise_sy:
    p_tag = wise_syg.select_one('li > div > div > p.lngkr')
    a_tag = wise_syg.select_one('li > div > dl > dt > a')
    if p_tag is not None:
        saying = p_tag.text
        name = a_tag.text
        doc = {
            'wise_sy': saying,
            'sy_name': name,
        }
        db.wise_sy.insert_one(doc)