// 在 window 加載時執行
window.onload = function () {                
    toggleSearch(); // 頁面加載時執行一次切換
};

google.charts.load('current', {'packages':['corechart']});
    
const url_all = 'https://script.google.com/macros/s/AKfycbwb8zlr3EtkncsWWzOALpAaoxM2dKaK98gntWfRnfrChmvyTTTNrZ3EA3lqv_Dyuigv/exec';
const gasurlforkey = "https://script.google.com/macros/s/AKfycbwtM2l2khPL7omkRDJw9UA5ezQ4kA-0FGwgQayLJRpkGkkqdFdGvyiy30YIvfxXi6P_/exec";

// 定義字典
const digitMap = {
    10: "一",
    20: "二",
    30: "三",
    40: "四",
    50: "五",
    60: "六"
};

var groupedData;
var groupedData_table12;
var groupedData_table3;

// 發送 get 請求到 Apps Script
// 要請求的 tables 列表
var tables = [3, 1];
// 迴圈處理所有的 GET 請求
tables.forEach(function(table) {
    $.get(
        url_all,
        { table: table }, // 傳遞選擇的年份字串
        function (response) {
            // 如果成功，將結果顯示到搜尋結果區域
            if (response) {
                console.log(response);
                // 根據不同的 table 值賦予不同的變數
                if (table === 3) {
                    groupedData_table3 = response;
                } else if (table === 1) {
                    groupedData_table12 = response;
                }
//                showAllSuggestions();
            }
        }
    ).fail(function () {
        // 處理錯誤情況
        console.log("fail~" + table);
    });
});


// 下載word
function generateWordDocument(imageUri) {
    const { Document, Packer, Paragraph, ImageRun } = docx;

    // 創建 Word 文檔
    const doc = new Document({
        creator: "你的名字", // 作者名稱
        title: "電費折線圖報告", // 文件標題
        description: "包含電費折線圖的報告文件", // 文件描述
        sections: [
            {
                children: [
                    // 創建標題
                    new Paragraph({
                        text: "電費折線圖報告",
                        heading: "Heading1",
                    }),
                    // 添加描述段落
                    new Paragraph("以下為電費折線圖：\n\n"),
                    // 插入圖片
                    new Paragraph({
                        children: [
                            new ImageRun({
                                data: imageUri, // Base64 或 Uint8Array 格式的圖片
                                transformation: {
                                    width: 560, // 圖片寬度
                                    height: 350, // 圖片高度
                                },
                            }),
                        ],
                    }),
                ],
            },
        ],
    });

    // 使用 Packer 打包文檔並觸發下載
    Packer.toBlob(doc).then((blob) => {
        const downloadLink = document.getElementById("download_link");
        downloadLink.setAttribute("href", URL.createObjectURL(blob));
        downloadLink.setAttribute("download", "電費折線圖.docx"); // 設置下載文件名
    });
}


