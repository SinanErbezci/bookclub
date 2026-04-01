import ast
import re
import unicodedata
from datetime import date
from decimal import Decimal, InvalidOperation
from typing import Any, Optional, List
import pandas as pd
import psycopg
from ftfy import fix_text

SOURCE = "best_books_ever_csv_v1"
CSV_ID_COLUMN = "bookId"
MAX_ERROR_PRINTS = 50

SPLIT_FIRST = re.compile(r"\s*(?:,|;|&|\band\b)\s*", re.IGNORECASE)
PARENS_TAIL = re.compile(r"(?:\s*\([^()]*\))+\s*$")

def clean_text(val: Any) -> Optional[str]:
    if val is None or (isinstance(val, float) and pd.isna(val)) or pd.isna(val):
        return None
    s = fix_text(str(val))
    s = unicodedata.normalize("NFC", s)
    s = s.strip()
    return s or None

def clean_author(val):
    s = clean_text(val)
    if not s:
        return None

    first = SPLIT_FIRST.split(s, maxsplit=1)[0].strip()

    first = PARENS_TAIL.sub("", first).strip()

    return first or None

def safe_int(x: Any) -> Optional[int]:
    try:
        return int(float(x))
    except (TypeError, ValueError):
        return None


def safe_smallint(x: Any) -> Optional[int]:
    n = safe_int(x)
    if n is None:
        return None
    return n if 0 <= n <= 32767 else None


def safe_decimal_1dp(x: Any) -> Decimal:
    try:
        d = Decimal(str(x))
    except (InvalidOperation, TypeError, ValueError):
        return Decimal("0.0")
    return d.quantize(Decimal("0.0"))


def parse_series(val: Any) -> tuple[Optional[str], Optional[int]]:
    s = clean_text(val)
    if not s:
        return None, None
    m = re.match(r"^(.*?)\s*#\s*(\d+)\s*$", s)
    if m:
        return m.group(1).strip() or None, int(m.group(2))
    return s, None


def parse_date_mmddyy(val: Any) -> Optional[date]:
    if val is None or pd.isna(val):
        return None
    s = str(val).strip()
    if not s:
        return None
    dt = pd.to_datetime(s, errors="coerce", format="%m/%d/%y")
    if pd.isna(dt):
        dt = pd.to_datetime(s, errors="coerce")
    if pd.isna(dt):
        return None
    return dt.date()


def parse_list_cell(val: Any) -> List[str]:
    if val is None or pd.isna(val):
        return []
    if isinstance(val, list):
        out = []
        for x in val:
            t = clean_text(x)
            if t:
                out.append(t)
        return out
    if not isinstance(val, str):
        return []
    s = val.strip()
    if not s:
        return []
    if s.startswith("[") and s.endswith("]"):
        try:
            parsed = ast.literal_eval(s)
            if isinstance(parsed, list):
                out: List[str] = []
                for x in parsed:
                    t = clean_text(x)
                    if t:
                        out.append(t)
                return out
        except Exception:
            return []
    return []

def preload_name_cache(cur, table: str) -> dict[str, int]:
    cache: dict[str, int] = {}
    cur.execute(f"SELECT id, name FROM {table}")
    for _id, name in cur.fetchall():
        if name:
            cache[name] = _id
    return cache


def get_or_create_by_name(cur, table: str, name, cache: dict[str, int]) -> Optional[int]:
    if name is None or pd.isna(name):
        return None

    name = clean_text(name)
    if not name:
        return None

    if name in cache:
        return cache[name]

    cur.execute(
        f"INSERT INTO {table} (name) VALUES (%s) ON CONFLICT (name) DO NOTHING",
        (name,),
    )
    cur.execute(f"SELECT id FROM {table} WHERE name = %s", (name,))
    row = cur.fetchone()
    if not row:
        raise RuntimeError(f"Failed to fetch id for {table}.name={name!r}")
    cache[name] = row[0]
    return row[0]


