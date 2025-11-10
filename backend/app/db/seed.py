"""Database initialisation and demo seed data."""
from __future__ import annotations

from datetime import date, datetime, timedelta
from math import sin
from random import Random

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.constants import PORTFOLIO_AGGREGATE_RIC, SCENARIO_WINDOW
from .base import Base
from .models import AssetVaRRecord, NewsRecord, ScenarioDistributionRecord, VaRSnapshot, VaRTimeSeriesRecord
from .session import SessionLocal, engine

ASSET_DEFINITIONS = [
    {"ric": "JP_EQ_LARGE", "name": "日本株式（大型）", "category": "株式", "base_amount": 10.8, "volatility": 0.35},
    {"ric": "JP_EQ_MID", "name": "日本株式（中型）", "category": "株式", "base_amount": 6.2, "volatility": 0.28},
    {"ric": "US_EQ_TECH", "name": "米国株式（テック）", "category": "株式", "base_amount": 9.4, "volatility": 0.45},
    {"ric": "EU_EQ_BANKS", "name": "欧州株式（金融）", "category": "株式", "base_amount": 5.3, "volatility": 0.25},
    {"ric": "EM_EQ", "name": "新興国株式", "category": "株式", "base_amount": 7.1, "volatility": 0.4},
    {"ric": "US_RATES_CORE", "name": "米国金利（10Y）", "category": "金利", "base_amount": 8.5, "volatility": 0.22},
    {"ric": "EU_RATES_CORE", "name": "欧州金利", "category": "金利", "base_amount": 6.7, "volatility": 0.18},
    {"ric": "JP_RATES", "name": "日本金利", "category": "金利", "base_amount": 4.2, "volatility": 0.12},
    {"ric": "UK_RATES", "name": "英国金利", "category": "金利", "base_amount": 3.9, "volatility": 0.2},
    {"ric": "AU_RATES", "name": "豪州金利", "category": "金利", "base_amount": 3.5, "volatility": 0.18},
    {"ric": "IG_CREDIT_US", "name": "米国IGクレジット", "category": "クレジット", "base_amount": 6.0, "volatility": 0.21},
    {"ric": "IG_CREDIT_EU", "name": "欧州IGクレジット", "category": "クレジット", "base_amount": 5.5, "volatility": 0.19},
    {"ric": "HY_CREDIT_US", "name": "米国HYクレジット", "category": "クレジット", "base_amount": 7.4, "volatility": 0.3},
    {"ric": "HY_CREDIT_EU", "name": "欧州HYクレジット", "category": "クレジット", "base_amount": 5.9, "volatility": 0.27},
    {"ric": "ASIA_CREDIT", "name": "アジアクレジット", "category": "クレジット", "base_amount": 4.8, "volatility": 0.22},
    {"ric": "MBS_AGENCY", "name": "エージェンシーMBS", "category": "モーゲージ", "base_amount": 6.3, "volatility": 0.2},
    {"ric": "MBS_NONAGENCY", "name": "ノンエージェンシーMBS", "category": "モーゲージ", "base_amount": 4.1, "volatility": 0.25},
    {"ric": "CMBS_CORE", "name": "CMBSコア", "category": "モーゲージ", "base_amount": 3.6, "volatility": 0.23},
    {"ric": "RMBS_HE", "name": "住宅RMBS（HE）", "category": "モーゲージ", "base_amount": 3.2, "volatility": 0.19},
    {"ric": "GOLD", "name": "金（ロング）", "category": "コモディティ", "base_amount": 2.8, "volatility": 0.2},
]

CONTRIBUTION_PROFILES = {
    "株式": {"window_drop": 0.28, "window_add": 0.12, "position_change": 0.35, "ranking_shift": 0.25},
    "金利": {"window_drop": 0.22, "window_add": 0.25, "position_change": 0.28, "ranking_shift": 0.25},
    "クレジット": {"window_drop": 0.26, "window_add": 0.14, "position_change": 0.30, "ranking_shift": 0.30},
    "モーゲージ": {"window_drop": 0.24, "window_add": 0.16, "position_change": 0.32, "ranking_shift": 0.28},
    "コモディティ": {"window_drop": 0.25, "window_add": 0.20, "position_change": 0.25, "ranking_shift": 0.30},
}

SNAPSHOT_DAYS = 5


def init_db() -> None:
    """Reset schema and seed demo data."""

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seed_demo_data(session)


def seed_demo_data(session: Session) -> None:
    today = date.today()
    as_of_dates = sorted({today - timedelta(days=offset) for offset in range(SNAPSHOT_DAYS)}, reverse=False)

    prev_amounts = {definition["ric"]: definition["base_amount"] for definition in ASSET_DEFINITIONS}
    prev_portfolio_total = None

    for as_of in as_of_dates:
        asset_records: list[AssetVaRRecord] = []
        sum_amount = 0.0
        for idx, definition in enumerate(ASSET_DEFINITIONS):
            drift = sin((as_of.toordinal() + idx * 13) / 5) * definition["volatility"]
            amount = round(definition["base_amount"] + drift, 2)
            prev_amount = prev_amounts.get(definition["ric"], amount)
            change_amount = round(amount - prev_amount, 2)
            change_pct = round((change_amount / prev_amount * 100) if prev_amount else 0.0, 2)
            prev_amounts[definition["ric"]] = amount

            contributions = _build_contributions(definition["category"], change_amount)
            record = AssetVaRRecord(
                ric=definition["ric"],
                name=definition["name"],
                category=definition["category"],
                amount=amount,
                change_amount=change_amount,
                change_pct=change_pct,
                window_drop_contribution=contributions["window_drop"],
                window_add_contribution=contributions["window_add"],
                position_change_contribution=contributions["position_change"],
                ranking_shift_contribution=contributions["ranking_shift"],
            )
            asset_records.append(record)
            sum_amount += amount

        diversification_effect = round(sum_amount * -0.18, 2)
        portfolio_total = round(sum_amount + diversification_effect, 2)
        if prev_portfolio_total is None:
            portfolio_change_amount = 0.0
            portfolio_change_pct = 0.0
        else:
            portfolio_change_amount = round(portfolio_total - prev_portfolio_total, 2)
            portfolio_change_pct = round(
                (portfolio_change_amount / prev_portfolio_total * 100) if prev_portfolio_total else 0.0,
                2,
            )
        prev_portfolio_total = portfolio_total

        snapshot = VaRSnapshot(
            as_of=as_of,
            portfolio_total=portfolio_total,
            portfolio_change_amount=portfolio_change_amount,
            portfolio_change_pct=portfolio_change_pct,
            diversification_effect=diversification_effect,
        )
        snapshot.assets = asset_records
        session.add(snapshot)

    session.flush()
    _seed_timeseries(session, today)
    _seed_news(session, today)
    _seed_scenario_distribution(session)
    session.commit()


