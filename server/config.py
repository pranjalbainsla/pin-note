import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    CLIENT_URL = os.getenv("CLIENT_URL")
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

