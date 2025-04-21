// static/js/slider.js

document.addEventListener("DOMContentLoaded", function () {
  console.log("문서 로드됨, 초기화 시작...");
  
  // 전역 변수 설정
  let map; // 카카오맵 인스턴스
  let currentMarkers = []; // 현재 지도에 표시된 마커들

  // API 데이터 로드 함수
  function loadApiData() {
      // 부동산 데이터 로드
      fetch("/api/property-data")
          .then((response) => response.json())
          .then((data) => {
              console.log("부동산 데이터 로드됨", data);
              updatePropertySection(data);
          })
          .catch((error) => console.error("부동산 데이터 로드 실패:", error));
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
      
      // 카카오맵 API 로드 확인 후 초기화
      if (typeof kakao !== 'undefined' && typeof kakao.maps !== 'undefined') {
          console.log("카카오맵 API가 로드되어 있습니다. 지도 초기화 시작...");
          initializeKakaoMap();
      } else {
          console.error("카카오맵 API가 로드되지 않았습니다. 1초 후 다시 시도합니다.");
          setTimeout(function() {
              if (typeof kakao !== 'undefined' && typeof kakao.maps !== 'undefined') {
                  console.log("카카오맵 API 로드 성공. 지도 초기화 시작...");
                  initializeKakaoMap();
              } else {
                  console.error("카카오맵 API 로드 실패. 스크립트 태그를 확인하세요.");
              }
          }, 1000);
      }
      
      initializeCharts();
      loadApiData();
      console.log("초기화 완료!");
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
                      loadNewsData();
                  } else if (targetSection === "weather") {
                      loadWeatherData();
                  } else if (targetSection === "crime-map") {
                      loadCrimeData();
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
          fetch(`/api/search?q=${encodeURIComponent(query)}`)
              .then((response) => response.json())
              .then((data) => {
                  console.log("검색 결과:", data);
                  // 검색 결과 표시 로직
                  displaySearchResults(data);

                  // 지도 중심 이동 (검색 지역으로)
                  if (map && data.coordinates) {
                      moveMapToLocation(data.coordinates.lat, data.coordinates.lng);
                  }
              })
              .catch((error) => console.error("검색 실패:", error));
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
      }
  }

  // 카카오맵 초기화
  function initializeKakaoMap() {
      console.log("카카오맵 초기화 함수 호출됨");
      
      // 맵 컨테이너 확인
      const mapContainer = document.getElementById("kakao-map");
      if (!mapContainer) {
          console.error("지도 컨테이너(kakao-map)를 찾을 수 없습니다.");
          return;
      }
      
      console.log("지도 컨테이너 크기:", mapContainer.offsetWidth, "x", mapContainer.offsetHeight);

      try {
          // 초기 지도 옵션 설정 (서울시 중심)
          const options = {
              center: new kakao.maps.LatLng(37.5665, 126.978), // 서울시 좌표
              level: 7, // 지도 확대 레벨
          };

          console.log("지도 옵션 설정:", options);

          // 지도 생성
          map = new kakao.maps.Map(mapContainer, options);
          console.log("카카오맵 생성 완료");

          // 현재 위치 가져오기
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                  // 성공 시 콜백
                  function (position) {
                      const lat = position.coords.latitude;
                      const lng = position.coords.longitude;
                      console.log("현재 위치 확인:", lat, lng);
                      moveMapToLocation(lat, lng, 5);
                  },
                  // 실패 시 콜백
                  function (error) {
                      console.error("현재 위치를 가져오는데 실패했습니다:", error);
                  }
              );
          }

          // 지도 이벤트 리스너 등록
          kakao.maps.event.addListener(map, "dragend", function () {
              // 지도 이동 후 현재 지도 영역의 매물 정보 로드
              const bounds = map.getBounds();
              const swLatLng = bounds.getSouthWest();
              const neLatLng = bounds.getNorthEast();

              loadPropertiesInBounds(swLatLng.getLat(), swLatLng.getLng(), neLatLng.getLat(), neLatLng.getLng());
          });

          // 샘플 매물 마커 표시
          const sampleProperties = [
              { lat: 37.5665, lng: 126.978, title: "서울 시청 인근 아파트", price: "8억 5,000만원" },
              { lat: 37.5282, lng: 126.9256, title: "여의도 오피스텔", price: "7억 2,000만원" },
              { lat: 37.4979, lng: 127.0276, title: "강남 럭셔리 아파트", price: "12억 5,000만원" },
              { lat: 37.5063, lng: 127.0418, title: "청담동 빌라", price: "9억 8,000만원" },
          ];

          // 샘플 마커 추가
          sampleProperties.forEach((property) => {
              addMarkerToMap(property.lat, property.lng, property.title, property.price);
          });
          
          // 지도 크기 재조정
          setTimeout(function() {
              console.log("지도 크기 재조정");
              map.relayout();
              map.setCenter(new kakao.maps.LatLng(37.5665, 126.978));
          }, 300);

      } catch (error) {
          console.error("카카오맵 초기화 중 오류 발생:", error);
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
      <h4>${title}</h4>
      <p>${price}</p>
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
  function moveMapToLocation(lat, lng, zoom = 5) {
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

  // 현재 지도 영역 내의 매물 정보 로드
  function loadPropertiesInBounds(swLat, swLng, neLat, neLng) {
      console.log("영역 내 매물 로드:", swLat, swLng, neLat, neLng);

      // API 호출
      fetch(`/api/properties-in-bounds?swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}`)
          .then(response => response.json())
          .then(data => {
              console.log("영역 내 매물 데이터 로드 성공:", data);
              // 지도에 마커 표시
              clearMapMarkers();
              data.properties.forEach(property => {
                  addMarkerToMap(
                      property.coordinates.lat, 
                      property.coordinates.lng, 
                      property.title, 
                      property.formattedPrice
                  );
              });
          })
          .catch(error => console.error('영역 내 매물 로드 실패:', error));
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
                  expandButton.style.right = "40%";
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
                  contentPane.style.width = isExpanded ? "100%" : "60%";
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

  // 날씨 데이터 로드
  function loadWeatherData() {
      const city = "seoul"; // 기본값
      fetch(`/api/weather?city=${city}`)
          .then((response) => response.json())
          .then((data) => {
              console.log("날씨 데이터 로드됨", data);
              updateWeatherUI(data);
          })
          .catch((error) => console.error("날씨 데이터 로드 실패:", error));
  }

  // 날씨 UI 업데이트
  function updateWeatherUI(data) {
      // 날씨 UI 업데이트 로직
      console.log("날씨 UI 업데이트");
  }

  // 뉴스 데이터 로드
  function loadNewsData() {
      fetch("/api/news")
          .then((response) => response.json())
          .then((data) => {
              console.log("뉴스 데이터 로드됨", data);
              updateNewsUI(data);
          })
          .catch((error) => console.error("뉴스 데이터 로드 실패:", error));
  }

  // 뉴스 UI 업데이트
  function updateNewsUI(data) {
      // 뉴스 UI 업데이트 로직
      console.log("뉴스 UI 업데이트");
  }

  // 범죄 데이터 로드
  function loadCrimeData() {
      fetch("/api/crime-data")
          .then((response) => response.json())
          .then((data) => {
              console.log("범죄 데이터 로드됨", data);
              updateCrimeUI(data);
          })
          .catch((error) => console.error("범죄 데이터 로드 실패:", error));
  }

  // 범죄 UI 업데이트
  function updateCrimeUI(data) {
      // 범죄 UI 업데이트 로직
      console.log("범죄 UI 업데이트");
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