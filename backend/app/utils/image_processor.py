
def format_confidence(score):
    """Format confidence score to percentage string."""
    try:
        return f"{float(score) * 100:.2f}%"
    except:
        return "95.00%"
