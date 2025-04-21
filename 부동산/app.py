# app.py
# 브랜치 테스트트
from flask import Flask, render_template, jsonify, request
import os
import json
from datetime import datetime

# 템플릿 폴더 경로 설정 (template → templates로 변경)
template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "templates"))
app = Flask(__name__, template_folder=template_dir)

# 필요한 데이터를 별도의 JSON 파일로 관리하기 위한 설정
DATA_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(DATA_FOLDER, exist_ok=True)


def get_data_file_path(filename):
    """데이터 파일 경로 반환"""
    return os.path.join(DATA_FOLDER, filename)


def read_data(filename):
    """JSON 데이터 파일 읽기"""
    file_path = get_data_file_path(filename)
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


# 카카오맵 API 키 설정 (환경 변수에서 가져오거나 기본값 사용)
KAKAO_MAP_API_KEY = os.environ.get(
    "KAKAO_MAP_API_KEY", "094498e95b98b4d033b4010264fe98cb"
)


@app.route("/")
def index():
    """메인 페이지 렌더링 - 원페이지 형식 웹 애플리케이션"""
    # 카카오맵 API 키를 템플릿에 전달
    return render_template("public/index.html", kakao_api_key=KAKAO_MAP_API_KEY)


@app.route("/api/property-data", methods=["GET"])
def property_data():
    """부동산 데이터 API (클라이언트 측 JavaScript에서 비동기 호출용)"""
    # 실제 앱에서는 데이터베이스나 외부 API에서 데이터를 가져올 수 있습니다
    property_data = {
        "regions": [
            {"name": "강남구", "avgPrice": 985, "growth": 3.8, "demand": "높음"},
            {"name": "서초구", "avgPrice": 875, "growth": 3.2, "demand": "높음"},
            {"name": "송파구", "avgPrice": 812, "growth": 1.8, "demand": "중간"},
            {"name": "마포구", "avgPrice": 732, "growth": 2.5, "demand": "중간"},
            {"name": "용산구", "avgPrice": 850, "growth": 4.2, "demand": "높음"},
            {"name": "영등포구", "avgPrice": 694, "growth": 4.2, "demand": "중간"},
        ],
        "trending": ["주택 정책", "금리", "도시 개발", "재산세", "스마트홈"],
        "featured": [
            {
                "id": 101,
                "title": "모던 럭셔리 아파트",
                "location": "강남구, 서울",
                "price": 850000000,
                "formattedPrice": "8억 5,000만원",
                "size": 95,
                "type": "아파트",
                "image": "https://readdy.ai/api/search-image?query=modern%20luxury%20apartment%20interior&width=400&height=300&seq=1&orientation=landscape",
                "coordinates": {"lat": 37.5172, "lng": 127.0473},
            },
            {
                "id": 102,
                "title": "리버뷰 레지던스",
                "location": "용산구, 서울",
                "price": 720000000,
                "formattedPrice": "7억 2,000만원",
                "size": 85,
                "type": "아파트",
                "image": "https://readdy.ai/api/search-image?query=contemporary%20apartment%20building%20exterior&width=400&height=300&seq=2&orientation=landscape",
                "coordinates": {"lat": 37.5328, "lng": 126.9902},
            },
            {
                "id": 103,
                "title": "스카이 가든 펜트하우스",
                "location": "서초구, 서울",
                "price": 1250000000,
                "formattedPrice": "12억 5,000만원",
                "size": 150,
                "type": "펜트하우스",
                "image": "https://readdy.ai/api/search-image?query=luxury%20penthouse%20interior&width=400&height=300&seq=3&orientation=landscape",
                "coordinates": {"lat": 37.4837, "lng": 127.0322},
            },
            {
                "id": 104,
                "title": "비즈니스 베이 오피스텔",
                "location": "역삼동, 서울",
                "price": 480000000,
                "formattedPrice": "4억 8,000만원",
                "size": 65,
                "type": "오피스텔",
                "image": "https://readdy.ai/api/search-image?query=modern%20officetel%20exterior&width=400&height=300&seq=4&orientation=landscape",
                "coordinates": {"lat": 37.5013, "lng": 127.0367},
            },
        ],
    }
    return jsonify(property_data)


