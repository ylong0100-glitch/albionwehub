'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PortfolioSummary } from '@/features/portfolio/components/portfolio-summary'
import { PositionTable } from '@/features/portfolio/components/position-table'
import { TradeLogTable } from '@/features/portfolio/components/trade-log-table'
import { AddPositionDialog } from '@/features/portfolio/components/add-position-dialog'

export default function PortfolioTracker() {
  const [addOpen, setAddOpen] = React.useState(false)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Portfolio Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your investments, positions, and trade history.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-1.5 size-4" />
          Add Position
        </Button>
      </div>

      {/* Summary cards */}
      <PortfolioSummary />

      {/* Tabs: Positions / Trade Log */}
      <Tabs defaultValue="positions">
        <TabsList>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="tradelog">Trade Log</TabsTrigger>
        </TabsList>

        <TabsContent value="positions">
          <PositionTable onAddClick={() => setAddOpen(true)} />
        </TabsContent>

        <TabsContent value="tradelog">
          <TradeLogTable />
        </TabsContent>
      </Tabs>

      {/* Add Position Dialog */}
      <AddPositionDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