var imgURL = '';
//畫電費
function drawChart(rawData) {
    // 解析多組資料
    var dataGroups = rawData.split('&&');

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

    // 將資料轉換為 Google Charts 所需格式
    var data = google.visualization.arrayToDataTable(chartData);

    // 設定圖表選項
    var options = {
        title: '全校冷氣 每月電費支出圖',
        titleTextStyle: {
            fontSize: 24, // 設定標題字體大小
            bold: true, // 設定標題字體為粗體
        },
        width: 800, // 固定寬度
        height: 500, // 固定高度
        curveType: 'none', // 標準折線圖
        legend: { position: 'bottom' },
        annotations: {
            alwaysOutside: true, // 始終顯示數據標籤
            textStyle: {
                fontSize: 12,
                color: '#000000', // 設定文本顏色
                bold: true
            }
        },
        pointSize: 6, // 設定點的大小
        vAxis: {
            title: '電費 (NT$)',
            format: 'NT$',
//            format: 'decimal' // 將 Y 軸格式化為貨幣
        },
        hAxis: {
            title: '月份'
        },
        tooltip: {
            isHtml: true, // 啟用 HTML 格式的 tooltip
//            trigger: 'selection' // 設定 tooltip 觸發為選擇的點
        }
    };

    // 生成並繪製圖表
    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

    // 格式化 Tooltip（無小數點）
    var formatter = new google.visualization.NumberFormat({
        fractionDigits: 0, // 設定小數位為 0
        suffix: ' 元' // 添加「元」
    });
    for (var colIndex = 1; colIndex < chartData[0].length; colIndex++) {
        formatter.format(data, colIndex); // 格式化每列數據
    }

    // 生成並繪製圖表
    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

//    google.visualization.events.addListener(chart, 'ready', function () {
//      // 更新圖片顯示
//      var imageUri = chart.getImageURI();
//
//      // 更新下載鏈接的 href 屬性
//      var downloadLink = document.getElementById("download_link");
//      downloadLink.setAttribute("href", imageUri);
//      // 更新下載鏈接顯示的文字
//      downloadLink.textContent = "下載 電費折線圖"; // 設定顯示的文本
//      downloadLink.setAttribute("download", "chart.png"); // 設置下載的文件名
//      downloadLink.style.display = "block"; // 顯示下載按鈕
//    });
    google.visualization.events.addListener(chart, 'ready', function () {
        // 獲取圖片的 URI
        var imageUri = chart.getImageURI();
        imgURL = imageUri;
        
        // 添加下載 Word 按鈕
      var downloadLink = document.getElementById("download_link_img");
      downloadLink.setAttribute("href", imageUri);
      // 更新下載鏈接顯示的文字
      downloadLink.textContent = "下載 電費折線圖"; // 設定顯示的文本
      downloadLink.setAttribute("download", "chart.png"); // 設置下載的文件名
      downloadLink.style.display = "block"; // 顯示下載按鈕
        
        var downloadLink = document.getElementById("download_link");
        downloadLink.textContent = "下載電費折線圖（Word）";
        downloadLink.style.display = "block";

        generateWordDocument(imgURL);
        // 設定下載按鈕的點擊事件
//        downloadLink.addEventListener("click", function () {
//            console.log("imgURL= " +imgURL);
//        });
    });


    
    // 初始化 Tooltip 元素
    var tooltipElement = document.createElement('div');
    tooltipElement.style.position = 'absolute';
    tooltipElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    tooltipElement.style.color = 'white';
    tooltipElement.style.padding = '5px';
    tooltipElement.style.borderRadius = '5px';
    tooltipElement.style.transition = 'opacity 0.3s'; // 添加淡入淡出效果
    tooltipElement.style.opacity = '0'; // 初始為隱藏
    tooltipElement.style.pointerEvents = 'none'; // 防止干擾滑鼠事件
    tooltipElement.style.zIndex = '9999'; // 確保顯示在最前面
    document.body.appendChild(tooltipElement);

    // 添加選擇事件
    google.visualization.events.addListener(chart, 'select', function (event) {
        var selection = chart.getSelection();
        if (selection.length > 0) {
            var selectedRow = selection[0].row; // 獲取選中的行 (月份)
            if (selectedRow !== null) {
                // 顯示選中的月份
                var tooltipContent = `月份: ${months[selectedRow]}\n`;

                // 遍歷所有的列（年份），顯示每條線對應的數值
                for (var colIndex = 1; colIndex < chartData[0].length; colIndex++) {
                    var value = data.getValue(selectedRow, colIndex); // 獲取該月份對應的 Y 軸數值
                    var formattedValue = formatter.formatValue(value); // 格式化數值
                    tooltipContent += `${chartData[0][colIndex]}: ${formattedValue}\n`; // 加入年份數值
                }

                // 更新 Tooltip 內容
                tooltipElement.innerText = tooltipContent;

                // 設定 Tooltip 的位置
                document.addEventListener('mousemove', function moveTooltip(event) {
                    tooltipElement.style.left = `${event.pageX + 10}px`; // 滑鼠右邊 10px
                    tooltipElement.style.top = `${event.pageY + 10}px`; // 滑鼠下方 10px
                });

                // 顯示 Tooltip，淡入效果
                tooltipElement.style.opacity = '1';

                // 自動移除 Tooltip，淡出效果
                setTimeout(() => {
                    tooltipElement.style.opacity = '0'; // 開始淡出
                    setTimeout(() => {
                        tooltipElement.innerText = ''; // 清空內容
                    }, 300); // 等待淡出完成後移除內容
                }, 2000); // 停留 3 秒後淡出
            }
        }
    });

    
    chart.draw(data, options);
}

