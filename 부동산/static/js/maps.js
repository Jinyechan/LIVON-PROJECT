// static/js/maps.js

// 전역 변수 설정
let map; // 카카오맵 인스턴스
let currentMarkers = []; // 현재 지도에 표시된 마커들
let lastSearchCenter = null; // 마지막 검색 중심점
let lastSearchLevel = 0; // 마지막 검색 시 지도 레벨
let isMapMoving = false; // 지도 이동 중인지 여부
let lastProperties = []; // 마지막으로 가져온 매물 목록
let isDragging = false; // 드래그 모드 상태
let isPressing = false; // 마우스 누르고 있는 상태
let pressTimer = null; // 길게 누르기 타이머

// 지도 초기화 확인 및 데이터 로드
function checkMapAndLoadData() {
  // 지도 객체가 이미 window.map으로 생성되어 있는지 확인
  if (window.map) {
    console.log("지도 객체 발견, 데이터 로드 시작");
    map = window.map;
    
    // 지도 이벤트 리스너 등록
    initMapEventListeners();
    
    // 현재 위치 기반 매물 로드
    loadPropertiesNearCurrentLocation();
  } else {
    console.log("지도 객체가 아직 초기화되지 않음, 1초 후 다시 시도");
    // 1초 후 다시 시도
    setTimeout(checkMapAndLoadData, 1000);
  }
}

// 지도 이벤트 리스너 초기화
function initMapEventListeners() {
  if (!map) return;
  
  // 지도 영역 찾기
  const mapContainer = document.getElementById('kakao-map');
  if (mapContainer) {
    // 지도 영역에서 스크롤 이벤트 처리 개선
    mapContainer.addEventListener('wheel', function(e) {
      e.stopPropagation(); // 스크롤 이벤트 전파 중지
      e.preventDefault(); // 기본 스크롤 동작 방지
      
      // 스크롤 방향에 따른 확대/축소
      if (e.deltaY < 0) {
        // 휠 위로 (확대)
        map.setLevel(Math.max(1, map.getLevel() - 1));
      } else {
        // 휠 아래로 (축소)
        map.setLevel(Math.min(14, map.getLevel() + 1));
      }
    }, { passive: false });
    
    // 터치 이벤트도 방지 (모바일)
    mapContainer.addEventListener('touchmove', function(e) {
      e.stopPropagation();
    }, { passive: false });
    
    // 마우스 눌렀을 때 이벤트 - 길게 누르기 감지
    mapContainer.addEventListener('mousedown', function(e) {
      // 좌클릭일 때만 처리
      if (e.button === 0) {
        isPressing = true;
        const startX = e.clientX;
        const startY = e.clientY;
        
        // 0.5초 이상 길게 누르면 내 위치 이동 모드로 전환
        pressTimer = setTimeout(() => {
          if (isPressing) {
            navigateToCoordinates(e.clientX, e.clientY);
          }
        }, 500);
      }
    });
    
    // 마우스 뗐을 때 이벤트
    mapContainer.addEventListener('mouseup', function() {
      isPressing = false;
      clearTimeout(pressTimer);
    });
    
    // 마우스가 지도 밖으로 나갔을 때
    mapContainer.addEventListener('mouseleave', function() {
      isPressing = false;
      clearTimeout(pressTimer);
    });
  }
  
  // 지도 영역 확대/축소 완료 이벤트
  kakao.maps.event.addListener(map, 'zoom_changed', function() {
    // 현재 확대 레벨 가져오기 (1: 최대 확대, 14: 최대 축소)
    const level = map.getLevel();
    
    // 확대 레벨을 lastSearchLevel에 저장
    lastSearchLevel = level;
    
    // 확대 레벨 표시 업데이트
    updateZoomLevelIndicator(level);
  });
  
  // 지도 이동 시작 이벤트
  kakao.maps.event.addListener(map, 'dragstart', function() {
    isMapMoving = true;
  });
  
  // 지도 이동 종료 이벤트 - 새 영역 내 매물 로드
  kakao.maps.event.addListener(map, 'dragend', function() {
    isMapMoving = false;
    
    // 현재 지도 중심
    const center = map.getCenter();
    
    // 현재 확대 레벨
    const level = map.getLevel();
    
    // 마지막 검색과 충분히 떨어진 경우에만 새로 검색
    if (shouldLoadNewData(center, level)) {
      // 지도 확대 레벨 7 이상일 때만 새로 로드 (너무 축소된 상태에서는 기존 매물 유지)
      if (level > 7) {
        return;
      }
      
      // 새 중심점 저장
      lastSearchCenter = center;
      lastSearchLevel = level;
      
      // 확대 레벨에 따른 반경 계산
      const radiusKm = calculateRadiusByLevel(level);
      
      // 새 매물 로드
      loadPropertiesNearLocation(center.getLat(), center.getLng(), radiusKm);
    }
  });
}

