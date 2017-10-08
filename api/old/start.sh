source venv/bin/activate
python3 hello.py
export FLASK_APP=server.py
export FLASK_DEBUG=1
flask run --host=0.0.0.0