//按 enter 搜尋
function handleEnter(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

const searchInput = document.getElementById("inputBox");
const suggestionsContainer = document.getElementById("suggestions");

// 切換輸入框提示字
function updatePlaceholderAndFocus() {
//  const suggestionsContainer = document.getElementById("suggestions");
//  const searchInput = document.getElementById("inputBox");
  const dropdown = document.getElementById("mainDropdown");

  if (dropdown.value === "3") {
    searchInput.placeholder = "輸入物品名稱 ex: 筆 釘書機";
  } else {
    searchInput.placeholder = "輸入班級 ex: 501 四4";
  }
//  searchInput.focus();
}

// 顯示所有建議
function showAllSuggestions() {
  suggestionsContainer.innerHTML = ""; // 清空建議
  const dropdown = document.getElementById("mainDropdown");
  if ( !dropdown.value ){ return; };
  groupedData = (dropdown.value === "3") ? groupedData_table3 : groupedData_table12;

  for (const group in groupedData) {
    const groupElement = document.createElement("div");
    groupElement.className = "group";

    const titleElement = document.createElement("div");
    titleElement.className = "group-title";
    titleElement.textContent = group;
    
    // 點擊 group-title 顯示所有該組的項目
    titleElement.addEventListener("click", () => {
      const allItems = groupedData[group].map(item => item.name).join(" "); // 使用空格分隔所有項目名稱
      searchInput.value = allItems; // 將結果放入搜尋欄
      suggestionsContainer.innerHTML = ""; // 隱藏建議
    });

    groupElement.appendChild(titleElement);

    groupedData[group].forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = "item";
      itemElement.textContent = item.name;
      groupElement.appendChild(itemElement);

      // 點擊選項填充輸入框
      itemElement.addEventListener("click", () => {
        searchInput.value = item.name;
        suggestionsContainer.innerHTML = ""; // 隱藏建議
      });
    });

    suggestionsContainer.appendChild(groupElement);
  }
}

// 搜尋功能
function handleInput() {
  const query = searchInput.value.toLowerCase().trim();
  suggestionsContainer.innerHTML = ""; // 清空建議

  if (!query) {
    showAllSuggestions();
    return;
  }

  for (const group in groupedData) {
    const matches = groupedData[group].filter((item) =>
      item.name.toLowerCase().includes(query)
    );

    if (matches.length > 0) {
      const groupElement = document.createElement("div");
      groupElement.className = "group";

      const titleElement = document.createElement("div");
      titleElement.className = "group-title";
      titleElement.textContent = group;
      groupElement.appendChild(titleElement);

      matches.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.className = "item";
        itemElement.textContent = item.name;
        groupElement.appendChild(itemElement);

        // 點擊建議時填充輸入框
        itemElement.onclick = () => {
          searchInput.value = item.name;
          suggestionsContainer.innerHTML = "";
        };
      });

      suggestionsContainer.appendChild(groupElement);
    }
  }
}

// 點擊其他地方隱藏建議
//document.addEventListener("click", (event) => {
//  if (!event.target.closest(".suggestions-place")) {
//    suggestionsContainer.innerHTML = "";
//  }
//});
// 獲取 DOM 元素
//const overlay = document.getElementById('overlay');
//const closeOverlayBtn = document.getElementById('closeOverlayBtn');

// 點擊"X"按鈕關閉懸浮視窗
//closeOverlayBtn.addEventListener('click', () => {
//  overlay.classList.add('hidden');
//});

// 點擊空白區域關閉懸浮視窗
document.addEventListener("click", (event) => {
  // 點擊空白區域關閉建議或懸浮視窗
  if (!event.target.closest(".suggestions-place")) {
    suggestionsContainer.innerHTML = ""; // 清空建議
  }

  // 點擊空白區域關閉懸浮視窗
//  const overlay = document.getElementById('overlay');
  if (event.target === overlay) { // 確保點擊的是空白區域
    overlay.classList.add('hidden');
  }

  // 點擊"X"按鈕關閉懸浮視窗
  if (event.target.id === 'closeOverlayBtn') {
    overlay.classList.add('hidden');
  }
});