// 확대 레벨 표시기 업데이트 함수
function updateZoomLevelIndicator(level) {
  const indicator = document.getElementById('zoom-level-indicator');
  const text = document.getElementById('zoom-level-text');
  
  if (indicator && text) {
    // 레벨 1(최대 확대)에서 14(최대 축소) 사이의 위치 계산
    const maxLevel = 14;
    const percentage = ((level - 1) / (maxLevel - 1)) * 100;
    
    // 인디케이터 위치 설정 (상단 0%, 하단 100%)
    indicator.style.top = `${percentage}%`;
    
    // 텍스트 업데이트
    text.textContent = `Lv.${level}`;
  }
}

// 좌표 위치로 네비게이션 (클릭 위치 기준)
function navigateToCoordinates(clientX, clientY) {
  if (!map) return;
  
  const mapContainer = document.getElementById('kakao-map');
  if (!mapContainer) return;
  
  // 클릭 위치의 화면 좌표를 상대적 위치로 변환
  const rect = mapContainer.getBoundingClientRect();
  const relativeX = clientX - rect.left;
  const relativeY = clientY - rect.top;
  
  // 화면 좌표를 지도 좌표로 변환
  const projection = map.getProjection();
  const position = projection.containerPointToCoordinate(new kakao.maps.Point(relativeX, relativeY));
  
  // 새 위치로 이동
  map.setCenter(position);
  
  // 효과음 (진동 효과가 있으면 좋겠지만 웹에서는 제한적)
  if ('vibrate' in navigator) {
    navigator.vibrate(50); // 50ms 진동
  }
  
  // 시각적 피드백
  showPositionFeedback(clientX, clientY);
}

// 위치 이동 시 시각적 피드백
function showPositionFeedback(x, y) {
  // 임시 요소 생성
  const feedback = document.createElement('div');
  feedback.style.position = 'fixed';
  feedback.style.left = `${x - 25}px`;
  feedback.style.top = `${y - 25}px`;
  feedback.style.width = '50px';
  feedback.style.height = '50px';
  feedback.style.borderRadius = '50%';
  feedback.style.backgroundColor = 'rgba(0, 123, 255, 0.3)';
  feedback.style.transform = 'scale(0)';
  feedback.style.transition = 'transform 0.3s ease-out';
  feedback.style.zIndex = '9999';
  document.body.appendChild(feedback);
  
  // 애니메이션 효과
  setTimeout(() => {
    feedback.style.transform = 'scale(1)';
    setTimeout(() => {
      feedback.style.transform = 'scale(0)';
      setTimeout(() => {
        document.body.removeChild(feedback);
      }, 300);
    }, 300);
  }, 10);
}

// 지도 확대 레벨에 따른 반경 계산 (km)
function calculateRadiusByLevel(level) {
  // 기본값은 2km
  if (!level) return 2;
  
  // 레벨에 따른 반경 매핑 (1: 최대 확대, 14: 최대 축소)
  const radiusMap = {
    1: 0.2,  // 200m
    2: 0.5,  // 500m
    3: 1,    // 1km
    4: 2,    // 2km
    5: 3,    // 3km
    6: 5,    // 5km
    7: 7     // 7km
  };
  
  // 레벨 7 이상은 모두 7km로 제한
  return radiusMap[level] || 7;
}

