// static/js/index.js

document.addEventListener("DOMContentLoaded", function () {
  console.log("문서 로드됨, 초기화 시작...");
  
  // 전역 변수 설정
  let map; // 카카오맵 인스턴스
  let currentMarkers = []; // 현재 지도에 표시된 마커들
  let radiusCircle; // 반경 원 객체

  // API 데이터 로드 함수
  function loadApiData() {
    // 부동산 데이터 로드
    API.loadPropertyData()
      .then((data) => {
        console.log("부동산 데이터 로드됨", data);
        updatePropertySection(data);
      });
    
    // 실거래가 데이터 로드 및 UI 초기화
    initRealTradingUI();
  }

  function updatePropertySection(data) {
    // 여기서 데이터를 사용하여 부동산 섹션 업데이트
    if (data.featured && data.featured.length > 0) {
      // 추천 매물 업데이트 로직
      console.log("추천 매물 업데이트 가능");
    }

    if (data.regions && data.regions.length > 0) {
      // 지역 데이터 표시 로직
      console.log("지역 데이터 업데이트 가능");
    }
  }

  // 초기화 함수
  function init() {
    console.log("초기화 함수 실행...");
    initSections();
    initNavigation();
    initSearchAutocomplete();
    initExpandButton();
    initCustomControls();
    
    // 지도는 HTML에서 직접 초기화하므로 여기서는 초기화하지 않음
    console.log("지도는 HTML에서 직접 초기화됨");
    
    initializeCharts();
    
    // 지도가 초기화된 후에 현재 위치 기반 매물 로드
    checkMapAndLoadData();
    
    console.log("초기화 완료!");
  }
  
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

  // 섹션 가시성 초기화
  function initSections() {
    const sections = {
      "property-search": document.querySelector("#content-pane"),
      news: document.querySelector("#news"),
      weather: document.querySelector("#weather"),
      "crime-map": document.querySelector("#crime-map"),
    };

    // 처음에는 property-search를 제외한 모든 섹션 숨기기
    Object.entries(sections).forEach(([key, section]) => {
      if (key !== "property-search" && section) {
        section.style.display = "none";
      }
    });

    // 초기 섹션에 활성화 상태 추가
    const initialSection = document.querySelector('[data-section="property-search"]');
    if (initialSection) {
      initialSection.classList.add("bg-primary/10", "text-gray-900", "active");
    }

    // 모든 섹션에 트랜지션 스타일 추가
    Object.values(sections).forEach((section) => {
      if (section) {
        section.style.transition = "opacity 0.3s ease-in-out";
      }
    });
  }

  // 네비게이션 초기화
  function initNavigation() {
    const sections = {
      "property-search": document.querySelector("#content-pane"),
      news: document.querySelector("#news"),
      weather: document.querySelector("#weather"),
      "crime-map": document.querySelector("#crime-map"),
    };

    document.querySelectorAll(".nav-item").forEach((button) => {
      button.addEventListener("click", function () {
        // 모든 버튼에서 활성화 상태 제거
        document.querySelectorAll(".nav-item").forEach((btn) => {
          btn.classList.remove("bg-primary/10", "text-gray-900", "active");
        });

        // 클릭된 버튼에 활성화 상태 추가
        this.classList.add("bg-primary/10", "text-gray-900", "active");

        const targetSection = this.getAttribute("data-section");

        // 모든 섹션 페이드 아웃
        Object.values(sections).forEach((section) => {
          if (section) {
            section.style.opacity = "0";
            setTimeout(() => {
              section.style.display = "none";
            }, 300);
          }
        });

        // 타겟 섹션 페이드 인
        const target = sections[targetSection];
        if (target) {
          setTimeout(() => {
            target.style.display = "block";
            setTimeout(() => {
              target.style.opacity = "1";
            }, 50);
          }, 300);

          // 섹션 변경 시 적절한 API 호출
          if (targetSection === "news") {
            loadNewsContent();
          } else if (targetSection === "weather") {
            loadWeatherContent();
          } else if (targetSection === "crime-map") {
            loadCrimeContent();
            initCrimeMap();
          }
        }
      });
    });

    // 스무스 스크롤 코드
    document.querySelectorAll('nav a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const contentPane = document.getElementById("content-pane");
          if (contentPane) {
            contentPane.scrollTo({
              top: targetElement.offsetTop - 80,
              behavior: "smooth",
            });
          }
        }
      });
    });
  }

  // 검색 자동완성 초기화
  function initSearchAutocomplete() {
    const locationSearch = document.getElementById("location-search");
    const searchAutocomplete = document.getElementById("search-autocomplete");

    if (locationSearch && searchAutocomplete) {
      const sampleLocations = ["강남구, 서울", "서초구, 서울", "용산구, 서울", "마포구, 서울", "송파구, 서울"];

      locationSearch.addEventListener("input", function () {
        const value = this.value.toLowerCase();
        if (value.length > 0) {
          const matches = sampleLocations.filter((location) => location.toLowerCase().includes(value));
          if (matches.length > 0) {
            searchAutocomplete.innerHTML = matches
              .map(
                (location) => `
                  <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    ${location}
                  </button>
                `
              )
              .join("");
            searchAutocomplete.classList.remove("hidden");

            // 자동완성 항목 클릭 이벤트
            searchAutocomplete.querySelectorAll("button").forEach((button) => {
              button.addEventListener("click", function () {
                locationSearch.value = this.textContent.trim();
                searchAutocomplete.classList.add("hidden");
                // 검색 실행
                performSearch(locationSearch.value);
              });
            });
          } else {
            searchAutocomplete.classList.add("hidden");
          }
        } else {
          searchAutocomplete.classList.add("hidden");
        }
      });

      document.addEventListener("click", function (e) {
        if (!locationSearch.contains(e.target)) {
          searchAutocomplete.classList.add("hidden");
        }
      });

      // 검색 버튼 이벤트
      const searchButton = document.querySelector('button[title="검색"]');
      if (searchButton) {
        searchButton.addEventListener("click", function () {
          performSearch(locationSearch.value);
        });
      }

      // 엔터 키 이벤트
      locationSearch.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          performSearch(locationSearch.value);
        }
      });
    }
  }

  // 검색 실행 함수
  function performSearch(query) {
    if (query && query.length >= 2) {
      console.log("검색어: " + query);
      API.searchLocation(query)
        .then((data) => {
          console.log("검색 결과:", data);
          // 검색 결과 표시 로직
          displaySearchResults(data);

          // 지도 중심 이동 (검색 지역으로)
          if (map && data.coordinates) {
            moveMapToLocation(data.coordinates.lat, data.coordinates.lng);
          }
        });
    }
  }

  // 검색 결과 표시 함수
  function displaySearchResults(data) {
    // 이 함수는 검색 결과를 UI에 표시하는 로직 구현
    console.log("검색 결과 표시");

    // 검색 결과에 매물이 있으면 지도에 마커 표시
    if (data.properties && data.properties.length > 0) {
      clearMapMarkers(); // 기존 마커 제거

      data.properties.forEach((property) => {
        addMarkerToMap(property.coordinates.lat, property.coordinates.lng, property.title, property.price);
      });
      
      // 매물 목록 업데이트
      updatePropertyList(data.properties);
    }
  }

  // 현재 위치 기반 매물 로드 (새로 추가)
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
          
          // 지도 이동
          moveMapToLocation(lat, lng, 5);
          
          // 현재 위치에 마커 추가
          addMyLocationMarker(lat, lng);
          
          // 반경 2km 원 표시
          drawRadiusCircle(lat, lng, 2);
          
          // 주변 2km 매물 로드
          API.loadPropertiesNearby(lat, lng, 2)
            .then(data => {
              console.log("주변 매물 로드 결과:", data);
              
              // 로딩 표시 제거
              showLoading(false);
              
              if (data.properties && data.properties.length > 0) {
                // 매물 마커 표시
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
          
          // 지도 이동
          moveMapToLocation(defaultLat, defaultLng, 7);
          
          // 반경 표시
          drawRadiusCircle(defaultLat, defaultLng, 2);
          
          // 주변 매물 로드
          API.loadPropertiesNearby(defaultLat, defaultLng, 2)
            .then(data => {
              if (data.properties && data.properties.length > 0) {
                // 매물 마커 표시
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
                updatePropertyList([]);
              }
            });
        }
      );
    } else {
      console.error("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
      showLoading(false);
      
      alert("이 브라우저에서는 위치 정보를 지원하지 않습니다. 기본 위치를 사용합니다.");
      
      // 위치 지원 안될 경우 서울 중심으로 설정
      const defaultLat = 37.5665;
      const defaultLng = 126.9780;
      moveMapToLocation(defaultLat, defaultLng, 7);
      
      // 주변 매물 로드
      API.loadPropertiesNearby(defaultLat, defaultLng, 2)
        .then(data => {
          if (data.properties && data.properties.length > 0) {
            // 매물 마커 표시
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
            updatePropertyList([]);
          }
        });
    }
  }
  
  // 로딩 표시 함수
  function showLoading(isLoading) {
    const propertyListContainer = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.gap-4');
    
    if (propertyListContainer) {
      if (isLoading) {
        propertyListContainer.innerHTML = `
          <div class="col-span-2 p-8 text-center">
            <div class="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-500">주변 매물을 불러오는 중입니다...</p>
          </div>
        `;
      }
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
  
  // 매물 목록 UI 업데이트 함수
  function updatePropertyList(properties) {
    const propertyListContainer = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.gap-4');
    
    if (!propertyListContainer) {
      console.error('매물 목록 컨테이너를 찾을 수 없습니다.');
      return;
    }
    
    // 컨테이너 초기화
    propertyListContainer.innerHTML = '';
    
    // 매물이 없는 경우
    if (!properties || properties.length === 0) {
      propertyListContainer.innerHTML = `
        <div class="col-span-2 p-8 text-center bg-gray-50 rounded-lg">
          <i class="ri-home-5-line text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-500">주변 2km 반경 내에 매물이 없습니다.</p>
        </div>
      `;
      return;
    }
    
    // 매물 리스트 생성
    properties.forEach(property => {
      const propertyCard = document.createElement('div');
      propertyCard.className = 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200';
      
      // 이미지 URL 확인
      const imageUrl = property.imageUrl || `https://via.placeholder.com/400x300?text=${encodeURIComponent(property.title || '매물')}`;
      
      propertyCard.innerHTML = `
        <div class="relative">
          <img src="${imageUrl}" class="w-full h-48 object-cover" alt="${property.title || '매물'} 이미지">
          <button class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full hover:bg-white">
            <i class="ri-heart-line text-gray-600 hover:text-red-500"></i>
          </button>
        </div>
        <div class="p-4">
          <h3 class="font-medium text-gray-800 mb-1">${property.title || '매물 정보'}</h3>
          <p class="text-sm text-gray-500 mb-2">${property.location || '위치 정보 없음'}</p>
          <div class="flex justify-between items-center">
            <span class="text-lg font-semibold text-gray-800">${property.formattedPrice || '가격 정보 없음'}</span>
            <span class="text-sm text-gray-500">${property.area || ''}</span>
          </div>
        </div>
      `;
      
      // 클릭 이벤트 - 지도에서 해당 매물 위치로 이동
      propertyCard.addEventListener('click', function() {
        if (property.coordinates) {
          // 지도 이동
          moveMapToLocation(property.coordinates.lat, property.coordinates.lng, 3);
          
          // 해당 마커 클릭 이벤트 트리거 (인포윈도우 표시)
          highlightProperty(property);
        }
      });
      
      propertyListContainer.appendChild(propertyCard);
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

  // 지도 영역 내 부동산 데이터 로드
  function loadPropertiesInMapBounds(swLat, swLng, neLat, neLng) {
    console.log("영역 내 매물 로드:", swLat, swLng, neLat, neLng);
    
    API.loadPropertiesInBounds(swLat, swLng, neLat, neLng)
      .then(data => {
        console.log("영역 내 매물 데이터 로드 성공:", data);
        // 지도에 마커 표시
        clearMapMarkers();
        
        if (data.properties && data.properties.length > 0) {
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
          updatePropertyList([]);
        }
      });
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

  // 확장/축소 버튼 초기화
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
          expandButton.style.right = "50%";
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
          contentPane.style.width = isExpanded ? "100%" : "50%";
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

  // 커스텀 컨트롤 초기화
  function initCustomControls() {
    // 커스텀 체크박스 기능
    const checkboxes = document.querySelectorAll(".custom-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("click", function () {
        this.classList.toggle("checked");
      });
    });

    // 커스텀 라디오 버튼 기능
    const radios = document.querySelectorAll(".custom-radio");
    radios.forEach((radio) => {
      radio.addEventListener("click", function () {
        const name = this.id.split("-")[0];
        document.querySelectorAll(`.custom-radio[id^="${name}"]`).forEach((r) => {
          r.classList.remove("checked");
        });
        this.classList.add("checked");
      });
    });
  }

  // 범죄 지도 초기화
  function initCrimeMap() {
    const crimeMapElement = document.getElementById("crime-data-map");
    if (!crimeMapElement) return;

    // 범죄 지도 로드 로직
    console.log("범죄 지도 초기화");

    // 여기에서 범죄 데이터 지도 구현
    // 예시: 카카오맵 API를 사용한 히트맵 구현
  }

  // 뉴스 콘텐츠 로드 및 UI 업데이트
  function loadNewsContent() {
    API.loadNewsData()
      .then((data) => {
        console.log("뉴스 데이터 로드됨", data);
        updateNewsUI(data);
      });
  }

  // 날씨 콘텐츠 로드 및 UI 업데이트
  function loadWeatherContent() {
    API.loadWeatherData()
      .then((data) => {
        console.log("날씨 데이터 로드됨", data);
        updateWeatherUI(data);
      });
  }

  // 범죄 콘텐츠 로드 및 UI 업데이트
  function loadCrimeContent() {
    API.loadCrimeData()
      .then((data) => {
        console.log("범죄 데이터 로드됨", data);
        updateCrimeUI(data);
      });
  }

  // 날씨 UI 업데이트
  function updateWeatherUI(data) {
    // 날씨 UI 업데이트 로직
    console.log("날씨 UI 업데이트");
  }

  // 뉴스 UI 업데이트
  function updateNewsUI(data) {
    // 뉴스 UI 업데이트 로직
    console.log("뉴스 UI 업데이트");
  }

  // 범죄 UI 업데이트
  function updateCrimeUI(data) {
    // 범죄 UI 업데이트 로직
    console.log("범죄 UI 업데이트");
  }
  
  // 실거래가 UI 초기화 및 이벤트 리스너 설정
  function initRealTradingUI() {
    const regionSelect = document.getElementById('trading-region-select');
    const loadButton = document.getElementById('load-trading-data');
    const loadingIndicator = document.getElementById('trading-data-loading');
    const dataContainer = document.getElementById('real-estate-news');
    
    if (!regionSelect || !loadButton || !dataContainer) {
      console.error("실거래가 UI 요소를 찾을 수 없습니다.");
      return;
    }
    
    // 지역 선택 변경 시 이벤트
    regionSelect.addEventListener('change', function() {
      console.log("선택된 지역:", this.value);
    });
    
    // 데이터 조회 버튼 클릭 이벤트
    loadButton.addEventListener('click', function() {
      const selectedRegion = regionSelect.value;
      const regionCode = API.getRegionCode(selectedRegion);
      
      console.log(`${selectedRegion}(${regionCode}) 지역의 실거래가 데이터를 로드합니다.`);
      
      // 로딩 표시
      loadingIndicator.classList.remove('hidden');
      dataContainer.innerHTML = '';
      
      // 실거래가 데이터 로드
      API.loadRealTradingData(regionCode)
        .then(result => {
          // 로딩 표시 숨기기
          loadingIndicator.classList.add('hidden');
          
          // 데이터 표시
          displayRealTradingData(result, selectedRegion);
        })
        .catch(error => {
          loadingIndicator.classList.add('hidden');
          dataContainer.innerHTML = `<p class="text-center text-red-500">${error.message || '데이터 로드 중 오류가 발생했습니다.'}</p>`;
        });
    });
  }
  
  // 실거래가 데이터 표시 함수
  function displayRealTradingData(result, region) {
    const dataContainer = document.getElementById('real-estate-news');
    if (!dataContainer) return;
    
    // 데이터가 없거나 오류가 발생한 경우
    if (!result.success || !result.data || result.data.length === 0) {
      dataContainer.innerHTML = `<p class="text-center py-10 text-gray-500">${result.message || `${region} 지역의 실거래 데이터가 없습니다.`}</p>`;
      return;
    }
    
    // 최신 데이터 정렬 (년, 월, 일 기준)
    const sortedData = result.data.sort((a, b) => {
      const dateA = new Date(a.dealYear, a.dealMonth - 1, a.dealDay);
      const dateB = new Date(b.dealYear, b.dealMonth - 1, b.dealDay);
      return dateB - dateA; // 최신순 정렬
    });
    
    // 최신 데이터 20개만 표시
    const recentData = sortedData.slice(0, 20);
    
    // 헤더 추가
    const header = document.createElement('div');
    header.className = 'mb-6';
    
    // 표시할 전체 데이터 수
    const totalCount = document.createElement('p');
    totalCount.className = 'text-gray-500 mb-2';
    totalCount.textContent = `총 ${result.data.length}개의 거래 데이터 중 최근 20건 표시`;
    header.appendChild(totalCount);
    
    // 지역 정보 및 데이터 기간
    const { year, month } = getLastMonth();
    const regionInfo = document.createElement('h3');
    regionInfo.className = 'text-xl font-semibold text-gray-800';
    regionInfo.textContent = `${region} 아파트 매매 실거래 정보 (${year}년 ${month}월)`;
    header.appendChild(regionInfo);
    
    dataContainer.appendChild(header);
    
    // 데이터 리스트 생성
    const dataList = document.createElement('div');
    dataList.className = 'grid grid-cols-1 lg:grid-cols-2 gap-4';
    
    recentData.forEach(item => {
      const listItem = document.createElement('div');
      listItem.className = 'bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-primary transition-colors';
      
      const dealDate = `${item.dealYear}년 ${item.dealMonth}월 ${item.dealDay}일`;
      const areaInPyeong = (parseFloat(item.area) * 0.3025).toFixed(2); // 평 변환
      
      listItem.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <h4 class="text-lg font-medium text-gray-800">${item.apartmentName}</h4>
          <span class="text-sm bg-primary/20 text-gray-700 px-2 py-1 rounded">${item.dealAmount}</span>
        </div>
        <p class="text-gray-600 mb-1">위치: ${item.dong}</p>
        <div class="grid grid-cols-2 gap-2 text-sm text-gray-500">
          <div>면적: ${item.area}㎡ (약 ${areaInPyeong}평)</div>
          <div>층수: ${item.floor}층</div>
          <div>거래일: ${dealDate}</div>
          <div>건축년도: ${item.buildYear}년</div>
        </div>
      `;
      
      dataList.appendChild(listItem);
    });
    
    dataContainer.appendChild(dataList);
  }

  // 초기화 함수 실행
  init();
});

function initializeCharts() {
  // 필요한 차트 요소 확인
  const chartElements = ["price-trend-chart", "neighborhood-chart", "investment-chart", "commercial-chart", "transaction-volume-chart", "price-distribution-chart", "sentiment-chart"];

  // 존재하는 차트만 초기화
  const chartsToInit = chartElements.filter((id) => document.getElementById(id));

  if (chartsToInit.length === 0) return;

  // 가격 추세 차트
  if (document.getElementById("price-trend-chart")) {
    const priceTrendChart = echarts.init(document.getElementById("price-trend-chart"));
    const priceTrendOption = {
      animation: false,
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        textStyle: {
          color: "#1f2937",
        },
      },
      grid: {
        top: 10,
        right: 10,
        bottom: 20,
        left: 40,
      },
      xAxis: {
        type: "category",
        data: ["1월", "2월", "3월", "4월", "5월", "6월"],
        axisLine: {
          lineStyle: {
            color: "#d1d5db",
          },
        },
        axisLabel: {
          color: "#1f2937",
        },
      },
      yAxis: {
        type: "value",
        axisLine: {
          lineStyle: {
            color: "#d1d5db",
          },
        },
        axisLabel: {
          color: "#1f2937",
        },
        splitLine: {
          lineStyle: {
            color: "#e5e7eb",
          },
        },
      },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330],
          type: "line",
          smooth: true,
          symbol: "none",
          lineStyle: {
            color: "rgba(87, 181, 231, 1)",
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(87, 181, 231, 0.3)",
              },
              {
                offset: 1,
                color: "rgba(87, 181, 231, 0.1)",
              },
            ]),
          },
        },
      ],
    };
    priceTrendChart.setOption(priceTrendOption);
  }

  // 지역 비교 차트
  if (document.getElementById("neighborhood-chart")) {
    const neighborhoodChart = echarts.init(document.getElementById("neighborhood-chart"));
    const neighborhoodOption = {
      animation: false,
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        textStyle: {
          color: "#1f2937",
        },
      },
      grid: {
        top: 10,
        right: 10,
        bottom: 20,
        left: 40,
      },
      xAxis: {
        type: "category",
        data: ["지역 A", "지역 B", "지역 C", "지역 D", "지역 E"],
        axisLine: {
          lineStyle: {
            color: "#d1d5db",
          },
        },
        axisLabel: {
          color: "#1f2937",
        },
      },
      yAxis: {
        type: "value",
        axisLine: {
          lineStyle: {
            color: "#d1d5db",
          },
        },
        axisLabel: {
          color: "#1f2937",
        },
        splitLine: {
          lineStyle: {
            color: "#e5e7eb",
          },
        },
      },
      series: [
        {
          data: [5200, 4800, 6500, 5800, 7200],
          type: "bar",
          barWidth: "60%",
          itemStyle: {
            color: "rgba(141, 211, 199, 1)",
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };
    neighborhoodChart.setOption(neighborhoodOption);
  }

  // 투자 차트
  if (document.getElementById("investment-chart")) {
    const investmentChart = echarts.init(document.getElementById("investment-chart"));
    const investmentOption = {
      animation: false,
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        textStyle: {
          color: "#1f2937",
        },
      },
      series: [
        {
          name: "투자 잠재력",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: "12",
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: 35, name: "고성장", itemStyle: { color: "rgba(87, 181, 231, 1)" } },
            { value: 30, name: "안정", itemStyle: { color: "rgba(141, 211, 199, 1)" } },
            { value: 20, name: "중간", itemStyle: { color: "rgba(251, 191, 114, 1)" } },
            { value: 15, name: "저성장", itemStyle: { color: "rgba(252, 141, 98, 1)" } },
          ],
        },
      ],
    };
    investmentChart.setOption(investmentOption);
  }

  // 시장 심리 차트
  if (document.getElementById("sentiment-chart")) {
    const sentimentChart = echarts.init(document.getElementById("sentiment-chart"));
    const sentimentOption = {
      animation: false,
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        textStyle: {
          color: "#1f2937",
        },
      },
      grid: {
        top: 10,
        right: 10,
        bottom: 20,
        left: 40,
      },
      xAxis: {
        type: "category",
        data: ["1월", "2월", "3월", "4월", "5월", "6월"],
        axisLine: {
          lineStyle: {
            color: "#d1d5db",
          },
        },
        axisLabel: {
          color: "#1f2937",
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 100,
        axisLine: {
          lineStyle: {
            color: "#d1d5db",
          },
        },
        axisLabel: {
          color: "#1f2937",
        },
        splitLine: {
          lineStyle: {
            color: "#e5e7eb",
          },
        },
      },
      series: [
        {
          data: [45, 52, 58, 62, 65, 68],
          type: "line",
          smooth: true,
          symbol: "none",
          lineStyle: {
            color: "rgba(87, 181, 231, 1)",
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(87, 181, 231, 0.3)",
              },
              {
                offset: 1,
                color: "rgba(87, 181, 231, 0.1)",
              },
            ]),
          },
        },
      ],
    };
    sentimentChart.setOption(sentimentOption);
  }

  // 창 크기가 변경될 때 차트 크기 조정
  window.addEventListener("resize", function () {
    chartsToInit.forEach((id) => {
      const chart = echarts.getInstanceByDom(document.getElementById(id));
      if (chart) {
        chart.resize();
      }
    });
  });
}