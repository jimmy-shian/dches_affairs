google.charts.load('current', {'packages':['corechart']});
    
const url_all = 'https://script.google.com/macros/s/AKfycbziDyrX0FwQDoFYMRYA0m2oemHziIEe4aaJEXJkFrmDZEIp_N6EUiLCTzXFejP8HnG-/exec';

function drawChart(rawData) {
      // 解析多組資料
      var dataGroups = rawData.split('&&'); // 用 "&&" 分隔多組資料
      console.log("dataGroups=", dataGroups);

      var months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

      // 初始化圖表資料，第一行是標題列
      var chartData = [['月份']]; // 第一列為月份，接下來會依據每組資料動態添加列標題

      // 解析每組數據並添加到 chartData 中
      dataGroups.forEach(function(rawDataEntry) {
        // 分析單一組資料
        var dataArray = rawDataEntry.split(',');
        var values = dataArray.slice(3, 15).map(function(value) {
          return value === '' ? 0 : parseInt(value); // 處理空值為 0
        });

        var yearName = dataArray[0].match(/^(\d+)年/); // 提取年份名稱
        var chartTitle = yearName ? yearName[0] : "年份資料";

        // 動態添加年份作為新列標題
        chartData[0].push(chartTitle);

        // 將資料與月份對應，加入 chartData
        months.forEach(function(month, index) {
          if (chartData[index + 1] === undefined) {
            chartData[index + 1] = [month]; // 若尚未存在，初始化行
          }
          chartData[index + 1].push(values[index]); // 添加對應月份的數據
        });
      });

      console.log("chartData=", chartData);

      // 將資料轉換為 Google Charts 所需格式
      var data = google.visualization.arrayToDataTable(chartData);

      // 設定圖表選項
        var options = {
          title: '每月電費支出',
          width: 800, // 固定寬度
          height: 500, // 固定高度
          curveType: 'none',  // 标准折线图
          legend: { position: 'bottom' },
          annotations: {
            alwaysOutside: true,  // 始终显示数据标签
            textStyle: {
              fontSize: 12,
              color: '#000000',  // 设置文本颜色
              bold: true
            }
          },
          pointSize: 6,  // 设置点的大小
          vAxis: {
            title: '電費'
          },
          hAxis: {
            title: '月份'
          }
        };

      // 生成並繪製圖表
      var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
        
      google.visualization.events.addListener(chart, 'ready', function () {
        // 更新圖片顯示
        var imageUri = chart.getImageURI();

        // 更新下載鏈接的 href 屬性
        var downloadLink = document.getElementById("download_link");
        downloadLink.setAttribute("href", imageUri);
        downloadLink.setAttribute("download", "chart.png");  // 設置下載的文件名
        downloadLink.style.display = "block";  // 顯示下載按鈕
      });
        
      chart.draw(data, options);
        
        

    }

//兩種搜尋切換
function toggleSearch() {
    // 獲取兩個搜尋容器
    const searchContainer1 = document.getElementById("searchContainer1");
    const searchContainer2 = document.getElementById("searchContainer2");

    // 切換顯示狀態
    if (searchContainer1.style.display === "none") {
        searchContainer1.style.display = "none";
        searchContainer2.style.display = "flex";
    } else {
        searchContainer1.style.display = "flex";
        searchContainer2.style.display = "none";
    }
}

//收合展開動畫
function toggleNav() {

    const navMenu = document.querySelector('.nav-menu');
    const bars = document.querySelectorAll('.bar');

    navMenu.classList.toggle('active'); // 切換 active 類別來展開或收合菜單

    // 切換漢堡按鈕的三條線變化
    if (navMenu.classList.contains('active')) {
        bars[0].style.transform = "rotate(-45deg) translateY(15px)";
        bars[1].style.opacity = "0";
        bars[2].style.transform = "rotate(45deg) translateY(-15px)";

    } else {
        bars[0].style.transform = "rotate(0) translateY(0)";
        bars[1].style.opacity = "1";
        bars[2].style.transform = "rotate(0) translateY(0)";

    }
}

//電費下拉選單的顯示狀態
function toggleDropdown() {
    const dropdown = document.getElementById("customDropdown");
    dropdown.classList.toggle("open"); // 切換 open 樣式
}
//電費年份顯示
function updateButtonText() {
    const button = document.querySelector('.dropdown-toggle');
    const buttonText = button.querySelector('.button-text'); // 獲取按鈕內的文字部分
    const checkboxes = document.querySelectorAll('.dropdown-options input[type="checkbox"]');
    let selectedValues = [];

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedValues.push(checkbox.parentElement.textContent.trim());
        }
    });

    // 更新按鈕的文字內容，箭頭保持在最右邊
    buttonText.textContent = selectedValues.length > 0 ? selectedValues.join(', ') : '電費年度選擇';
}
//電費搜尋畫圖
function submitMessage_ebill(event) {
    event.preventDefault();

    // 獲取所有被勾選的值
    const checkboxes = document.querySelectorAll(".dropdown-options input[type='checkbox']:checked");
    const selectedYears = Array.from(checkboxes).map(checkbox => checkbox.value).join(",");


    if (!selectedYears) {
        alert("請至少選擇一個年度！");
        return;
    }

    console.log("selectedYears= " + selectedYears + ", T= " + typeof selectedYears);

    // API URL
    const url = url_all;

    const resultContainer = document.getElementById("searchResult");
    let dotCount = 0;
    const loadingText = "<p>查詢中";

    // 每隔 0.5 秒更新一次，讓「.」逐個顯示
    const interval = setInterval(() => {
        dotCount = (dotCount + 1) % 4; // 循環 0、1、2、3，控制點的數量
        resultContainer.innerHTML = `${loadingText}${'.'.repeat(dotCount)}</p>`;
    }, 500);

    // 發送 POST 請求到 Apps Script
    $.post(
        url,
        { choice: selectedYears, cc: selectedYears }, // 傳遞選擇的年份字串
        function (response) {
            clearInterval(interval);
            // 如果成功，將結果顯示到搜尋結果區域
              if (response.success) {
                resultContainer.innerHTML = `<p>查詢成功！</p>`;
                // 分割返回的資料
                var rawDataArray_a = response.data;
                drawChart( rawDataArray_a );
              } else {
                resultContainer.innerHTML = `<p>查詢失敗：${response.message}</p>`;
              }
        }
    ).fail(function () {
        // 處理錯誤情況
        const resultContainer = document.getElementById("searchResult");
        resultContainer.innerHTML = `<p>連線錯誤，請稍後再試。</p>`;
    });
}



