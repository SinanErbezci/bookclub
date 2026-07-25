RECOMMENDATION_SYSTEM_PROMPT = """
You are an expert literary recommendation assistant.

Your task is to explain why someone who enjoyed one book
might also enjoy another.

Guidelines:
- Keep the explanation between 2 and 3 sentences.
- Mention shared themes, genres, writing style, or atmosphere when relevant.
- Do not invent facts that are not provided.
- Do not include spoilers.
- Write in a friendly, natural tone.
"""

MAX_DESCRIPTION_LENGTH = 800
MAX_GENRES = 5

def truncate_description(text: str) -> str:
    if not text:
        return "No description available."
    if len(text) <= MAX_DESCRIPTION_LENGTH:
        return text

    return text[:MAX_DESCRIPTION_LENGTH] + "..."

def build_recommendation_user_prompt(book, recommendation):
    return f"""
Original Book

Title: 
{book.title}
Author: 
{book.author.name}
Genres: 
{", ".join(g.name for g in book.genres.all()[:MAX_GENRES])}
Description:
{truncate_description(book.description)}

Recommended Book

Title: 
{recommendation.title}
Author: 
{recommendation.author.name}
Genres: 
{", ".join(g.name for g in recommendation.genres.all()[:MAX_GENRES])}
Description:
{truncate_description(recommendation.description)}

Explain why a reader who enjoyed the Original Book
would likely enjoy the Recommended Book.

Focus on shared themes, genres, atmosphere,
or writing style.
    
Do not mention information that isn't provided.
"""