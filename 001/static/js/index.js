function initializeCharts() {
  // 필요한 차트 요소 확인
  const chartElements = [
    'price-trend-chart',
    'neighborhood-chart',
    'investment-chart',
    'commercial-chart',
    'transaction-volume-chart',
    'price-distribution-chart',
    'sentiment-chart'
  ];
  
  // 존재하는 차트만 초기화
  const chartsToInit = chartElements.filter(id => document.getElementById(id));
  
  if (chartsToInit.length === 0) return;
  
  // 가격 추세 차트
  if (document.getElementById('price-trend-chart')) {
    const priceTrendChart = echarts.init(document.getElementById('price-trend-chart'));
    const priceTrendOption = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        textStyle: {
          color: '#1f2937'
        }
      },
      grid: {
        top: 10,
        right: 10,
        bottom: 20,
        left: 40
      },
      xAxis: {
        type: 'category',
        data: ['1월', '2월', '3월', '4월', '5월', '6월'],
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      series: [{
        data: [820, 932, 901, 934, 1290, 1330],
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: 'rgba(87, 181, 231, 1)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(87, 181, 231, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(87, 181, 231, 0.1)'
            }
          ])
        }
      }]
    };
    transactionVolumeChart.setOption(transactionVolumeOption);
  }

  // 가격 분포 차트
  if (document.getElementById('price-distribution-chart')) {
    const priceDistributionChart = echarts.init(document.getElementById('price-distribution-chart'));
    const priceDistributionOption = {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        textStyle: {
          color: '#1f2937'
        }
      },
      series: [{
        name: '가격 분포',
        type: 'pie',
        radius: '70%',
        center: ['50%', '50%'],
        data: [
          { value: 25, name: '5억원 이하', itemStyle: { color: 'rgba(87, 181, 231, 1)' } },
          { value: 35, name: '5억원-8억원', itemStyle: { color: 'rgba(141, 211, 199, 1)' } },
          { value: 25, name: '8억원-12억원', itemStyle: { color: 'rgba(251, 191, 114, 1)' } },
          { value: 15, name: '12억원 이상', itemStyle: { color: 'rgba(252, 141, 98, 1)' } }
        ],
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
    priceDistributionChart.setOption(priceDistributionOption);
  }

  // 시장 심리 차트
  if (document.getElementById('sentiment-chart')) {
    const sentimentChart = echarts.init(document.getElementById('sentiment-chart'));
    const sentimentOption = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        textStyle: {
          color: '#1f2937'
        }
      },
      grid: {
        top: 10,
        right: 10,
        bottom: 20,
        left: 40
      },
      xAxis: {
        type: 'category',
        data: ['1월', '2월', '3월', '4월', '5월', '6월'],
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      series: [{
        data: [45, 52, 58, 62, 65, 68],
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: 'rgba(87, 181, 231, 1)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(87, 181, 231, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(87, 181, 231, 0.1)'
            }
          ])
        }
      }]
    };
    sentimentChart.setOption(sentimentOption);
  }

  // 창 크기가 변경될 때 차트 크기 조정
  window.addEventListener('resize', function() {
    chartsToInit.forEach(id => {
      const chart = echarts.getInstanceByDom(document.getElementById(id));
      if (chart) {
        chart.resize();
      }
    });
  });
}(87, 181, 231, 0.1)'
            }
          ])
        }
      }]
    };
    priceTrendChart.setOption(priceTrendOption);
  }

  // 지역 비교 차트
  if (document.getElementById('neighborhood-chart')) {
    const neighborhoodChart = echarts.init(document.getElementById('neighborhood-chart'));
    const neighborhoodOption = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        textStyle: {
          color: '#1f2937'
        }
      },
      grid: {
        top: 10,
        right: 10,
        bottom: 20,
        left: 40
      },
      xAxis: {
        type: 'category',
        data: ['지역 A', '지역 B', '지역 C', '지역 D', '지역 E'],
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      series: [{
        data: [5200, 4800, 6500, 5800, 7200],
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          color: 'rgba(141, 211, 199, 1)',
          borderRadius: [4, 4, 0, 0]
        }
      }]
    };
    neighborhoodChart.setOption(neighborhoodOption);
  }

  // 투자 차트
  if (document.getElementById('investment-chart')) {
    const investmentChart = echarts.init(document.getElementById('investment-chart'));
    const investmentOption = {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        textStyle: {
          color: '#1f2937'
        }
      },
      series: [{
        name: '투자 잠재력',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '12',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 35, name: '고성장', itemStyle: { color: 'rgba(87, 181, 231, 1)' } },
          { value: 30, name: '안정', itemStyle: { color: 'rgba(141, 211, 199, 1)' } },
          { value: 20, name: '중간', itemStyle: { color: 'rgba(251, 191, 114, 1)' } },
          { value: 15, name: '저성장', itemStyle: { color: 'rgba(252, 141, 98, 1)' } }
        ]
      }]
    };
    investmentChart.setOption(investmentOption);
  }

  // 상업용 차트
  if (document.getElementById('commercial-chart')) {
    const commercialChart = echarts.init(document.getElementById('commercial-chart'));
    const commercialOption = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        textStyle: {
          color: '#1f2937'
        }
      },
      legend: {
        data: ['오피스텔', '상업용'],
        bottom: 0,
        textStyle: {
          color: '#1f2937'
        }
      },
      grid: {
        top: 10,
        right: 10,
        bottom: 40,
        left: 40
      },
      xAxis: {
        type: 'category',
        data: ['강남', '마포', '영등포', '송파', '서초'],
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      series: [
        {
          name: '오피스텔',
          type: 'bar',
          data: [9850, 7320, 6940, 8120, 8750],
          itemStyle: {
            color: 'rgba(87, 181, 231, 1)',
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: '상업용',
          type: 'bar',
          data: [8500, 6800, 6500, 7600, 8200],
          itemStyle: {
            color: 'rgba(141, 211, 199, 1)',
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    };
    commercialChart.setOption(commercialOption);
  }

  // 거래량 차트
  if (document.getElementById('transaction-volume-chart')) {
    const transactionVolumeChart = echarts.init(document.getElementById('transaction-volume-chart'));
    const transactionVolumeOption = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        textStyle: {
          color: '#1f2937'
        }
      },
      grid: {
        top: 10,
        right: 10,
        bottom: 20,
        left: 40
      },
      xAxis: {
        type: 'category',
        data: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      series: [{
        data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330],
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: 'rgba(87, 181, 231, 1)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(87, 181, 231, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba// static/js/slider.js

document.addEventListener('DOMContentLoaded', function() {
  // API 데이터 로드 함수
  function loadApiData() {
    // 부동산 데이터 로드
    fetch('/api/property-data')
      .then(response => response.json())
      .then(data => {
        console.log('부동산 데이터 로드됨', data);
        updatePropertySection(data);
      })
      .catch(error => console.error('부동산 데이터 로드 실패:', error));
  }

  function updatePropertySection(data) {
    // 여기서 데이터를 사용하여 부동산 섹션 업데이트
    if (data.featured && data.featured.length > 0) {
      // 추천 매물 업데이트 로직
      console.log('추천 매물 업데이트 가능');
    }

    if (data.regions && data.regions.length > 0) {
      // 지역 데이터 표시 로직
      console.log('지역 데이터 업데이트 가능');
    }
  }

  // 초기화 함수
  function init() {
    initSections();
    initNavigation();
    initSearchAutocomplete();
    initExpandButton();
    initCustomControls();
    initializeCharts();
    loadApiData();
  }

  // 섹션 가시성 초기화
  function initSections() {
    const sections = {
      'property-search': document.querySelector('#property-search'),
      'news': document.querySelector('#news'),
      'weather': document.querySelector('#weather'),
      'crime-map': document.querySelector('#crime-map')
    };

    // 처음에는 property-search를 제외한 모든 섹션 숨기기
    Object.entries(sections).forEach(([key, section]) => {
      if(key !== 'property-search' && section) {
        section.style.display = 'none';
      }
    });

    // 초기 섹션에 활성화 상태 추가
    const initialSection = document.querySelector('[data-section="property-search"]');
    if (initialSection) {
      initialSection.classList.add('bg-primary/10', 'text-gray-900');
    }

    // 모든 섹션에 트랜지션 스타일 추가
    Object.values(sections).forEach(section => {
      if (section) {
        section.style.transition = 'opacity 0.3s ease-in-out';
      }
    });
  }

  // 네비게이션 초기화
  function initNavigation() {
    const sections = {
      'property-search': document.querySelector('#property-search'),
      'news': document.querySelector('#news'),
      'weather': document.querySelector('#weather'),
      'crime-map': document.querySelector('#crime-map')
    };

    document.querySelectorAll('.nav-item').forEach(button => {
      button.addEventListener('click', function() {
        // 모든 버튼에서 활성화 상태 제거
        document.querySelectorAll('.nav-item').forEach(btn => {
          btn.classList.remove('bg-primary/10', 'text-gray-900');
        });

        // 클릭된 버튼에 활성화 상태 추가
        this.classList.add('bg-primary/10', 'text-gray-900');

        const targetSection = this.getAttribute('data-section');

        // 모든 섹션 페이드 아웃
        Object.values(sections).forEach(section => {
          if (section) {
            section.style.opacity = '0';
            setTimeout(() => {
              section.style.display = 'none';
            }, 300);
          }
        });

        // 타겟 섹션 페이드 인
        const target = sections[targetSection];
        if (target) {
          setTimeout(() => {
            target.style.display = 'block';
            setTimeout(() => {
              target.style.opacity = '1';
            }, 50);
          }, 300);
          
          // 섹션 변경 시 적절한 API 호출
          if (targetSection === 'news') {
            loadNewsData();
          } else if (targetSection === 'weather') {
            loadWeatherData();
          } else if (targetSection === 'crime-map') {
            loadCrimeData();
          }
        }
      });
    });

    // 스무스 스크롤 코드
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const contentPane = document.getElementById('content-pane');
          if (contentPane) {
            contentPane.scrollTo({
              top: targetElement.offsetTop - 80,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }

  // 검색 자동완성 초기화
  function initSearchAutocomplete() {
    const locationSearch = document.getElementById('location-search');
    const searchAutocomplete = document.getElementById('search-autocomplete');
    
    if (locationSearch && searchAutocomplete) {
      const sampleLocations = [
        '강남구, 서울',
        '서초구, 서울',
        '용산구, 서울',
        '마포구, 서울',
        '송파구, 서울'
      ];

      locationSearch.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        if (value.length > 0) {
          const matches = sampleLocations.filter(location =>
            location.toLowerCase().includes(value)
          );
          if (matches.length > 0) {
            searchAutocomplete.innerHTML = matches.map(location => `
              <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                ${location}
              </button>
            `).join('');
            searchAutocomplete.classList.remove('hidden');
            
            // 자동완성 항목 클릭 이벤트
            searchAutocomplete.querySelectorAll('button').forEach(button => {
              button.addEventListener('click', function() {
                locationSearch.value = this.textContent.trim();
                searchAutocomplete.classList.add('hidden');
                // 검색 실행
                performSearch(locationSearch.value);
              });
            });
          } else {
            searchAutocomplete.classList.add('hidden');
          }
        } else {
          searchAutocomplete.classList.add('hidden');
        }
      });

      document.addEventListener('click', function(e) {
        if (!locationSearch.contains(e.target)) {
          searchAutocomplete.classList.add('hidden');
        }
      });
      
      // 검색 버튼 이벤트
      const searchButton = document.querySelector('button[title="검색"]');
      if (searchButton) {
        searchButton.addEventListener('click', function() {
          performSearch(locationSearch.value);
        });
      }
      
      // 엔터 키 이벤트
      locationSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          performSearch(locationSearch.value);
        }
      });
    }
  }
  
  // 검색 실행 함수
  function performSearch(query) {
    if (query && query.length >= 2) {
      console.log('검색어: ' + query);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
          console.log('검색 결과:', data);
          // 검색 결과 표시 로직
          displaySearchResults(data);
        })
        .catch(error => console.error('검색 실패:', error));
    }
  }
  
  // 검색 결과 표시 함수
  function displaySearchResults(data) {
    // 이 함수는 검색 결과를 UI에 표시하는 로직 구현
    console.log('검색 결과 표시');
  }

  // 확장/축소 버튼 초기화
  function initExpandButton() {
    const contentPane = document.getElementById('content-pane');
    const mapPane = document.getElementById('map-pane');
    const expandButton = document.getElementById('expand-button');
    
    if (contentPane && mapPane && expandButton) {
      let isExpanded = false;
      
      expandButton.addEventListener('click', () => {
        isExpanded = !isExpanded;
        
        // 버튼 위치 및 아이콘 업데이트
        if(isExpanded) {
          expandButton.style.right = '0';
          const icon = expandButton.querySelector('i');
          if (icon) {
            icon.classList.remove('ri-arrow-left-line');
            icon.classList.add('ri-arrow-right-line');
          }
        } else {
          expandButton.style.right = '40%';
          const icon = expandButton.querySelector('i');
          if (icon) {
            icon.classList.remove('ri-arrow-right-line');
            icon.classList.add('ri-arrow-left-line');
          }
        }

        // 콘텐츠 및 지도 패널 애니메이션
        requestAnimationFrame(() => {
          contentPane.style.width = isExpanded ? '100%' : '60%';
          mapPane.style.transform = isExpanded ? 'translateX(100%)' : 'translateX(0)';
          mapPane.style.opacity = isExpanded ? '0' : '1';
        });
      });
    }
  }

  // 커스텀 컨트롤 초기화
  function initCustomControls() {
    // 커스텀 체크박스 기능
    const checkboxes = document.querySelectorAll('.custom-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('click', function() {
        this.classList.toggle('checked');
      });
    });

    // 커스텀 라디오 버튼 기능
    const radios = document.querySelectorAll('.custom-radio');
    radios.forEach(radio => {
      radio.addEventListener('click', function() {
        const name = this.id.split('-')[0];
        document.querySelectorAll(`.custom-radio[id^="${name}"]`).forEach(r => {
          r.classList.remove('checked');
        });
        this.classList.add('checked');
      });
    });
  }
  
  // 날씨 데이터 로드
  function loadWeatherData() {
    const city = 'seoul'; // 기본값
    fetch(`/api/weather?city=${city}`)
      .then(response => response.json())
      .then(data => {
        console.log('날씨 데이터 로드됨', data);
        updateWeatherUI(data);
      })
      .catch(error => console.error('날씨 데이터 로드 실패:', error));
  }
  
  // 날씨 UI 업데이트
  function updateWeatherUI(data) {
    // 날씨 UI 업데이트 로직
    console.log('날씨 UI 업데이트');
  }
  
  // 뉴스 데이터 로드
  function loadNewsData() {
    fetch('/api/news')
      .then(response => response.json())
      .then(data => {
        console.log('뉴스 데이터 로드됨', data);
        updateNewsUI(data);
      })
      .catch(error => console.error('뉴스 데이터 로드 실패:', error));
  }
  
  // 뉴스 UI 업데이트
  function updateNewsUI(data) {
    // 뉴스 UI 업데이트 로직
    console.log('뉴스 UI 업데이트');
  }
  
  // 범죄 데이터 로드
  function loadCrimeData() {
    fetch('/api/crime-data')
      .then(response => response.json())
      .then(data => {
        console.log('범죄 데이터 로드됨', data);
        updateCrimeUI(data);
      })
      .catch(error => console.error('범죄 데이터 로드 실패:', error));
  }
  
  // 범죄 UI 업데이트
  function updateCrimeUI(data) {
    // 범죄 UI 업데이트 로직
    console.log('범죄 UI 업데이트');
  }

  // 초기화 함수 실행
  init();
});

