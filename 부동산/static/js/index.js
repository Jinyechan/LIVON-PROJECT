// static/js/index.js

document.addEventListener("DOMContentLoaded", function () {
  console.log("문서 로드됨, 초기화 시작...");

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
    initFilters(); // 필터 초기화
    
    // 지도는 HTML에서 직접 초기화하므로 여기서는 초기화하지 않음
    console.log("지도는 HTML에서 직접 초기화됨");
    
    initializeCharts();
    
    // 지도가 초기화된 후에 현재 위치 기반 매물 로드
    checkMapAndLoadData();
    
    console.log("초기화 완료!");
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
                // 모든 매물 데이터 저장
                allProperties = data.properties;
                
                // 매물에 가상의 방향 속성 추가 (필터링 테스트용)
                const directions = ['남향', '남동향', '남서향', '동향', '서향', '북향', '북동향', '북서향'];
                allProperties = allProperties.map(property => {
                  // 매물 데이터에 임의의 방향 속성 추가
                  property.direction = directions[Math.floor(Math.random() * directions.length)];
                  return property;
                });
                
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
                allProperties = [];
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
                // 모든 매물 데이터 저장
                allProperties = data.properties;
                
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
                allProperties = [];
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
            // 모든 매물 데이터 저장
            allProperties = data.properties;
            
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
            allProperties = [];
            updatePropertyList([]);
          }
        });
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

  // 초기화 함수 실행
  init();
});