"""
============================================
ROOTS & ROUTES — backend/scraper.py
Standalone BeautifulSoup Data Pipeline
Scrapes travel info → pushes to Firebase
============================================

Usage:
  python scraper.py --destinations "Santorini,Bali,Kyoto"
  python scraper.py --url "https://example.com/article"
  python scraper.py --seed   (seeds Firebase with initial data)
"""

import argparse
import json
import logging
import os
import sys
from datetime import datetime

import requests
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("RootsRoutesScraper")

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; RootsAndRoutes/1.0)"}

# ── Scrapers ─────────────────────────────────

def scrape_wikipedia(destination: str) -> dict:
    """Scrape Wikipedia for a destination's overview."""
    url = f"https://en.wikipedia.org/wiki/{destination.replace(' ', '_')}"
    logger.info(f"Scraping Wikipedia: {url}")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=12)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # Title
        title = soup.find("h1", {"id": "firstHeading"})
        title_text = title.get_text(strip=True) if title else destination

        # Summary paragraph
        summary = ""
        content = soup.find("div", {"id": "mw-content-text"})
        if content:
            for p in content.find_all("p", recursive=True):
                text = p.get_text(strip=True)
                # Skip citation-heavy or short paragraphs
                if len(text) > 120 and "[" not in text[:20]:
                    summary = text[:500]
                    break

        # Infobox
        infobox = {}
        ib_table = soup.find("table", {"class": lambda c: c and "infobox" in c})
        if ib_table:
            for row in ib_table.find_all("tr"):
                th = row.find("th")
                td = row.find("td")
                if th and td:
                    k = th.get_text(strip=True).lower().replace(" ", "_")[:30]
                    v = td.get_text(strip=True)[:100]
                    if k and v:
                        infobox[k] = v

        # Images in article
        images = []
        for img in soup.find_all("img", src=True)[:5]:
            src = img["src"]
            if src.startswith("//") and not "icon" in src and not "thumb" in src.lower():
                images.append("https:" + src)
            elif src.startswith("http") and "upload.wikimedia" in src:
                images.append(src)

        return {
            "name": title_text,
            "wiki_url": url,
            "summary": summary,
            "infobox": infobox,
            "images": images[:3],
            "scraped_at": datetime.utcnow().isoformat(),
            "source": "wikipedia"
        }

    except Exception as e:
        logger.error(f"Error scraping {destination}: {e}")
        return {"name": destination, "error": str(e), "scraped_at": datetime.utcnow().isoformat()}


def scrape_article(url: str) -> dict:
    """Generic article scraper for travel blogs."""
    logger.info(f"Scraping article: {url}")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=12)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # Meta / OG tags
        def meta(name=None, prop=None):
            if name:
                tag = soup.find("meta", {"name": name})
            else:
                tag = soup.find("meta", property=prop)
            return tag["content"].strip() if tag and tag.get("content") else ""

        title    = soup.find("h1")
        title_t  = title.get_text(strip=True) if title else meta(prop="og:title") or soup.title.string or "Untitled"
        desc     = meta(name="description") or meta(prop="og:description")
        image    = meta(prop="og:image")
        author   = meta(name="author")
        pub_date = meta(prop="article:published_time") or meta(name="date")

        # Body text
        body = soup.find("article") or soup.find("main") or soup.body
        paragraphs = []
        if body:
            for p in body.find_all("p"):
                text = p.get_text(strip=True)
                if len(text) > 60:
                    paragraphs.append(text)
                if len(paragraphs) >= 8:
                    break

        # All headings (for structure)
        headings = [h.get_text(strip=True) for h in soup.find_all(["h2", "h3"])[:6]]

        # Keywords
        kw_tag = soup.find("meta", {"name": "keywords"})
        keywords = [k.strip() for k in kw_tag["content"].split(",")] if kw_tag and kw_tag.get("content") else []

        return {
            "url": url,
            "title": title_t,
            "description": desc,
            "image": image,
            "author": author,
            "published": pub_date,
            "excerpt": paragraphs[0] if paragraphs else desc,
            "paragraphs": paragraphs,
            "headings": headings,
            "keywords": keywords[:10],
            "word_count": sum(len(p.split()) for p in paragraphs),
            "scraped_at": datetime.utcnow().isoformat(),
            "source": "web_scrape"
        }

    except Exception as e:
        logger.error(f"Article scrape error: {e}")
        return {"url": url, "error": str(e), "scraped_at": datetime.utcnow().isoformat()}


