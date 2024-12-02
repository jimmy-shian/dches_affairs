document.getElementById('addElement').addEventListener('click', () => {
    const container = document.getElementById('elementContainer');
    
    // 創建新元素
    const newElement = document.createElement('div');
    newElement.className = 'element';
    
    // 加入容器
    container.appendChild(newElement);
});

document.getElementById('removeElement').addEventListener('click', () => {
    const container = document.getElementById('elementContainer');
    
    // 如果有元素，刪除最後一個
    if (container.children.length > 0) {
        container.removeChild(container.lastChild);
    }
});
