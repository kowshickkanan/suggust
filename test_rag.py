import pymysql
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import os

def get_db_connection():
    return pymysql.connect(
        host="127.0.0.1",
        user="root",
        password="Kowsh@123",
        database="ai_recommender",
        cursorclass=pymysql.cursors.DictCursor
    )

def test_rag(query):
    query = query.lower()
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM knowledge_base")
        knowledge = cursor.fetchall()
        
        kb_texts = [f"{k['topic']} {k['sub_topic']} {k['content']} {k['keywords']}".lower() for k in knowledge]
        kb_vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        kb_matrix = kb_vectorizer.fit_transform(kb_texts)
        query_vec = kb_vectorizer.transform([query])
        
        similarities = cosine_similarity(query_vec, kb_matrix).flatten()
        print(f"\nQuery: {query}")
        for i, score in enumerate(similarities):
            if score > 0:
                print(f"Match: {knowledge[i]['topic']} | Score: {score:.4f}")

if __name__ == "__main__":
    queries = [
        "tyrosinase inhibition",
        "salicylic acid mechanism",
        "uneven texture",
        "60-second truth"
    ]
    for q in queries:
        test_rag(q)
