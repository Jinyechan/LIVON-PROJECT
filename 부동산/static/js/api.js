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
            return { 
                error: "영역 내 매물을 로드하는 중 오류가 발생했습니다.",
                properties: getSampleProperties(swLat, swLng, neLat, neLng) // 실제 API 실패 시 샘플 데이터 제공
            };
        });
}

// 현재 위치 기반으로 반경 내 매물 조회 (새로 추가)
function loadPropertiesNearby(lat, lng, radiusKm = 2) {
    // 반경을 위도/경도 범위로 변환
    const latDelta = radiusKm / 111; // 위도 1도는 약 111km
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180)); // 경도 1도는 위도에 따라 달라짐
    
    const swLat = lat - latDelta;
    const swLng = lng - lngDelta;
    const neLat = lat + latDelta;
    const neLng = lng + lngDelta;
    
    return fetch(`/api/properties-nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`)
        .then(response => response.json())
        .catch(error => {
            console.error('주변 매물 로드 실패:', error);
            // API 실패 시 대체 함수 호출 (범위 기반 샘플 데이터)
            return { 
                success: true,
                properties: getSampleProperties(swLat, swLng, neLat, neLng, lat, lng, radiusKm)
            };
        });
}

// 샘플 매물 데이터 생성 함수 (API 실패시 사용)
function getSampleProperties(swLat, swLng, neLat, neLng, centerLat, centerLng, radius) {
    // 중심점이 없으면 영역의 중심으로 계산
    if (!centerLat || !centerLng) {
        centerLat = (swLat + neLat) / 2;
        centerLng = (swLng + neLng) / 2;
    }
    
    // 임의의 샘플 매물 생성 (5~10개)
    const count = Math.floor(Math.random() * 6) + 5;
    const properties = [];
    
    const propertyTypes = ['아파트', '오피스텔', '빌라', '단독주택', '상가'];
    const areas = ['강남구', '서초구', '용산구', '마포구', '송파구', '종로구', '중구', '성북구'];
    const directions = ['남향', '남동향', '남서향', '동향', '서향', '북향', '북동향', '북서향'];
    const dealTypes = ['매매', '전세', '월세'];
    
    for (let i = 0; i < count; i++) {
        // 주어진 중심에서 랜덤한 위치 생성 (반경 내)
        const distance = Math.random() * (radius || 2) * 0.8; // 80%까지의 반경
        const angle = Math.random() * 2 * Math.PI; // 0~360도
        
        // 극좌표를 직교좌표로 변환
        const latOffset = distance * Math.cos(angle) / 111;
        const lngOffset = distance * Math.sin(angle) / (111 * Math.cos(centerLat * Math.PI / 180));
        
        const lat = centerLat + latOffset;
        const lng = centerLng + lngOffset;
        
        // 임의 가격 생성 (1억~15억)
        const price = Math.floor(Math.random() * 1400) + 100;
        let formattedPrice = '';
        
        // 물건 유형 선택
        const type = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
        
        // 지역 선택
        const areaName = areas[Math.floor(Math.random() * areas.length)];
        
        // 방향 선택
        const direction = directions[Math.floor(Math.random() * directions.length)];
        
        // 거래 유형 선택
        const dealType = dealTypes[Math.floor(Math.random() * dealTypes.length)];
        
        // 임의 면적 생성 (20~200㎡)
        const area = Math.floor(Math.random() * 180) + 20;
        
        // 거래 유형에 따른 가격 표시 및 관련 데이터 설정
        let monthlyPrice = null;
        let depositAmount = null;
        
        if (dealType === '매매') {
            if (price >= 10000) {
                const uk = Math.floor(price / 10000);
                const man = price % 10000;
                formattedPrice = `${uk}억 ${man > 0 ? man + '만' : ''}원`;
            } else {
                formattedPrice = `${price}만원`;
            }
        } else if (dealType === '전세') {
            if (price >= 10000) {
                const uk = Math.floor(price / 10000);
                const man = price % 10000;
                formattedPrice = `전세 ${uk}억 ${man > 0 ? man + '만' : ''}원`;
            } else {
                formattedPrice = `전세 ${price}만원`;
            }
        } else { // 월세
            depositAmount = Math.floor(price / 10); // 보증금 (매매가의 1/10)
            monthlyPrice = Math.floor(Math.random() * 100) + 50; // 월세 (50~150만원)
            
            if (depositAmount >= 10000) {
                const uk = Math.floor(depositAmount / 10000);
                const man = depositAmount % 10000;
                formattedPrice = `월세 ${uk}억 ${man > 0 ? man + '만' : ''} / ${monthlyPrice}만원`;
            } else {
                formattedPrice = `월세 ${depositAmount}만 / ${monthlyPrice}만원`;
            }
        }
        
        properties.push({
            id: `property-${Date.now()}-${i}`,
            title: `${areaName} ${type} ${i+1}호`,
            description: `${areaName}에 위치한 ${direction} ${type}입니다. 역세권, 편의시설 인접.`,
            price: price * 10000, // 실제 가격 (원)
            formattedPrice: formattedPrice,
            area: `${area}㎡`,
            type: type,
            location: `${areaName}, 서울`,
            direction: direction,
            dealType: dealType,
            monthlyPrice: monthlyPrice,
            depositAmount: depositAmount,
            coordinates: {
                lat: lat,
                lng: lng
            },
            imageUrl: `https://via.placeholder.com/400x300?text=${encodeURIComponent(type)}`,
            features: ['주차가능', '역세권', '신축건물'],
            contact: '02-123-4567'
        });
    }
    
    return properties;
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

// 매물 필터링 함수
function filterProperties(properties, filters) {
    if (!properties || properties.length === 0) return [];
    if (!filters || Object.keys(filters).length === 0) return properties;
    
    return properties.filter(property => {
        // 매물 유형 필터
        if (filters.propertyType && filters.propertyType.length > 0) {
            if (!property.type || !filters.propertyType.includes(property.type)) {
                return false;
            }
        }
        
        // 가격 필터
        if (filters.price) {
            if (property.dealType === '매매' || property.dealType === '전세') {
                if (filters.price.min && property.price < filters.price.min) return false;
                if (filters.price.max && property.price > filters.price.max) return false;
            } else if (property.dealType === '월세') {
                if (filters.price.monthlyMin && property.monthlyPrice * 10000 < filters.price.monthlyMin) return false;
                if (filters.price.monthlyMax && property.monthlyPrice * 10000 > filters.price.monthlyMax) return false;
            }
        }
        
        // 면적 필터
        if (filters.area) {
            // 면적 문자열(예: "80㎡")에서 숫자만 추출
            const areaMatch = property.area && property.area.match(/(\d+\.?\d*)/);
            if (!areaMatch) return true; // 면적 정보가 없으면 필터링하지 않음
            
            const area = parseFloat(areaMatch[1]);
            if (filters.area.min && area < filters.area.min) return false;
            if (filters.area.max && area > filters.area.max) return false;
        }
        
        // 방향 필터
        if (filters.direction && filters.direction.length > 0) {
            if (!property.direction || !filters.direction.includes(property.direction)) {
                return false;
            }
        }
        
        // 모든 필터를 통과한 경우
        return true;
    });
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
    loadPropertiesNearby, 
    searchLocation,
    geocodeLocation,
    loadWeatherData,
    loadNewsData,
    loadCrimeData,
    loadRealTradingData,
    getRegionCode,
    filterProperties
};