@app.route("/api/properties-in-bounds", methods=["GET"])
def properties_in_bounds():
    """지도 영역 내의 부동산 데이터 API"""
    # URL 파라미터에서 남서(sw)와 북동(ne) 좌표 가져오기
    sw_lat = request.args.get("swLat", type=float)
    sw_lng = request.args.get("swLng", type=float)
    ne_lat = request.args.get("neLat", type=float)
    ne_lng = request.args.get("neLng", type=float)

    # 파라미터가 누락된 경우 에러 반환
    if None in [sw_lat, sw_lng, ne_lat, ne_lng]:
        return jsonify({"error": "필수 좌표 파라미터가 누락되었습니다"}), 400

    # 샘플 부동산 데이터 (실제 앱에서는 데이터베이스에서 쿼리)
    all_properties = [
        {
            "id": 101,
            "title": "모던 럭셔리 아파트",
            "location": "강남구, 서울",
            "price": "8억 5,000만원",
            "formattedPrice": "8억 5,000만원",
            "size": 95,
            "type": "아파트",
            "coordinates": {"lat": 37.5172, "lng": 127.0473},
        },
        {
            "id": 102,
            "title": "리버뷰 레지던스",
            "location": "용산구, 서울",
            "price": "7억 2,000만원",
            "formattedPrice": "7억 2,000만원",
            "size": 85,
            "type": "아파트",
            "coordinates": {"lat": 37.5328, "lng": 126.9902},
        },
        {
            "id": 103,
            "title": "스카이 가든 펜트하우스",
            "location": "서초구, 서울",
            "price": "12억 5,000만원",
            "formattedPrice": "12억 5,000만원",
            "size": 150,
            "type": "펜트하우스",
            "coordinates": {"lat": 37.4837, "lng": 127.0322},
        },
        {
            "id": 104,
            "title": "비즈니스 베이 오피스텔",
            "location": "역삼동, 서울",
            "price": "4억 8,000만원",
            "formattedPrice": "4억 8,000만원",
            "size": 65,
            "type": "오피스텔",
            "coordinates": {"lat": 37.5013, "lng": 127.0367},
        },
        {
            "id": 105,
            "title": "강남 센트럴 파크 아파트",
            "location": "강남구, 서울",
            "price": "9억 2,000만원",
            "formattedPrice": "9억 2,000만원",
            "size": 110,
            "type": "아파트",
            "coordinates": {"lat": 37.5065, "lng": 127.0533},
        },
        {
            "id": 106,
            "title": "여의도 스카이뷰 오피스텔",
            "location": "영등포구, 서울",
            "price": "5억 5,000만원",
            "formattedPrice": "5억 5,000만원",
            "size": 75,
            "type": "오피스텔",
            "coordinates": {"lat": 37.5256, "lng": 126.9300},
        },
        {
            "id": 107,
            "title": "청담동 럭셔리 빌라",
            "location": "강남구, 서울",
            "price": "15억 원",
            "formattedPrice": "15억 원",
            "size": 180,
            "type": "빌라",
            "coordinates": {"lat": 37.5240, "lng": 127.0533},
        },
    ]

    # 지도 영역 내의 부동산만 필터링
    filtered_properties = [
        prop
        for prop in all_properties
        if (
            sw_lat <= prop["coordinates"]["lat"] <= ne_lat
            and sw_lng <= prop["coordinates"]["lng"] <= ne_lng
        )
    ]

    return jsonify(
        {"properties": filtered_properties, "count": len(filtered_properties)}
    )


