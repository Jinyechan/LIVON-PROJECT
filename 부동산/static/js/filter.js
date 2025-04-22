// static/js/filter.js

// 전역 변수
let allProperties = []; // 모든 매물 데이터 저장
let isShowingFavoritesOnly = false; // 찜한 매물만 보기 모드
let activeFilters = {}; // 적용 중인 필터
let favoriteProperties = []; // 찜한 매물 목록 배열

// 필터 초기화 함수
function initFilters() {
  // 필터 토글 버튼 클릭 이벤트
  document.querySelectorAll('.filter-toggle').forEach(button => {
    button.addEventListener('click', function(event) {
      event.stopPropagation(); // 이벤트 버블링 방지
      
      const filterType = this.getAttribute('data-filter');
      const menuElement = this.closest('.filter-dropdown').querySelector('.filter-menu');
      
      // 현재 메뉴 토글
      if (menuElement.classList.contains('hidden')) {
        // 다른 열린 메뉴 모두 닫기
        document.querySelectorAll('.filter-menu').forEach(menu => {
          if (menu !== menuElement) {
            menu.classList.add('hidden');
          }
        });
        
        // 현재 메뉴 열기
        menuElement.classList.remove('hidden');
        this.classList.add('active');
        
        // 메뉴 위치 조정 (화면 밖으로 나가지 않도록)
        const rect = menuElement.getBoundingClientRect();
        
        // 고정 헤더 및 검색필터 영역 고려하여 위치 조정
        if (rect.right > window.innerWidth) {
          menuElement.style.left = 'auto';
          menuElement.style.right = '0';
        }
        
        // 메뉴가 화면 아래로 넘어가는 경우 처리
        if (rect.bottom > window.innerHeight) {
          menuElement.style.maxHeight = `${window.innerHeight - rect.top - 20}px`;
          menuElement.style.overflowY = 'auto';
        }
      } else {
        // 현재 메뉴 닫기
        menuElement.classList.add('hidden');
        this.classList.remove('active');
      }
    });
  });
  
  // 필터 외부 클릭 시 닫기
  document.addEventListener('click', function(event) {
    const isClickInsideFilter = event.target.closest('.filter-dropdown');
    if (!isClickInsideFilter) {
      document.querySelectorAll('.filter-menu').forEach(menu => {
        menu.classList.add('hidden');
      });
      document.querySelectorAll('.filter-toggle').forEach(toggle => {
        toggle.classList.remove('active');
      });
    }
  });
  
  // 면적 슬라이더 초기화 (평수 단위)
  const areaMin = document.getElementById('area-min');
  const areaMax = document.getElementById('area-max');
  const areaDisplay = document.getElementById('area-display');
  
  if (areaMin && areaMax && areaDisplay) {
    // 슬라이더 값 변경 시 표시 업데이트
    function updateAreaDisplay() {
      const minVal = parseInt(areaMin.value);
      const maxVal = parseInt(areaMax.value);
      
      // 60평 이상인 경우 텍스트 조정
      const maxText = maxVal >= 60 ? "60평 이상" : `${maxVal}평`;
      areaDisplay.textContent = `${minVal}평 ~ ${maxText}`;
      
      // 최소값이 최대값보다 크면 조정
      if (minVal > maxVal) {
        if (areaMin === document.activeElement) {
          areaMax.value = minVal;
        } else {
          areaMin.value = maxVal;
        }
        updateAreaDisplay();
      }
    }
    
    areaMin.addEventListener('input', updateAreaDisplay);
    areaMax.addEventListener('input', updateAreaDisplay);
    
    // 초기 업데이트
    updateAreaDisplay();
    
    // 면적 프리셋 버튼 클릭 이벤트
    document.querySelectorAll('.area-preset').forEach(btn => {
      btn.addEventListener('click', function() {
        // 모든 프리셋 버튼에서 활성 클래스 제거
        document.querySelectorAll('.area-preset').forEach(b => b.classList.remove('active'));
        
        // 현재 버튼 활성화
        this.classList.add('active');
        
        // 슬라이더 값 설정
        areaMin.value = this.getAttribute('data-min');
        areaMax.value = this.getAttribute('data-max');
        
        // 표시 업데이트
        updateAreaDisplay();
      });
    });
  }
  
  // 필터 적용 버튼 이벤트
  document.querySelectorAll('.filter-apply-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // 부모 필터 메뉴 찾기
      const filterMenu = this.closest('.filter-menu');
      const filterType = filterMenu.closest('.filter-dropdown').querySelector('.filter-toggle').getAttribute('data-filter');
      
      // 필터 값 수집
      if (filterType === 'property-type') {
        // 매물 유형 필터 적용
        const checkedTypes = Array.from(filterMenu.querySelectorAll('input[name="property-type"]:checked'))
          .map(input => input.value);
        
        activeFilters.propertyType = checkedTypes.length > 0 ? checkedTypes : null;
      }
      else if (filterType === 'price-range') {
        // 가격대 필터 적용
        const priceMin = document.getElementById('price-min').value;
        const priceMax = document.getElementById('price-max').value;
        const monthlyMin = document.getElementById('monthly-min').value;
        const monthlyMax = document.getElementById('monthly-max').value;
        
        activeFilters.price = {
          min: priceMin ? parseFloat(priceMin) * 10000 * 10000 : null, // 억 단위를 원 단위로 변환
          max: priceMax ? parseFloat(priceMax) * 10000 * 10000 : null,
          monthlyMin: monthlyMin ? parseFloat(monthlyMin) * 10000 : null, // 만원 단위를 원 단위로 변환
          monthlyMax: monthlyMax ? parseFloat(monthlyMax) * 10000 : null
        };
      }
      else if (filterType === 'area-range') {
        // 면적 필터 적용 (평 단위)
        const areaMin = document.getElementById('area-min').value;
        const areaMax = document.getElementById('area-max').value;
        
        activeFilters.area = {
          min: areaMin ? parseFloat(areaMin) * 3.3058 : null, // 평을 제곱미터로 변환
          max: areaMax ? parseFloat(areaMax) * 3.3058 : null  // 평을 제곱미터로 변환
        };
      }
      
      // 메뉴 닫기
      filterMenu.classList.add('hidden');
      filterMenu.closest('.filter-dropdown').querySelector('.filter-toggle').classList.remove('active');
      
      // 필터 적용하여 매물 리스트 업데이트
      filterAndUpdateProperties();
      
      console.log('현재 적용된 필터:', activeFilters);
    });
  });
  
  // 찜한 매물만 보기 버튼 이벤트
  const favoritesFilterBtn = document.getElementById('favorites-filter');
  if (favoritesFilterBtn) {
    favoritesFilterBtn.addEventListener('click', function() {
      this.classList.toggle('active');
      isShowingFavoritesOnly = this.classList.contains('active');
      
      // 필터 적용하여 매물 리스트 업데이트
      filterAndUpdateProperties();
    });
  }
  
  // 로컬 스토리지에서 찜 목록 불러오기
  loadFavoritesFromStorage();
}

