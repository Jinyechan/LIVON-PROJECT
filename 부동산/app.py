# app.py

from flask import Flask, render_template, jsonify, request
import requests
import xml.etree.ElementTree as ET
from datetime import datetime
import json

app = Flask(__name__)

# 공공데이터포털 API 키
REALTRADING_API_KEY = 'S/1Gqx+pk+3dioHedGdoVI2fg3tdrEFyHYX6fhHWP0ZGmHdlJSidYxf22GwfHvuB6nW0ycYF4P8fIgNJR3EPEg=='
REALTRADING_ENDPOINT = 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade'

# 지역코드 매핑 (일부 지역 예시)
REGION_CODE_MAP = {
    '강남구': '11680',
    '서초구': '11650',
    '송파구': '11710',
    '마포구': '11440',
    '용산구': '11170',
    '종로구': '11110',
    '중구': '11140',
    '성북구': '11290',
    '강동구': '11740',
    '광진구': '11260'
}

# 메인 라우트 - 리브온 부동산 첫 페이지
@app.route('/')
def index():
    return render_template('index.html')

# 부동산 데이터 API
@app.route('/api/property-data')
def property_data():
    # 실제 구현에서는 DB에서 데이터를 가져오거나 다른 API를 호출할 수 있음
    # 지금은 샘플 데이터 반환
    return jsonify({
        'success': True,
        'message': '데이터 로드 성공',
        'properties': get_sample_properties()
    })

# 영역 내 부동산 조회 API
@app.route('/api/properties-in-bounds')
def properties_in_bounds():
    sw_lat = float(request.args.get('swLat', 37.4))
    sw_lng = float(request.args.get('swLng', 126.8))
    ne_lat = float(request.args.get('neLat', 37.7))
    ne_lng = float(request.args.get('neLng', 127.1))
    
    # 주어진 영역 내의 매물 가져오기
    properties = get_sample_properties(sw_lat, sw_lng, ne_lat, ne_lng)
    
    return jsonify({
        'success': True,
        'properties': properties
    })

# 주변 부동산 조회 API
@app.route('/api/properties-nearby')
def properties_nearby():
    lat = float(request.args.get('lat', 37.5665))
    lng = float(request.args.get('lng', 126.9780))
    radius = float(request.args.get('radius', 2))
    
    # 반경을 위도/경도 범위로 변환
    lat_delta = radius / 111  # 위도 1도는 약 111km
    lng_delta = radius / (111 * (lat * 3.14159 / 180))  # 경도 1도는 위도에 따라 달라짐
    
    sw_lat = lat - lat_delta
    sw_lng = lng - lng_delta
    ne_lat = lat + lat_delta
    ne_lng = lng + lng_delta
    
    # 주어진 반경 내의 매물 가져오기
    properties = get_sample_properties(sw_lat, sw_lng, ne_lat, ne_lng, lat, lng, radius)
    
    return jsonify({
        'success': True,
        'properties': properties
    })

# 위치 검색 API
@app.route('/api/search')
def search():
    query = request.args.get('q', '')
    
    if not query or len(query) < 2:
        return jsonify({
            'success': False,
            'message': '검색어는 2글자 이상이어야 합니다',
            'results': []
        })
    
    # 실제 구현에서는 DB나 외부 API를 통해 검색
    # 여기서는 간단한 샘플 결과 반환
    results = [
        {'id': 1, 'name': f'{query} 아파트', 'address': f'서울특별시 강남구 {query}동'},
        {'id': 2, 'name': f'{query} 오피스텔', 'address': f'서울특별시 서초구 {query}로'},
        {'id': 3, 'name': f'{query} 빌라', 'address': f'서울특별시 마포구 {query}길'}
    ]
    
    return jsonify({
        'success': True,
        'results': results
    })

# 지오코딩 API
@app.route('/api/geocode')
def geocode():
    location = request.args.get('location', '')
    
    if not location:
        return jsonify({
            'success': False,
            'message': '위치를 입력해주세요'
        })
    
    # 실제 구현에서는 카카오맵이나 네이버맵 API 등을 통해 지오코딩
    # 여기서는 간단한 샘플 결과 반환
    result = {
        'lat': 37.5665,
        'lng': 126.9780,
        'address': f'서울특별시 {location}'
    }
    
    return jsonify({
        'success': True,
        'result': result
    })

