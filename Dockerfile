# 1) sestavení webu (náhledy obrázků potřebují Pillow, numpy a scipy)
FROM python:3.15-slim AS build
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src src
COPY docs docs
COPY tools/build.py tools/build.py
RUN python tools/build.py

# 2) běh: jen server ze standardní knihovny + hotový web
FROM python:3.15-alpine
WORKDIR /app
RUN adduser -D -H -u 10001 app && mkdir /data && chown app /data
COPY --from=build /app/web web
COPY tools/server.py tools/server.py
ENV CNC_DATA=/data PORT=8090 PYTHONUNBUFFERED=1
VOLUME /data
EXPOSE 8090
USER app
HEALTHCHECK --interval=60s --timeout=5s CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8090/healthz', timeout=4)"
CMD ["python", "tools/server.py", "--host", "0.0.0.0"]