// 새 데이터를 로드해야 하는지 여부 확인
function shouldLoadNewData(center, level) {
  if (!lastSearchCenter) return true;
  
  // 중심점 간 거리 계산 (m)
  const distance = calculateDistance(
    lastSearchCenter.getLat(),
    lastSearchCenter.getLng(),
    center.getLat(),
    center.getLng()
  );
  
  // 확대 레벨이 변경되었거나, 일정 거리 이상 이동한 경우에만 새로 로드
  const levelDifference = Math.abs(lastSearchLevel - level);
  
  // 레벨별 최소 이동 거리 (m)
  const minDistanceByLevel = {
    1: 100,   // 레벨 1: 100m 이상 이동 시
    2: 200,   // 레벨 2: 200m 이상 이동 시
    3: 500,   // 레벨 3: 500m 이상 이동 시
    4: 1000,  // 레벨 4: 1km 이상 이동 시
    5: 2000,  // 레벨 5: 2km 이상 이동 시
    6: 3000,  // 레벨 6: 3km 이상 이동 시
    7: 5000   // 레벨 7: 5km 이상 이동 시
  };
  
  // 현재 레벨에 맞는 최소 이동 거리 또는 기본값 2km
  const minDistance = minDistanceByLevel[level] || 2000;
  
  return levelDifference > 0 || distance > minDistance;
}

// 두 지점 간 거리 계산 (m)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 지구 반지름 (m)
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// 각도를 라디안으로 변환
function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// 지도에 마커 추가하는 함수
function addMarkerToMap(lat, lng, title, price) {
  if (!map) {
    console.error("지도가 초기화되지 않았습니다. 마커를 추가할 수 없습니다.");
    return;
  }

  const markerPosition = new kakao.maps.LatLng(lat, lng);

  // 마커 생성
  const marker = new kakao.maps.Marker({
    position: markerPosition,
    map: map,
    title: title
  });

  // 인포윈도우 내용
  const iwContent = `
    <div class="map-info-window">
      <h4>${title || '매물 정보'}</h4>
      <p>${price || '가격 정보 없음'}</p>
    </div>
  `;

  // 인포윈도우 생성
  const infowindow = new kakao.maps.InfoWindow({
    content: iwContent,
  });

  // 마커 클릭 이벤트 등록
  kakao.maps.event.addListener(marker, "click", function () {
    // 인포윈도우 표시
    infowindow.open(map, marker);

    // 일정 시간 후 인포윈도우 닫기
    setTimeout(() => {
      infowindow.close();
    }, 5000);
  });

  // 현재 마커 배열에 추가
  currentMarkers.push(marker);
}

// 지도 마커 모두 제거하는 함수
function clearMapMarkers() {
  currentMarkers.forEach((marker) => {
    marker.setMap(null);
  });
  currentMarkers = [];
}

// 지도 특정 위치로 이동시키는 함수
function moveMapToLocation(lat, lng, zoom) {
  if (!map) {
    console.error("지도가 초기화되지 않았습니다. 위치를 이동할 수 없습니다.");
    return;
  }

  const moveLatLng = new kakao.maps.LatLng(lat, lng);
  map.setCenter(moveLatLng);

  // 줌 레벨이 지정된 경우 변경
  if (zoom) {
    map.setLevel(zoom);
    lastSearchLevel = zoom; // 줌 레벨 저장
    updateZoomLevelIndicator(zoom); // 줌 레벨 표시 업데이트
  }
}

// 내 위치 마커 추가
function addMyLocationMarker(lat, lng) {
  if (!map) return;
  
  // 기존 내 위치 마커 제거
  if (window.myLocationMarker) {
    window.myLocationMarker.setMap(null);
  }
  
  // 현재 위치에 특별한 마커 생성
  const markerPosition = new kakao.maps.LatLng(lat, lng);
  
  // 커스텀 오버레이로 내 위치 표시
  const content = `
    <div style="position: relative;">
      <div style="position: absolute; top: -25px; left: -25px;">
        <div style="width: 50px; height: 50px; border-radius: 50%; background-color: rgba(0, 123, 255, 0.2); display: flex; justify-content: center; align-items: center;">
          <div style="width: 20px; height: 20px; border-radius: 50%; background-color: #007bff;"></div>
        </div>
      </div>
    </div>
  `;
  
  window.myLocationMarker = new kakao.maps.CustomOverlay({
    position: markerPosition,
    content: content,
    map: map
  });
}

