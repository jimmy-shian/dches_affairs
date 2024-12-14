// 在 window 加載時執行
window.onload = function () {                
    toggleSearch(); // 頁面加載時執行一次切換
};

google.charts.load('current', {'packages':['corechart']});
    
const url_all = 'https://script.google.com/macros/s/AKfycbyurLf-u2DDA2Q6KVRt6L9VUeOoH-SQtl97GOsG6XIaTAz-LX7CmAV4PcqNZ8JdEDvl/exec';
// 定義字典
const digitMap = {
    10: "一",
    20: "二",
    30: "三",
    40: "四",
    50: "五",
    60: "六"
};
//畫電費
function drawChart(rawData) {
      // 解析多組資料
      var dataGroups = rawData.split('&&'); // 用 "&&" 分隔多組資料
//      console.log("dataGroups=", dataGroups);

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

//      console.log("chartData=", chartData);

      // 將資料轉換為 Google Charts 所需格式
      var data = google.visualization.arrayToDataTable(chartData);

      // 設定圖表選項
        var options = {
          title: '班班有冷氣 每月電費支出',
          titleTextStyle: {
            fontSize: 24,  // 設定標題字體大小
            bold: true,    // 設定標題字體為粗體
          },
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
        // 更新下載鏈接顯示的文字
        downloadLink.textContent = "下載 電費折線圖"; // 設定顯示的文本
        downloadLink.setAttribute("download", "chart.png");  // 設置下載的文件名
        downloadLink.style.display = "block";  // 顯示下載按鈕
      });
        
      chart.draw(data, options);
    }

//按 enter 搜尋
function handleEnter(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}
//input 提示字
function updatePlaceholderAndFocus() {
    const dropdown = document.getElementById('mainDropdown');
    const inputBox = document.getElementById('inputBox');

    // 根據 dropdown 的值更新 placeholder
    if (dropdown.value === "3") {
        inputBox.placeholder = "輸入物品名稱 ex: 筆 釘書機";
    } else {
        inputBox.placeholder = "輸入班級 ex: 501 四4";
    }

    // 將焦點移到 inputBox
    inputBox.focus();
}   

// 導覽列隱藏顯示
function showhide() {
    const leftSidebar = document.querySelector('.left-sidebar');
    const rightSidebar = document.querySelector('.right-sidebar');
    const switchButton = document.querySelector('#showhide');  // 選擇按鈕

    // 如果左側邊欄是隱藏狀態
    if (leftSidebar.style.display === 'none') {
        // 如果已經是隱藏狀態，先顯示，觸發過渡
        leftSidebar.style.display = '';
        rightSidebar.style.display = '';
        setTimeout(function() {
            // 觸發過渡
            leftSidebar.classList.toggle('hidden');
            rightSidebar.classList.toggle('hidden');
        }, 200);  // 設定為與過渡時間一致（200ms）

        // 更改按鈕文字為 "隱藏"
        switchButton.textContent = "隱藏導覽列";
    } else {
        // 直接切換顯示或隱藏
        leftSidebar.classList.toggle('hidden');
        rightSidebar.classList.toggle('hidden');
        setTimeout(function() {
            leftSidebar.style.display = 'none';
            rightSidebar.style.display = 'none';
        }, 200);  // 設定為與過渡時間一致（200ms）

        // 更改按鈕文字為 "顯示"
        switchButton.textContent = "顯示導覽列";
    }
}

