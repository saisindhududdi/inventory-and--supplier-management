import os

def query_gemini_or_fallback(prompt, context=None):
    """
    Communicates with Google Gemini API when GEMINI_API_KEY is configured;
    falls back cleanly to rule-based answers when key is not present.
    """
    api_key = os.getenv('GEMINI_API_KEY')
    if api_key and api_key != 'your_gemini_api_key_here':
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model='gemini-3.8-flash',
                contents=f"You are an AI Inventory & Supply Chain Specialist. Answer concisely with bullet points based on retail inventory best practices.\nQuery: {prompt}"
            )
            if response and response.text:
                return response.text
        except Exception as e:
            print(f"Gemini API request failed, falling back to rule engine: {e}")

    # Rule-based fallback response
    p = prompt.lower()
    if 'reorder' in p or 'immediate' in p or 'critical' in p:
        return (
            "### 🚨 Rule-Based Reorder Advice\n\n"
            "Products whose stock coverage is lower than supplier lead times must be reordered immediately.\n"
            "• **Action:** Check items with current_stock <= reorder_point in your Reorder Center.\n"
            "• **Strategy:** Generate draft purchase orders for top critical fast-movers first."
        )
    elif 'fast' in p or 'velocity' in p:
        return (
            "### ⚡ Fast-Moving Products Advice\n\n"
            "Fast-moving products have daily velocity >= 5.5 units/day.\n"
            "• **Strategy:** Maintain higher safety stock buffer (15-20 days) to prevent sudden stock-outs.\n"
            "• **Supplier Selection:** Choose vendors with < 4 days delivery turnarounds."
        )
    elif 'supplier' in p:
        return (
            "### 🏢 Supplier Sourcing Advice\n\n"
            "Evaluate suppliers using the Multi-Criteria Decision Model:\n"
            "• Prioritize high On-Time Delivery (>95%) and Low Return Rates (<2%) for critical products.\n"
            "• Use lower-cost suppliers for non-critical, slow-moving items with flexible delivery windows."
        )
    else:
        return (
            "### 🤖 AI Inventory System Status\n\n"
            "The system is currently running in **Intelligent Rule-Based Mode**.\n"
            "All inventory metrics, reorder points, velocity classifications, and supplier rankings are mathematically computed in real time from database records."
        )
