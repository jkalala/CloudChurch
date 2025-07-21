"use client";

import { useState } from 'react';
import { WidgetBase } from '../widget-base';
import { WidgetSize } from '@/lib/types/dashboard-widget';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../../dialog';
import { Button } from '../../button';
import { useDashboard } from '@/lib/contexts/dashboard-context';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../select';
import { BarChart, LineChart, PieChart } from 'lucide-react';

interface ChartWidgetProps {
  id: string;
  size: string;
}

export function ChartWidget({ id, size }: ChartWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { updateWidgetSettings } = useDashboard();
  const [chartType, setChartType] = useState<'attendance' | 'giving' | 'growth'>('attendance');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [displayType, setDisplayType] = useState<'bar' | 'line' | 'pie'>('bar');
  
  const handleSaveSettings = () => {
    updateWidgetSettings(id, { chartType, timeRange, displayType });
    setShowSettings(false);
  };

  // Sample data for different chart types
  const attendanceData = {
    week: [120, 0, 0, 0, 0, 0, 135],
    month: [120, 125, 118, 130, 135],
    quarter: [380, 410, 390, 420],
    year: [1200, 1300, 1250, 1400, 1350, 1450, 1500, 1550, 1600, 1650, 1700, 1750]
  };

  const givingData = {
    week: [2500, 0, 0, 0, 0, 0, 3200],
    month: [10000, 12000, 9500, 11000, 13000],
    quarter: [32000, 35000, 30000, 38000],
    year: [120000, 125000, 118000, 130000, 135000, 140000, 142000, 145000, 150000, 155000, 160000, 165000]
  };

  const growthData = {
    week: [2, 0, 0, 0, 0, 0, 3],
    month: [8, 12, 5, 10, 15],
    quarter: [25, 30, 28, 35],
    year: [100, 120, 115, 130, 140, 145, 150, 155, 160, 165, 170, 180]
  };

  // Get the appropriate data based on chart type and time range
  const getChartData = () => {
    switch (chartType) {
      case 'attendance': return attendanceData[timeRange];
      case 'giving': return givingData[timeRange];
      case 'growth': return growthData[timeRange];
      default: return attendanceData[timeRange];
    }
  };

  // Get labels based on time range
  const getLabels = () => {
    switch (timeRange) {
      case 'week': return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      case 'month': return ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
      case 'quarter': return ['Month 1', 'Month 2', 'Month 3', 'Month 4'];
      case 'year': return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default: return ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
    }
  };

  // Get chart title based on chart type
  const getChartTitle = () => {
    switch (chartType) {
      case 'attendance': return 'Church Attendance';
      case 'giving': return 'Financial Giving';
      case 'growth': return 'Membership Growth';
      default: return 'Church Attendance';
    }
  };

  // Get chart unit based on chart type
  const getChartUnit = () => {
    switch (chartType) {
      case 'attendance': return 'people';
      case 'giving': return 'dollars';
      case 'growth': return 'new members';
      default: return 'people';
    }
  };

  // Calculate chart statistics
  const data = getChartData();
  const currentValue = data[data.length - 1];
  const previousValue = data[data.length - 2] || data[0];
  const percentChange = previousValue ? ((currentValue - previousValue) / previousValue) * 100 : 0;
  const isPositive = percentChange >= 0;

  // Render a simple chart visualization
  const renderChart = () => {
    const data = getChartData();
    const labels = getLabels();
    const maxValue = Math.max(...data);
    
    switch (displayType) {
      case 'bar':
        return (
          <div className="h-40 flex items-end space-x-2">
            {data.map((value, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-primary/80 rounded-t"
                  style={{ 
                    height: `${(value / maxValue) * 100}%`,
                    minHeight: '4px'
                  }}
                ></div>
                <span className="text-xs mt-1 text-muted-foreground">{labels[index]}</span>
              </div>
            ))}
          </div>
        );
      
      case 'line':
        return (
          <div className="h-40 relative">
            <svg className="w-full h-full">
              <polyline
                points={data.map((value, index) => 
                  `${(index / (data.length - 1)) * 100}% ${100 - (value / maxValue) * 100}%`
                ).join(' ')}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between">
              {labels.map((label, index) => (
                <span key={index} className="text-xs text-muted-foreground">{label}</span>
              ))}
            </div>
          </div>
        );
      
      case 'pie':
        // For simplicity, we'll just show a placeholder for pie chart
        return (
          <div className="h-40 flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-20 w-20 mx-auto text-primary/80" />
              <p className="text-sm mt-2">Pie chart visualization</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <WidgetBase 
        id={id} 
        title={getChartTitle()} 
        size={size as WidgetSize}
        hasSettings={true}
        onSettingsClick={() => setShowSettings(true)}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">{currentValue.toLocaleString()}</h3>
              <div className="flex items-center">
                <span className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  from previous {timeRange}
                </span>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button 
                variant={displayType === 'bar' ? 'default' : 'outline'} 
                size="icon"
                className="h-8 w-8"
                onClick={() => setDisplayType('bar')}
              >
                <BarChart className="h-4 w-4" />
              </Button>
              <Button 
                variant={displayType === 'line' ? 'default' : 'outline'} 
                size="icon"
                className="h-8 w-8"
                onClick={() => setDisplayType('line')}
              >
                <LineChart className="h-4 w-4" />
              </Button>
              <Button 
                variant={displayType === 'pie' ? 'default' : 'outline'} 
                size="icon"
                className="h-8 w-8"
                onClick={() => setDisplayType('pie')}
              >
                <PieChart className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {renderChart()}
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Total {getChartUnit()}
            </span>
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </WidgetBase>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chart Widget Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="chart-type" className="text-sm font-medium">
                Chart Type
              </label>
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger id="chart-type">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="giving">Giving</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="time-range" className="text-sm font-medium">
                Default Time Range
              </label>
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger id="time-range">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Type</label>
              <div className="flex space-x-2">
                <Button 
                  variant={displayType === 'bar' ? 'default' : 'outline'}
                  onClick={() => setDisplayType('bar')}
                  className="flex-1"
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  Bar
                </Button>
                <Button 
                  variant={displayType === 'line' ? 'default' : 'outline'}
                  onClick={() => setDisplayType('line')}
                  className="flex-1"
                >
                  <LineChart className="h-4 w-4 mr-2" />
                  Line
                </Button>
                <Button 
                  variant={displayType === 'pie' ? 'default' : 'outline'}
                  onClick={() => setDisplayType('pie')}
                  className="flex-1"
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  Pie
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}