function initializeCharts() {
  // 필요한 차트 요소 확인
  const chartElements = [
    'price-trend-chart',
    'neighborhood-chart',
    'investment-chart',
    'commercial-chart',
    'transaction-volume-chart',
    'price-distribution-chart',
    'sentiment-chart'
  ];
  
  // 존재하는 차트만 초기화
  const chartsToInit = chartElements.filter(id => document.getElementById(id));
  
  if (chartsToInit.length === 0) return;
  
  // 가격 추세 차트
  if (document.getElementById('price-trend-chart')) {
    const priceTrendChart = echarts.init(document.getElementById('price-trend-chart'));
    const priceTrendOption = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        textStyle: {
          color: '#1f2937'
        }
      },
      grid: {
        top: 10,
        right: 10,
        bottom: 20,
        left: 40
      },
      xAxis: {
        type: 'category',
        data: ['1월', '2월', '3월', '4월', '5월', '6월'],
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      series: [{
        data: [820, 932, 901, 934, 1290, 1330],
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: 'rgba(87, 181, 231, 1)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(87, 181, 231, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(87, 181, 231, 0.1)'
            }
          ])
        }
      }]
    };
    priceTrendChart.setOption(priceTrendOption);
  }

  // 지역 비교 차트
  if (document.getElementById('neighborhood-chart')) {
    const neighborhoodChart = echarts.init(document.getElementById('neighborhood-chart'));
    const neighborhoodOption = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        textStyle: {
          color: '#1f2937'
        }
      },
      grid: {
        top: 10,
        right: 10,
        bottom: 20,
        left: 40
      },
      xAxis: {
        type: 'category',
        data: ['지역 A', '지역 B', '지역 C', '지역 D', '지역 E'],
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      series: [{
        data: [5200, 4800, 6500, 5800, 7200],
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          color: 'rgba(141, 211, 199, 1)',
          borderRadius: [4, 4, 0, 0]
        }
      }]
    };
    neighborhoodChart.setOption(neighborhoodOption);
  }

  // 투자 차트
  if (document.getElementById('investment-chart')) {
    const investmentChart = echarts.init(document.getElementById('investment-chart'));
    const investmentOption = {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        textStyle: {
          color: '#1f2937'
        }
      },
      series: [{
        name: '투자 잠재력',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '12',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 35, name: '고성장', itemStyle: { color: 'rgba(87, 181, 231, 1)' } },
          { value: 30, name: '안정', itemStyle: { color: 'rgba(141, 211, 199, 1)' } },
          { value: 20, name: '중간', itemStyle: { color: 'rgba(251, 191, 114, 1)' } },
          { value: 15, name: '저성장', itemStyle: { color: 'rgba(252, 141, 98, 1)' } }
        ]
      }]
    };
    investmentChart.setOption(investmentOption);
  }

  // 상업용 차트
  if (document.getElementById('commercial-chart')) {
    const commercialChart = echarts.init(document.getElementById('commercial-chart'));
    const commercialOption = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        textStyle: {
          color: '#1f2937'
        }
      },
      legend: {
        data: ['오피스텔', '상업용'],
        bottom: 0,
        textStyle: {
          color: '#1f2937'
        }
      },
      grid: {
        top: 10,
        right: 10,
        bottom: 40,
        left: 40
      },
      xAxis: {
        type: 'category',
        data: ['강남', '마포', '영등포', '송파', '서초'],
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      series: [
        {
          name: '오피스텔',
          type: 'bar',
          data: [9850, 7320, 6940, 8120, 8750],
          itemStyle: {
            color: 'rgba(87, 181, 231, 1)',
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: '상업용',
          type: 'bar',
          data: [8500, 6800, 6500, 7600, 8200],
          itemStyle: {
            color: 'rgba(141, 211, 199, 1)',
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    };
    commercialChart.setOption(commercialOption);
  }

  // 거래량 차트
  if (document.getElementById('transaction-volume-chart')) {
    const transactionVolumeChart = echarts.init(document.getElementById('transaction-volume-chart'));
    const transactionVolumeOption = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        textStyle: {
          color: '#1f2937'
        }
      },
      grid: {
        top: 10,
        right: 10,
        bottom: 20,
        left: 40
      },
      xAxis: {
        type: 'category',
        data: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      series: [{
        data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330],
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: 'rgba(87, 181, 231, 1)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(87, 181, 231, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(87, 181, 231, 0.1)'
            }
          ])
        }
      }]
    };
    transactionVolumeChart.setOption(transactionVolumeOption);
  }

  // 가격 분포 차트
  if (document.getElementById('price-distribution-chart')) {
    const priceDistributionChart = echarts.init(document.getElementById('price-distribution-chart'));
    const priceDistributionOption = {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        textStyle: {
          color: '#1f2937'
        }
      },
      series: [{
        name: '가격 분포',
        type: 'pie',
        radius: '70%',
        center: ['50%', '50%'],
        data: [
          { value: 25, name: '5억원 이하', itemStyle: { color: 'rgba(87, 181, 231, 1)' } },
          { value: 35, name: '5억원-8억원', itemStyle: { color: 'rgba(141, 211, 199, 1)' } },
          { value: 25, name: '8억원-12억원', itemStyle: { color: 'rgba(251, 191, 114, 1)' } },
          { value: 15, name: '12억원 이상', itemStyle: { color: 'rgba(252, 141, 98, 1)' } }
        ],
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
    priceDistributionChart.setOption(priceDistributionOption);
  }

  // 시장 심리 차트
  if (document.getElementById('sentiment-chart')) {
    const sentimentChart = echarts.init(document.getElementById('sentiment-chart'));
    const sentimentOption = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        textStyle: {
          color: '#1f2937'
        }
      },
      grid: {
        top: 10,
        right: 10,
        bottom: 20,
        left: 40
      },
      xAxis: {
        type: 'category',
        data: ['1월', '2월', '3월', '4월', '5월', '6월'],
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: {
          lineStyle: {
            color: '#d1d5db'
          }
        },
        axisLabel: {
          color: '#1f2937'
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      series: [{
        data: [45, 52, 58, 62, 65, 68],
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: 'rgba(87, 181, 231, 1)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(87, 181, 231, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(87, 181, 231, 0.1)'
            }
          ])
        }
      }]
    };
    sentimentChart.setOption(sentimentOption);
  }

  // 창 크기가 변경될 때 차트 크기 조정
  window.addEventListener('resize', function() {
    chartsToInit.forEach(id => {
      const chart = echarts.getInstanceByDom(document.getElementById(id));
      if (chart) {
        chart.resize();
      }
    });
  });