// 현재 위치 기반 매물 로드
function loadPropertiesNearCurrentLocation() {
  console.log("현재 위치 기반 매물 로드 시작");
  
  // 로딩 표시 추가
  showLoading(true);
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      // 위치 조회 성공 시
      function(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log("현재 위치:", lat, lng);
        
        // 마지막 검색 중심점 저장
        lastSearchCenter = new kakao.maps.LatLng(lat, lng);
        lastSearchLevel = 3; // 초기 확대 레벨
        
        // 지도 이동
        moveMapToLocation(lat, lng, lastSearchLevel);
        
        // 현재 위치에 마커 추가
        addMyLocationMarker(lat, lng);
        
        // 주변 매물 로드 (반경은 확대 레벨에 따라 결정)
        const initialRadius = calculateRadiusByLevel(lastSearchLevel);
        loadPropertiesNearLocation(lat, lng, initialRadius);
      },
      // 위치 조회 실패 시
      function(error) {
        console.error("위치 정보를 가져오는데 실패했습니다:", error);
        
        // 로딩 표시 제거
        showLoading(false);
        
        // 실패 메시지와 함께 서울 중심으로 설정
        alert("위치 정보를 가져오는데 실패했습니다. 기본 위치(서울시청)를 사용합니다.");
        
        const defaultLat = 37.5665;
        const defaultLng = 126.9780;
        
        // 마지막 검색 중심점 저장
        lastSearchCenter = new kakao.maps.LatLng(defaultLat, defaultLng);
        lastSearchLevel = 5; // 초기 확대 레벨
        
        // 지도 이동
        moveMapToLocation(defaultLat, defaultLng, lastSearchLevel);
        
        // 주변 매물 로드 (반경은 확대 레벨에 따라 결정)
        const initialRadius = calculateRadiusByLevel(lastSearchLevel);
        loadPropertiesNearLocation(defaultLat, defaultLng, initialRadius);
      }
    );
  } else {
    console.error("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
    showLoading(false);
    
    alert("이 브라우저에서는 위치 정보를 지원하지 않습니다. 기본 위치를 사용합니다.");
    
    // 위치 지원 안될 경우 서울 중심으로 설정
    const defaultLat = 37.5665;
    const defaultLng = 126.9780;
    
    // 마지막 검색 중심점 저장
    lastSearchCenter = new kakao.maps.LatLng(defaultLat, defaultLng);
    lastSearchLevel = 5; // 초기 확대 레벨
    
    moveMapToLocation(defaultLat, defaultLng, lastSearchLevel);
    
    // 주변 매물 로드 (반경은 확대 레벨에 따라 결정)
    const initialRadius = calculateRadiusByLevel(lastSearchLevel);
    loadPropertiesNearLocation(defaultLat, defaultLng, initialRadius);
  }
}

// 특정 위치 주변 매물 로드 함수
function loadPropertiesNearLocation(lat, lng, radiusKm) {
  // 로딩 표시
  showLoading(true);
  
  // API 호출
  API.loadPropertiesNearby(lat, lng, radiusKm)
    .then(data => {
      console.log("주변 매물 로드 결과:", data);
      
      // 로딩 표시 제거
      showLoading(false);
      
      if (data.properties && data.properties.length > 0) {
        // 모든 매물 데이터 저장
        allProperties = data.properties;
        lastProperties = data.properties;
        
        // 매물에 가상의 방향 속성 추가 (필터링 테스트용)
        const directions = ['남향', '남동향', '남서향', '동향', '서향', '북향', '북동향', '북서향'];
        allProperties = allProperties.map(property => {
          // 매물 데이터에 임의의 방향 속성 추가
          property.direction = directions[Math.floor(Math.random() * directions.length)];
          return property;
        });
        
        // 매물 마커 표시
        clearMapMarkers();
        data.properties.forEach(property => {
          addMarkerToMap(
            property.coordinates.lat,
            property.coordinates.lng,
            property.title,
            property.formattedPrice
          );
        });
        
        // 매물 목록 업데이트
        updatePropertyList(data.properties);
      } else {
        // 매물이 없는 경우
        allProperties = [];
        lastProperties = [];
        updatePropertyList([]);
      }
    })
    .catch(error => {
      console.error("주변 매물 로드 실패:", error);
      showLoading(false);
      
      // 오류 메시지 표시
      const propertyListContainer = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.gap-4');
      if (propertyListContainer) {
        propertyListContainer.innerHTML = `
          <div class="col-span-2 p-8 text-center bg-gray-50 rounded-lg">
            <i class="ri-error-warning-line text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-500">매물 정보를 불러오는데 실패했습니다.</p>
          </div>
        `;
      }
    });
}