# 날씨 데이터 API
@app.route('/api/weather')
def weather():
    city = request.args.get('city', 'seoul')
    
    # 실제 구현에서는 외부 날씨 API를 호출
    # 여기서는 샘플 데이터 반환
    weather_data = {
        'city': city,
        'temperature': 22,
        'description': '맑음',
        'humidity': 65,
        'wind': 3.5,
        'icon': 'clear-day'
    }
    
    return jsonify({
        'success': True,
        'data': weather_data
    })

# 뉴스 데이터 API
@app.route('/api/news')
def news():
    category = request.args.get('category')
    
    # 실제 구현에서는 외부 뉴스 API를 호출
    # 여기서는 샘플 데이터 반환
    news_items = [
        {
            'title': '서울 아파트 가격 동향',
            'description': '최근 서울 아파트 가격이 상승세를 보이고 있습니다.',
            'source': '부동산 신문',
            'url': '#',
            'published': '2025-04-20T12:00:00Z'
        },
        {
            'title': '부동산 정책 변화 예상',
            'description': '정부의 새로운 부동산 정책이 발표될 예정입니다.',
            'source': '경제 일보',
            'url': '#',
            'published': '2025-04-19T15:30:00Z'
        },
        {
            'title': '서울 강남권 오피스텔 공급 증가',
            'description': '강남구와 서초구 일대의 오피스텔 공급이 증가하고 있습니다.',
            'source': '부동산 뉴스',
            'url': '#',
            'published': '2025-04-18T09:15:00Z'
        }
    ]
    
    if category:
        news_items = [item for item in news_items if category.lower() in item['title'].lower()]
    
    return jsonify({
        'success': True,
        'news': news_items
    })

# 범죄 데이터 API
@app.route('/api/crime-data')
def crime_data():
    region = request.args.get('region')
    
    # 실제 구현에서는 외부 API 또는 DB에서 데이터 조회
    # 여기서는 샘플 데이터 반환
    crime_stats = [
        {'type': '강도', 'count': 25, 'year': 2024, 'region': '강남구'},
        {'type': '절도', 'count': 152, 'year': 2024, 'region': '강남구'},
        {'type': '폭행', 'count': 78, 'year': 2024, 'region': '강남구'},
        {'type': '사기', 'count': 205, 'year': 2024, 'region': '강남구'},
        {'type': '살인', 'count': 3, 'year': 2024, 'region': '강남구'}
    ]
    
    if region:
        crime_stats = [stat for stat in crime_stats if region in stat['region']]
    
    return jsonify({
        'success': True,
        'data': crime_stats
    })

# 아파트 실거래가 API
@app.route('/api/realtrading')
def realtrading():
    region_name = request.args.get('region', '강남구')
    region_code = get_region_code(region_name)
    year_month = request.args.get('yearMonth', get_last_month())
    
    try:
        data = fetch_apartment_trade_data(region_code, year_month)
        if not data:
            return jsonify({
                'success': False,
                'message': '조회된 실거래 데이터가 없습니다.',
                'data': []
            })
        
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e),
            'data': []
        })

# 현재 날짜 기준으로 이전 달의 데이터를 조회하기 위한 함수
def get_last_month():
    today = datetime.now()
    if today.month == 1:
        year = today.year - 1
        month = 12
    else:
        year = today.year
        month = today.month - 1
    
    return f"{year}{month:02d}"

# 지역명으로 지역코드를 가져오는 함수
def get_region_code(region_name):
    # 기본값은 강남구로 설정
    if not region_name:
        return '11680'
    
    # 지역명에 '구'가 없으면 추가
    if not region_name.endswith('구'):
        region_name = region_name + '구'
    
    # 지역코드 맵에서 찾기
    return REGION_CODE_MAP.get(region_name, '11680')

# 아파트 매매 실거래가 API 요청을 보내는 함수
def fetch_apartment_trade_data(lawd_cd, deal_ymd):
    url = f"{REALTRADING_ENDPOINT}/getRTMSDataSvcAptTrade"
    params = {
        'serviceKey': REALTRADING_API_KEY,
        'LAWD_CD': lawd_cd,
        'DEAL_YMD': deal_ymd,
        'numOfRows': '10000',
        'pageNo': '1'
    }
    
    try:
        response = requests.get(url, params=params)
        if response.status_code != 200:
            raise Exception(f"API 요청 실패: {response.status_code}")
        
        # XML 응답 파싱
        trade_data = parse_xml(response.text)
        return trade_data
    except Exception as e:
        app.logger.error(f"데이터 가져오기 실패: {str(e)}")
        return None

