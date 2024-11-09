$(document).ready(function() {
    // 搜尋按鈕點擊事件
    $('#searchButton').click(function() {
        let inputContent = $('#inputField').val();
        let selectedOption1 = $('#dropdown1').val();
        let selectedOption2 = $('#dropdown2').val();
        let selectedOption3 = $('#dropdown3').val();
        
        $('.search-display').html(`<p>搜尋結果: ${inputContent} (${selectedOption1}, ${selectedOption2}, ${selectedOption3})</p>`);
    });

    // 儲存提醒事件
    $('#saveReminder').click(function() {
        let reminderContent = $('#reminderInput').val();
        if (reminderContent) {
            localStorage.setItem('userReminder', reminderContent);
            alert('記事已儲存!');
        } else {
            alert('請輸入記事內容');
        }
    });
});