// 導覽列隱藏顯示
function showhide() {
    const leftSidebar = document.querySelector('.left-sidebar');
    const rightSidebar = document.querySelector('.right-sidebar');
    const switchButton = document.querySelector('#showhide');  // 選擇按鈕
    const center_content = document.querySelector('.center-content ');  // 主要內容
    const toggleIcon = document.getElementById('toggleIcon');  // 圖片元素

    // 如果左側邊欄是隱藏狀態
    if (leftSidebar.style.display === 'none') {
        // 如果已經是隱藏狀態，先顯示，觸發過渡
        leftSidebar.style.display = '';
        rightSidebar.style.display = '';
        setTimeout(function() {
            // 觸發過渡
            center_content.style.maxWidth = '';
            leftSidebar.classList.toggle('hidden');
            rightSidebar.classList.toggle('hidden');
        }, 200);  // 設定為與過渡時間一致（200ms）

        // 更改圖片為 "隱藏" 導覽列的圖示
        toggleIcon.src = 'https://jimmy-shian.github.io/dches_affairs/images/hide_password.png';
        toggleIcon.alt = '隱藏導覽列';
    } else {
        center_content.style.maxWidth = '80%';

        // 直接切換顯示或隱藏
        leftSidebar.classList.toggle('hidden');
        rightSidebar.classList.toggle('hidden');
        setTimeout(function() {
            leftSidebar.style.display = 'none';
            rightSidebar.style.display = 'none';
        }, 100);  // 設定為與過渡時間一致（100ms）

        // 更改圖片為 "顯示" 導覽列的圖示
        toggleIcon.src = 'https://jimmy-shian.github.io/dches_affairs/images/show_password.png';
        toggleIcon.alt = '顯示導覽列';
    }
}
// 清除搜尋框
function clearSearch() {
    const resultContainer = document.getElementById("searchResult");
    const text_table = document.getElementById("text_table");

    resultContainer.innerHTML = ``;
    text_table.innerHTML = ``;
}

//兩種搜尋切換
function toggleSearch() {
    // 獲取兩個搜尋容器
    const searchContainer1 = document.getElementById("searchContainer1");
    const searchContainer2 = document.getElementById("searchContainer2");
    const text_table = document.getElementById("text_table");
    const curve_chart = document.getElementById("curve_chart"); 
    const download_links = document.querySelectorAll(".download_link");

    // 切換顯示狀態
    if (searchContainer2.style.display === "none") {
        searchContainer1.style.display = "none";
        text_table.style.display = "none";
        searchContainer2.style.display = "flex";
        
        curve_chart.style.display = "";
        download_links.forEach(link => link.style.display = "");
    } else {
        searchContainer1.style.display = "flex";
        searchContainer2.style.display = "none";
        curve_chart.style.display = "none";
        download_links.forEach(link => link.style.display = "none");
        
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


// 更新資料
const updateDataBtn = document.getElementById("updateDataBtn");
const overlay = document.getElementById("overlay");
const gotoDriveBtn = document.getElementById("gotoDriveBtn");
const postRequestBtn = document.getElementById("postRequestBtn");
const closeOverlayBtn = document.getElementById("closeOverlayBtn");

const driveUrl = "https://drive.google.com/drive/folders/1Kfh9Nb5Lyr8hQM9kfI6X1TKaTNW1QVsT?usp=drive_link";

// 點擊「更新資料」按鈕時，顯示懸浮畫面
updateDataBtn.addEventListener("click", () => {
  overlay.classList.remove("hidden");
});

// 點擊「前往雲端硬碟」按鈕
gotoDriveBtn.addEventListener("click", () => {
  window.open(driveUrl, "_blank"); // 新視窗打開雲端硬碟
  overlay.classList.add("hidden"); // 關閉懸浮畫面
});

// 點擊「發送 POST 請求」按鈕
postRequestBtn.addEventListener("click", () => {
  const resultContainer = document.getElementById("searchResult");
  resultContainer.innerHTML = `<p>請稍後，更改電話年級名稱 中...</p>`;
  $.post(
    url_all,
    { change_phone: "your_data_here" }, // 傳遞必要的參數
    function (response) {
      if (response.success) {
        resultContainer.innerHTML = `<p>更改成功，${JSON.stringify(response.data)}</p>`;
      } else {
        resultContainer.innerHTML = `<p>操作失敗，請稍後再試。</p>`;
      }
        $.get(
        url_all,
            { table: 1 }, // 傳遞選擇的年份字串
            function (response) {
                // 如果成功，將結果顯示到搜尋結果區域
                if (response) {
                    console.log(response);
                    groupedData_table12 = response;
                    showAllSuggestions();
                }
            }
        ).fail(function () {
            // 處理錯誤情況
            console.log("fail~" + table);
        });
    }
  ).fail(() => {
    resultContainer.innerHTML = `<p>連線錯誤，請稍後再試。</p>`;
  });

  overlay.classList.add("hidden"); // 關閉懸浮畫面
});

// 點擊「取消」按鈕時，關閉懸浮畫面
closeOverlayBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
});