@app.route("/api/weather", methods=["GET"])
def weather():
    """날씨 데이터 API (클라이언트 측 JavaScript에서 비동기 호출용)"""
    # 요청 파라미터로 도시 지정 가능
    city = request.args.get("city", "seoul")

    weather_data = {
        "seoul": {
            "current": {
                "temperature": 23,
                "condition": "맑음",
                "humidity": 65,
                "wind": 4.2,
                "airQuality": "보통",
                "icon": "wi-day-sunny",
            },
            "forecast": [
                {
                    "day": "월",
                    "condition": "맑음",
                    "high": 25,
                    "low": 16,
                    "icon": "wi-day-sunny",
                },
                {
                    "day": "화",
                    "condition": "맑음",
                    "high": 26,
                    "low": 17,
                    "icon": "wi-day-sunny",
                },
                {
                    "day": "수",
                    "condition": "구름 조금",
                    "high": 24,
                    "low": 16,
                    "icon": "wi-day-cloudy",
                },
                {
                    "day": "목",
                    "condition": "비",
                    "high": 21,
                    "low": 15,
                    "icon": "wi-rain",
                },
                {
                    "day": "금",
                    "condition": "구름 많음",
                    "high": 22,
                    "low": 15,
                    "icon": "wi-cloudy",
                },
            ],
            "lastUpdated": datetime.now().strftime("%Y-%m-%d %H:%M"),
        },
        "busan": {
            "current": {
                "temperature": 25,
                "condition": "구름 조금",
                "humidity": 70,
                "wind": 5.8,
                "airQuality": "좋음",
                "icon": "wi-day-cloudy",
            },
            "forecast": [
                {
                    "day": "월",
                    "condition": "구름 조금",
                    "high": 26,
                    "low": 18,
                    "icon": "wi-day-cloudy",
                },
                {
                    "day": "화",
                    "condition": "맑음",
                    "high": 27,
                    "low": 19,
                    "icon": "wi-day-sunny",
                },
                {
                    "day": "수",
                    "condition": "맑음",
                    "high": 28,
                    "low": 20,
                    "icon": "wi-day-sunny",
                },
                {
                    "day": "목",
                    "condition": "구름 조금",
                    "high": 26,
                    "low": 19,
                    "icon": "wi-day-cloudy",
                },
                {
                    "day": "금",
                    "condition": "비",
                    "high": 24,
                    "low": 18,
                    "icon": "wi-rain",
                },
            ],
            "lastUpdated": datetime.now().strftime("%Y-%m-%d %H:%M"),
        },
    }

    if city in weather_data:
        return jsonify(weather_data[city])
    else:
        return jsonify({"error": "도시를 찾을 수 없습니다"}), 404


@app.route("/api/crime-data", methods=["GET"])
def crime_data():
    """범죄 데이터 API (클라이언트 측 JavaScript에서 비동기 호출용)"""
    # 지역 필터링 지원
    region = request.args.get("region", None)

    crime_data = {
        "regions": [
            {
                "name": "강남구",
                "crimeIndex": 25,
                "theft": 28,
                "assault": 12,
                "burglary": 9,
                "vandalism": 18,
            },
            {
                "name": "서초구",
                "crimeIndex": 22,
                "theft": 24,
                "assault": 10,
                "burglary": 8,
                "vandalism": 16,
            },
            {
                "name": "송파구",
                "crimeIndex": 30,
                "theft": 32,
                "assault": 15,
                "burglary": 12,
                "vandalism": 22,
            },
            {
                "name": "마포구",
                "crimeIndex": 35,
                "theft": 38,
                "assault": 18,
                "burglary": 14,
                "vandalism": 25,
            },
            {
                "name": "용산구",
                "crimeIndex": 28,
                "theft": 30,
                "assault": 14,
                "burglary": 10,
                "vandalism": 20,
            },
        ],
        "hotspots": [
            {
                "lat": 37.5172,
                "lng": 127.0473,
                "type": "theft",
                "count": 45,
                "area": "강남구 역삼동",
            },
            {
                "lat": 37.5665,
                "lng": 126.9780,
                "type": "assault",
                "count": 18,
                "area": "중구 명동",
            },
            {
                "lat": 37.5113,
                "lng": 127.0980,
                "type": "theft",
                "count": 38,
                "area": "송파구 잠실동",
            },
            {
                "lat": 37.5809,
                "lng": 126.9210,
                "type": "vandalism",
                "count": 25,
                "area": "마포구 홍대입구",
            },
            {
                "lat": 37.4989,
                "lng": 127.0299,
                "type": "burglary",
                "count": 12,
                "area": "강남구 개포동",
            },
        ],
        "statistics": {
            "yearOnYear": -5.2,  # 전년 대비 감소율
            "mostCommon": "절도",
            "safestArea": "서초구",
            "mostDangerousArea": "마포구",
            "crimesByTime": {
                "morning": 15,
                "afternoon": 22,
                "evening": 35,
                "night": 28,
            },
        },
        "lastUpdated": "2025-03-15",
    }

    # 특정 지역 필터링
    if region:
        filtered_data = {
            "regions": [r for r in crime_data["regions"] if r["name"] == region],
            "hotspots": [h for h in crime_data["hotspots"] if region in h["area"]],
            "statistics": crime_data["statistics"],
            "lastUpdated": crime_data["lastUpdated"],
        }
        return jsonify(filtered_data)

    return jsonify(crime_data)


