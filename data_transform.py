import pandas as pd
import psycopg
import unicodedata
import re
import ast
from ftfy import fix_text

def clean_author(author):
    if pd.isna(author):
        return None

    # remove anything in parentheses
    author = re.sub(r"\s*\(.*?\)", "", author)

    # take only first author (before comma)
    author = author.split(",")[0]

    return author.strip()

def clean_text(s):
    if pd.isna(s):
        return None
    
    s = str(s)

    s = fix_text(s)

    s = unicodedata.normalize("NFC", s)

    s = re.sub(r"[\u0000-\u001F\u007F]", "", s)

    s = re.sub(r"\s+", " ", s).strip()

    return s

def parse_genres(genres):
    if pd.isna(genres):
        return None
    
    try:
        return ast.literal_eval(genres)
    except (ValueError, SyntaxError):
        return None

def parse_series(series):
    if pd.isna(series):
        return None, None
    
    series = str(series).strip()

    # Match "Series Name #Number"
    m = re.match(r"^(.*?)\s*#\s*(\d+)$", series)

    if m:
        name = m.group(1).strip()
        num = int(m.group(2))
        return name, num

    # No number → series name only
    return series, None


def load_map(conn, table):
    with conn.cursor() as cur:
        cur.execute(f"SELECT id, name FROM {table}")
        return dict(cur.fetchall())
    
def main():
    df = pd.read_csv("books_1.Best_Books_Ever.csv", encoding="utf-8", encoding_errors="strict")

    # Basic Cleanup
    df["author"] = df["author"].apply(fix_text).apply(clean_author)
    df["publisher"] = df["publisher"].apply(clean_text)
    df["genres"] = df["genres"].apply(parse_genres)
    df[["series" , "series_num"]] = df["series"].apply(parse_series).apply(pd.Series)
    df["series"] = df["series"].apply(clean_text)
    df["series_num"] = pd.to_numeric(df["series_num"], errors="coerce")

    authors = df["author"].dropna().drop_duplicates().tolist()
    
    publishers = df["publisher"].dropna().drop_duplicates().tolist()

    series_names = df["series"].dropna().drop_duplicates().tolist()

    genres = (
        df["genres"]
        .explode()
        .dropna()
        .drop_duplicates()
        .tolist()
    )
    
    df["publishDate"] = pd.to_datetime(df["publishDate"], errors="coerce").dt.date

    sql_author = """
    INSERT INTO library_author (name)
    VALUES (%s)
    ON CONFLICT (name) DO NOTHING;
    """

    sql_publisher = """
    INSERT INTO library_publisher (name)
    VALUES (%s)
    ON CONFLICT (name) DO NOTHING;
    """

    sql_genres = """
    INSERT INTO library_genres (name)
    VALUES (%s)
    ON CONFLICT (name) DO NOTHING;
    """

    sql_series = """
    INSERT INTO library_series (name)
    VALUES (%s)
    ON CONFLICT (name) DO NOTHING;
    """

    sql = """
    INSERT INTO book (
    title, description, pub_date, author_id,
    pages, series_id, series_order, publisher_id, cover_url
    )
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
    RETURNING id;
    """

    with psycopg.connect("dbname=bookclub user=postgres host=localhost") as conn:
        with conn.cursor() as cur:
            cur.executemany(sql_author, [(a,) for a in authors])
            cur.executemany(sql_publisher, [(a,) for a in publishers])
            cur.executemany(sql_genres, [(a,) for a in genres])
            cur.executemany(sql_series, [(a,) for a in series_names])
      
        author_map = load_map(conn, "library_author")
        publisher_map = load_map(conn, "library_publisher")
        series_map = load_map(conn, "library_series")
        genre_map = load_map(conn, "library_genres")


        book_rows = []

        for _, row in df.iterrows():
            book_rows.append((
                row["title"],
                row["description"],
                row["publishDate"],
                author_map.get(row["author"]),
                pd.to_numeric(row["pages"], errors="coerce"),
                series_map.get(row["series"]),
                row["series_num"],
                publisher_map.get(row["publisher"]),
                row["coverImg"],
            ))
        
        with conn.cursor() as cur:
            cur.executemany(sql, book_rows)
        
main()