// 切換主題 & 更新導覽列內容

document.addEventListener('DOMContentLoaded', function () {
    const specialKey = localStorage.getItem('specialKey');
    const keyExpiry = localStorage.getItem('keyExpiry');

    // 驗證密鑰
    if (!specialKey || (keyExpiry && new Date() > new Date(new Date(keyExpiry).getTime() + 2 * 86400000))) {
        localStorage.removeItem('specialKey');
        localStorage.removeItem('keyExpiry');
        window.location.href = 'index.html';
        return;
    }

    // 驗證密鑰有效性並載入導覽列
    $.get(gasurlforkey + "?key=" + specialKey, function (response) {
        if (response.success && response.navItems) {
            updateNavigation(response.navItems);
        } else {
            localStorage.removeItem('specialKey');
            window.location.href = 'index.html';
        }
    }).fail(function () {
        localStorage.removeItem('specialKey');
        window.location.href = 'index.html';
    });

    // 載入主題
    loadThemePreference();

    // 初始化導覽列編輯與控制按鈕
    bindNavigationControls();
});

// ------------------ 導覽列 ------------------

function updateNavigation(navItems) {
    const navMenu = document.querySelector('.nav-menu');
    const leftSidebar = document.querySelector('.left-sidebar');
    const rightSidebar = document.querySelector('.right-sidebar');

    navMenu.innerHTML = '';
    leftSidebar.innerHTML = '';
    rightSidebar.innerHTML = '';

    const specialBtn = document.createElement('a');
    specialBtn.href = '#';
    specialBtn.id = 'updateDataBtn';
    specialBtn.className = 'nav-menu-a-special';
    specialBtn.textContent = '更新資料';
    navMenu.appendChild(specialBtn);

    const bottomBtn = document.createElement('a');
    bottomBtn.href = 'https://drive.google.com/drive/home';
    bottomBtn.target = '_blank';
    bottomBtn.className = 'sticky-bottom';
    bottomBtn.textContent = '我的雲端硬碟';
    rightSidebar.appendChild(bottomBtn);

    navItems.forEach(function (item) {
        const link = document.createElement('a');
        link.href = item.url;
        link.target = '_blank';
        link.textContent = item.name;

        if (item.position === 'nav') navMenu.insertBefore(link, specialBtn);
        else if (item.position === 'left') leftSidebar.appendChild(link);
        else if (item.position === 'right') rightSidebar.insertBefore(link, bottomBtn);
    });

    document.getElementById('updateDataBtn').addEventListener('click', function () {
        document.getElementById('overlay').classList.remove('hidden');
    });
}

// ------------------ 主題切換 ------------------

function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // 切換主題事件
    document.getElementById('theme-toggle')?.addEventListener('change', function () {
    const newTheme = this.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    });

    // 預設載入主題
    window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-toggle').checked = savedTheme === 'dark';
    });

}

// ------------------ 導覽列編輯功能 ------------------

function bindNavigationControls() {
    document.getElementById('closeOverlayBtn')?.addEventListener('click', () => {
        document.getElementById('overlay').classList.add('hidden');
    });

    document.getElementById('editNavBtn')?.addEventListener('click', () => {
        document.getElementById('overlay').classList.add('hidden');
        document.getElementById('navEditOverlay').classList.remove('hidden');
        loadNavItems();
    });

    document.getElementById('closeNavEditBtn')?.addEventListener('click', () => {
        document.getElementById('navEditOverlay').classList.add('hidden');
    });

    document.getElementById('cancelNavChangesBtn')?.addEventListener('click', () => {
        document.getElementById('navEditOverlay').classList.add('hidden');
    });

    document.getElementById('addNavItemBtn')?.addEventListener('click', () => {
        addNavItem('navItemsContainer');
    });

    document.getElementById('addLeftItemBtn')?.addEventListener('click', () => {
        addNavItem('leftItemsContainer');
    });

    document.getElementById('addRightItemBtn')?.addEventListener('click', () => {
        addNavItem('rightItemsContainer');
    });

    document.getElementById('saveNavChangesBtn')?.addEventListener('click', () => {
        saveNavChanges();
    });

    document.getElementById('gotoDriveBtn')?.addEventListener('click', () => {
        window.open('https://drive.google.com/drive/home', '_blank');
    });

    document.getElementById('postRequestBtn')?.addEventListener('click', () => {
        document.getElementById('overlay').classList.add('hidden');
    });
}

