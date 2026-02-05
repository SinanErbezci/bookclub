import re
import ast
import unicodedata
import pandas as pd
import psycopg
from ftfy import fix_text


CSV_PATH = "books_1.Best_Books_Ever.csv"


# -----------------------
# Text cleaning
# -----------------------

def clean_text(val):
    if pd.isna(val) or val is None:
        return None
    val = fix_text(str(val))
    val = unicodedata.normalize("NFC", val)
    val = val.strip()
    return val or None


def clean_author(val):
    if pd.isna(val) or val is None:
        return None
    val = clean_text(val)
    if not val:
        return None
    val = re.sub(r"\s*\(.*?\)", "", val)
    val = val.split(",")[0]
    return val.strip() or None


# -----------------------
# Series parsing
# -----------------------

def parse_series(val):
    if pd.isna(val) or val is None:
        return None, None

    val = clean_text(val)
    if not val:
        return None, None

    m = re.match(r"^(.*?)\s*#\s*(\d+)$", val)
    if m:
        return m.group(1).strip(), int(m.group(2))

    return val.strip(), None


# -----------------------
# Numeric hard guards
# -----------------------

def safe_smallint(x):
    try:
        x = int(x)
    except (TypeError, ValueError):
        return None
    return x if 0 <= x <= 32767 else None


# -----------------------
# Main import
# -----------------------

def run_import():
    df = pd.read_csv(CSV_PATH, encoding="utf-8", encoding_errors="strict")

    # ---- Clean fields
    df["title"] = df["title"].apply(clean_text)
    df["description"] = df["description"].apply(clean_text)
    df["author"] = df["author"].apply(clean_author)
    df["publisher"] = df["publisher"].apply(clean_text)
    df["coverImg"] = df["coverImg"].apply(clean_text)

    # ---- Pages (pre-clean)
    df["pages"] = pd.to_numeric(df["pages"], errors="coerce")

    # ---- Series
    df[["series_name", "series_num"]] = (
        df["series"]
        .apply(parse_series)
        .apply(pd.Series)
    )

    # ---- Genres
    df["genres_list"] = df["genres"].apply(
        lambda x: ast.literal_eval(x)
        if isinstance(x, str) and x.startswith("[")
        else []
    )

    # ---- Dates
    df["pub_date"] = pd.to_datetime(
        df["publishDate"], errors="coerce"
    ).dt.date

    # -----------------------
    # Database
    # -----------------------

    with psycopg.connect("dbname=bookclub user=postgres host=localhost") as conn:
        with conn.cursor() as cur:

            author_cache = {}
            publisher_cache = {}
            series_cache = {}
            genre_cache = {}

            # preload genres
            cur.execute("SELECT id, name FROM library_genres")
            for gid, name in cur.fetchall():
                genre_cache[name] = gid

            for _, row in df.iterrows():

                # ---------- AUTHOR ----------
                author_id = None
                if row["author"]:
                    if row["author"] not in author_cache:
                        cur.execute(
                            """
                            INSERT INTO library_author (name)
                            VALUES (%s)
                            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                            RETURNING id
                            """,
                            (row["author"],)
                        )
                        author_cache[row["author"]] = cur.fetchone()[0]
                    author_id = author_cache[row["author"]]

                # ---------- PUBLISHER ----------
                publisher_id = None
                if row["publisher"]:
                    if row["publisher"] not in publisher_cache:
                        cur.execute(
                            """
                            INSERT INTO library_publisher (name)
                            VALUES (%s)
                            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                            RETURNING id
                            """,
                            (row["publisher"],)
                        )
                        publisher_cache[row["publisher"]] = cur.fetchone()[0]
                    publisher_id = publisher_cache[row["publisher"]]

                # ---------- SERIES ----------
                series_id = None
                if row["series_name"]:
                    if row["series_name"] not in series_cache:
                        cur.execute(
                            """
                            INSERT INTO library_series (name)
                            VALUES (%s)
                            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                            RETURNING id
                            """,
                            (row["series_name"],)
                        )
                        series_cache[row["series_name"]] = cur.fetchone()[0]
                    series_id = series_cache[row["series_name"]]

                # ---------- BOOK ----------
                cur.execute(
                    """
                    INSERT INTO library_book (
                        title, description, pub_date,
                        pages, series_num,
                        cover,
                        author_id, publisher_id, series_id,
                        num_ratings, rating
                    )
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,0,0)
                    ON CONFLICT (title) DO NOTHING
                    RETURNING id
                    """,
                    (
                        row["title"],
                        row["description"],
                        row["pub_date"],
                        safe_smallint(row["pages"]),
                        safe_smallint(row["series_num"]),
                        row["coverImg"],
                        author_id,
                        publisher_id,
                        series_id,
                    )
                )

                res = cur.fetchone()
                if res is None:
                    continue

                book_id = res[0]

                # ---------- GENRES ----------
                for g in row["genres_list"]:
                    g = clean_text(g)
                    if not g:
                        continue

                    if g not in genre_cache:
                        cur.execute(
                            """
                            INSERT INTO library_genres (name)
                            VALUES (%s)
                            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                            RETURNING id
                            """,
                            (g,)
                        )
                        genre_cache[g] = cur.fetchone()[0]

                    cur.execute(
                        """
                        INSERT INTO library_book_genres (book_id, genres_id)
                        VALUES (%s, %s)
                        ON CONFLICT DO NOTHING
                        """,
                        (book_id, genre_cache[g])
                    )

        conn.commit()


# -----------------------
# Entry point
# -----------------------

if __name__ == "__main__":
    run_import()