@app.route("/api/news", methods=["GET"])
def news_data():
    """뉴스 데이터 API (클라이언트 측 JavaScript에서 비동기 호출용)"""
    # 카테고리 필터링 지원
    category = request.args.get("category", None)

    news_data = {
        "articles": [
            {
                "id": 1001,
                "title": "새 주택 정책, 시장 활성화 기대",
                "summary": "첫 구매자를 위한 세금 인센티브와 완화된 대출 규정을 포함한 정부의 새로운 주택 정책이 향후 몇 달 동안 시장 활동을 자극할 것으로 예상됩니다.",
                "content": "정부가 발표한 새로운 주택 정책은 첫 주택 구매자에게 취득세 감면 혜택과 주택담보대출 비율(LTV) 완화 등의 혜택을 제공합니다. 이러한 조치는 침체된 부동산 시장을 활성화하고 실수요자들의 주택 구매를 촉진하기 위한 것으로 보입니다. 부동산 전문가들은 이번 정책이 특히 30대 초반 신혼부부와 1인 가구의 주택 구매를 유도할 것으로 예상하고 있습니다.",
                "date": "2025년 4월 18일",
                "author": "김부동",
                "category": "정책",
                "image": "https://readdy.ai/api/search-image?query=modern%20apartment%20building%20with%20glass%20facade&width=300&height=200&seq=2&orientation=landscape",
                "tags": ["주택정책", "세금혜택", "부동산시장"],
            },
            {
                "id": 1002,
                "title": "도심 지역 주요 개발 프로젝트 발표",
                "summary": "주거, 상업, 사무실 공간을 포함하는 복합 단지를 포함하여 도심 지역에 대한 여러 주요 개발 프로젝트가 발표되었습니다.",
                "content": "서울시는 도심 재생 프로젝트의 일환으로 총 5개 구역에 걸친 대규모 개발 계획을 발표했습니다. 이 프로젝트는 주거, 상업, 오피스 공간을 통합한 복합 단지 조성을 목표로 하며, 약 2만 세대의 주택 공급 효과가 있을 것으로 예상됩니다. 특히 용산역 인근 지역은 국제업무지구로 탈바꿈하여 글로벌 기업의 오피스 공간과 고급 주거 시설이 들어설 예정입니다.",
                "date": "2025년 4월 15일",
                "author": "이개발",
                "category": "개발",
                "image": "https://readdy.ai/api/search-image?query=urban%20development%20construction%20site&width=300&height=200&seq=3&orientation=landscape",
                "tags": ["도시개발", "복합단지", "재개발"],
            },
            {
                "id": 1003,
                "title": "2025년 내내 금리 안정 예상",
                "summary": "경제 분석가들은 2025년 내내 금리가 안정적으로 유지될 것으로 예측하여 부동산 투자 및 모기지 자금 조달에 유리한 환경을 제공할 것입니다.",
                "content": "한국은행과 주요 금융기관의 경제 분석가들에 따르면, 2025년 기준금리는 현재 수준에서 큰 변동 없이 유지될 것으로 전망됩니다. 이러한 금리 안정은 부동산 시장에 긍정적인 영향을 미칠 것으로 예상되며, 특히 주택담보대출 금리의 안정화로 실수요자들의 주택 구매 여력이 향상될 전망입니다. 또한 투자자들에게도 예측 가능한 투자 환경을 제공하여 장기 투자 계획 수립에 도움이 될 것입니다.",
                "date": "2025년 4월 10일",
                "author": "박경제",
                "category": "금융",
                "image": "https://readdy.ai/api/search-image?query=real%20estate%20agents%20meeting%20with%20clients&width=300&height=200&seq=4&orientation=landscape",
                "tags": ["금리", "주택담보대출", "투자환경"],
            },
        ],
        "trending": [
            "주택 정책",
            "금리",
            "도시 개발",
            "재산세",
            "스마트홈",
            "친환경 건축",
            "임대시장",
            "외국인 투자",
        ],
        "categories": [
            "정책",
            "개발",
            "금융",
            "시장분석",
            "투자",
            "임대",
            "해외부동산",
        ],
        "featured": {
            "id": 1001,
            "title": "새 주택 정책, 시장 활성화 기대",
            "image": "https://readdy.ai/api/search-image?query=modern%20apartment%20building%20with%20glass%20facade&width=800&height=400&seq=5&orientation=landscape",
        },
    }

    # 카테고리별 필터링
    if category:
        filtered_articles = [
            article
            for article in news_data["articles"]
            if article["category"].lower() == category.lower()
        ]
        filtered_data = {
            "articles": filtered_articles,
            "trending": news_data["trending"],
            "categories": news_data["categories"],
            "featured": news_data["featured"],
        }
        return jsonify(filtered_data)

    return jsonify(news_data)


