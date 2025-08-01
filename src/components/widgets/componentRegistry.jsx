"use client"
import { BarChart3, TrendingUp, DollarSign, Activity, Calendar, FileText } from "lucide-react"
import LineChart from "./LineChart"
import BarChart from "./BarChart"
import PieChartComponent from "./PieChart"
import MetricCard from "./MetricCard"
import DataTable from "./DataTable"
import TextWidget from "./TextWidget"
import ImageWidget from "./ImageWidget"
import CalendarWidget from "./CalendarWidget"

// Widget registry mapping
export const WIDGET_TYPES = {
  "line-chart": {
    component: LineChart,
    name: "Line Chart",
    icon: TrendingUp,
    category: "Charts",
    defaultProps: {
      title: "Line Chart",
      data: [
        { name: "Jan", value: 400 },
        { name: "Feb", value: 300 },
        { name: "Mar", value: 600 },
        { name: "Apr", value: 800 },
        { name: "May", value: 500 },
      ],
      xKey: "name",
      yKey: "value",
      color: "#3B82F6",
    },
    defaultSize: { w: 6, h: 4 },
  },
  "bar-chart": {
    component: BarChart,
    name: "Bar Chart",
    icon: BarChart3,
    category: "Charts",
    defaultProps: {
      title: "Bar Chart",
      data: [
        { name: "Product A", value: 400 },
        { name: "Product B", value: 300 },
        { name: "Product C", value: 600 },
        { name: "Product D", value: 800 },
      ],
      xKey: "name",
      yKey: "value",
      color: "#10B981",
    },
    defaultSize: { w: 6, h: 4 },
  },
  "pie-chart": {
    component: PieChartComponent,
    name: "Pie Chart",
    icon: FileText, // Placeholder icon, replace with actual PieChart icon if available
    category: "Charts",
    defaultProps: {
      title: "Pie Chart",
      data: [
        { name: "Desktop", value: 60, color: "#3B82F6" },
        { name: "Mobile", value: 30, color: "#10B981" },
        { name: "Tablet", value: 10, color: "#F59E0B" },
      ],
    },
    defaultSize: { w: 4, h: 4 },
  },
  "metric-card": {
    component: MetricCard,
    name: "Metric Card",
    icon: DollarSign,
    category: "Metrics",
    defaultProps: {
      title: "Total Revenue",
      value: "$125,000",
      change: "+12%",
      trend: "up",
      icon: "dollar-sign",
    },
    defaultSize: { w: 3, h: 2 },
  },
  "data-table": {
    component: DataTable,
    name: "Data Table",
    icon: FileText,
    category: "Data",
    defaultProps: {
      title: "Data Table",
      data: [
        { id: 1, name: "John Doe", email: "john@example.com", status: "Active" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Inactive" },
        { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "Active" },
      ],
      columns: [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "status", label: "Status" },
      ],
    },
    defaultSize: { w: 8, h: 4 },
  },
  "text-widget": {
    component: TextWidget,
    name: "Text Widget",
    icon: FileText,
    category: "Content",
    defaultProps: {
      content: "# Welcome to your dashboard\n\nThis is a text widget where you can add **markdown** content.",
      fontSize: "md",
    },
    defaultSize: { w: 4, h: 3 },
  },
  "image-widget": {
    component: ImageWidget,
    name: "Image Widget",
    icon: Activity,
    category: "Content",
    defaultProps: {
      src: "/placeholder.svg?height=200&width=400&text=Image+Widget",
      alt: "Dashboard Image",
      caption: "Image Caption",
    },
    defaultSize: { w: 4, h: 3 },
  },
  "calendar-widget": {
    component: CalendarWidget,
    name: "Calendar",
    icon: Calendar,
    category: "Utilities",
    defaultProps: {
      title: "Calendar",
      events: [
        { date: "2024-01-15", title: "Team Meeting" },
        { date: "2024-01-20", title: "Project Deadline" },
      ],
    },
    defaultSize: { w: 4, h: 4 },
  },
}

// Get widget component by type
export const getWidgetComponent = (type) => {
  const widget = WIDGET_TYPES[type]
  return widget ? widget.component : null
}

// Get widget config by type
export const getWidgetConfig = (type) => {
  return WIDGET_TYPES[type] || null
}

// Get all widget categories
export const getWidgetCategories = () => {
  const categories = {}
  Object.entries(WIDGET_TYPES).forEach(([type, config]) => {
    if (!categories[config.category]) {
      categories[config.category] = []
    }
    categories[config.category].push({ type, ...config })
  })
  return categories
}

// Create default widget instance
export const createWidgetInstance = (type, position = { x: 0, y: 0 }) => {
  const config = getWidgetConfig(type)
  if (!config) return null

  return {
    id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    position: {
      ...position,
      w: config.defaultSize.w,
      h: config.defaultSize.h,
    },
    props: { ...config.defaultProps },
    style: {},
    locked: false,
    visible: true,
  }
}
