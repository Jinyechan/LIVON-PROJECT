// static/js/maps.js

// 전역 변수 설정
let map; // 카카오맵 인스턴스
let currentMarkers = []; // 현재 지도에 표시된 마커들
let radiusCircle; // 반경 원 객체

// 지도 초기화 확인 및 데이터 로드
function checkMapAndLoadData() {
  // 지도 객체가 이미 window.map으로 생성되어 있는지 확인
  if (window.map) {
    console.log("지도 객체 발견, 데이터 로드 시작");
    map = window.map;
    loadPropertiesNearCurrentLocation();
  } else {
    console.log("지도 객체가 아직 초기화되지 않음, 1초 후 다시 시도");
    // 1초 후 다시 시도
    setTimeout(checkMapAndLoadData, 1000);
  }
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

// 반경 2km 원 표시 함수
function drawRadiusCircle(lat, lng, radiusKm) {
  if (!map) return;
  
  // 기존 원 제거
  if (radiusCircle) {
    radiusCircle.setMap(null);
  }
  
  // 원 생성
  const center = new kakao.maps.LatLng(lat, lng);
  radiusCircle = new kakao.maps.Circle({
    center: center,
    radius: radiusKm * 1000, // m 단위로 변환
    strokeWeight: 2,
    strokeColor: '#007bff',
    strokeOpacity: 0.7,
    strokeStyle: 'dashed',
    fillColor: '#007bff',
    fillOpacity: 0.1
  });
  
  radiusCircle.setMap(map);
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
        expandButton.style.right = "calc(50% - 15px)"; // 간격 조정에 맞게 수정
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
        contentPane.style.width = isExpanded ? "100%" : "calc(50% - 15px)"; // 간격 조정에 맞게 수정
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

// 지도 영역 내 부동산 데이터 로드
function loadPropertiesInMapBounds(swLat, swLng, neLat, neLng) {
  console.log("영역 내 매물 로드:", swLat, swLng, neLat, neLng);
  
  API.loadPropertiesInBounds(swLat, swLng, neLat, neLng)
    .then(data => {
      console.log("영역 내 매물 데이터 로드 성공:", data);
      // 지도에 마커 표시
      clearMapMarkers();
      
      if (data.properties && data.properties.length > 0) {
        // 모든 매물 데이터 저장
        allProperties = data.properties;
        
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
        updatePropertyList([]);
      }
    });
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