// 필터링 및 매물 리스트 업데이트 함수
function filterAndUpdateProperties() {
  // 기존 매물 데이터 복사
  let filteredProperties = [...allProperties];
  
  // 찜한 매물만 보기 필터 적용
  if (isShowingFavoritesOnly) {
    filteredProperties = filteredProperties.filter(property => 
      favoriteProperties.includes(property.id)
    );
  }
  
  // 매물 유형 필터 적용
  if (activeFilters.propertyType && activeFilters.propertyType.length > 0) {
    filteredProperties = filteredProperties.filter(property => {
      // 빌라/투룸 필터링 특수 처리
      if (activeFilters.propertyType.includes('빌라/투룸')) {
        if (property.type === '빌라' || property.type === '투룸') {
          return true;
        }
      }
      return activeFilters.propertyType.includes(property.type);
    });
  }
  
  // 가격대 필터 적용
  if (activeFilters.price) {
    filteredProperties = filteredProperties.filter(property => {
      // 실제 구현 시 매물 데이터에 거래 유형(매매/전세/월세)과 가격 정보가 있어야 함
      const price = property.price; // 원 단위 가격
      
      // 매매, 전세인 경우 (price가 억 단위)
      if (property.dealType === '매매' || property.dealType === '전세') {
        if (activeFilters.price.min && price < activeFilters.price.min) return false;
        if (activeFilters.price.max && price > activeFilters.price.max) return false;
      }
      // 월세인 경우
      else if (property.dealType === '월세') {
        const monthlyPrice = property.monthlyPrice || 0; // 월세 가격(만원)
        if (activeFilters.price.monthlyMin && monthlyPrice < activeFilters.price.monthlyMin) return false;
        if (activeFilters.price.monthlyMax && monthlyPrice > activeFilters.price.monthlyMax) return false;
      }
      return true;
    });
  }
  
  // 면적 필터 적용 (평 -> 제곱미터 변환하여 비교)
  if (activeFilters.area) {
    filteredProperties = filteredProperties.filter(property => {
      // 면적 문자열(예: "80㎡")에서 숫자만 추출
      const areaMatch = property.area && property.area.match(/(\d+\.?\d*)/);
      if (!areaMatch) return true; // 면적 정보가 없으면 필터링하지 않음
      
      const area = parseFloat(areaMatch[1]);
      if (activeFilters.area.min && area < activeFilters.area.min) return false;
      if (activeFilters.area.max && area > activeFilters.area.max) return false;
      return true;
    });
  }
  
  // 필터링된 매물로 목록 업데이트
  updatePropertyList(filteredProperties);
  
  // 지도 마커도 업데이트
  updateMapMarkers(filteredProperties);
}

// 찜 목록 로컬 스토리지 저장/불러오기
function saveFavoritesToStorage() {
  localStorage.setItem('favoriteProperties', JSON.stringify(favoriteProperties));
}

function loadFavoritesFromStorage() {
  const saved = localStorage.getItem('favoriteProperties');
  if (saved) {
    favoriteProperties = JSON.parse(saved);
  }
}

// 찜하기 토글 함수
function toggleFavorite(propertyId) {
  const index = favoriteProperties.indexOf(propertyId);
  
  if (index === -1) {
    // 찜 목록에 추가
    favoriteProperties.push(propertyId);
  } else {
    // 찜 목록에서 제거
    favoriteProperties.splice(index, 1);
  }
  
  // 로컬 스토리지에 저장
  saveFavoritesToStorage();
  
  // 찜한 매물만 보기 모드인 경우 목록 업데이트
  if (isShowingFavoritesOnly) {
    filterAndUpdateProperties();
  } else {
    // 찜 버튼 상태만 업데이트
    updateFavoriteButtonStates();
  }
}

// 매물 목록의 찜 버튼 상태 업데이트
function updateFavoriteButtonStates() {
  document.querySelectorAll('.property-card').forEach(card => {
    const propertyId = card.getAttribute('data-id');
    const favoriteBtn = card.querySelector('.favorite-btn');
    
    if (favoriteBtn) {
      if (favoriteProperties.includes(propertyId)) {
        favoriteBtn.classList.add('active');
        const icon = favoriteBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('ri-heart-line');
          icon.classList.add('ri-heart-fill');
        }
      } else {
        favoriteBtn.classList.remove('active');
        const icon = favoriteBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('ri-heart-fill');
          icon.classList.add('ri-heart-line');
        }
      }
    }
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