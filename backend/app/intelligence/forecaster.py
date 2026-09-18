import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from sklearn.ensemble import RandomForestRegressor

def train_and_forecast_demand(
    consumption_records: List[Dict[str, Any]],
    horizon_days: int = 14
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], float, float, float, str, str, List[str]]:
    """
    Given historical daily consumption records, train a lightweight time-series regressor
    and generate forecast with 95% confidence intervals.
    """
    if not consumption_records:
        # Cold start fallback
        today = datetime.utcnow().date()
        hist = [{"date": (today - timedelta(days=i)).isoformat(), "actual": 40, "is_abnormal": False} for i in range(14, 0, -1)]
        preds = [{"date": (today + timedelta(days=i)).isoformat(), "predicted": 40.0, "lower_bound": 35.0, "upper_bound": 45.0, "confidence": 0.95} for i in range(1, horizon_days + 1)]
        return hist, preds, 40.0, 40.0, 0.0, "Stable", "Moderate", ["Baseline consumption assumed due to limited records."]

    # Convert to DataFrame
    df = pd.DataFrame(consumption_records)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').reset_index(drop=True)

    # Historical points to return (last 30 days)
    hist_tail = df.tail(30).copy()
    historical_points = []
    for _, row in hist_tail.iterrows():
        historical_points.append({
            "date": row['date'].strftime("%Y-%m-%d"),
            "actual": int(row['quantity_used']),
            "is_abnormal": bool(row.get('is_abnormal', False))
        })

    current_7d_avg = float(df['quantity_used'].tail(7).mean()) if len(df) >= 7 else float(df['quantity_used'].mean())

    # Build lag and calendar features
    df['day_of_week'] = df['date'].dt.dayofweek
    df['day_of_month'] = df['date'].dt.day
    df['lag_1'] = df['quantity_used'].shift(1)
    df['lag_7'] = df['quantity_used'].shift(7)
    df['rolling_7'] = df['quantity_used'].shift(1).rolling(window=7, min_periods=1).mean()
    df['rolling_14'] = df['quantity_used'].shift(1).rolling(window=14, min_periods=1).mean()

    # Drop initial NaNs for training
    train_df = df.dropna().copy()

    if len(train_df) < 10:
        # Fallback to moving average if series is too short
        predicted_daily = current_7d_avg
        change_pct = 0.0
        trend = "Stable"
        last_date = df['date'].max()
        forecast_points = []
        std_err = float(df['quantity_used'].std()) if len(df) > 1 and not np.isnan(df['quantity_used'].std()) else 5.0
        for i in range(1, horizon_days + 1):
            f_date = last_date + timedelta(days=i)
            forecast_points.append({
                "date": f_date.strftime("%Y-%m-%d"),
                "predicted": round(predicted_daily, 1),
                "lower_bound": max(0.0, round(predicted_daily - 1.96 * std_err, 1)),
                "upper_bound": round(predicted_daily + 1.96 * std_err, 1),
                "confidence": 0.95
            })
        return historical_points, forecast_points, round(current_7d_avg, 1), round(predicted_daily, 1), change_pct, trend, "High", ["Moving average baseline due to limited training samples."]

    feature_cols = ['day_of_week', 'day_of_month', 'lag_1', 'lag_7', 'rolling_7', 'rolling_14']
    X = train_df[feature_cols]
    y = train_df['quantity_used']

    # Train Random Forest Regressor
    model = RandomForestRegressor(n_estimators=40, max_depth=6, random_state=42)
    model.fit(X, y)

    # In-sample residuals for confidence bounds
    y_pred_train = model.predict(X)
    residuals = y - y_pred_train
    residual_std = float(np.std(residuals)) if len(residuals) > 0 else 5.0

    # Iterative multi-step forecasting
    last_known_date = df['date'].max()
    curr_df = df.copy()

    forecast_points = []
    predicted_values = []

    for step in range(1, horizon_days + 1):
        target_date = last_known_date + timedelta(days=step)
        
        # Calculate lag features from curr_df
        last_qty = curr_df['quantity_used'].iloc[-1]
        lag_7_val = curr_df['quantity_used'].iloc[-7] if len(curr_df) >= 7 else last_qty
        r7 = curr_df['quantity_used'].tail(7).mean()
        r14 = curr_df['quantity_used'].tail(14).mean()

        row_features = pd.DataFrame([{
            'day_of_week': target_date.dayofweek,
            'day_of_month': target_date.day,
            'lag_1': last_qty,
            'lag_7': lag_7_val,
            'rolling_7': r7,
            'rolling_14': r14
        }])

        pred_val = float(model.predict(row_features)[0])
        pred_val = max(0.0, pred_val)
        predicted_values.append(pred_val)

        # Dynamic uncertainty expands slightly over horizon
        horizon_uncertainty = residual_std * (1.0 + 0.05 * (step ** 0.5))
        lower_bound = max(0.0, pred_val - 1.96 * horizon_uncertainty)
        upper_bound = pred_val + 1.96 * horizon_uncertainty

        forecast_points.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "predicted": round(pred_val, 1),
            "lower_bound": round(lower_bound, 1),
            "upper_bound": round(upper_bound, 1),
            "confidence": 0.95
        })

        # Append simulated row for next step lag
        new_row = pd.DataFrame([{
            'date': target_date,
            'quantity_used': pred_val,
            'day_of_week': target_date.dayofweek,
            'day_of_month': target_date.day,
            'lag_1': last_qty,
            'lag_7': lag_7_val,
            'rolling_7': r7,
            'rolling_14': r14
        }])
        curr_df = pd.concat([curr_df, new_row], ignore_index=True)

    predicted_avg_daily = float(np.mean(predicted_values))
    if current_7d_avg > 0:
        change_pct = round(((predicted_avg_daily - current_7d_avg) / current_7d_avg) * 100, 1)
    else:
        change_pct = 0.0

    if change_pct > 5.0:
        trend = "Increasing"
    elif change_pct < -5.0:
        trend = "Decreasing"
    else:
        trend = "Stable"

    # Explanatory factors
    factors = []
    if trend == "Increasing":
        factors.append(f"Consumption trend indicates a +{change_pct}% surge relative to the last 7 days.")
    elif trend == "Decreasing":
        factors.append(f"Consumption trend projected to decline by {abs(change_pct)}% as demand stabilizes.")
    else:
        factors.append("Demand pattern aligns stably with the 30-day moving average.")

    day_variance = float(df.groupby('day_of_week')['quantity_used'].mean().std())
    if day_variance > 3.0:
        factors.append("Strong day-of-week seasonality detected across hospital wards.")

    confidence_level = "High" if len(train_df) >= 30 and residual_std < 10.0 else "Moderate"

    return (
        historical_points,
        forecast_points,
        round(current_7d_avg, 1),
        round(predicted_avg_daily, 1),
        change_pct,
        trend,
        confidence_level,
        factors
    )
