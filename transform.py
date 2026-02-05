df = pd.read_csv("books_1.Best_Books_Ever.csv", encoding="utf-8", encoding_errors="strict")

# Basic Cleanup
df["author"] = df["author"].apply(clean_author)
df["publisher"] = df["publisher"].apply(clean_text)
df["genres"] = df["genres"].apply(parse_genres)
df["series"] = df["series"].apply(clean_text)

authors = (
df["author"]
.dropna()
.drop_duplicates()
.tolist()
)

publishers = (
    df["publisher"]
    .dropna()
    .drop_duplicates()
    .tolist()
)

genres = (
    df["genres"]
    .dropna()
    .drop_duplicates()
    .tolist()
)

series = (
    df["series"]
    .dropna()
    .drop_duplicates()
    .tolist()
)


conn = psycopg.connect("dbname=bookclub user=postgres host=localhost")

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

with conn.cursor() as cur:
    cur.executemany(sql_author, [(a,) for a in authors])
    cur.executemany(sql_publisher, [(a,) for a in publishers])
    cur.executemany(sql_genres, [(a,) for a in genres])
    cur.executemany(sql_series, [(a,) for a in series])