@app.route("/api/search", methods=["GET"])
def search():
    """통합 검색 API"""
    query = request.args.get("q", "")
    if not query or len(query) < 2:
        return jsonify({"error": "검색어는 2글자 이상이어야 합니다"}), 400

    # 실제 애플리케이션에서는 데이터베이스에서 검색 수행
    search_results = {
        "properties": [
            {
                "id": 101,
                "title": "모던 럭셔리 아파트",
                "location": "강남구, 서울",
                "price": "8억 5,000만원",
                "type": "아파트",
                "matchScore": 0.95,
                "image": "https://readdy.ai/api/search-image?query=modern%20luxury%20apartment%20interior&width=400&height=300&seq=1&orientation=landscape",
                "coordinates": {"lat": 37.5172, "lng": 127.0473},
            },
            {
                "id": 105,
                "title": "강남 센트럴 파크 아파트",
                "location": "강남구, 서울",
                "price": "9억 2,000만원",
                "type": "아파트",
                "matchScore": 0.87,
                "image": "https://readdy.ai/api/search-image?query=luxury%20apartment%20building&width=400&height=300&seq=6&orientation=landscape",
                "coordinates": {"lat": 37.5065, "lng": 127.0533},
            },
        ],
        "news": [
            {
                "id": 1001,
                "title": "새 주택 정책, 시장 활성화 기대",
                "date": "2025년 4월 18일",
                "category": "정책",
            }
        ],
        "regions": [{"name": "강남구", "avgPrice": 985, "growth": 3.8}],
        "coordinates": {"lat": 37.5172, "lng": 127.0473},  # 검색 결과의 중심 좌표
    }

    return jsonify(search_results)


@app.route("/api/geocode", methods=["GET"])
def geocode():
    """주소나 장소 이름으로 위도/경도 좌표 검색"""
    location = request.args.get("location", "")
    if not location:
        return jsonify({"error": "위치를 입력해주세요"}), 400

    # 임시 지오코딩 결과 (실제로는 카카오 또는 구글 Geocoding API 사용)
    geocode_results = {
        "강남구": {"lat": 37.5172, "lng": 127.0473},
        "서초구": {"lat": 37.4837, "lng": 127.0177},
        "송파구": {"lat": 37.5145, "lng": 127.1060},
        "마포구": {"lat": 37.5665, "lng": 126.9018},
        "용산구": {"lat": 37.5384, "lng": 126.9654},
        "영등포구": {"lat": 37.5226, "lng": 126.9100},
        "도곡동": {"lat": 37.4865, "lng": 127.0462},
        "역삼동": {"lat": 37.5013, "lng": 127.0367},
        "삼성동": {"lat": 37.5089, "lng": 127.0566},
        "명동": {"lat": 37.5633, "lng": 126.9838},
    }

    # 위치 검색
    for key, coords in geocode_results.items():
        if key in location:
            return jsonify(
                {"location": location, "coordinates": coords, "status": "SUCCESS"}
            )

    # 결과가 없음
    return jsonify(
        {
            "location": location,
            "coordinates": {"lat": 37.5665, "lng": 126.9780},  # 서울 시청 좌표 (기본값)
            "status": "NOT_FOUND",
        }
    )


@app.errorhandler(404)
def page_not_found(e):
    """404 에러 핸들러 - 원페이지 앱이므로 메인으로 리다이렉트"""
    return render_template("public/index.html"), 404


if __name__ == "__main__":
    app.run(debug=True)