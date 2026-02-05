import ast
import re
import unicodedata
import pandas as pd
import psycopg
from ftfy import fix_text


# ---------- text cleaning helpers ----------

def clean_text(s):
    if pd.isna(s):
        return None
    s = fix_text(str(s))
    s = unicodedata.normalize("NFC", s)
    s = re.sub(r"[\u0000-\u001F\u007F]", "", s)
    return re.sub(r"\s+", " ", s).strip()


def clean_author(author):
    if pd.isna(author):
        return None
    author = fix_text(str(author))
    author = re.sub(r"\s*\(.*?\)", "", author)
    author = author.split(",")[0]
    return author.strip()


def parse_genres(val):
    if pd.isna(val):
        return []
    try:
        return [clean_text(g) for g in ast.literal_eval(val)]
    except Exception:
        return []


def parse_series(val):
    if pd.isna(val):
        return None, None

    val = clean_text(val)
    m = re.match(r"^(.*?)\s*#\s*(\d+)$", val)
    if m:
        return m.group(1), int(m.group(2))
    return val, None


# ---------- DB helpers ----------

def load_map(conn, table):
    with conn.cursor() as cur:
        cur.execute(f"SELECT id, name FROM {table}")
        return dict(cur.fetchall())


# ---------- main pipeline ----------

def run_import():
    df = pd.read_csv(
        "books_1.Best_Books_Ever.csv",
        encoding="utf-8",
        encoding_errors="strict"
    )

    # --- clean & transform ---
    df["author_clean"] = df["author"].apply(clean_author).apply(clean_text)
    df["publisher_clean"] = df["publisher"].apply(clean_text)
    df["title"] = df["title"].apply(clean_text).str.slice(0, 100)
    df["description"] = df["description"].apply(clean_text).str.slice(0, 10_000)
    df["coverImg"] = df["coverImg"].astype(str).str.slice(0, 200)

    df["pub_date"] = pd.to_datetime(
        df["publishDate"], errors="coerce"
    ).dt.date

    df[["series_clean", "series_num"]] = (
        df["series"].apply(parse_series).apply(pd.Series)
    )

    df["series_clean"] = df["series_clean"].apply(clean_text)

    df["pages"] = (
        pd.to_numeric(df["pages"], errors="coerce")
        .clip(0, 32767)
    )

    df["series_num"] = (
        pd.to_numeric(df["series_num"], errors="coerce")
        .clip(0, 32767)
    )

    df["genres"] = df["genres"].apply(parse_genres)

    # --- dimension values ---
    authors = df["author_clean"].dropna().drop_duplicates().tolist()
    publishers = df["publisher_clean"].dropna().drop_duplicates().tolist()
    series_names = df["series_clean"].dropna().drop_duplicates().tolist()

    genres = (
        df["genres"]
        .explode()
        .dropna()
        .drop_duplicates()
        .tolist()
    )

    # ---------- database work ----------
    with psycopg.connect("dbname=bookclub user=postgres host=localhost") as conn:

        with conn.cursor() as cur:
            cur.executemany(
                "INSERT INTO library_author (name) VALUES (%s) ON CONFLICT DO NOTHING",
                [(a,) for a in authors]
            )
            cur.executemany(
                "INSERT INTO library_publisher (name) VALUES (%s) ON CONFLICT DO NOTHING",
                [(p,) for p in publishers]
            )
            cur.executemany(
                "INSERT INTO library_series (name) VALUES (%s) ON CONFLICT DO NOTHING",
                [(s,) for s in series_names]
            )
            cur.executemany(
                "INSERT INTO library_genres (name) VALUES (%s) ON CONFLICT DO NOTHING",
                [(g,) for g in genres]
            )

        # --- load FK maps ---
        author_map = load_map(conn, "library_author")
        publisher_map = load_map(conn, "library_publisher")
        series_map = load_map(conn, "library_series")
        genre_map = load_map(conn, "library_genres")

        # --- insert books + capture IDs ---
        book_genre_rows = []
        insert_book_sql = """
        INSERT INTO library_book (
            title, description, pub_date, author_id,
            pages, series_id, series_num,
            publisher_id, cover
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        RETURNING id;
        """

        with conn.cursor() as cur:
            for _, row in df.iterrows():

                author_id = author_map.get(row["author_clean"])
                publisher_id = publisher_map.get(row["publisher_clean"])
                series_id = series_map.get(row["series_clean"])

                if author_id is None or publisher_id is None:
                    continue

                cur.execute(
                    insert_book_sql,
                    (
                        row["title"],
                        row["description"],
                        row["pub_date"],
                        author_id,
                        row["pages"],
                        publisher_id,
                        row["series_num"],
                        series_id,
                        row["coverImg"],
                    ),
                )
                book_id = cur.fetchone()[0]
                for g in row["genres"]:
                    gid = genre_map.get(g)
                    if gid:
                        book_genre_rows.append((book_id, gid))  

        with conn.cursor() as cur:
            cur.executemany(
                """
                INSERT INTO library_book_genres (book_id, genre_id)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING
                """,
                book_genre_rows
            )


if __name__ == "__main__":
    run_import()