def push_to_firebase(collection: str, doc_id: str, data: dict) -> bool:
    """Push data to Firestore (requires firebase-admin configured)."""
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        if not firebase_admin._apps:
            cred_path = os.environ.get("FIREBASE_CRED", "serviceAccountKey.json")
            if not os.path.exists(cred_path):
                logger.warning("serviceAccountKey.json not found — skipping Firebase push")
                return False
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)

        db = firestore.client()
        db.collection(collection).document(doc_id).set(data, merge=True)
        logger.info(f"✅ Pushed to Firestore: {collection}/{doc_id}")
        return True

    except Exception as e:
        logger.error(f"Firebase push failed: {e}")
        return False


def save_local(filename: str, data):
    """Save scraped data locally as JSON."""
    os.makedirs("data", exist_ok=True)
    path = f"data/{filename}"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    logger.info(f"💾 Saved locally: {path}")


# ── Seed Data ─────────────────────────────────

SEED_DESTINATIONS = [
    {"id": "1",  "name": "Santorini",   "category": "beach",    "country": "Greece",      "rating": 4.9, "price": 1200, "duration": "7 days"},
    {"id": "2",  "name": "Rajasthan",   "category": "heritage", "country": "India",       "rating": 4.8, "price": 680,  "duration": "10 days"},
    {"id": "3",  "name": "Bali",        "category": "beach",    "country": "Indonesia",   "rating": 4.7, "price": 920,  "duration": "8 days"},
    {"id": "4",  "name": "Swiss Alps",  "category": "mountain", "country": "Switzerland", "rating": 4.9, "price": 2100, "duration": "6 days"},
    {"id": "5",  "name": "Kyoto",       "category": "heritage", "country": "Japan",       "rating": 4.8, "price": 1450, "duration": "9 days"},
    {"id": "6",  "name": "Patagonia",   "category": "mountain", "country": "Argentina",   "rating": 4.6, "price": 2800, "duration": "12 days"},
]

SEED_TOURS = [
    {"id": "t1", "name": "Golden Triangle India",  "duration": "8 Days",  "price": 899,  "groupSize": 12, "difficulty": "Easy"},
    {"id": "t2", "name": "Amalfi Coast Walk",      "duration": "6 Days",  "price": 1650, "groupSize": 8,  "difficulty": "Moderate"},
    {"id": "t3", "name": "Northern Lights Norway", "duration": "7 Days",  "price": 2400, "groupSize": 10, "difficulty": "Easy"},
    {"id": "t4", "name": "Amazon Rainforest Trek", "duration": "10 Days", "price": 3200, "groupSize": 6,  "difficulty": "Hard"},
]

def seed_firebase():
    """Seed Firebase with initial destinations and tours."""
    logger.info("Seeding Firebase with initial data...")
    for dest in SEED_DESTINATIONS:
        push_to_firebase("destinations", dest["id"], {**dest, "created_at": datetime.utcnow().isoformat()})
    for tour in SEED_TOURS:
        push_to_firebase("tours", tour["id"], {**tour, "created_at": datetime.utcnow().isoformat()})
    logger.info(f"✅ Seeded {len(SEED_DESTINATIONS)} destinations and {len(SEED_TOURS)} tours")


# ── CLI ───────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Roots & Routes BeautifulSoup Scraper")
    parser.add_argument("--destinations", type=str, help="Comma-separated destination names to scrape")
    parser.add_argument("--url", type=str, help="URL of a travel article to scrape")
    parser.add_argument("--seed", action="store_true", help="Seed Firebase with initial data")
    parser.add_argument("--no-firebase", action="store_true", help="Skip Firebase push, save locally only")
    args = parser.parse_args()

    if args.seed:
        seed_firebase()
        return

    if args.url:
        data = scrape_article(args.url)
        save_local(f"article_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json", data)
        if not args.no_firebase:
            doc_id = data.get("title", "article")[:40].replace(" ", "_")
            push_to_firebase("blog_posts", doc_id, data)
        print(json.dumps(data, indent=2, ensure_ascii=False))
        return

    if args.destinations:
        names = [d.strip() for d in args.destinations.split(",")]
        results = []
        for name in names:
            data = scrape_wikipedia(name)
            save_local(f"{name.replace(' ', '_').lower()}.json", data)
            if not args.no_firebase:
                push_to_firebase("scraped_destinations", name.replace(" ", "_"), data)
            results.append(data)
        print(json.dumps(results, indent=2, ensure_ascii=False))
        return

    parser.print_help()

if __name__ == "__main__":
    main()
