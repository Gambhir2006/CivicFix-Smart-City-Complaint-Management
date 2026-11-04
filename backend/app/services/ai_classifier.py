from typing import Dict, Tuple
import re


class ComplaintClassifier:
    """Simple rule-based complaint classifier"""

    def __init__(self):
        self.category_keywords = {
            "Garbage": ["garbage", "trash", "waste", "dustbin", "litter", "rubbish", "sewage", "dump"],
            "Road Damage": ["pothole", "road", "crack", "broken road", "street damage", "traffic"],
            "Water Leakage": ["leak", "water", "pipe", "burst", "overflow", "drainage"],
            "Streetlight": ["light", "street light", "lamp", "dark", "illumination", "pole"],
            "Drainage": ["drain", "clogged", "blocked", "sewer", "flooding", "water logging"],
            "Public Sanitation": ["toilet", "sanitation", "public toilet", "cleanliness", "hygiene"]
        }

        self.priority_keywords = {
            "Urgent": ["dangerous", "hazard", "emergency", "blocked", "burst", "accident", "risk"],
            "High": ["large", "major", "severe", "extensive", "multiple", "frequent"],
            "Medium": ["needs", "should", "moderate", "some", "few"],
            "Low": ["minor", "small", "slight", "cosmetic", "aesthetic"]
        }

    def classify(self, title: str, description: str) -> Dict:
        """
        Classify a complaint and return suggested category and priority
        """
        text = f"{title} {description}".lower()

        # Classify category
        category_scores = {}
        for category, keywords in self.category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                category_scores[category] = score

        suggested_category = max(category_scores.items(), key=lambda x: x[1])[0] if category_scores else "Other"
        confidence = max(category_scores.values()) / len(text.split()) if category_scores else 0.0

        # Classify priority
        priority_scores = {}
        for priority, keywords in self.priority_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                priority_scores[priority] = score

        suggested_priority = max(priority_scores.items(), key=lambda x: x[1])[0] if priority_scores else "Medium"

        return {
            "category": suggested_category,
            "priority": suggested_priority,
            "confidence": round(confidence * 100, 2)
        }

    def detect_duplicates(self, new_complaint: Dict, existing_complaints: list, threshold: float = 0.7) -> list:
        """
        Detect potential duplicate complaints based on similarity
        This is a simple implementation using keyword overlap
        """
        new_text = f"{new_complaint.get('title', '')} {new_complaint.get('description', '')}".lower()
        new_words = set(re.findall(r'\w+', new_text))

        duplicates = []

        for complaint in existing_complaints:
            existing_text = f"{complaint.get('title', '')} {complaint.get('description', '')}".lower()
            existing_words = set(re.findall(r'\w+', existing_text))

            # Calculate Jaccard similarity
            intersection = len(new_words & existing_words)
            union = len(new_words | existing_words)

            if union > 0:
                similarity = intersection / union
                if similarity >= threshold:
                    duplicates.append({
                        "complaint_id": complaint.get("id"),
                        "similarity": round(similarity * 100, 2),
                        "complaint_code": complaint.get("complaint_code")
                    })

        return duplicates


classifier = ComplaintClassifier()
