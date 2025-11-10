"""API endpoints exposed by the Value at Risk prototype."""
from datetime import date
from typing import List

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import desc, select

from ..core.constants import PORTFOLIO_AGGREGATE_RIC
from ..db.models import NewsRecord, ScenarioDistributionRecord, VaRSnapshot, VaRTimeSeriesRecord
from ..db.session import SessionLocal
from ..models.var import (
    AssetVaR,
    DriverBreakdown,
    NewsItem,
    PortfolioVaR,
    ScenarioDistributionResponse,
    VaRSummaryResponse,
    VaRTimeSeriesPoint,
    VaRTimeSeriesResponse,
)

router = APIRouter()


@router.get("/var/summary", response_model=VaRSummaryResponse)
def get_var_summary(
    as_of: date | None = Query(None, description="基準日を指定 (未指定時は最新)"),
) -> VaRSummaryResponse:
    """Return headline VaR figures for the latest valuation date."""

    with SessionLocal() as session:
        stmt = select(VaRSnapshot)
        if as_of:
            stmt = stmt.where(VaRSnapshot.as_of == as_of)
        stmt = stmt.order_by(desc(VaRSnapshot.as_of)).limit(1)
        snapshot = session.scalars(stmt).unique().first()
        if snapshot is None:
            raise HTTPException(status_code=404, detail="VaR snapshot not found")

        portfolio = PortfolioVaR(
            total=snapshot.portfolio_total,
            change_amount=snapshot.portfolio_change_amount,
            change_pct=snapshot.portfolio_change_pct,
            diversification_effect=snapshot.diversification_effect,
        )
        assets = [
            AssetVaR(
                ric=asset.ric,
                name=asset.name,
                category=asset.category,
                amount=asset.amount,
                change_amount=asset.change_amount,
                change_pct=asset.change_pct,
                contributions=DriverBreakdown(
                    window_drop=asset.window_drop_contribution,
                    window_add=asset.window_add_contribution,
                    position_change=asset.position_change_contribution,
                    ranking_shift=asset.ranking_shift_contribution,
                ),
            )
            for asset in snapshot.assets
        ]

        return VaRSummaryResponse(as_of=snapshot.as_of, portfolio=portfolio, assets=assets)


@router.get("/var/timeseries", response_model=VaRTimeSeriesResponse)
def get_var_timeseries(
    ric: str = Query(PORTFOLIO_AGGREGATE_RIC, description="Asset identifier to retrieve"),
    days: int = Query(30, ge=5, le=90),
) -> VaRTimeSeriesResponse:
    """Return a rolling window of VaR observations for an asset."""

    with SessionLocal() as session:
        stmt = (
            select(VaRTimeSeriesRecord)
            .where(VaRTimeSeriesRecord.ric == ric)
            .order_by(desc(VaRTimeSeriesRecord.point_date))
            .limit(days)
        )
        records = list(session.scalars(stmt))
        if not records:
            raise HTTPException(status_code=404, detail=f"No time series found for {ric}")

        points = [
            VaRTimeSeriesPoint(date=record.point_date, value=record.value, change=record.change)
            for record in reversed(records)
        ]
        if points:
            points[0].change = None
        return VaRTimeSeriesResponse(ric=ric, points=points)


@router.get("/news", response_model=List[NewsItem])
def get_news(limit: int = Query(5, ge=1, le=20)) -> List[NewsItem]:
    """Return mocked list of news items related to VaR movements."""

    with SessionLocal() as session:
        stmt = select(NewsRecord).order_by(desc(NewsRecord.published_at)).limit(limit)
        return [
            NewsItem(
                id=str(record.id),
                headline=record.headline,
                published_at=record.published_at.isoformat(),
                source=record.source,
                summary=record.summary,
            )
            for record in session.scalars(stmt)
        ]


@router.get("/var/dates", response_model=List[date])
def list_snapshot_dates() -> List[date]:
    """Return available snapshot dates sorted descending."""

    with SessionLocal() as session:
        stmt = select(VaRSnapshot.as_of).order_by(desc(VaRSnapshot.as_of))
        return [row[0] for row in session.execute(stmt)]


@router.get("/var/scenario-distribution", response_model=ScenarioDistributionResponse)
def get_scenario_distribution(
    ric: str = Query(PORTFOLIO_AGGREGATE_RIC, description="対象資産のRIC (全資産は ALL_ASSETS)"),
) -> ScenarioDistributionResponse:
    """Return histogram-ready scenario P/L samples for the requested asset."""

    with SessionLocal() as session:
        stmt = (
            select(ScenarioDistributionRecord.value)
            .where(ScenarioDistributionRecord.ric == ric)
            .order_by(ScenarioDistributionRecord.scenario_index)
        )
        values = [row[0] for row in session.execute(stmt)]
        if not values:
            raise HTTPException(status_code=404, detail="Scenario distribution not found")
        return ScenarioDistributionResponse(ric=ric, values=values)
