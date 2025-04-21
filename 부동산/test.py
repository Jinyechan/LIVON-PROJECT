import requests

# 1) 발급받은 서비스 키를 입력하세요
SERVICE_KEY = 'uhvHNYHQT4qsZSk0zH6McWDi5r4rplFkeJZU8LGqPJaaS%2FWB3NSJfDiLgeGSCTDtAv%2FFW5H1fPJpAOB5bHGRDA%3D%3D'

# 2) 테스트할 API 엔드포인트 (아파트 매매 실거래가)
BASE_URL = 'https://api.odcloud.kr/api/15083803/v1/uddi:04e7fcee-3162-40ae-90e9-b1330f2e9b1330f2e9b11'

# 3) 요청 파라미터 설정
params = {
    'serviceKey': SERVICE_KEY,  # 필수: 인증키
    'LAWD_CD': '11110',         # 법정동 코드 (예: 서울 종로구)
    'DEAL_YMD': '202501',       # 계약년월 (예: 2025년 1월)
    'page': 1,                  # 페이지 번호
    'perPage': 10,              # 한 페이지 결과 수
    'returnType': 'JSON'        # JSON 또는 XML
}

# 4) API 호출 및 결과 확인
response = requests.get(BASE_URL, params=params)
if response.status_code == 200:
    data = response.json()
    print(data)
else:
    print(f'Error: {response.status_code}', response.text)