def _build_contributions(category: str, change_amount: float) -> dict[str, float]:
    profile = CONTRIBUTION_PROFILES.get(category, CONTRIBUTION_PROFILES["株式"])
    if change_amount == 0:
        return {key: 0.0 for key in profile}
    return {key: round(change_amount * weight, 3) for key, weight in profile.items()}


def _seed_timeseries(session: Session, today: date) -> None:
    offsets = list(range(120, -1, -1))
    portfolio_buckets = {offset: 0.0 for offset in offsets}

    for definition in ASSET_DEFINITIONS:
        points: list[VaRTimeSeriesRecord] = []
        base = definition["base_amount"]
        for offset in offsets:
            point_date = today - timedelta(days=offset)
            value = round(base + sin((offset + len(definition["ric"])) / 4) * definition["volatility"] * 3, 3)
            change = None
            if points:
                change = round(value - points[-1].value, 3)
            points.append(
                VaRTimeSeriesRecord(
                    ric=definition["ric"],
                    point_date=point_date,
                    value=value,
                    change=change,
                )
            )
            portfolio_buckets[offset] += value
        session.add_all(points)

    portfolio_points: list[VaRTimeSeriesRecord] = []
    prev_value = None
    for offset in offsets:
        point_date = today - timedelta(days=offset)
        standalone = portfolio_buckets[offset]
        portfolio_value = round(standalone * 0.82, 3)
        change = None if prev_value is None else round(portfolio_value - prev_value, 3)
        portfolio_points.append(
            VaRTimeSeriesRecord(
                ric=PORTFOLIO_AGGREGATE_RIC,
                point_date=point_date,
                value=portfolio_value,
                change=change,
            )
        )
        prev_value = portfolio_value

    session.add_all(portfolio_points)


def _seed_news(session: Session, today: date) -> None:
    news = [
        NewsRecord(
            headline="日銀、長期金利の許容レンジ拡大を示唆",
            published_at=datetime.combine(today, datetime.min.time()),
            source="日本経済新聞",
            summary="長期ゾーンのJGB利回りがじり高となり、国内機関投資家のポジション調整が波及。",
        ),
        NewsRecord(
            headline="米CPI鈍化で長期債が続伸、ヘッジ需要も増加",
            published_at=datetime.combine(today, datetime.min.time()) + timedelta(hours=6),
            source="Bloomberg",
            summary="コアCPIが予想を下回り、デュレーション・ヘッジへの需要が再び活発化。",
        ),
        NewsRecord(
            headline="モーゲージスプレッドが落ち着きヘッジ需要後退",
            published_at=datetime.combine(today - timedelta(days=1), datetime.min.time()) + timedelta(hours=12),
            source="Reuters",
            summary="スプレッドがタイト化し、保険勢のポジションが軽くなった。",
        ),
    ]
    session.add_all(news)


def _seed_scenario_distribution(session: Session) -> None:
    rng_cache: dict[str, Random] = {}
    portfolio_accumulator = [0.0 for _ in range(SCENARIO_WINDOW)]
    records: list[ScenarioDistributionRecord] = []

    for definition in ASSET_DEFINITIONS:
        generator = rng_cache.setdefault(
            definition["ric"], Random(sum(ord(ch) for ch in definition["ric"]))
        )
        values = _build_scenario_series(definition["base_amount"], definition["volatility"], generator)
        for idx, value in enumerate(values):
            records.append(
                ScenarioDistributionRecord(
                    ric=definition["ric"],
                    scenario_index=idx,
                    value=value,
                )
            )
            portfolio_accumulator[idx] += value * 0.6

    for idx, value in enumerate(portfolio_accumulator):
        records.append(
            ScenarioDistributionRecord(
                ric=PORTFOLIO_AGGREGATE_RIC,
                scenario_index=idx,
                value=round(value, 3),
            )
        )

    session.add_all(records)


def _build_scenario_series(base_amount: float, volatility: float, rng: Random) -> list[float]:
    """Return pseudo Gaussian loss samples to mimic正規分布寄りのシナリオPL."""

    values: list[float] = []
    mean_scale = base_amount * 0.12
    drift_amplitude = max(0.2, volatility * 0.35)
    shock_scale = max(0.25, base_amount * 0.03)

    for idx in range(SCENARIO_WINDOW):
        seasonal = sin((idx + base_amount) / 32) * drift_amplitude
        gaussian = rng.gauss(0, 1)
        value = round(-(mean_scale + seasonal + gaussian * shock_scale), 3)
        values.append(value)

    return values


if __name__ == "__main__":
    init_db()