# XML 응답을 파싱하는 함수
def parse_xml(xml_string):
    try:
        root = ET.fromstring(xml_string)
        
        # 응답 코드 확인
        result_code = root.find(".//resultCode")
        if result_code is not None and result_code.text != '00':
            result_msg = root.find(".//resultMsg")
            result_msg_text = result_msg.text if result_msg is not None else '알 수 없는 오류'
            raise Exception(f"API 오류: {result_code.text} - {result_msg_text}")
        
        # 아파트 거래 데이터 추출
        items = root.findall(".//item")
        trade_data = []
        
        for item in items:
            apartment_name = item.find('아파트')
            dong = item.find('법정동')
            deal_amount = item.find('거래금액')
            build_year = item.find('건축년도')
            deal_year = item.find('년')
            deal_month = item.find('월')
            deal_day = item.find('일')
            area = item.find('전용면적')
            floor = item.find('층')
            
            trade_data.append({
                'apartmentName': apartment_name.text if apartment_name is not None else '',
                'dong': dong.text if dong is not None else '',
                'dealAmount': deal_amount.text.strip() if deal_amount is not None else '',
                'buildYear': build_year.text if build_year is not None else '',
                'dealYear': deal_year.text if deal_year is not None else '',
                'dealMonth': deal_month.text if deal_month is not None else '',
                'dealDay': deal_day.text if deal_day is not None else '',
                'area': area.text if area is not None else '',
                'floor': floor.text if floor is not None else ''
            })
        
        return trade_data
    except Exception as e:
        app.logger.error(f"XML 파싱 실패: {str(e)}")
        raise e

# 샘플 매물 데이터 생성 함수 (API 실패시 사용)
def get_sample_properties(sw_lat=None, sw_lng=None, ne_lat=None, ne_lng=None, center_lat=None, center_lng=None, radius=None):
    import random
    
    # 기본 위치 값 설정 (서울)
    if not all([sw_lat, sw_lng, ne_lat, ne_lng]):
        sw_lat, sw_lng = 37.4, 126.8
        ne_lat, ne_lng = 37.7, 127.1
    
    # 중심점이 없으면 영역의 중심으로 계산
    if not center_lat or not center_lng:
        center_lat = (sw_lat + ne_lat) / 2
        center_lng = (sw_lng + ne_lng) / 2
    
    # 임의의 샘플 매물 생성 (5~10개)
    count = random.randint(5, 10)
    properties = []
    
    property_types = ['아파트', '오피스텔', '빌라', '단독주택', '상가']
    areas = ['강남구', '서초구', '용산구', '마포구', '송파구', '종로구', '중구', '성북구']
    
    for i in range(count):
        # 주어진 중심에서 랜덤한 위치 생성 (반경 내)
        distance = random.random() * (radius or 2) * 0.8  # 80%까지의 반경
        angle = random.random() * 2 * 3.14159  # 0~360도 (라디안)
        
        # 극좌표를 직교좌표로 변환
        lat_offset = distance * (lat_delta := (distance * math.cos(angle) / 111))
        lng_offset = distance * (lng_delta := (distance * math.sin(angle) / (111 * math.cos(center_lat * 3.14159 / 180))))
        
        lat = center_lat + lat_offset
        lng = center_lng + lng_offset
        
        # 임의 가격 생성 (1억~15억)
        price = random.randint(100, 1500)
        
        if price >= 10000:
            uk = price // 10000
            man = price % 10000
            formatted_price = f"{uk}억 {man if man > 0 else ''}만원"
        else:
            formatted_price = f"{price}만원"
        
        # 임의 면적 생성 (20~200㎡)
        area = random.randint(20, 200)
        
        # 물건 유형 선택
        prop_type = random.choice(property_types)
        
        # 지역 선택
        area_name = random.choice(areas)
        
        properties.append({
            'id': f"property-{int(datetime.now().timestamp())}-{i}",
            'title': f"{area_name} {prop_type} {i+1}호",
            'description': f"{area_name}에 위치한 {prop_type}입니다. 역세권, 편의시설 인접.",
            'price': price * 10000,  # 실제 가격 (원)
            'formattedPrice': formatted_price,
            'area': f"{area}㎡",
            'type': prop_type,
            'location': f"{area_name}, 서울",
            'coordinates': {
                'lat': lat,
                'lng': lng
            },
            'imageUrl': f"https://via.placeholder.com/400x300?text={prop_type}",
            'features': ['주차가능', '역세권', '신축건물'],
            'contact': '02-123-4567'
        })
    
    return properties

# 누락된 math 모듈 임포트 추가
import math

if __name__ == '__main__':
    app.run(debug=True)