//兩種搜尋切換
function toggleSearch() {
    // 獲取兩個搜尋容器
    const searchContainer1 = document.getElementById("searchContainer1");
    const searchContainer2 = document.getElementById("searchContainer2");
    const text_table = document.getElementById("text_table");
    const curve_chart = document.getElementById("curve_chart"); 
    const download_link = document.getElementById("download_link");



    // 切換顯示狀態
    if (searchContainer2.style.display === "none") {
        searchContainer1.style.display = "none";
        text_table.style.display = "none";
        searchContainer2.style.display = "flex";
        
        curve_chart.style.display = "";
        download_link.style.display = "";
    } else {
        searchContainer1.style.display = "flex";
        searchContainer2.style.display = "none";
        curve_chart.style.display = "none";
        download_link.style.display = "none";

        text_table.style.display = "";
    }
}
// 點擊選單外部時自動關閉
document.addEventListener("click", function (event) {
    const dropdown = document.getElementById("customDropdown");
    const navDown = document.querySelector(".nav-menu");
    const buger = document.querySelector(".hamburger-place");

    if (!dropdown.contains(event.target)) {
        dropdown.classList.remove("open");
    }
    if (!navDown.contains(event.target) && !buger.contains(event.target)) {
        navDown.classList.remove("active");
        const bars = document.querySelectorAll('.bar');
        bars[0].style.transform = "rotate(0) translateY(0)";
        bars[1].style.opacity = "1";
        bars[2].style.transform = "rotate(0) translateY(0)";
    }
});
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
    
    const searchButton = document.getElementById('searchyearButton');
    searchButton.disabled = true; // 禁用按鈕

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
                resultContainer.innerHTML = ``;
                if (!response.data || response.data.length === 0) { // 檢查資料是否為空
                    resultContainer.innerHTML = `<p>查詢結束，沒有相關資料	(；д；)。</p>`;
                    return;
                }
                // 分割返回的資料
                var rawDataArray_a = response.data;
                drawChart( rawDataArray_a );
              } else {
                resultContainer.innerHTML = `<p>查詢結束，沒有相關資料	(；д；)。</p>`;
              }
        }
    ).fail(function () {
        // 處理錯誤情況
        const resultContainer = document.getElementById("searchResult");
        resultContainer.innerHTML = `<p>連線錯誤，請稍後再試。</p>`;
    }).always(function () {
        searchButton.disabled = false; // 禁用按鈕
    });
}

