'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TimeseriesControlsProps {
  options: { value: string; label: string }[]
  selectedRic: string
  windowDays: number
  onAssetChange: (ric: string) => void
  onWindowChange: (days: number) => void
}

export function TimeseriesControls({ options, selectedRic, windowDays, onAssetChange, onWindowChange }: TimeseriesControlsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">時系列コントロール</CardTitle>
        <p className="text-xs text-muted-foreground">資産と観測ウィンドウを切り替えると折れ線グラフを即時更新します。</p>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="timeseries-asset">資産</Label>
          <Select value={selectedRic} onValueChange={onAssetChange}>
            <SelectTrigger id="timeseries-asset">
              <SelectValue placeholder="資産を選択" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeseries-window">観測日数</Label>
          <Select value={String(windowDays)} onValueChange={(value) => onWindowChange(Number(value))}>
            <SelectTrigger id="timeseries-window">
              <SelectValue placeholder="観測ウィンドウ" />
            </SelectTrigger>
            <SelectContent>
              {[14, 30, 60, 90].map((days) => (
                <SelectItem key={days} value={String(days)}>
                  {days}日
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