// ------------------ 編輯導覽列 ------------------

function loadNavItems() {
    document.getElementById('navItemsContainer').innerHTML = '';
    document.getElementById('leftItemsContainer').innerHTML = '';
    document.getElementById('rightItemsContainer').innerHTML = '';

    document.querySelectorAll('.nav-menu a:not(.nav-menu-a-special)').forEach(link => {
        addNavItem('navItemsContainer', link.textContent, link.href);
    });

    document.querySelectorAll('.left-sidebar a:not(.sticky-bottom)').forEach(link => {
        addNavItem('leftItemsContainer', link.textContent, link.href);
    });

    document.querySelectorAll('.right-sidebar a:not(.sticky-bottom)').forEach(link => {
        addNavItem('rightItemsContainer', link.textContent, link.href);
    });
}

function addNavItem(containerId, name = '', url = '') {
    const container = document.getElementById(containerId);
    const itemDiv = document.createElement('div');
    itemDiv.className = 'nav-item-input';

    let position = 'nav';
    if (containerId === 'leftItemsContainer') position = 'left';
    else if (containerId === 'rightItemsContainer') position = 'right';

    itemDiv.dataset.position = position;
    itemDiv.innerHTML = `
        <input type="text" class="nav-name-input" placeholder="名稱" value="${name}">
        <input type="text" class="nav-url-input" placeholder="URL" value="${url}">
        <button class="remove-item-btn">刪除</button>
    `;
    container.appendChild(itemDiv);

    itemDiv.querySelector('.remove-item-btn').addEventListener('click', () => {
        container.removeChild(itemDiv);
    });
}

function collectNavItems(containerId) {
    const items = [];
    document.querySelectorAll(`#${containerId} .nav-item-input`).forEach(div => {
        const name = div.querySelector('.nav-name-input').value.trim();
        const url = div.querySelector('.nav-url-input').value.trim();
        if (name && url) {
            items.push({ name, url });
        }
    });
    return items;
}

function saveNavChanges() {
    // 禁用按鈕並顯示處理中狀態
    const saveBtn = document.getElementById('saveNavChangesBtn');
    const cancelBtn = document.getElementById('cancelNavChangesBtn');
    saveBtn.innerHTML = '儲存變更 <span class="spinner"></span>';
    cancelBtn.innerHTML = '取消';
    document.querySelector('.nav-edit-buttons').classList.add('processing');
    
    // 禁用所有輸入框
    const inputs = document.querySelectorAll('.nav-items-container input');
    inputs.forEach(input => input.disabled = true);
    // 禁用 navEditOverlay 內的按鈕
    const overlayButtons = document.querySelectorAll('#navEditOverlay button');
    overlayButtons.forEach(btn => {
    btn.disabled = true;
    btn.classList.add('disabled-btn'); // 套用 CSS 樣式
    });

    const navItems = collectNavItems('navItemsContainer');
    const leftItems = collectNavItems('leftItemsContainer');
    const rightItems = collectNavItems('rightItemsContainer');
    const specialKey = localStorage.getItem('specialKey');
    
    $.post(
        gasurlforkey,
        {
            key: specialKey,
            action: 'updateNavItems',
            navItems: JSON.stringify(navItems),
            leftItems: JSON.stringify(leftItems),
            rightItems: JSON.stringify(rightItems)
        },
        function (response) {
            console.log(response);
            // 恢復按鈕狀態
            saveBtn.innerHTML = '儲存變更';
            cancelBtn.innerHTML = '取消';
            document.querySelector('.nav-edit-buttons').classList.remove('processing');
            inputs.forEach(input => input.disabled = false);
            overlayButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled-btn');
            });
            
            if (response.success) {
                alert('導覽列更新成功！');
                location.reload();
            } else {
                alert('導覽列更新失敗：' + (response.message || '未知錯誤'));
            }
            document.getElementById('navEditOverlay').classList.add('hidden');
        }
    ).fail(function () {
        alert('無法連接到伺服器，請稍後再試。');
        // 恢復按鈕狀態
        saveBtn.innerHTML = '儲存變更';
        cancelBtn.innerHTML = '取消';
        document.querySelector('.nav-edit-buttons').classList.remove('processing');
        inputs.forEach(input => input.disabled = false);
    });
}