//分機、機櫃、冷氣、消耗品
function performSearch() {
    // 取得選擇的值和輸入框內容
    const mainValue = document.getElementById('mainDropdown').value;
    if (!mainValue){
        alert("選擇搜尋項目~!");
        return;
    }
    var inputValue = document.getElementById('inputBox').value;

    const searchButton = document.getElementById('searchButton');
    searchButton.disabled = true; // 禁用按鈕

    // 替換中間的多餘空格為單一空格
    inputValue = inputValue.replace(/\s+/g, ' ');
    // 移除尾端的多餘空格
    inputValue = inputValue.replace(/\s+$/, '');
    
    // 串接顯示結果
    // API URL
    const url = url_all;

    const resultContainer = document.getElementById("searchResult");
    const text_table = document.getElementById("text_table");

    let dotCount = 0;
    const loadingText = "<p>查詢中";

    // 每隔 0.5 秒更新一次，讓「.」逐個顯示
    const interval = setInterval(() => {
        dotCount = (dotCount + 1) % 4; // 循環 0、1、2、3，控制點的數量
        resultContainer.innerHTML = `${loadingText}${'.'.repeat(dotCount)}</p>`;
    }, 500);
    document.getElementById('inputBox').value = inputValue;
    if(mainValue != "3"){
//            console.log("1,=" + inputValue + ", 2.=" + mainValue );
     // 拆分數字字串為數字組
        const inputArray = inputValue.split(' ');

        // 處理每一組數字
        const processedArray = inputArray.map(item => {
            // 判斷每組是否為3位數字
            if (/^\d{3}$/.test(item)) {
                const prefix = parseInt(item.slice(0, 2), 10); // 獲取前兩位數字並轉換為整數
                // 從字典中查找對應的字
                const mappedValue = digitMap[prefix] || item.slice(0, 2); // 如果沒有對應，保留原值
                // 拼接保留的第三位
                return mappedValue + item[2];
            }
            return item; // 如果不是3位數字，則直接返回原值
        });

        // 將處理後的數字組合併成一個字串
        inputValue = processedArray.join(' ');
        // 更新輸入框的值
        inputValue = inputValue.replace(/\s+$/, '');
        document.getElementById('inputBox').value = inputValue;

        // 發送 POST 請求到 Apps Script
        $.post(
            url,
            { texts: inputValue, 
             table: parseInt(mainValue) }, // 傳遞輸入字串
            function (response) {
                clearInterval(interval);
                // 如果成功，將結果顯示到搜尋結果區域
                  if (response.success) {
                    if (!response.data || response.data.length === 0) { // 檢查資料是否為空
                        resultContainer.innerHTML = `<p>查詢結束，沒有相關資料(˙︿˙)。</p>`;
                        return;
                    }
//                    text_table.innerHTML = JSON.stringify(response.data);

                    // 將資料轉換成表格
                    function createTable(data) {
                      let table = '<table border="1" style="border-collapse: collapse; width: 100%;">';

                      // 表頭
                        table += `
                          <thead>
                            <tr>
                              <th style="padding: 8px; text-align: left;">教室位置</th>
                              <th style="padding: 8px; text-align: left;">分機號碼1</th>
                              <th style="padding: 8px; text-align: left;">分機號碼2</th>
                              <th style="padding: 8px; text-align: left;">維修</th>
                            </tr>
                          </thead>
                          <tbody>
                        `;

                        // 表格內容
                        data.forEach(item => {
                          // 拆解 source1 以獲取教室位置、分機號碼1、分機號碼2
                          const [classroomLocation, phone1, phone2] = item.source1.split(',');

                          // 處理 phone2 如果是 "無"，則替換為 "--"
                          const phone2Value = phone2 === "無" ? "--" : phone2;

                          table += `
                            <tr>
                              <td style="padding: 8px;">${classroomLocation}</td>
                              <td style="padding: 8px;">${phone1}</td>
                              <td style="padding: 8px;">${phone2Value}</td>
                              <td style="padding: 8px;">${item.source2.trim().replace(/,$/, '')}</td>
                            </tr>
                          `;
                        });

                      // 結尾
                      table += '</tbody></table>';

                      return table;
                    }

                    // 解析並顯示資料
                    text_table.innerHTML = createTable( (response.data) );
                    resultContainer.innerHTML = `<p>查詢成功！</p>`;

                  } else {
                    resultContainer.innerHTML = `<p>查詢失敗：${response.message}</p>`;
                  }
            }
        ).fail(function () {
            // 處理錯誤情況
//            const resultContainer = document.getElementById("searchResult");
            resultContainer.innerHTML = `<p>連線錯誤，請稍後再試。</p>`;
        }).always(function () {
            searchButton.disabled = false; // 禁用按鈕
        });
    }else{
        $.post(
            url,
            { texts_items: inputValue}, // 傳遞輸入字串
            function (response) {
                clearInterval(interval);
                // 如果成功，將結果顯示到搜尋結果區域
                  if (response.success) {
                    if (!response.data || response.data.length === 0) { // 檢查資料是否為空
                        resultContainer.innerHTML = `<p>查詢結束，沒有相關資料(〒︿〒)。</p>`;
                        return;
                    }
//                        text_table.innerHTML = JSON.stringify(response.data);

                                // 將資料轉換成表格
                    function createTable(data) {
                        let table = '<table border="1" style="border-collapse: collapse; width: 100%;">';

                        // 表頭
                        table += `
                            <thead>
                                <tr>
                                    <th style="padding: 8px; text-align: left;">物品名稱</th>
                                    <th style="padding: 8px; text-align: left;">單位</th>
                                    <th style="padding: 8px; text-align: left;">剩餘數量</th>
                                </tr>
                            </thead>
                            <tbody>
                        `;

                        // 表格內容
                        data.forEach(item => {
                            table += `
                                <tr>
                                    <td style="padding: 8px;">${item.itemName}</td>
                                    <td style="padding: 8px;">${item.unit}</td>
                                    <td style="padding: 8px;">${item.remaining}</td>
                                </tr>
                            `;
                        });

                        // 結尾
                        table += '</tbody></table>';

                        return table;
                    }

//                      console.log("tyope= " + typeof JSON.parse(response.data))
//                      console.log("response.data= " + JSON.parse(response.data))

                    // 解析並顯示資料，將資料轉換為表格並插入到頁面中
                    text_table.innerHTML = createTable( JSON.parse(response.data));
                    resultContainer.innerHTML = `<p>查詢成功！</p>`;

                  } else {
                    resultContainer.innerHTML = `<p>查詢結束，沒有相關資料(〒︿〒)。</p>`;
                  }
            }
        ).fail(function () {
            // 處理錯誤情況
            const resultContainer = document.getElementById("searchResult");
            resultContainer.innerHTML = `<p>連線錯誤，請稍後再試。</p>`;
        }).always(function () {
            searchButton.disabled = false; // 禁用按鈕
        });
    }
}
