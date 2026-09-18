import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple

def detect_usage_anomalies(
    consumption_records: List[Dict[str, Any]],
    z_threshold: float = 2.0
) -> Tuple[bool, float, float, float, str]:
    """
    Analyzes historical consumption to detect abnormal spikes or surges.
    Returns:
      (is_abnormal, recent_3d_avg, baseline_30d_avg, percentage_increase, narrative)
    """
    if not consumption_records or len(consumption_records) < 7:
        return False, 0.0, 0.0, 0.0, "Insufficient historical data to evaluate anomalies."

    df = pd.DataFrame(consumption_records)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').reset_index(drop=True)

    quantities = df['quantity_used'].values
    
    # Recent 3 days vs baseline (previous 30 days)
    recent_3d = quantities[-3:] if len(quantities) >= 3 else quantities
    recent_avg = float(np.mean(recent_3d))

    baseline_sample = quantities[:-3] if len(quantities) > 10 else quantities
    baseline_avg = float(np.mean(baseline_sample))
    baseline_std = float(np.std(baseline_sample)) if len(baseline_sample) > 1 else 1.0
    if baseline_std == 0:
        baseline_std = 1.0

    z_score = (recent_avg - baseline_avg) / baseline_std

    pct_increase = 0.0
    if baseline_avg > 0:
        pct_increase = round(((recent_avg - baseline_avg) / baseline_avg) * 100.0, 1)

    is_abnormal = False
    narrative = "Consumption is within expected historical variance."

    if z_score >= z_threshold and pct_increase >= 25.0:
        is_abnormal = True
        narrative = f"Abnormal consumption surge detected: Recent usage ({recent_avg:.1f}/day) is {pct_increase:+.1f}% above 30-day baseline ({baseline_avg:.1f}/day) with Z-score {z_score:.2f}."
    elif pct_increase >= 40.0:
        is_abnormal = True
        narrative = f"Critical consumption escalation: Recent usage rose {pct_increase:+.1f}% above normal baseline."
    elif pct_increase <= -40.0:
        narrative = f"Notable consumption drop: Recent usage dropped {pct_increase:.1f}% below baseline."

    return is_abnormal, round(recent_avg, 1), round(baseline_avg, 1), pct_increase, narrative
