#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import urlopen
import subprocess
import time

ROOT = Path(__file__).resolve().parents[2]
BASIN_ENDPOINT = "https://usebasin.com/f/0184c01ee34e"


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.forms = []
        self.current_form = None
        self.meta = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta":
            self.meta.append(attrs)
        elif tag == "a":
            self.links.append(attrs)
        elif tag == "form":
            self.current_form = {"attrs": attrs, "inputs": []}
            self.forms.append(self.current_form)
        elif tag == "input" and self.current_form is not None:
            self.current_form["inputs"].append(attrs)

    def handle_endtag(self, tag):
        if tag == "form":
            self.current_form = None


def parse_html(path):
    parser = PageParser()
    parser.feed((ROOT / path).read_text(encoding="utf-8"))
    return parser


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def validate_markup_contract():
    index = parse_html("index.html")
    index_robot_metas = [meta for meta in index.meta if meta.get("name") == "robots"]
    require(
        all("noindex" not in meta.get("content", "").lower() for meta in index_robot_metas),
        "index.html must not set noindex after the search-indexing release",
    )
    require(
        all("nofollow" not in meta.get("content", "").lower() for meta in index_robot_metas),
        "index.html must not set nofollow after the search-indexing release",
    )

    forms = [form for form in index.forms if form["attrs"].get("id") == "waitlist-form"]
    require(len(forms) == 1, "waitlist form must exist exactly once")
    form = forms[0]
    require(form["attrs"].get("action") == BASIN_ENDPOINT, "waitlist form must post to the production Basin endpoint")
    require(form["attrs"].get("method") == "POST", "waitlist form must use POST")

    inputs = {field.get("name"): field for field in form["inputs"] if field.get("name")}
    require(set(inputs) == {"name", "telegram", "consent"}, "waitlist form must collect only name, telegram, and consent")
    require(all("required" in inputs[name] for name in inputs), "all waitlist fields must be required")
    require(inputs["consent"].get("type") == "checkbox", "consent must be a checkbox")
    require("checked" not in inputs["consent"], "consent must be unticked by default")
    require(inputs["telegram"].get("pattern") == r"^@?[A-Za-z][A-Za-z0-9_]{3,30}[A-Za-z0-9]$", "Telegram pattern must reject trailing underscores")
    require(any(link.get("href") == "/privacy.html" for link in index.links), "consent copy must link to privacy.html")
    require(any(link.get("href") == "/terms.html" for link in index.links), "consent copy must link to terms.html")

    for page in ["404.html", "privacy.html", "terms.html"]:
        parsed = parse_html(page)
        require(
            any(meta.get("name") == "robots" and meta.get("content") == "noindex, nofollow" for meta in parsed.meta),
            f"{page} must stay noindex,nofollow as a support page",
        )

    robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
    require("User-agent: *" in robots, "robots.txt must address all crawlers")
    require("Disallow: /" not in robots, "robots.txt must not block the public home page")
    require("Allow: /" in robots, "robots.txt must allow crawling from the site root")
    require(
        "Sitemap: https://tutor.tutoratlas.sg/sitemap.xml" in robots,
        "robots.txt must advertise the canonical sitemap",
    )


def validate_served_pages():
    server = subprocess.Popen(
        ["python3", "-m", "http.server", "5174", "--bind", "127.0.0.1"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        time.sleep(1)
        for path in ["/", "/privacy.html", "/terms.html", "/robots.txt", "/sitemap.xml"]:
            with urlopen(f"http://127.0.0.1:5174{path}", timeout=5) as response:
                body = response.read().decode("utf-8")
                require(response.status == 200, f"{path} should return HTTP 200")
                require(body, f"{path} should not be empty")
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()


def main():
    validate_markup_contract()
    validate_served_pages()


if __name__ == "__main__":
    main()
