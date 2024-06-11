import http.server
import socketserver
import webbrowser
import os

PORT = 8000

# 获取当前工作目录
current_dir = os.getcwd()

# 设置index.html所在的目录
os.chdir(current_dir)

Handler = http.server.SimpleHTTPRequestHandler

# 启动简单的 HTTP 服务器
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("本地服务器正在端口", PORT, "上运行...")
    
    # 构建 index.html 文件的 URL
    url = f"http://localhost:{PORT}/index.html"
    
    # 在浏览器中打开 index.html
    webbrowser.open(url)
    
    # 服务永远运行
    httpd.serve_forever()
