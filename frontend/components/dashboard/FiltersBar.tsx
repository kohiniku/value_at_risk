'use client'

import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'

interface FiltersBarProps {
  dates: string[]
  selectedDate: string
  onDateChange: (date: string) => void
}

export function FiltersBar({ dates, selectedDate, onDateChange }: FiltersBarProps) {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  return (
    <Card>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Select value={selectedDate} label="基準日" onChange={(event) => onDateChange(event.target.value)}>
          {dates.map((iso) => (
            <option key={iso} value={iso}>
              {formatDate(iso)}
            </option>
          ))}
        </Select>
        <div className="text-xs text-muted-foreground">
          <p>選択内容は自動的に反映されます</p>
          <p>最新値は約60秒周期で取得します</p>
        </div>
      </div>
    </Card>
  )
}
