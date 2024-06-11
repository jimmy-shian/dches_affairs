document.addEventListener('DOMContentLoaded', function() {
    fetch('SchPass.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const contentDiv = document.getElementById('content');

            data.forEach(section => {
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'section';

                const titleElement = document.createElement('h2');
                if (section.url) {
                    const titleLink = document.createElement('a');
                    titleLink.href = section.url;
                    titleLink.textContent = section.title;
                    titleElement.appendChild(titleLink);
                } else {
                    titleElement.textContent = section.title;
                }
                sectionDiv.appendChild(titleElement);


                if (section.url2) {
                    const url2Element = document.createElement('a');
                    url2Element.href = section.url2;
                    url2Element.textContent = '後台: ' + section.url2;
                    sectionDiv.appendChild(url2Element);
                }

                const credentialsDiv = document.createElement('div');
                credentialsDiv.className = 'credentials';
                sectionDiv.appendChild(credentialsDiv);

                if (section.account) {
                    const accountSpan = document.createElement('span');
                    accountSpan.textContent = `帳號: ${section.account}`;
                    accountSpan.addEventListener('click', () => copyToClipboard(accountSpan.textContent));
                    credentialsDiv.appendChild(accountSpan);
                }

                if (section.password) {
                    const passwordSpan = document.createElement('span');
                    passwordSpan.textContent = `密碼: ${section.password}`;
                    passwordSpan.addEventListener('click', () => copyToClipboard(passwordSpan.textContent));
                    credentialsDiv.appendChild(passwordSpan);
                }

                contentDiv.appendChild(sectionDiv);
            });
        })
        .catch(error => console.error('Error fetching the file:', error));
});

function copyToClipboard(text) {
    const notification = document.getElementById('notification');
    //重複進入，我要中斷上一個showNotification的執行
        navigator.clipboard.writeText(text.split(': ')[1]).then(() => {
            showNotification('複製文字: ' + text.split(': ')[1]);
        }).catch(err => {
            notification.style.backgroundColor = '#ff4f1b';
            showNotification('失敗: ' + err);
        });
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
        //  延迟20毫秒
    setTimeout(function() {
        notification.style.opacity = 1;  //  修改div的透明度
    }, 20);
    setTimeout(() => {
        setTimeout(function() {
            notification.style.opacity = 0;  //  修改div的透明度
        }, 20);
        notification.style.display = 'none';
    }, 1000);

}