// 카카오맵 로드 실패 시 오류 표시
function showMapLoadingError() {
  const mapPane = document.getElementById("map-pane");
  if (mapPane) {
    mapPane.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full bg-gray-100 p-4 text-center">
        <div class="text-red-500 text-4xl mb-4"><i class="ri-error-warning-line"></i></div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">카카오맵 로드 실패</h3>
        <p class="text-gray-600 mb-4">카카오맵 API를 로드하는 중 문제가 발생했습니다.</p>
        <p class="text-gray-500 text-sm">브라우저 콘솔에서 자세한 오류를 확인해주세요.</p>
      </div>
    `;
  }
}

// 지도 확장/축소 버튼 초기화
function initExpandButton() {
  const contentPane = document.getElementById("content-pane");
  const mapPane = document.getElementById("map-pane");
  const expandButton = document.getElementById("expand-button");

  if (contentPane && mapPane && expandButton) {
    let isExpanded = false;

    expandButton.addEventListener("click", () => {
      isExpanded = !isExpanded;

      // 버튼 위치 및 아이콘 업데이트
      if (isExpanded) {
        expandButton.style.right = "20px";
        const icon = expandButton.querySelector("i");
        if (icon) {
          icon.classList.remove("ri-arrow-left-line");
          icon.classList.add("ri-arrow-right-line");
        }
        expandButton.querySelector("button").setAttribute("title", "지도 보기");
        expandButton.querySelector("i").setAttribute("aria-label", "지도 보기");
      } else {
        expandButton.style.right = "50%"; // 간격 조정에 맞게 수정
        const icon = expandButton.querySelector("i");
        if (icon) {
          icon.classList.remove("ri-arrow-right-line");
          icon.classList.add("ri-arrow-left-line");
        }
        expandButton.querySelector("button").setAttribute("title", "전체화면 보기");
        expandButton.querySelector("i").setAttribute("aria-label", "전체화면 보기");
      }

      // 콘텐츠 및 지도 패널 애니메이션
      requestAnimationFrame(() => {
        contentPane.style.width = isExpanded ? "100%" : "50%"; // 간격 조정에 맞게 수정
        mapPane.style.transform = isExpanded ? "translateX(100%)" : "translateX(0)";
        mapPane.style.opacity = isExpanded ? "0" : "1";

        // 지도 크기 변경 시 리사이즈 이벤트 트리거 (카카오맵 렌더링 업데이트)
        setTimeout(() => {
          if (map && !isExpanded) {
            map.relayout();
          }
        }, 400);
      });
    });
  }
}

// 지도 마커 업데이트 함수
function updateMapMarkers(properties) {
  // 기존 마커 제거
  clearMapMarkers();
  
  // 필터링된 매물의 마커만 표시
  properties.forEach(property => {
    if (property.coordinates) {
      addMarkerToMap(
        property.coordinates.lat,
        property.coordinates.lng,
        property.title,
        property.formattedPrice
      );
    }
  });
}

// 특정 매물 강조 표시
function highlightProperty(property) {
  // 모든 마커를 순회하며 해당 매물에 해당하는 마커 찾기
  currentMarkers.forEach(marker => {
    const position = marker.getPosition();
    
    // 위치가 일치하는 마커 찾기
    if (position.getLat() === property.coordinates.lat && 
        position.getLng() === property.coordinates.lng) {
      // 해당 마커의 클릭 이벤트 트리거
      kakao.maps.event.trigger(marker, 'click');
    }
  });
}