// static/js/ui.js

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
  
  // 매물 목록 UI 업데이트 함수
  function updatePropertyList(properties) {
    const propertyListContainer = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.gap-4');
    
    if (!propertyListContainer) {
      console.error('매물 목록 컨테이너를 찾을 수 없습니다.');
      return;
    }
    
    // 컨테이너 초기화
    propertyListContainer.innerHTML = '';
    
    // 매물이 없는 경우 - 메시지 수정
    if (!properties || properties.length === 0) {
      propertyListContainer.innerHTML = `
        <div class="col-span-2 p-8 text-center bg-gray-50 rounded-lg">
          <i class="ri-home-5-line text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-500">주변에 매물이 없습니다.</p>
        </div>
      `;
      return;
    }
    
    // 매물 리스트 생성
    properties.forEach(property => {
      const propertyCard = document.createElement('div');
      propertyCard.className = 'property-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200';
      propertyCard.setAttribute('data-id', property.id);
      
      // 이미지 URL 확인
      const imageUrl = property.imageUrl || `https://via.placeholder.com/400x300?text=${encodeURIComponent(property.title || '매물')}`;
      
      // 찜 버튼 상태 결정
      const isFavorite = favoriteProperties.includes(property.id);
      const heartIcon = isFavorite ? 'ri-heart-fill' : 'ri-heart-line';
      const heartClass = isFavorite ? 'active' : '';
      
      // 면적을 평수로 변환하여 표시 (㎡ -> 평)
      let areaDisplay = property.area || '';
      const areaMatch = property.area && property.area.match(/(\d+\.?\d*)/);
      if (areaMatch) {
        const areaSqm = parseFloat(areaMatch[1]);
        const areaPyung = Math.round(areaSqm / 3.3058 * 10) / 10; // 소수점 첫째자리까지 반올림
        areaDisplay = `${areaSqm}㎡ (${areaPyung}평)`;
      }
      
      propertyCard.innerHTML = `
        <div class="relative">
          <img src="${imageUrl}" class="w-full h-48 object-cover" alt="${property.title || '매물'} 이미지">
          <button class="favorite-btn absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full hover:bg-white ${heartClass}">
            <i class="${heartIcon} text-gray-600 hover:text-red-500"></i>
          </button>
        </div>
        <div class="p-4">
          <h3 class="font-medium text-gray-800 mb-1">${property.title || '매물 정보'}</h3>
          <p class="text-sm text-gray-500 mb-2">${property.location || '위치 정보 없음'}</p>
          <div class="flex justify-between items-center">
            <span class="text-lg font-semibold text-gray-800">${property.formattedPrice || '가격 정보 없음'}</span>
            <span class="text-sm text-gray-500">${areaDisplay}</span>
          </div>
        </div>
      `;
      
      // 찜 버튼 클릭 이벤트
      const favoriteBtn = propertyCard.querySelector('.favorite-btn');
      if (favoriteBtn) {
        favoriteBtn.addEventListener('click', function(event) {
          event.stopPropagation(); // 매물 카드 클릭 이벤트 방지
          toggleFavorite(property.id);
        });
      }
      
      // 카드 클릭 이벤트 - 지도에서 해당 매물 위치로 이동
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
  
  function getLastMonth() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = String(lastMonth.getMonth() + 1).padStart(2, '0');
    return { year, month };
  }
  
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