def run_import(csv_path: str, db_dsn: str, rejects_csv: str = "etl_reject.csv"):
    df = pd.read_csv(csv_path, encoding="utf-8", encoding_errors="strict")
    if CSV_ID_COLUMN not in df.columns:
        raise RuntimeError(f"CSV must contain {CSV_ID_COLUMN!r} column.")

    df["bookId"] = df["bookId"].apply(clean_text)
    df["title"] = df["title"].apply(clean_text)
    df["description"] = df["description"].apply(clean_text)
    df["author"] = df["author"].apply(clean_author)
    df["publisher"] = df["publisher"].apply(clean_text)
    df["coverImg"] = df["coverImg"].apply(clean_text)

    df[["series_name", "series_num"]] = df["series"].apply(parse_series).apply(pd.Series)
    df["pub_date"] = df["publishDate"].apply(parse_date_mmddyy)
    df["genres_list"] = df["genres"].apply(parse_list_cell)

    df["pages_num"] = df["pages"].apply(safe_int) if "pages" in df.columns else None
    df["num_ratings_num"] = df["numRatings"].apply(safe_int) if "numRatings" in df.columns else None
    df["rating_dec"] = df["rating"].apply(safe_decimal_1dp) if "rating" in df.columns else Decimal("0.0")

    inserted = 0
    updated = 0
    rejected = 0
    db_errors = 0
    rejects: List[dict] = []

    with psycopg.connect(db_dsn) as conn:
        conn.autocommit = False
        with conn.cursor() as cur:
            author_cache = preload_name_cache(cur, "library_author")
            publisher_cache = preload_name_cache(cur, "library_publisher")
            series_cache = preload_name_cache(cur, "library_series")
            genre_cache = preload_name_cache(cur, "library_genre")

            for idx, row in df.iterrows():
                source_row_id = row["bookId"]
                title = row.get("title")

                if not source_row_id:
                    rejected += 1
                    rejects.append({"row": idx, "bookId": None, "title": title, "reason": "missing_bookId"})
                    continue

                author_name = row["author"]
                if not author_name:
                    rejected += 1
                    rejects.append({"row": idx, "bookId": source_row_id, "title": title, "reason": "missing_author"})
                    continue

                try:
                    author_id = get_or_create_by_name(cur, "library_author", author_name, author_cache)
                    if not author_id:
                        raise RuntimeError("author_id could not be resolved (unexpected)")

                    publisher_id = get_or_create_by_name(cur, "library_publisher", row["publisher"], publisher_cache)
                    series_id = get_or_create_by_name(cur, "library_series", row["series_name"], series_cache)

                    pages = safe_int(row.get("pages_num"))
                    series_num = safe_smallint(row.get("series_num"))
                    num_ratings = row.get("num_ratings_num") or 0
                    rating = row.get("rating_dec") or Decimal("0.0")

                    cur.execute(
                        """
                        INSERT INTO library_book (
                            source, source_row_id,
                            title, description, pub_date,
                            author_id, pages, series_id, series_num,
                            publisher_id, cover,
                            num_ratings, rating
                        )
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                        ON CONFLICT (source, source_row_id)
                        DO UPDATE SET
                            title = EXCLUDED.title,
                            description = EXCLUDED.description,
                            pub_date = EXCLUDED.pub_date,
                            author_id = EXCLUDED.author_id,
                            pages = EXCLUDED.pages,
                            series_id = EXCLUDED.series_id,
                            series_num = EXCLUDED.series_num,
                            publisher_id = EXCLUDED.publisher_id,
                            cover = EXCLUDED.cover,
                            num_ratings = EXCLUDED.num_ratings,
                            rating = EXCLUDED.rating
                        RETURNING id, (xmax = 0) AS inserted
                        """,
                        (
                            SOURCE, source_row_id,
                            row["title"],
                            row["description"] or "",
                            row["pub_date"],
                            author_id,
                            pages,
                            series_id,
                            series_num,
                            publisher_id,
                            row["coverImg"],
                            num_ratings,
                            rating,
                        ),
                    )
                    book_id, was_inserted = cur.fetchone()

                    cur.execute("DELETE FROM library_book_genres WHERE book_id = %s", (book_id,))
                    for g in row["genres_list"]:
                        genre_id = get_or_create_by_name(cur, "library_genre", g, genre_cache)
                        if not genre_id:
                            continue
                        cur.execute(
                            """
                            INSERT INTO library_book_genres (book_id, genre_id)
                            VALUES (%s, %s)
                            ON CONFLICT DO NOTHING
                            """,
                            (book_id, genre_id),
                        )

                    conn.commit()
                    if was_inserted:
                        inserted += 1
                    else:
                        updated += 1

                except Exception as e:
                    conn.rollback()
                    db_errors += 1
                    # classify as reject vs db_error
                    reason = str(e)
                    rejects.append({"row": idx, "bookId": source_row_id, "title": title, "reason": reason})
                    if db_errors <= MAX_ERROR_PRINTS:
                        print(f"[ERROR] row={idx} bookId={source_row_id!r} title={title!r} err={e}")
                    continue

    if rejects:
        pd.DataFrame(rejects).to_csv(rejects_csv, index=False)

    print("---- ETL Summary ----")
    print(f"CSV rows:   {len(df)}")
    print(f"Inserted:   {inserted}")
    print(f"Updated:    {updated}")
    print(f"Rejected:   {rejected}")
    print(f"DB Errors:  {db_errors}")
    if rejects:
        print(f"Reject log: {rejects_csv}")
