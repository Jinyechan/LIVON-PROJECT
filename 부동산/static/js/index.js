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
    
    // 스크롤 이벤트 처리
    initScrollEvents();
    
    console.log("초기화 완료!");
  }

  // 스크롤 이벤트 초기화
  function initScrollEvents() {
    // 지도 영역 찾기
    const mapContainer = document.getElementById('kakao-map');
    if (mapContainer) {
      // 지도 영역에서 스크롤 이벤트 처리 - 확대/축소 기능
      mapContainer.addEventListener('wheel', function(e) {
        e.stopPropagation(); // 스크롤 이벤트 전파 중지
        e.preventDefault(); // 기본 스크롤 동작 방지
        
        // 스크롤 방향에 따른 확대/축소는 maps.js에서 처리
      }, { passive: false });
    }
    
    // 콘텐츠 패널만 스크롤 가능하도록 설정
    const contentPane = document.getElementById('content-pane');
    if (contentPane) {
      contentPane.style.overflowY = 'auto';
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
      initialSection.classList.add("active");
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
          btn.classList.remove("active");
        });

        // 클릭된 버튼에 활성화 상태 추가
        this.classList.add("active");

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