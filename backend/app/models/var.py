"""Pydantic models for Value at Risk domain objects."""
from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class DriverBreakdown(BaseModel):
    """Quantifies contribution of each driver category."""

    window_drop: float = 0.0
    window_add: float = 0.0
    position_change: float = 0.0
    ranking_shift: float = 0.0


class AssetVaR(BaseModel):
    """VaR value at asset level."""

    ric: str
    name: str
    category: str
    amount: float
    change_amount: float
    change_pct: float
    contributions: DriverBreakdown


class PortfolioVaR(BaseModel):
    """Overall portfolio VaR information."""

    total: float
    change_amount: float
    change_pct: float
    diversification_effect: float = Field(
        ..., description="Difference between sum of asset VaR and portfolio VaR"
    )


class VaRSummaryResponse(BaseModel):
    """Summary payload containing VaR details for a specific valuation date."""

    as_of: date
    portfolio: PortfolioVaR
    assets: List[AssetVaR]


class VaRTimeSeriesPoint(BaseModel):
    """Data point representing a single day's VaR measurement."""

    date: date
    value: float
    change: Optional[float] = None


class VaRTimeSeriesResponse(BaseModel):
    """Collection of VaR time series points for charting."""

    ric: str
    points: List[VaRTimeSeriesPoint]


class NewsItem(BaseModel):
    """News headline related to VaR movements."""

    id: str
    headline: str
    published_at: str
    source: str
    summary: Optional[str] = None


class ScenarioDistributionResponse(BaseModel):
    """Distribution of scenario P/L values for histogram chart."""

    ric: str
    values: List[float]
