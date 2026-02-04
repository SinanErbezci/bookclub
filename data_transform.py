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

def clean_genres(genres):
    if pd.isna(genres):
        return None
    
    try:
        return ast.literal_eval(genres)
    except (ValueError, SyntaxError):
        return None

# def clean_text(s):
#     if s is None:
#         return None
#     s = re.sub(r"[^\x20-\x7E]", "", s)
#     return s.strip() or None

def loading_authors():
    df = pd.read_csv("books_1.Best_Books_Ever.csv", encoding="utf-8", encoding_errors="strict")

    authors_series = (
        df["author"]
        .dropna()
        .astype(str)
        .apply(fix_text)
        .apply(clean_author)
        .apply(lambda x: unicodedata.normalize("NFC", x))
    )

    authors_df = (
        authors_series
        .drop_duplicates()
        .to_frame(name="name")
        .reset_index(drop=True)
    )
    
    print(authors_df[
    authors_df["name"].str.contains("├|Ã|Â|�", regex=True, na=False)
])
    conn = psycopg.connect(
        "dbname=bookclub user=postgres host=localhost"
    )

    insert_sql = """
    INSERT INTO library_author (name)
    VALUES (%s)
    ON CONFLICT (name) DO NOTHING
    """

    print(authors_df[authors_df["name"].str.contains("Benjamin Alire", na=False)].head(5))
    # Delete mojibake string
    # delete_sql = "DELETE FROM library_author WHERE octet_length(name) > length(name) * 2.5;"
    
    with conn:
        with conn.cursor() as cur:
            cur.executemany(
                insert_sql,
                authors_df.itertuples(index=False, name=None)
            )
            # cur.execute(delete_sql)

def loading_genres():
    df = pd.read_csv("books_1.Best_Books_Ever.csv", encoding="utf-8", dtype=str)

    # print(df["genres"].head())

    df["genres_list"] = df["genres"].apply(clean_genres)
    
    genres_df = (
        df[["genres_list"]]
        .explode("genres_list")
        .dropna()
        .rename(columns={"genres_list": "name"})
    )
    
    genres_df["name"] = (
        genres_df["name"]
        .str.strip()
        .str.title()
    )

    genres_df = genres_df.drop_duplicates().reset_index(drop=True)

    insert_sql = """
    INSERT INTO library_genres (name)
    VALUES (%s)
    ON CONFLICT (name) DO NOTHING
    """

    # Delete mojibake string
    delete_sql = "DELETE FROM library_genres WHERE octet_length(name) > length(name) * 2.5;"

    conn = psycopg.connect(
        "dbname=bookclub user=postgres host=localhost"
    )

    with conn:
        with conn.cursor() as cur:
            cur.executemany(
                insert_sql,
                genres_df[["name"]].itertuples(index=False, name=None)
            )
            cur.execute(delete_sql)

def loading_publisher():
    df = pd.read_csv("books_1.Best_Books_Ever.csv", encoding="utf-8", dtype=str)

    publisher_df = (
        df[["publisher"]]
        .dropna()
        .drop_duplicates()
        .reset_index(drop=True)
        .rename(columns={"publisher": "name"})
    )

    sorted_df = publisher_df.sort_values(by="name", key=lambda x: x.str.len())
    print(sorted_df.iloc[-1].str.len())
    
    # insert_sql = """
    # INSERT INTO library_publisher (name)
    # VALUES (%s)
    # ON CONFLICT (name) DO NOTHING
    # """

    # conn = psycopg.connect(
    #     "dbname=bookclub user=postgres host=localhost"
    # )

    # with conn:
    #     with conn.cursor() as cur:
    #         cur.executemany(
    #             insert_sql,
    #             publisher_df[["name"]].itertuples(index=False, name=None))
            
loading_authors()