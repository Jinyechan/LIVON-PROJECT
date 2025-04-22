// static/js/api.js

// 부동산 데이터 로드 함수
function loadPropertyData() {
    return fetch("/api/property-data")
        .then(response => response.json())
        .catch(error => {
            console.error("부동산 데이터 로드 실패:", error);
            return { error: "데이터를 로드하는 중 오류가 발생했습니다." };
        });
}

// 지도 영역 내 부동산 데이터 로드
function loadPropertiesInBounds(swLat, swLng, neLat, neLng) {
    return fetch(`/api/properties-in-bounds?swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}`)
        .then(response => response.json())
        .catch(error => {
            console.error('영역 내 매물 로드 실패:', error);
            return { error: "영역 내 매물을 로드하는 중 오류가 발생했습니다." };
        });
}

// 위치 검색 함수
function searchLocation(query) {
    if (!query || query.length < 2) {
        return Promise.reject("검색어는 2글자 이상이어야 합니다");
    }
    
    return fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .catch(error => {
            console.error("검색 실패:", error);
            return { error: "검색 중 오류가 발생했습니다." };
        });
}

// 지오코딩 함수
function geocodeLocation(location) {
    if (!location) {
        return Promise.reject("위치를 입력해주세요");
    }
    
    return fetch(`/api/geocode?location=${encodeURIComponent(location)}`)
        .then(response => response.json())
        .catch(error => {
            console.error("지오코딩 실패:", error);
            return { error: "위치 변환 중 오류가 발생했습니다." };
        });
}

// 날씨 데이터 로드
function loadWeatherData(city = "seoul") {
    return fetch(`/api/weather?city=${city}`)
        .then(response => response.json())
        .catch(error => {
            console.error("날씨 데이터 로드 실패:", error);
            return { error: "날씨 데이터를 로드하는 중 오류가 발생했습니다." };
        });
}

// 뉴스 데이터 로드
function loadNewsData(category = null) {
    let url = "/api/news";
    if (category) {
        url += `?category=${category}`;
    }
    
    return fetch(url)
        .then(response => response.json())
        .catch(error => {
            console.error("뉴스 데이터 로드 실패:", error);
            return { error: "뉴스 데이터를 로드하는 중 오류가 발생했습니다." };
        });
}

// 범죄 데이터 로드
function loadCrimeData(region = null) {
    let url = "/api/crime-data";
    if (region) {
        url += `?region=${encodeURIComponent(region)}`;
    }
    
    return fetch(url)
        .then(response => response.json())
        .catch(error => {
            console.error("범죄 데이터 로드 실패:", error);
            return { error: "범죄 데이터를 로드하는 중 오류가 발생했습니다." };
        });
}

// 아파트 매매 실거래가 API 연동 (공공데이터포털)
const realtradingApiKey = 'S/1Gqx+pk+3dioHedGdoVI2fg3tdrEFyHYX6fhHWP0ZGmHdlJSidYxf22GwfHvuB6nW0ycYF4P8fIgNJR3EPEg==';
const realtradingEndpoint = 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade';

// 현재 날짜 기준으로 이전 달의 데이터를 조회하기 위한 함수
function getLastMonth() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = String(lastMonth.getMonth() + 1).padStart(2, '0');
    return { year, month };
}

// 아파트 매매 실거래가 API 요청을 보내는 함수
async function fetchApartmentTradeData(lawd_cd, deal_ymd) {
    const url = new URL(realtradingEndpoint + '/getRTMSDataSvcAptTrade');
    url.searchParams.append('serviceKey', realtradingApiKey);
    url.searchParams.append('LAWD_CD', lawd_cd); // 지역코드 (예: '11110' - 서울특별시 종로구)
    url.searchParams.append('DEAL_YMD', deal_ymd); // 계약월 (예: '202503')
    url.searchParams.append('numOfRows', '10000'); // 한 페이지 결과 수
    url.searchParams.append('pageNo', '1'); // 페이지 번호

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status}`);
        }
        
        const xmlText = await response.text();
        return parseXML(xmlText);
    } catch (error) {
        console.error('데이터 가져오기 실패:', error);
        return null;
    }
}

// XML 응답을 파싱하는 함수
function parseXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // 응답 코드 확인
    const resultCode = xmlDoc.querySelector('resultCode')?.textContent;
    if (resultCode !== '00') {
        const resultMsg = xmlDoc.querySelector('resultMsg')?.textContent || '알 수 없는 오류';
        throw new Error(`API 오류: ${resultCode} - ${resultMsg}`);
    }
    
    // 아파트 거래 데이터 추출
    const items = xmlDoc.querySelectorAll('item');
    const tradeData = Array.from(items).map(item => {
        return {
            apartmentName: item.querySelector('아파트')?.textContent || '',
            dong: item.querySelector('법정동')?.textContent || '',
            dealAmount: item.querySelector('거래금액')?.textContent.trim() || '',
            buildYear: item.querySelector('건축년도')?.textContent || '',
            dealYear: item.querySelector('년')?.textContent || '',
            dealMonth: item.querySelector('월')?.textContent || '',
            dealDay: item.querySelector('일')?.textContent || '',
            area: item.querySelector('전용면적')?.textContent || '',
            floor: item.querySelector('층')?.textContent || ''
        };
    });
    
    return tradeData;
}

// 특정 지역의 실거래가 데이터를 로드하는 함수
async function loadRealTradingData(regionCode = '11680') {
    const { year, month } = getLastMonth();
    const deal_ymd = `${year}${month}`;
    
    try {
        const data = await fetchApartmentTradeData(regionCode, deal_ymd);
        if (!data || data.length === 0) {
            console.log('조회된 실거래 데이터가 없습니다.');
            return { success: false, message: '조회된 실거래 데이터가 없습니다.', data: [] };
        }
        
        console.log(`${data.length}개의 실거래 데이터를 가져왔습니다.`);
        return { success: true, data: data };
    } catch (error) {
        console.error('실거래 데이터 로드 실패:', error);
        return { success: false, message: error.message, data: [] };
    }
}

// 지역코드 맵핑 (일부 지역 예시)
const regionCodeMap = {
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
};

// 지역명으로 지역코드를 가져오는 함수
function getRegionCode(regionName) {
    // 기본값은 강남구로 설정
    if (!regionName) return '11680';
    
    // 지역명에 '구'가 없으면 추가
    if (!regionName.endsWith('구')) {
        regionName = regionName + '구';
    }
    
    // 지역코드 맵에서 찾기
    return regionCodeMap[regionName] || '11680';
}

// API 모듈 내보내기
const API = {
    loadPropertyData,
    loadPropertiesInBounds,
    searchLocation,
    geocodeLocation,
    loadWeatherData,
    loadNewsData,
    loadCrimeData,
    loadRealTradingData,
    getRegionCode
};