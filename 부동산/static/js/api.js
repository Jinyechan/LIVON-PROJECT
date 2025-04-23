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
                error: "영역 내 매물을 로드하는 중 오류가 발생했습니다."
            };
        });
}

// 현재 위치 기반으로 반경 내 매물 조회
function loadPropertiesNearby(lat, lng, radiusKm = 2) {
    return fetch(`/api/properties-nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`)
        .then(response => response.json())
        .catch(error => {
            console.error('주변 매물 로드 실패:', error);
            return { 
                success: false,
                message: "주변 매물을 로드하는 중 오류가 발생했습니다."
            };
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
            return {
                success: false,
                message: "검색 중 오류가 발생했습니다",
                results: []
            };
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

// 아파트 매매 실거래가 데이터 로드
async function loadRealTradingData(regionCode = '11680') {
    try {
        const response = await fetch(`/api/realtrading?region=${regionCode}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('실거래 데이터 로드 실패:', error);
        return { 
            success: false, 
            message: error.message || '데이터를 불러오는 중 오류가 발생했습니다.', 
            data: [] 
        };
    }
}

// 지역명으로 지역코드를 가져오는 함수
function getRegionCode(regionName) {
    // 기본값은 강남구
    if (!regionName) return '11680';
    
    // 지역명에 '구'가 없으면 추가
    if (!regionName.endsWith('구')) {
        regionName = regionName + '구';
    }
    
    // 지역코드 맵
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
    
    // 지역코드 반환
    return regionCodeMap[regionName] || '11680';
}

// 매물 필터링 함수
function filterProperties(properties, filters) {
    if (!properties || properties.length === 0) return [];
    if (!filters || Object.keys(filters).length === 0) return properties;
    
    return properties.filter(property => {
        // 매물 유형 필터
        if (filters.propertyType && filters.propertyType.length > 0) {
            if (!property.type || !filters.propertyType.includes(property.type)) {
                // 빌라/투룸 특수 처리
                if (filters.propertyType.includes('빌라/투룸')) {
                    if (property.type === '빌라' || property.type === '투룸') {
                        return true;
                    }
                }
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
            // 면적 문자열(예: "80㎡ (24.2평)")에서 제곱미터 숫자만 추출
            const areaMatch = property.area && property.area.match(/(\d+\.?\d*)/);
            if (!areaMatch) return true; // 면적 정보가 없으면 필터링하지 않음
            
            const areaSqm = parseFloat(areaMatch[1]);
            // 제곱미터를 평으로 변환하여 비교
            const areaPyung = areaSqm / 3.3058;
            
            if (filters.area.min && areaPyung < (filters.area.min / 3.3058)) return false;
            if (filters.area.max && areaPyung > (filters.area.max / 3.3058)) return false;
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