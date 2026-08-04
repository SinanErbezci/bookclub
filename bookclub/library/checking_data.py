import pandas as pd

CSV_PATH = "books_1.Best_Books_Ever.csv"

# Load the dataset
df = pd.read_csv(
    CSV_PATH,
    low_memory=False,
)

columns = [
    "bookFormat",
    "language",
    "edition",
    "likedPercent",
]

for column in columns:
    print("\n" + "=" * 80)
    print(column)
    print("=" * 80)

    # How many values are missing?
    missing = df[column].isna().sum()
    print(f"Missing values: {missing}")

    # How many unique values exist?
    unique = df[column].nunique(dropna=True)
    print(f"Unique values: {unique}")

    # Most common values
    print("\nTop 20 values:")
    print(
        df[column]
        .fillna("<missing>")
        .value_counts()
        .head(20)
    )

# ---------------------------------------------------------------------

print("\n" + "=" * 80)
print("Unique book formats")
print("=" * 80)

formats = (
    df["bookFormat"]
    .dropna()
    .astype(str)
    .str.strip()
    .sort_values()
    .unique()
)

print(f"Total unique formats: {len(formats)}\n")

for fmt in formats:
    print(fmt)

# ---------------------------------------------------------------------

print("\n" + "=" * 80)
print("Book format distribution")
print("=" * 80)

print(
    df.groupby("bookFormat")
      .size()
      .sort_values(ascending=False)
)

interesting = (
    df["bookFormat"]
    .fillna("")
    .str.lower()
)

keywords = [
    "graphic",
    "comic",
    "box",
    "set",
    "omnibus",
    "audio",
]

for keyword in keywords:
    print(f"\n--- {keyword} ---")
    print(
        interesting
        .loc[interesting.str.contains(keyword)]
        .value_counts()
    )