def rank_suppliers(suppliers, weights=None):
    """
    Weighted Multi-Criteria Evaluation:
    Price (25%), Delivery Speed (20%), On-Time Reliability (20%), Quality Rating (15%), Fulfillment Rate (20%)
    """
    if weights is None:
        weights = {
            'price': 0.25,
            'delivery': 0.20,
            'reliability': 0.20,
            'quality': 0.15,
            'fulfillment': 0.20
        }

    ranked = []
    for s in suppliers:
        # Price Score (normalized 40-100)
        price_index = s.get('unit_price_index', 1.0)
        price_score = max(40.0, min(100.0, 100.0 - (price_index - 0.85) * 120.0))

        # Delivery Score (normalized 30-100)
        lead_time = s.get('average_delivery_time', 4)
        delivery_score = max(30.0, min(100.0, 100.0 - (lead_time - 2) * 6.5))

        # Reliability Score (directly On-Time rate)
        reliability_score = s.get('on_time_delivery_rate', 90.0)

        # Quality Score (scaled from 5.0 to 100 with return penalty)
        quality_rating = s.get('quality_rating', 4.0)
        return_rate = s.get('return_rate', 2.0)
        quality_score = max(40.0, min(100.0, (quality_rating / 5.0) * 100.0 - return_rate * 2.5))

        # Fulfillment Score
        fulfillment_score = s.get('fulfillment_rate', 90.0)

        # Overall composite score
        overall = (
            price_score * weights['price'] +
            delivery_score * weights['delivery'] +
            reliability_score * weights['reliability'] +
            quality_score * weights['quality'] +
            fulfillment_score * weights['fulfillment']
        )
        overall_score = round(overall, 1)

        reason = ""
        if overall_score >= 90:
            reason = f"Top-tier performance: {s.get('on_time_delivery_rate')}% on-time fulfillment, low {s.get('return_rate')}% return rate, and fast {lead_time}-day lead time."
        elif overall_score >= 80:
            reason = f"Dependable partner: Competitive price index ({price_index}x) and steady supply stability."
        else:
            reason = f"Acceptable for non-urgent replenishment ({lead_time} days delivery)."

        ranked.append({
            **s,
            'price_score': round(price_score, 1),
            'delivery_score': round(delivery_score, 1),
            'reliability_score': round(reliability_score, 1),
            'quality_score': round(quality_score, 1),
            'fulfillment_score': round(fulfillment_score, 1),
            'overall_score': overall_score,
            'recommendation_explanation': reason
        })

    return sorted(ranked, key=lambda x: x['overall_score'], reverse=True)
