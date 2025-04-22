# app.py
from flask import Flask, render_template
import os

# 템플릿 폴더 경로 설정
template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "templates"))
app = Flask(__name__, template_folder=template_dir)

# 필요한 데이터를 별도의 JSON 파일로 관리하기 위한 설정
DATA_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(DATA_FOLDER, exist_ok=True)

@app.route("/")
def index():
    """메인 페이지 렌더링 - 원페이지 형식 웹 애플리케이션"""
    return render_template("public/index.html")

@app.errorhandler(404)
def page_not_found(e):
    """404 에러 핸들러 - 원페이지 앱이므로 메인으로 리다이렉트"""
    return render_template("public/index.html"), 404

if __name__ == "__main__":
    app.run(debug=True)